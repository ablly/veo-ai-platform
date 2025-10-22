import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "未登录" },
        { status: 401 }
      )
    }

    // 查询用户积分账户
    const creditAccounts = await prisma.$queryRaw`
      SELECT 
        total_credits,
        available_credits,
        used_credits,
        frozen_credits,
        expires_at,
        created_at,
        updated_at
      FROM user_credit_accounts 
      WHERE user_id = ${session.user.id}
      LIMIT 1
    ` as {
      total_credits: number;
      available_credits: number;
      used_credits: number;
      frozen_credits: number;
      expires_at: Date | null;
      created_at: Date;
      updated_at: Date;
    }[]

    if (creditAccounts.length === 0) {
      return NextResponse.json(
        { error: "积分账户不存在" },
        { status: 404 }
      )
    }

    const creditAccount = creditAccounts[0]

    // 查询最近的积分交易记录
    const recentTransactions = await prisma.$queryRaw`
      SELECT 
        transaction_type,
        credit_amount,
        balance_after,
        description,
        created_at
      FROM credit_transactions 
      WHERE user_id = ${session.user.id}
      ORDER BY created_at DESC
      LIMIT 5
    ` as {
      transaction_type: string;
      credit_amount: number;
      balance_after: number;
      description: string | null;
      created_at: Date;
    }[]

    return NextResponse.json({
      success: true,
      data: {
        account: creditAccount,
        recentTransactions: recentTransactions
      }
    })

  } catch (error) {
    console.error("获取积分信息失败:", error)
    return NextResponse.json(
      { error: "获取积分信息失败" },
      { status: 500 }
    )
  }
}
