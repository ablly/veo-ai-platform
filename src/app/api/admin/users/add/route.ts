import { NextRequest, NextResponse } from "next/server"
import { pool } from "@/lib/db"
import { createErrorResponse, Errors } from "@/lib/error-handler"
import { logger } from "@/lib/logger"
import { adminApiGuard } from "@/lib/admin-auth"

/**
 * 添加用户（管理员）
 * POST /api/admin/users/add
 */
export async function POST(request: NextRequest) {
  // 严格的管理员权限验证
  const authError = await adminApiGuard(request)
  if (authError) return authError

  try {
    const body = await request.json()
    const { 
      email, 
      name, 
      credits = 0, 
      packageId = null,
      status = 'active' 
    } = body

    // 验证必填字段
    if (!email) {
      return createErrorResponse(Errors.BAD_REQUEST, "邮箱不能为空")
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return createErrorResponse(Errors.BAD_REQUEST, "邮箱格式不正确")
    }

    const client = await pool.connect()
    
    try {
      await client.query('BEGIN')

      // 检查邮箱是否已存在
      const existingUser = await client.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      )

      if (existingUser.rows.length > 0) {
        return createErrorResponse(Errors.BAD_REQUEST, "该邮箱已存在")
      }

      // 创建用户
      const userResult = await client.query(
        `INSERT INTO users (email, name, status, created_at, updated_at)
         VALUES ($1, $2, $3, NOW(), NOW())
         RETURNING id, email, name, status, created_at`,
        [email, name || null, status]
      )

      const newUser = userResult.rows[0]

      // 创建用户积分账户
      let packageName = null
      if (packageId) {
        const packageResult = await client.query(
          'SELECT name FROM credit_packages WHERE id = $1',
          [packageId]
        )
        if (packageResult.rows.length > 0) {
          packageName = packageResult.rows[0].name
        }
      }

      await client.query(
        `INSERT INTO user_credit_accounts (
          user_id, available_credits, total_credits, used_credits, frozen_credits,
          package_name, package_expires_at, is_expired, created_at, updated_at
        ) VALUES ($1, $2, $2, 0, 0, $3, $4, false, NOW(), NOW())`,
        [
          newUser.id, 
          credits, 
          packageName,
          packageId ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) : null // 默认1年有效期
        ]
      )

      // 记录积分变动
      if (credits > 0) {
        await client.query(
          `INSERT INTO credit_transactions (
            user_id, type, amount, balance_after, description, created_at
          ) VALUES ($1, 'ADMIN_ADD', $2, $2, $3, NOW())`,
          [newUser.id, credits, `管理员添加用户时赠送 ${credits} 积分`]
        )
      }

      // 记录管理员操作
      await client.query(`
        INSERT INTO admin_operation_logs (admin_email, operation, target_type, target_id, details)
        VALUES ($1, $2, $3, $4, $5)
      `, [
        '3533912007@qq.com',
        'ADD_USER',
        'user',
        newUser.id,
        { 
          user_email: email, 
          user_name: name,
          initial_credits: credits,
          package_id: packageId,
          package_name: packageName
        }
      ])

      await client.query('COMMIT')

      logger.info("管理员添加用户", {
        adminEmail: "3533912007@qq.com",
        newUserId: newUser.id,
        userEmail: email,
        initialCredits: credits
      })

      return NextResponse.json({
        success: true,
        message: "用户添加成功",
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          status: newUser.status,
          created_at: newUser.created_at,
          credits: credits
        }
      })

    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }

  } catch (error) {
    logger.error("添加用户失败", { error })
    return createErrorResponse(Errors.INTERNAL_SERVER_ERROR, "添加用户失败")
  }
}






