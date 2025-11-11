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
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "请先登录" },
        { status: 401 }
      )
    }

    const { id: videoId } = await params
    const userId = session.user.id

    await client.query('BEGIN')

    // 检查是否已经点赞
    const existingLike = await client.query(
      'SELECT id FROM video_likes WHERE user_id = $1 AND video_id = $2',
      [userId, videoId]
    )

    let isLiked = false

    if (existingLike.rows.length > 0) {
      // 取消点赞
      await client.query(
        'DELETE FROM video_likes WHERE user_id = $1 AND video_id = $2',
        [userId, videoId]
      )
      
      // 减少点赞数
      await client.query(
        'UPDATE gallery_videos SET likes_count = likes_count - 1 WHERE id = $1',
        [videoId]
      )
      
      isLiked = false
    } else {
      // 添加点赞
      await client.query(
        'INSERT INTO video_likes (user_id, video_id) VALUES ($1, $2)',
        [userId, videoId]
      )
      
      // 增加点赞数
      await client.query(
        'UPDATE gallery_videos SET likes_count = likes_count + 1 WHERE id = $1',
        [videoId]
      )
      
      isLiked = true
    }

    // 获取最新点赞数
    const result = await client.query(
      'SELECT likes_count FROM gallery_videos WHERE id = $1',
      [videoId]
    )

    await client.query('COMMIT')

    return NextResponse.json({
      success: true,
      isLiked,
      likesCount: result.rows[0]?.likes_count || 0
    })

  } catch (error) {
    await client.query('ROLLBACK')
    console.error("点赞操作失败:", error)
    return NextResponse.json(
      { error: "点赞操作失败", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  } finally {
    client.release()
  }
}
