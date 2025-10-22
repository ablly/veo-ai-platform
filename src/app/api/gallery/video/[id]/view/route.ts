import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import pool from "@/lib/db"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const client = await pool.connect()
  
  try {
    const session = await getServerSession(authOptions)
    const { id: videoId } = await params
    const userId = session?.user?.id || null
    
    // 获取IP地址和User-Agent
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || '127.0.0.1'
    const userAgent = request.headers.get('user-agent') || ''

    await client.query('BEGIN')

    // 检查是否在最近1小时内已经记录过浏览（防止重复计数）
    const recentView = await client.query(`
      SELECT id FROM video_views 
      WHERE video_id = $1 
        AND (user_id = $2 OR ip_address = $3::inet)
        AND created_at > NOW() - INTERVAL '1 hour'
      LIMIT 1
    `, [videoId, userId, ip])

    if (recentView.rows.length === 0) {
      // 记录浏览
      await client.query(`
        INSERT INTO video_views (user_id, video_id, ip_address, user_agent)
        VALUES ($1, $2, $3::inet, $4)
      `, [userId, videoId, ip, userAgent])

      // 增加浏览数
      await client.query(
        'UPDATE gallery_videos SET views_count = views_count + 1 WHERE id = $1',
        [videoId]
      )
    }

    // 获取最新浏览数
    const result = await client.query(
      'SELECT views_count FROM gallery_videos WHERE id = $1',
      [videoId]
    )

    await client.query('COMMIT')

    return NextResponse.json({
      success: true,
      viewsCount: result.rows[0]?.views_count || 0
    })

  } catch (error) {
    await client.query('ROLLBACK')
    console.error("记录浏览失败:", error)
    return NextResponse.json(
      { error: "记录浏览失败", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  } finally {
    client.release()
  }
}
