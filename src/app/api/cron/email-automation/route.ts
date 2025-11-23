import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
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

    const results = {
      creditLow: 0,
      creditEmpty: 0,
      firstPurchaseOffer: 0,
      lastChanceOffer: 0,
      errors: [] as string[]
    }

    // 1. 积分不足提醒（积分 < 3，且未发送过此类邮件）
    const lowCreditUsers = await prisma.user.findMany({
      where: {
        emailUnsubscribed: false,
        creditAccount: {
          availableCredits: {
            lt: 3,
            gt: 0
          }
        },
        NOT: {
          emailMarketingLogs: {
            some: {
              emailType: 'credit_low',
              sentAt: {
                gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7天内
              }
            }
          }
        }
      },
      include: {
        creditAccount: true
      }
    })

    for (const user of lowCreditUsers) {
      try {
        if (!user.email) continue

        const template = creditLowEmail({
          userName: user.name || '用户',
          credits: user.creditAccount?.availableCredits || 0
        })

        const result = await sendEmailWithResend({
          to: user.email,
          subject: template.subject,
          html: template.html
        })

        if (result.success) {
          await prisma.emailMarketingLog.create({
            data: {
              userId: user.id,
              emailType: 'credit_low',
              sentAt: new Date(),
              status: 'SENT',
              messageId: result.messageId
            }
          })

          await prisma.user.update({
            where: { id: user.id },
            data: { lastMarketingEmailAt: new Date() }
          })

          results.creditLow++
        }
      } catch (error) {
        results.errors.push(`Credit low email failed for user ${user.id}: ${error}`)
      }
    }

    // 2. 积分用完提醒（积分 = 0，且未发送过此类邮件）
    const emptyCreditUsers = await prisma.user.findMany({
      where: {
        emailUnsubscribed: false,
        creditAccount: {
          availableCredits: 0
        },
        NOT: {
          emailMarketingLogs: {
            some: {
              emailType: 'credit_empty',
              sentAt: {
                gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7天内
              }
            }
          }
        }
      }
    })

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
          await prisma.emailMarketingLog.create({
            data: {
              userId: user.id,
              emailType: 'credit_empty',
              sentAt: new Date(),
              status: 'SENT',
              messageId: result.messageId
            }
          })

          await prisma.user.update({
            where: { id: user.id },
            data: { lastMarketingEmailAt: new Date() }
          })

          results.creditEmpty++
        }
      } catch (error) {
        results.errors.push(`Credit empty email failed for user ${user.id}: ${error}`)
      }
    }

    // 3. 注册24小时未购买（首单特惠）
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000)

    const firstOfferUsers = await prisma.user.findMany({
      where: {
        emailUnsubscribed: false,
        createdAt: {
          gte: twoDaysAgo,
          lte: oneDayAgo
        },
        NOT: {
          OR: [
            {
              creditOrders: {
                some: {
                  status: 'PAID'
                }
              }
            },
            {
              emailMarketingLogs: {
                some: {
                  emailType: 'first_purchase_offer'
                }
              }
            }
          ]
        }
      },
      include: {
        creditAccount: true
      }
    })

    for (const user of firstOfferUsers) {
      try {
        if (!user.email) continue

        const template = firstPurchaseOfferEmail({
          userName: user.name || '用户',
          credits: user.creditAccount?.availableCredits || 0
        })

        const result = await sendEmailWithResend({
          to: user.email,
          subject: template.subject,
          html: template.html
        })

        if (result.success) {
          await prisma.emailMarketingLog.create({
            data: {
              userId: user.id,
              emailType: 'first_purchase_offer',
              sentAt: new Date(),
              status: 'SENT',
              messageId: result.messageId
            }
          })

          await prisma.user.update({
            where: { id: user.id },
            data: { lastMarketingEmailAt: new Date() }
          })

          results.firstPurchaseOffer++
        }
      } catch (error) {
        results.errors.push(`First purchase offer email failed for user ${user.id}: ${error}`)
      }
    }

    // 4. 注册7天未购买（最后提醒）
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const eightDaysAgo = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)

    const lastChanceUsers = await prisma.user.findMany({
      where: {
        emailUnsubscribed: false,
        createdAt: {
          gte: eightDaysAgo,
          lte: sevenDaysAgo
        },
        NOT: {
          OR: [
            {
              creditOrders: {
                some: {
                  status: 'PAID'
                }
              }
            },
            {
              emailMarketingLogs: {
                some: {
                  emailType: 'last_chance_offer'
                }
              }
            }
          ]
        }
      }
    })

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
          await prisma.emailMarketingLog.create({
            data: {
              userId: user.id,
              emailType: 'last_chance_offer',
              sentAt: new Date(),
              status: 'SENT',
              messageId: result.messageId
            }
          })

          await prisma.user.update({
            where: { id: user.id },
            data: { lastMarketingEmailAt: new Date() }
          })

          results.lastChanceOffer++
        }
      } catch (error) {
        results.errors.push(`Last chance offer email failed for user ${user.id}: ${error}`)
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
