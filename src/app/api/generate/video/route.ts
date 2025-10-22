import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { pool } from "@/lib/db"
import { createErrorResponse, Errors, validateRequired } from "@/lib/error-handler"
import { logger } from "@/lib/logger"
import { measurePerformance } from "@/lib/logger"
import { CREDIT_CONFIG } from "@/config/credits"

// VEO API配置
const VEO_API_URL = process.env.VEO_API_URL || "https://api.veo.ai"
const VEO_API_KEY = process.env.VEO_API_KEY

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // 验证用户登录状态
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return createErrorResponse(Errors.UNAUTHORIZED, "用户未登录")
    }

    // 解析请求体
    const body = await request.json()
    const { prompt, images = [] } = body

    // 验证必需参数
    const validation = validateRequired({ prompt }, ["prompt"])
    if (!validation.isValid) {
      return createErrorResponse(Errors.VALIDATION_ERROR, `缺少必需参数: ${validation.missingFields.join(", ")}`)
    }

    if (prompt.trim().length === 0) {
      return createErrorResponse(Errors.VALIDATION_ERROR, "视频描述不能为空")
    }

    if (prompt.length > 500) {
      return createErrorResponse(Errors.VALIDATION_ERROR, "视频描述不能超过500个字符")
    }

    // 计算所需积分
    const baseCredits = CREDIT_CONFIG.VIDEO_GENERATION.BASE_COST
    const imageCredits = images.length * CREDIT_CONFIG.VIDEO_GENERATION.IMAGE_COST
    const totalCredits = baseCredits + imageCredits

    logger.info("开始视频生成", {
      user_email: session.user.email,
      prompt_length: prompt.length,
      image_count: images.length,
      total_credits: totalCredits
    })

    // 开始数据库事务
    const client = await pool.connect()
    
    try {
      await client.query('BEGIN')

      // 查询用户当前积分
      const userResult = await client.query(
        `SELECT u.id, COALESCE(uca.available_credits, 0) as available_credits 
         FROM users u 
         LEFT JOIN user_credit_accounts uca ON u.id = uca.user_id 
         WHERE u.email = $1`,
        [session.user.email]
      )

      if (userResult.rows.length === 0) {
        await client.query('ROLLBACK')
        return createErrorResponse(Errors.NOT_FOUND, "用户不存在")
      }

      const user = userResult.rows[0]
      const availableCredits = user.available_credits || 0

      // 检查积分是否足够
      if (availableCredits < totalCredits) {
        await client.query('ROLLBACK')
        return createErrorResponse(Errors.INSUFFICIENT_CREDITS, `积分不足，需要 ${totalCredits} 积分，当前只有 ${availableCredits} 积分`)
      }

      // 扣除积分
      await client.query(
        `UPDATE user_credit_accounts 
         SET available_credits = available_credits - $1,
             used_credits = used_credits + $1,
             updated_at = NOW()
         WHERE user_id = $2`,
        [totalCredits, user.id]
      )

      // 创建视频生成记录
      const videoResult = await client.query(
        `INSERT INTO video_generations 
         (user_id, prompt, reference_images, status, credits_consumed, created_at)
         VALUES ($1, $2, $3, 'PROCESSING', $4, NOW())
         RETURNING id`,
        [user.id, prompt, JSON.stringify(images), totalCredits]
      )

      const videoId = videoResult.rows[0].id

      await client.query('COMMIT')

      // 调用VEO API生成视频
      const veoResponse = await callVeoAPI(prompt, images, videoId)
      
      if (!veoResponse.success) {
        // VEO API调用失败，回滚积分
        await pool.query(
          `UPDATE user_credit_accounts 
           SET available_credits = available_credits + $1,
               used_credits = used_credits - $1,
               updated_at = NOW()
           WHERE user_id = $2`,
          [totalCredits, user.id]
        )

        await pool.query(
          `UPDATE video_generations 
           SET status = 'FAILED', 
               error_message = $1
           WHERE id = $2`,
          [veoResponse.error, videoId]
        )

        return createErrorResponse(Errors.EXTERNAL_API_ERROR, veoResponse.error || "视频生成失败")
      }

      // 更新视频生成记录
      await pool.query(
        `UPDATE video_generations 
         SET external_task_id = $1,
             updated_at = NOW()
         WHERE id = $2`,
        [veoResponse.taskId, videoId]
      )

      const duration = measurePerformance(startTime)
      logger.info("视频生成请求成功", {
        user_email: session.user.email,
        video_id: videoId,
        task_id: veoResponse.taskId,
        duration
      })

      return NextResponse.json({
        success: true,
        taskId: veoResponse.taskId,
        videoId: videoId,
        creditsUsed: totalCredits,
        message: "视频生成已开始，请等待处理完成"
      })

    } catch (dbError) {
      await client.query('ROLLBACK')
      throw dbError
    } finally {
      client.release()
    }

  } catch (error) {
    const duration = measurePerformance(startTime)
    logger.error("视频生成失败", { 
      error: error instanceof Error ? error.message : String(error),
      duration
    })
    return createErrorResponse(Errors.INTERNAL_SERVER_ERROR, "服务器内部错误")
  }
}

