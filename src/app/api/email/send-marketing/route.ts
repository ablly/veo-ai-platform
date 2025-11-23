import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sendEmailWithResend } from '@/lib/email-resend'
import { 
  welcomeEmail, 
  creditLowEmail, 
  creditEmptyEmail,
  firstPurchaseOfferEmail,
  lastChanceOfferEmail
} from '@/lib/email-templates/marketing-templates'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // 只允许管理员或系统调用
    if (!session?.user?.isAdmin && request.headers.get('x-cron-secret') !== process.env.CRON_SECRET) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { userId, emailType } = body

    // 获取用户信息
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        creditAccount: true
      }
    })

    if (!user || !user.email) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // 检查用户是否取消订阅
    if (user.emailUnsubscribed) {
      return NextResponse.json(
        { success: false, error: 'User unsubscribed' },
        { status: 400 }
      )
    }

    // 检查是否在24小时内已发送过营销邮件
    if (user.lastMarketingEmailAt) {
      const hoursSinceLastEmail = (Date.now() - user.lastMarketingEmailAt.getTime()) / (1000 * 60 * 60)
      if (hoursSinceLastEmail < 24) {
        return NextResponse.json(
          { success: false, error: 'Email sent too recently' },
          { status: 429 }
        )
      }
    }

    // 根据邮件类型选择模板
    let template
    const credits = user.creditAccount?.availableCredits || 0

    switch (emailType) {
      case 'welcome':
        template = welcomeEmail({
          userName: user.name || '用户',
          credits
        })
        break
      case 'credit_low':
        template = creditLowEmail({
          userName: user.name || '用户',
          credits
        })
        break
      case 'credit_empty':
        template = creditEmptyEmail({
          userName: user.name || '用户'
        })
        break
      case 'first_purchase_offer':
        template = firstPurchaseOfferEmail({
          userName: user.name || '用户',
          credits
        })
        break
      case 'last_chance_offer':
        template = lastChanceOfferEmail({
          userName: user.name || '用户'
        })
        break
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid email type' },
          { status: 400 }
        )
    }

    // 发送邮件
    const result = await sendEmailWithResend({
      to: user.email,
      subject: template.subject,
      html: template.html
    })

    if (!result.success) {
      throw new Error(result.error)
    }

    // 记录邮件发送历史
    await prisma.$executeRaw`
      INSERT INTO email_marketing_logs (user_id, email_type, sent_at, status, message_id)
      VALUES (${user.id}, ${emailType}, NOW(), 'SENT', ${result.messageId})
    `

    // 更新用户最后营销邮件时间
    await prisma.$executeRaw`
      UPDATE users 
      SET last_marketing_email_at = NOW() 
      WHERE id = ${user.id}
    `

    return NextResponse.json({
      success: true,
      messageId: result.messageId
    })

  } catch (error) {
    console.error('发送营销邮件失败:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}
