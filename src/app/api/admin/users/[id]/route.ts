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
      return createErrorResponse(Errors.NOT_FOUND, "用户不存在")
    }

    const user = userResult.rows[0]

    // 开始事务删除用户相关数据
    const client = await pool.connect()
    
    try {
      await client.query('BEGIN')

      // 删除用户相关数据
      await client.query('DELETE FROM user_credit_accounts WHERE user_id = $1', [userId])
      await client.query('DELETE FROM credit_transactions WHERE user_id = $1', [userId])
      await client.query('DELETE FROM video_generations WHERE user_id = $1', [userId])
      await client.query('DELETE FROM credit_orders WHERE user_id = $1', [userId])
      await client.query('DELETE FROM api_cost_records WHERE user_id = $1', [userId])
      await client.query('DELETE FROM user_activity_logs WHERE user_id = $1', [userId])
      
      // 最后删除用户
      await client.query('DELETE FROM users WHERE id = $1', [userId])

      // 记录管理员操作
      await client.query(`
        INSERT INTO admin_operation_logs (admin_email, operation, target_type, target_id, details)
        VALUES ($1, $2, $3, $4, $5)
      `, [
        '3533912007@qq.com',
        'DELETE_USER',
        'user',
        userId,
        { user_email: user.email, action: 'delete_user_and_related_data' }
      ])

      await client.query('COMMIT')

      logger.info("管理员删除用户", {
        adminEmail: "3533912007@qq.com",
        userId,
        userEmail: user.email
      })

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
    logger.error("删除用户失败", { error, userId })
    return createErrorResponse(Errors.INTERNAL_SERVER_ERROR, "删除用户失败")
  }
}








