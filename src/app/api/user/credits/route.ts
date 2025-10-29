import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { pool } from "@/lib/db"
import { createErrorResponse, Errors } from "@/lib/error-handler"
import { logger } from "@/lib/logger"

export async function GET() {
  const client = await pool.connect()
  
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      throw Errors.unauthorized()
    }

    const userId = session.user.id
    const startTime = Date.now()

    // 查询用户积分账户
    const creditResult = await client.query(
      `SELECT 
        total_credits,
        available_credits,
        used_credits,
        frozen_credits,
        package_expires_at,
        is_expired,
        package_name,
        created_at,
        updated_at
      FROM user_credit_accounts 
      WHERE user_id = $1`,
      [userId]
    )

    if (creditResult.rows.length === 0) {
      // 如果没有积分账户，创建一个默认的
      await client.query(
        `INSERT INTO user_credit_accounts (user_id, available_credits, total_credits, used_credits, frozen_credits, created_at, updated_at)
         VALUES ($1, 0, 0, 0, 0, NOW(), NOW())`,
        [userId]
      )
      
      const creditAccount = {
        total_credits: 0,
        available_credits: 0,
        used_credits: 0,
        frozen_credits: 0,
        package_expires_at: null,
        is_expired: false,
        package_name: null,
        created_at: new Date(),
        updated_at: new Date()
      }

      const response = NextResponse.json({
        success: true,
        data: {
          account: creditAccount,
          recentTransactions: []
        }
      })

      logger.apiCall({
        method: "GET",
        url: "/api/user/credits",
        status: 200,
        duration: Date.now() - startTime,
        userId
      })

      return response
    }

    const creditAccount = creditResult.rows[0]

    // 查询最近的积分交易记录
    const transactionResult = await client.query(
      `SELECT 
        transaction_type,
        credit_amount,
        balance_after,
        description,
        created_at
      FROM credit_transactions 
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 10`,
      [userId]
    )

    const response = NextResponse.json({
      success: true,
      data: {
        account: creditAccount,
        recentTransactions: transactionResult.rows
      }
    })

    logger.apiCall({
      method: "GET",
      url: "/api/user/credits",
      status: 200,
      duration: Date.now() - startTime,
      userId
    })

    return response

  } catch (error) {
    logger.apiCall({
      method: "GET",
      url: "/api/user/credits",
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