export async function GET(request: NextRequest) {
  try {
    // 验证用户登录状态
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return createErrorResponse(Errors.UNAUTHORIZED, "用户未登录")
    }

    // 获取查询参数
    const { searchParams } = new URL(request.url)
    const taskId = searchParams.get('taskId')

    if (!taskId) {
      return createErrorResponse(Errors.VALIDATION_ERROR, "缺少taskId参数")
    }

    // 查询视频生成状态
    const result = await pool.query(
      `SELECT vg.*, u.email 
       FROM video_generations vg
       JOIN users u ON vg.user_id = u.id
       WHERE vg.external_task_id = $1 AND u.email = $2`,
      [taskId, session.user.email]
    )

    if (result.rows.length === 0) {
      return createErrorResponse(Errors.NOT_FOUND, "视频生成任务不存在")
    }

    const video = result.rows[0]

    // 如果状态是processing，查询VEO API获取最新状态
    if (video.status === 'PROCESSING') {
      const veoStatus = await checkVeoStatus(taskId)
      
      if (veoStatus.success) {
        if (veoStatus.status === 'completed' && veoStatus.videoUrl) {
          // 更新数据库状态
          await pool.query(
            `UPDATE video_generations 
             SET status = 'COMPLETED',
                 video_url = $1,
                 completed_at = NOW()
             WHERE external_task_id = $2`,
            [veoStatus.videoUrl, taskId]
          )
          
          return NextResponse.json({
            success: true,
            status: 'completed',
            videoUrl: veoStatus.videoUrl,
            createdAt: video.created_at
          })
        } else if (veoStatus.status === 'failed') {
          // 更新数据库状态为失败
          await pool.query(
            `UPDATE video_generations 
             SET status = 'FAILED',
                 error_message = $1
             WHERE external_task_id = $2`,
            [veoStatus.error || '生成失败', taskId]
          )
          
          return NextResponse.json({
            success: false,
            status: 'failed',
            error: veoStatus.error || '视频生成失败'
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      status: video.status,
      videoUrl: video.video_url,
      createdAt: video.created_at,
      error: video.error_message
    })

  } catch (error) {
    logger.error("查询视频生成状态失败", { error })
    return createErrorResponse(Errors.INTERNAL_SERVER_ERROR, "服务器内部错误")
  }
}

// 调用VEO API生成视频
async function callVeoAPI(prompt: string, images: string[], videoId: string) {
  try {
    if (!VEO_API_KEY) {
      throw new Error("VEO API密钥未配置")
    }

    const payload = {
      prompt,
      images,
      callback_url: `${process.env.NEXTAUTH_URL}/api/webhooks/veo`,
      metadata: { videoId }
    }

    const response = await fetch(`${VEO_API_URL}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${VEO_API_KEY}`
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(30000) // 30秒超时
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `VEO API错误: ${response.status}`)
    }

    const data = await response.json()
    
    return {
      success: true,
      taskId: data.task_id || data.id
    }

  } catch (error) {
    logger.error("VEO API调用失败", { error, prompt })
    return {
      success: false,
      error: error instanceof Error ? error.message : "VEO API调用失败"
    }
  }
}

// 检查VEO API状态
async function checkVeoStatus(taskId: string) {
  try {
    if (!VEO_API_KEY) {
      throw new Error("VEO API密钥未配置")
    }

    const response = await fetch(`${VEO_API_URL}/status/${taskId}`, {
      headers: {
        'Authorization': `Bearer ${VEO_API_KEY}`
      },
      signal: AbortSignal.timeout(10000) // 10秒超时
    })

    if (!response.ok) {
      throw new Error(`VEO API状态查询错误: ${response.status}`)
    }

    const data = await response.json()
    
    return {
      success: true,
      status: data.status,
      videoUrl: data.video_url,
      error: data.error
    }

  } catch (error) {
    logger.error("VEO API状态查询失败", { error, taskId })
    return {
      success: false,
      error: error instanceof Error ? error.message : "状态查询失败"
    }
  }
}
