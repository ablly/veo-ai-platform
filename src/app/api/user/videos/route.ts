import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "未授权访问" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const offset = (page - 1) * limit

    // 查询用户的视频生成历史
    const videos = await prisma.$queryRaw`
      SELECT 
        id,
        prompt,
        status,
        video_url,
        thumbnail_url,
        credit_cost,
        created_at,
        completed_at
      FROM video_generations 
      WHERE user_id = ${session.user.id}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    ` as {
      id: string
      prompt: string
      status: string
      video_url: string | null
      thumbnail_url: string | null
      credit_cost: number
      created_at: Date
      completed_at: Date | null
    }[]

    // 查询总数
    const totalResult = await prisma.$queryRaw`
      SELECT COUNT(*) as count
      FROM video_generations 
      WHERE user_id = ${session.user.id}
    ` as { count: bigint }[]

    const total = Number(totalResult[0].count)

    return NextResponse.json({
      success: true,
      videos: videos.map(video => ({
        id: video.id,
        prompt: video.prompt,
        status: video.status,
        videoUrl: video.video_url,
        thumbnailUrl: video.thumbnail_url,
        creditCost: video.credit_cost,
        createdAt: video.created_at.toISOString(),
        completedAt: video.completed_at?.toISOString() || null
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error("查询视频历史错误:", error)
    return NextResponse.json(
      { error: "服务器内部错误" },
      { status: 500 }
    )
  }
}














