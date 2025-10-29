/**
 * 用户个人资料API
 * GET: 获取个人资料
 * PUT: 更新个人资料
 */

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { pool } from "@/lib/db"
import { createErrorResponse, Errors } from "@/lib/error-handler"
import { logger } from "@/lib/logger"

/**
 * GET /api/user/profile
 * 获取用户个人资料
 */
export async function GET(req: NextRequest) {
  const client = await pool.connect()
  
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      throw Errors.unauthorized()
    }

    const userId = session.user.id
    const startTime = Date.now()

    // 获取用户信息
    const userResult = await client.query(
      `SELECT id, email, name, phone, avatar, wechat_nickname, created_at
       FROM users
       WHERE id = $1`,
      [userId]
    )

    if (userResult.rows.length === 0) {
      throw Errors.notFound("用户")
    }

    const user = userResult.rows[0]

    // 获取积分信息
    const creditsResult = await client.query(
      `SELECT available_credits, total_credits, used_credits
       FROM user_credit_accounts
       WHERE user_id = $1`,
      [userId]
    )

    const credits = creditsResult.rows[0] || {
      available_credits: 0,
      total_credits: 0,
      used_credits: 0,
    }

    const response = NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        avatar: user.avatar,
        wechatNickname: user.wechat_nickname,
        createdAt: user.created_at,
        credits: {
          available: credits.available_credits,
          total: credits.total_credits,
          used: credits.used_credits,
        },
      },
    })

    logger.apiCall({
      method: "GET",
      url: "/api/user/profile",
      status: 200,
      duration: Date.now() - startTime,
      userId
    })

    return response

  } catch (error) {
    logger.apiCall({
      method: "GET",
      url: "/api/user/profile", 
      status: 500,
      duration: Date.now() - startTime,
      userId: session?.user?.id,
      error: error instanceof Error ? error : new Error(String(error))
    })
    return createErrorResponse(error)
  } finally {
    client.release()
  }
}

/**
 * PUT /api/user/profile
 * 更新用户个人资料
 */
export async function PUT(req: NextRequest) {
  const client = await pool.connect()
  
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      throw Errors.unauthorized()
    }

    const userId = session.user.id
    const { name, phone } = await req.json()
    const startTime = Date.now()

    // 验证输入
    if (name && name.trim().length === 0) {
      throw Errors.invalidParameter("name", "昵称不能为空")
    }

    if (name && name.length > 50) {
      throw Errors.invalidParameter("name", "昵称不能超过50个字符")
    }

    if (phone && !/^1[3-9]\d{9}$/.test(phone)) {
      throw Errors.invalidParameter("phone", "手机号格式不正确")
    }

    // 如果修改手机号，检查是否已被使用
    if (phone) {
      const phoneCheck = await client.query(
        "SELECT id FROM users WHERE phone = $1 AND id != $2",
        [phone, userId]
      )

      if (phoneCheck.rows.length > 0) {
        throw Errors.resourceExists("该手机号")
      }
    }

    // 更新用户信息
    const updateResult = await client.query(
      `UPDATE users
       SET name = COALESCE($1, name),
           phone = COALESCE($2, phone),
           updated_at = NOW()
       WHERE id = $3
       RETURNING id, email, name, phone, avatar`,
      [name || null, phone || null, userId]
    )

    const updatedUser = updateResult.rows[0]

    logger.businessEvent({
      event: "Profile updated",
      userId,
      data: { name, phone }
    })

    const response = NextResponse.json({
      success: true,
      data: updatedUser,
      message: "个人资料已更新",
    })

    logger.apiCall({
      method: "PUT",
      url: "/api/user/profile",
      status: 200,
      duration: Date.now() - startTime,
      userId
    })

    return response

  } catch (error) {
    logger.apiCall({
      method: "PUT",
      url: "/api/user/profile",
      status: 500,
      duration: Date.now() - startTime,
      userId: session?.user?.id,
      error: error instanceof Error ? error : new Error(String(error))
    })
    return createErrorResponse(error)
  } finally {
    client.release()
  }
}



