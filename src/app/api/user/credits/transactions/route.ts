import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { pool } from "@/lib/db"

export async function GET(request: Request) {
  const client = await pool.connect()
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 })
    }

    const userId = session.user.id

    // 获取URL参数
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    const result = await client.query(
      `SELECT 
        id,
        transaction_type as type,
        credit_amount as amount,
        description,
        balance_before,
        balance_after,
        created_at
      FROM credit_transactions
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    )

    const transactions = result.rows.map(row => ({
      id: row.id,
      type: row.type,
      amount: row.amount,
      description: row.description,
      balance_before: row.balance_before,
      balance_after: row.balance_after,
      created_at: row.created_at
    }))

    return NextResponse.json({
      success: true,
      transactions
    })
  } catch (error) {
    console.error("获取交易历史失败:", error)
    return NextResponse.json(
      { error: "获取交易历史失败", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  } finally {
    client.release()
  }
}





