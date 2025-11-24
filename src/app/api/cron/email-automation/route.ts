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
    // 验证请求来源
    // Vercel Cron 会自动添加 x-vercel-cron header
    const cronHeader = request.headers.get('x-vercel-cron')
    const authHeader = request.headers.get('authorization')
    
    // 允许两种验证方式：
    // 1. Vercel Cron 自动添加的 header
    // 2. 手动测试时使用的 Authorization header
    const isVercelCron = cronHeader === '1'
    const isAuthorized = authHeader === `Bearer ${process.env.CRON_SECRET}`
    
    if (!isVercelCron && !isAuthorized) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized', debug: { cronHeader, hasAuth: !!authHeader } },
        { status: 401 }
      )
    }

    console.log('🚀 Cron 任务开始执行...')
    console.log('📋 环境变量检查:', {
      hasSupabaseUrl: !!process.env.SUPABASE_URL,
      hasSupabaseKey: !!process.env.SUPABASE_SERVICE_KEY,
      hasResendKey: !!process.env.RESEND_API_KEY,
      supabaseUrlPrefix: process.env.SUPABASE_URL?.substring(0, 30),
      supabaseKeyPrefix: process.env.SUPABASE_SERVICE_KEY?.substring(0, 50),
      supabaseKeyLength: process.env.SUPABASE_SERVICE_KEY?.length
    })

    // 初始化 Supabase 客户端（在运行时）
    const supabaseUrl = process.env.SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY!
    
    console.log('🔑 Supabase 配置:', {
      url: supabaseUrl,
      keyStart: supabaseKey.substring(0, 20),
      keyEnd: supabaseKey.substring(supabaseKey.length - 20),
      keyLength: supabaseKey.length
    })
    
    const supabase = createClient(supabaseUrl, supabaseKey)

    const results = {
      creditLow: 0,
      creditEmpty: 0,
      firstPurchaseOffer: 0,
      lastChanceOffer: 0,
      errors: [] as string[]
    }

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    console.log('📅 查询时间范围:', sevenDaysAgo)

    // 1. 积分不足提醒（积分 < 10）
    console.log('🔍 查询积分不足用户...')
    const { data: lowCreditUsers, error: lowCreditError } = await supabase
      .rpc('get_low_credit_users', { days_ago: 7 })

    if (lowCreditError) {
      console.error('❌ 查询积分不足用户失败:', lowCreditError)
      results.errors.push(`Query low credit users failed: ${lowCreditError.message}`)
    } else if (lowCreditUsers && Array.isArray(lowCreditUsers)) {
      console.log(`✅ 找到 ${lowCreditUsers.length} 个积分不足用户`)
      for (const user of lowCreditUsers) {
        try {
          if (!user.email) continue

          const template = creditLowEmail({
            userName: user.name || '用户',
            credits: user.available_credits || 0
          })

          const result = await sendEmailWithResend({
            to: user.email,
            subject: template.subject,
            html: template.html
          })

          if (result.success) {
            await supabase.from('email_marketing_logs').insert({
              user_id: user.id,
              email_type: 'credit_low',
              sent_at: new Date().toISOString(),
              status: 'SENT',
              message_id: result.messageId
            })

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

    // 2. 积分用完提醒（积分 = 0）
    const { data: emptyCreditUsers, error: emptyCreditError } = await supabase
      .rpc('get_empty_credit_users', { days_ago: 7 })

    if (emptyCreditError) {
      results.errors.push(`Query empty credit users failed: ${emptyCreditError.message}`)
    } else if (emptyCreditUsers && Array.isArray(emptyCreditUsers)) {
      for (const user of emptyCreditUsers) {
        try {
          if (!user.email) continue

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
    const { data: firstOfferUsers, error: firstOfferError } = await supabase
      .rpc('get_first_purchase_offer_users')

    if (firstOfferError) {
      results.errors.push(`Query first offer users failed: ${firstOfferError.message}`)
    } else if (firstOfferUsers && Array.isArray(firstOfferUsers)) {
      for (const user of firstOfferUsers) {
        try {
          if (!user.email) continue

          const template = firstPurchaseOfferEmail({
            userName: user.name || '用户',
            credits: user.available_credits || 0
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
    const { data: lastChanceUsers, error: lastChanceError } = await supabase
      .rpc('get_last_chance_offer_users')

    if (lastChanceError) {
      results.errors.push(`Query last chance users failed: ${lastChanceError.message}`)
    } else if (lastChanceUsers && Array.isArray(lastChanceUsers)) {
      for (const user of lastChanceUsers) {
        try {
          if (!user.email) continue

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

    console.log('✅ Cron 任务执行完成')
    console.log('📊 发送统计:', results)

    return NextResponse.json({
      success: true,
      results,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('💥 邮件自动化任务失败:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
