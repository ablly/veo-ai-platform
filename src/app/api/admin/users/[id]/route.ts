import { NextRequest, NextResponse } from "next/server"
import { pool } from "@/lib/db"
import { createErrorResponse, Errors } from "@/lib/error-handler"
import { logger } from "@/lib/logger"
import { adminApiGuard } from "@/lib/admin-auth"

/**
 * 删除用户（管理员）
 * DELETE /api/admin/users/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // 严格的管理员权限验证
  const authError = await adminApiGuard(request)
  if (authError) return authError

  try {
    const resolvedParams = await params
    const userId = resolvedParams.id

    // 检查用户是否存在
    const userResult = await pool.query(
      'SELECT id, email FROM users WHERE id = $1',
      [userId]
    )

    if (userResult.rows.length === 0) {
      return createErrorResponse(Errors.notFound("用户"))
    }

    const user = userResult.rows[0]

    // 开始事务删除用户相关数据
    const client = await pool.connect()
    
    try {
      await client.query('BEGIN')

      // 删除用户相关数据（按照外键依赖顺序删除）
      
      // 1. 删除邮件相关记录
      await client.query('DELETE FROM email_marketing_logs WHERE user_id = $1', [userId])
      await client.query('DELETE FROM email_send_history WHERE recipient_id = $1', [userId])
      
      // 2. 删除用户通知
      await client.query('DELETE FROM user_notifications WHERE user_id = $1', [userId])
      
      // 3. 删除用户活动日志
      await client.query('DELETE FROM user_activity_logs WHERE user_id = $1', [userId])
      
      // 4. 删除指南反馈
      await client.query('DELETE FROM guide_feedback WHERE user_id = $1', [userId])
      
      // 5. 删除视频互动记录
      await client.query('DELETE FROM video_views WHERE user_id = $1', [userId])
      await client.query('DELETE FROM video_likes WHERE user_id = $1', [userId])
      
      // 6. 删除画廊视频
      await client.query('DELETE FROM gallery_videos WHERE user_id = $1', [userId])
      
      // 7. 删除用户VivaAPI密钥
      await client.query('DELETE FROM user_viva_api_keys WHERE user_id = $1', [userId])
      
      // 8. 删除API成本记录
      await client.query('DELETE FROM api_cost_records WHERE user_id = $1', [userId])
      
      // 9. 删除用户API权限
      await client.query('DELETE FROM user_api_permissions WHERE user_id = $1', [userId])
      
      // 10. 删除积分交易记录
      await client.query('DELETE FROM credit_transactions WHERE user_id = $1', [userId])
      
      // 11. 删除用户积分账户
      await client.query('DELETE FROM user_credit_accounts WHERE user_id = $1', [userId])
      
      // 12. 删除视频生成记录
      await client.query('DELETE FROM video_generations WHERE user_id = $1', [userId])
      
      // 13. 删除积分订单
      await client.query('DELETE FROM credit_orders WHERE user_id = $1', [userId])
      
      // 14. 删除支付订单
      await client.query('DELETE FROM payment_orders WHERE user_id = $1', [userId])
      
      // 15. 删除API使用统计
      await client.query('DELETE FROM api_usage_stats WHERE user_id = $1', [userId])
      
      // 16. 删除3D生成记录
      await client.query('DELETE FROM generations WHERE user_id = $1', [userId])
      
      // 17. 删除NextAuth相关数据
      await client.query('DELETE FROM sessions WHERE user_id = $1', [userId])
      await client.query('DELETE FROM accounts WHERE user_id = $1', [userId])
      
      // 18. 最后删除用户
      await client.query('DELETE FROM users WHERE id = $1', [userId])

      await client.query('COMMIT')

      logger.info("管理员删除用户成功", { context: { userId, userEmail: user.email } })

      return NextResponse.json({
        success: true,
        message: "用户删除成功"
      })

    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }

  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))
    logger.error("删除用户失败", { error: err })
    return createErrorResponse(Errors.internalError("删除用户失败"))
  }
}


















