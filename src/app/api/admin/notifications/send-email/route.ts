import { NextRequest, NextResponse } from "next/server"
import { pool } from "@/lib/db"
import { sendEmail } from "@/lib/email"
import { createErrorResponse, Errors } from "@/lib/error-handler"
import { logger } from "@/lib/logger"
import { adminApiGuard } from "@/lib/admin-auth"

/**
 * 管理员发送邮件API
 * POST /api/admin/notifications/send-email
 */
export async function POST(request: NextRequest) {
  // 严格的管理员权限验证
  const authError = await adminApiGuard(request)
  if (authError) return authError

  try {
    const body = await request.json()
    const {
      recipients, // 'all' | 'selected' | 'single'
      userIds, // 用户ID数组（当recipients为selected时）
      userId, // 单个用户ID（当recipients为single时）
      subject,
      content,
      templateType // 'custom' | 'welcome' | 'announcement' | 'reminder'
    } = body

    // 验证必填字段
    if (!subject || !content) {
      return createErrorResponse(Errors.badRequest(), "邮件主题和内容不能为空")
    }

    // 获取收件人列表
    let recipientList: Array<{ email: string; name: string; id: string }> = []

    if (recipients === 'all') {
      // 发送给所有用户
      const result = await pool.query(
        "SELECT id, email, name FROM users WHERE email IS NOT NULL"
      )
      recipientList = result.rows
    } else if (recipients === 'selected' && userIds && userIds.length > 0) {
      // 发送给选中的用户
      const result = await pool.query(
        "SELECT id, email, name FROM users WHERE id = ANY($1) AND email IS NOT NULL",
        [userIds]
      )
      recipientList = result.rows
    } else if (recipients === 'single' && userId) {
      // 发送给单个用户
      const result = await pool.query(
        "SELECT id, email, name FROM users WHERE id = $1 AND email IS NOT NULL",
        [userId]
      )
      recipientList = result.rows
    } else {
      return createErrorResponse(Errors.badRequest(), "无效的收件人配置")
    }

    if (recipientList.length === 0) {
      return createErrorResponse(Errors.badRequest(), "没有找到有效的收件人")
    }

    // 生成邮件HTML
    const emailHtml = generateEmailHtml(subject, content, templateType)

    // 发送邮件并记录结果
    const results = {
      total: recipientList.length,
      success: 0,
      failed: 0,
      errors: [] as Array<{ email: string; error: string }>
    }

    // 批量发送邮件
    for (const recipient of recipientList) {
      try {
        const result = await sendEmail({
          to: recipient.email,
          subject,
          html: emailHtml.replace(/\{\{userName\}\}/g, recipient.name || '用户')
        })

        if (result.success) {
          results.success++
          
          // 记录发送历史
          await pool.query(
            `INSERT INTO email_send_history 
             (recipient_id, recipient_email, subject, content, status, sent_at)
             VALUES ($1, $2, $3, $4, 'SUCCESS', NOW())`,
            [recipient.id, recipient.email, subject, content]
          )
        } else {
          results.failed++
          results.errors.push({
            email: recipient.email,
            error: result.error || '未知错误'
          })
          
          // 记录失败历史
          await pool.query(
            `INSERT INTO email_send_history 
             (recipient_id, recipient_email, subject, content, status, error_message, sent_at)
             VALUES ($1, $2, $3, $4, 'FAILED', $5, NOW())`,
            [recipient.id, recipient.email, subject, content, result.error]
          )
        }
      } catch (error) {
        results.failed++
        const errorMsg = error instanceof Error ? error.message : String(error)
        results.errors.push({
          email: recipient.email,
          error: errorMsg
        })
      }
    }

    logger.info("管理员发送邮件", {
      context: {
        recipients: recipients,
        total: results.total,
        success: results.success,
        failed: results.failed
      }
    })

    return NextResponse.json({
      success: true,
      message: `邮件发送完成：成功 ${results.success} 封，失败 ${results.failed} 封`,
      results
    })

  } catch (error) {
    logger.error("发送邮件失败", { 
      error: error instanceof Error ? error : new Error(String(error))
    })
    return createErrorResponse(Errors.internalError(), "发送邮件失败")
  }
}


// 生成邮件HTML
function generateEmailHtml(subject: string, content: string, templateType: string): string {
  const baseTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
          color: white; 
          padding: 30px; 
          text-align: center; 
          border-radius: 10px 10px 0 0; 
        }
        .content { 
          background: #f9f9f9; 
          padding: 30px; 
          border-radius: 0 0 10px 10px; 
        }
        .message { 
          background: white; 
          padding: 20px; 
          margin: 20px 0; 
          border-radius: 8px; 
          border-left: 4px solid #667eea; 
          white-space: pre-line;
        }
        .footer { 
          text-align: center; 
          margin-top: 30px; 
          color: #999; 
          font-size: 12px; 
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${subject}</h1>
          <p>VEO AI 官方通知</p>
        </div>
        <div class="content">
          <p>尊敬的 <strong>{{userName}}</strong>，您好！</p>
          <div class="message">${content}</div>
          <div class="footer">
            <p>此邮件由VEO AI管理员发送</p>
            <p>VEO AI - 让创意生动起来</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `

  return baseTemplate
}
