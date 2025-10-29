import { NextRequest, NextResponse } from "next/server"
import { pool } from "@/lib/db"
import { EmailService } from "@/lib/email"
import { logger } from "@/lib/logger"

/**
 * 定时检查用户过期情况
 * GET /api/cron/check-expiry
 * 
 * 建议：每天凌晨2点执行
 * Vercel Cron: 0 2 * * *
 */
export async function GET(request: NextRequest) {
  try {
    // 验证请求来源（生产环境应该使用密钥）
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET || 'dev-secret-key'
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    logger.info('开始执行过期检查定时任务')

    const results = {
      expiringSoonCount: 0,
      expiredCount: 0,
      creditLowCount: 0,
      emailsSent: 0,
      errors: 0
    }

    // 1. 查找即将过期的用户（7天内）
    const expiringSoonResult = await pool.query(`
      SELECT 
        u.id, u.email, u.name,
        uca.package_name,
        uca.package_expires_at,
        uca.available_credits,
        EXTRACT(DAY FROM (uca.package_expires_at - NOW())) as days_left
      FROM users u
      JOIN user_credit_accounts uca ON u.id = uca.user_id
      WHERE uca.package_expires_at BETWEEN NOW() AND NOW() + INTERVAL '7 days'
        AND uca.is_expired = false
        AND (uca.last_notification_at IS NULL 
             OR uca.last_notification_at < NOW() - INTERVAL '24 hours')
    `)

    results.expiringSoonCount = expiringSoonResult.rows.length

    // 发送即将过期邮件
    for (const user of expiringSoonResult.rows) {
      try {
        await EmailService.sendExpiringSoon({
          email: user.email,
          userName: user.name || user.email.split('@')[0],
          packageName: user.package_name,
          expiresAt: new Date(user.package_expires_at).toLocaleDateString('zh-CN'),
          daysLeft: Math.floor(user.days_left),
          availableCredits: parseInt(user.available_credits)
        })

        // 更新最后提醒时间
        await pool.query(
          'UPDATE user_credit_accounts SET last_notification_at = NOW() WHERE user_id = $1',
          [user.id]
        )

        // 创建通知记录
        await pool.query(
          `INSERT INTO user_notifications (user_id, type, title, message, is_read, created_at)
           VALUES ($1, 'EXPIRING_SOON', '套餐即将过期', $2, false, NOW())`,
          [user.id, `您的${user.package_name}将在${Math.floor(user.days_left)}天后过期`]
        )

        results.emailsSent++
        logger.info('发送即将过期邮件', { userId: user.id, email: user.email })
      } catch (error) {
        results.errors++
        logger.error('发送即将过期邮件失败', { 
          error: error instanceof Error ? error : new Error(String(error)),
          userId: user.id 
        })
      }
    }

    // 2. 查找已过期的用户
    const expiredResult = await pool.query(`
      SELECT 
        u.id, u.email, u.name,
        uca.package_name,
        uca.package_expires_at
      FROM users u
      JOIN user_credit_accounts uca ON u.id = uca.user_id
      WHERE uca.package_expires_at < NOW()
        AND uca.is_expired = false
    `)

    results.expiredCount = expiredResult.rows.length

    // 标记为已过期并发送邮件
    for (const user of expiredResult.rows) {
      try {
        // 标记为已过期
        await pool.query(
          'UPDATE user_credit_accounts SET is_expired = true, updated_at = NOW() WHERE user_id = $1',
          [user.id]
        )

        // 发送已过期邮件
        await EmailService.sendExpired({
          email: user.email,
          userName: user.name || user.email.split('@')[0],
          packageName: user.package_name,
          expiredAt: new Date(user.package_expires_at).toLocaleDateString('zh-CN')
        })

        // 创建通知记录
        await pool.query(
          `INSERT INTO user_notifications (user_id, type, title, message, is_read, created_at)
           VALUES ($1, 'EXPIRED', '套餐已过期', $2, false, NOW())`,
          [user.id, `您的${user.package_name}已过期，请续费后继续使用`]
        )

        results.emailsSent++
        logger.info('发送已过期邮件', { userId: user.id, email: user.email })
      } catch (error) {
        results.errors++
        logger.error('发送已过期邮件失败', { 
          error: error instanceof Error ? error : new Error(String(error)),
          userId: user.id 
        })
      }
    }

    // 3. 查找积分不足的用户（< 15积分且未过期）
    const creditLowResult = await pool.query(`
      SELECT 
        u.id, u.email, u.name,
        uca.available_credits
      FROM users u
      JOIN user_credit_accounts uca ON u.id = uca.user_id
      WHERE uca.available_credits < 15
        AND uca.is_expired = false
        AND (uca.last_notification_at IS NULL 
             OR uca.last_notification_at < NOW() - INTERVAL '24 hours')
    `)

    results.creditLowCount = creditLowResult.rows.length

    // 发送积分不足邮件
    for (const user of creditLowResult.rows) {
      try {
        await EmailService.sendCreditLow({
          email: user.email,
          userName: user.name || user.email.split('@')[0],
          availableCredits: parseInt(user.available_credits)
        })

        // 更新最后提醒时间
        await pool.query(
          'UPDATE user_credit_accounts SET last_notification_at = NOW() WHERE user_id = $1',
          [user.id]
        )

        // 创建通知记录
        await pool.query(
          `INSERT INTO user_notifications (user_id, type, title, message, is_read, created_at)
           VALUES ($1, 'CREDIT_LOW', '积分不足', $2, false, NOW())`,
          [user.id, `您的积分余额仅剩${user.available_credits}，请及时充值`]
        )

        results.emailsSent++
        logger.info('发送积分不足邮件', { userId: user.id, email: user.email })
      } catch (error) {
        results.errors++
        logger.error('发送积分不足邮件失败', { 
          error: error instanceof Error ? error : new Error(String(error)),
          userId: user.id 
        })
      }
    }

    // 记录到系统日志
    await pool.query(
      `INSERT INTO system_logs (level, category, message, details, created_at)
       VALUES ('INFO', 'CRON', '过期检查定时任务完成', $1, NOW())`,
      [JSON.stringify(results)]
    )

    logger.info('过期检查定时任务完成', { context: results })

    return NextResponse.json({
      success: true,
      message: '过期检查完成',
      results
    })

  } catch (error) {
    logger.error('过期检查定时任务失败', {
      error: error instanceof Error ? error : new Error(String(error))
    })
    
    return NextResponse.json({ 
      success: false, 
      error: '定时任务执行失败' 
    }, { status: 500 })
  }
}









