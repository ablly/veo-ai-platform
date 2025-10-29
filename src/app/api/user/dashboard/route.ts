import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { Pool } from "pg"

const pool = new Pool({
  connectionString: "postgresql://postgres:bxbbyffb4y4djTx3@db.hblthmkkdfkzvpywlthq.supabase.co:5432/postgres",
  ssl: { rejectUnauthorized: false },
  max: 5,
})

export async function GET() {
  const client = await pool.connect()
  
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "未授权访问" },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // 1. 获取积分信息
    const creditsResult = await client.query(
      `SELECT available_credits FROM user_credit_accounts WHERE user_id = $1`,
      [userId]
    )
    const availableCredits = creditsResult.rows[0]?.available_credits || 0

    // 2. 获取视频生成总数
    const videoCountResult = await client.query(
      `SELECT COUNT(*) as count FROM video_generations WHERE user_id = $1`,
      [userId]
    )
    const totalVideos = parseInt(videoCountResult.rows[0]?.count || '0')

    // 3. 获取已完成视频的总时长（假设每个视频默认5秒）
    const completedVideosResult = await client.query(
      `SELECT COUNT(*) as count FROM video_generations 
       WHERE user_id = $1 AND status = 'COMPLETED'`,
      [userId]
    )
    const completedVideos = parseInt(completedVideosResult.rows[0]?.count || '0')
    const totalDuration = completedVideos * 5 // 默认每个视频5秒

    // 4. 获取本月使用次数（本月的积分消耗交易）
    const monthUsageResult = await client.query(
      `SELECT COUNT(*) as count FROM credit_transactions 
       WHERE user_id = $1 
       AND transaction_type = 'CONSUME' 
       AND created_at >= date_trunc('month', CURRENT_DATE)`,
      [userId]
    )
    const monthlyUsage = parseInt(monthUsageResult.rows[0]?.count || '0')

    // 5. 获取最近的视频作品（最多10个）
    const recentVideosResult = await client.query(
      `SELECT id, prompt, video_url, thumbnail_url, status, created_at, completed_at
       FROM video_generations 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT 10`,
      [userId]
    )

    // 6. 获取最近活动（积分交易记录）
    const recentActivitiesResult = await client.query(
      `SELECT transaction_type, credit_amount, description, created_at
       FROM credit_transactions 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT 10`,
      [userId]
    )

    client.release()

    return NextResponse.json({
      success: true,
      data: {
        credits: {
          available: availableCredits
        },
        videos: {
          total: totalVideos,
          completed: completedVideos
        },
        stats: {
          totalDuration: totalDuration,
          monthlyUsage: monthlyUsage
        },
        recentVideos: recentVideosResult.rows,
        recentActivities: recentActivitiesResult.rows.map(activity => ({
          type: activity.transaction_type,
          amount: activity.credit_amount,
          description: activity.description,
          date: activity.created_at
        }))
      }
    })

  } catch (error) {
    console.error("获取工作台数据错误:", error)
    if (client) {
      client.release()
    }
    return NextResponse.json(
      { error: "服务器内部错误" },
      { status: 500 }
    )
  }
}













