import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendEmailWithResend } from '@/lib/email-resend'
import { 
  creditLowEmail, 
  creditEmptyEmail,
  firstPurchaseOfferEmail,
  lastChanceOfferEmail
} from '@/lib/email-templates/marketing-templates'

export async function GET(request: NextRequest) {
  try {
    // 验证Cron密钥
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 初始化 Supabase 客户端（在运行时）
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const results = {
      creditLow: 0,
      creditEmpty: 0,
      firstPurchaseOffer: 0,
      lastChanceOffer: 0,
      errors: [] as string[]
    }

    // 1. 积分不足提醒（积分 < 10，且7天内未发送过此类邮件）
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    
    const { data: lowCreditUsers, error: lowCreditError } = await supabase
      .from('users')
      .select(`
        id,
        email,
        name,
        user_credit_accounts!inner(available_credits)
      `)
      .eq('email_unsubscribed', false)
      .lt('user_credit_accounts.available_credits', 10)
      .gt('user_credit_accounts.available_credits', 0)

    if (lowCreditError) {
      results.errors.push(`Query low credit users failed: ${lowCreditError.message}`)
    } else if (lowCreditUsers) {
      for (const user of lowCreditUsers) {
        try {
          if (!user.email) continue

          // 检查7天内是否已发送过
          const { data: recentLogs } = await supabase
            .from('email_marketing_logs')
            .select('id')
            .eq('user_id', user.id)
            .eq('email_type', 'credit_low')
            .gte('sent_at', sevenDaysAgo)
            .limit(1)

          if (recentLogs && recentLogs.length > 0) {
            continue // 7天内已发送过，跳过
          }

          const credits = (user.user_credit_accounts as any)[0]?.available_credits || 0

          const template = creditLowEmail({
            userName: user.name || '用户',
            credits
          })

          const result = await sendEmailWithResend({
            to: user.email,
            subject: template.subject,
            html: template.html
          })

          if (result.success) {
            // 记录发送日志
            await supabase.from('email_marketing_logs').insert({
              user_id: user.id,
              email_type: 'credit_low',
              sent_at: new Date().toISOString(),
              status: 'SENT',
              message_id: result.messageId
            })

            // 更新用户最后营销邮件时间
            await supabase
              .from('users')
              .update({ last_marketing_email_at: new Date().toISOString() })
              .eq('id', user.id)

            results.creditLow++
          }
        } catch (error) {
          results.errors.push(`Credit low email failed for user ${user.id}: ${error}`)
        }
      }
    }

    // 2. 积分用完提醒（积分 = 0，且7天内未发送过此类邮件）
    const { data: emptyCreditUsers, error: emptyCreditError } = await supabase
      .from('users')
      .select(`
        id,
        email,
        name,
        user_credit_accounts!inner(available_credits)
      `)
      .eq('email_unsubscribed', false)
      .eq('user_credit_accounts.available_credits', 0)

    if (emptyCreditError) {
      results.errors.push(`Query empty credit users failed: ${emptyCreditError.message}`)
    } else if (emptyCreditUsers) {
      for (const user of emptyCreditUsers) {
        try {
          if (!user.email) continue

          // 检查7天内是否已发送过
          const { data: recentLogs } = await supabase
            .from('email_marketing_logs')
            .select('id')
            .eq('user_id', user.id)
            .eq('email_type', 'credit_empty')
            .gte('sent_at', sevenDaysAgo)
            .limit(1)

          if (recentLogs && recentLogs.length > 0) {
            continue
          }

          const template = creditEmptyEmail({
            userName: user.name || '用户'
          })

          const result = await sendEmailWithResend({
            to: user.email,
            subject: template.subject,
            html: template.html
          })

          if (result.success) {
            await supabase.from('email_marketing_logs').insert({
              user_id: user.id,
              email_type: 'credit_empty',
              sent_at: new Date().toISOString(),
              status: 'SENT',
              message_id: result.messageId
            })

            await supabase
              .from('users')
              .update({ last_marketing_email_at: new Date().toISOString() })
              .eq('id', user.id)

            results.creditEmpty++
          }
        } catch (error) {
          results.errors.push(`Credit empty email failed for user ${user.id}: ${error}`)
        }
      }
    }

    // 3. 注册24小时未购买（首单特惠）
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()

    const { data: firstOfferUsers, error: firstOfferError } = await supabase
      .from('users')
      .select(`
        id,
        email,
        name,
        created_at,
        user_credit_accounts(available_credits)
      `)
      .eq('email_unsubscribed', false)
      .gte('created_at', twoDaysAgo)
      .lte('created_at', oneDayAgo)

    if (firstOfferError) {
      results.errors.push(`Query first offer users failed: ${firstOfferError.message}`)
    } else if (firstOfferUsers) {
      for (const user of firstOfferUsers) {
        try {
          if (!user.email) continue

          // 检查是否已购买过
          const { data: orders } = await supabase
            .from('credit_orders')
            .select('id')
            .eq('user_id', user.id)
            .eq('status', 'PAID')
            .limit(1)

          if (orders && orders.length > 0) {
            continue // 已购买过，跳过
          }

          // 检查是否已发送过首单特惠邮件
          const { data: sentLogs } = await supabase
            .from('email_marketing_logs')
            .select('id')
            .eq('user_id', user.id)
            .eq('email_type', 'first_purchase_offer')
            .limit(1)

          if (sentLogs && sentLogs.length > 0) {
            continue
          }

          const credits = (user.user_credit_accounts as any)[0]?.available_credits || 0

          const template = firstPurchaseOfferEmail({
            userName: user.name || '用户',
            credits
          })

          const result = await sendEmailWithResend({
            to: user.email,
            subject: template.subject,
            html: template.html
          })

          if (result.success) {
            await supabase.from('email_marketing_logs').insert({
              user_id: user.id,
              email_type: 'first_purchase_offer',
              sent_at: new Date().toISOString(),
              status: 'SENT',
              message_id: result.messageId
            })

            await supabase
              .from('users')
              .update({ last_marketing_email_at: new Date().toISOString() })
              .eq('id', user.id)

            results.firstPurchaseOffer++
          }
        } catch (error) {
          results.errors.push(`First purchase offer email failed for user ${user.id}: ${error}`)
        }
      }
    }

    // 4. 注册7天未购买（最后提醒）
    const sevenDaysAgoDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const eightDaysAgo = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()

    const { data: lastChanceUsers, error: lastChanceError } = await supabase
      .from('users')
      .select('id, email, name, created_at')
      .eq('email_unsubscribed', false)
      .gte('created_at', eightDaysAgo)
      .lte('created_at', sevenDaysAgoDate)

    if (lastChanceError) {
      results.errors.push(`Query last chance users failed: ${lastChanceError.message}`)
    } else if (lastChanceUsers) {
      for (const user of lastChanceUsers) {
        try {
          if (!user.email) continue

          // 检查是否已购买过
          const { data: orders } = await supabase
            .from('credit_orders')
            .select('id')
            .eq('user_id', user.id)
            .eq('status', 'PAID')
            .limit(1)

          if (orders && orders.length > 0) {
            continue
          }

          // 检查是否已发送过最后提醒邮件
          const { data: sentLogs } = await supabase
            .from('email_marketing_logs')
            .select('id')
            .eq('user_id', user.id)
            .eq('email_type', 'last_chance_offer')
            .limit(1)

          if (sentLogs && sentLogs.length > 0) {
            continue
          }

          const template = lastChanceOfferEmail({
            userName: user.name || '用户'
          })

          const result = await sendEmailWithResend({
            to: user.email,
            subject: template.subject,
            html: template.html
          })

          if (result.success) {
            await supabase.from('email_marketing_logs').insert({
              user_id: user.id,
              email_type: 'last_chance_offer',
              sent_at: new Date().toISOString(),
              status: 'SENT',
              message_id: result.messageId
            })

            await supabase
              .from('users')
              .update({ last_marketing_email_at: new Date().toISOString() })
              .eq('id', user.id)

            results.lastChanceOffer++
          }
        } catch (error) {
          results.errors.push(`Last chance offer email failed for user ${user.id}: ${error}`)
        }
      }
    }

    return NextResponse.json({
      success: true,
      results,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('邮件自动化任务失败:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}
