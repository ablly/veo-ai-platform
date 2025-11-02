import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { pool } from "@/lib/db"
import { createErrorResponse, Errors, validateRequired } from "@/lib/error-handler"
import { logger } from "@/lib/logger"
import { measurePerformance } from "@/lib/logger"
import { CREDIT_CONFIG } from "@/config/credits"
import { API_CONFIG } from "@/config/api"

// 速创API配置
const SUCHUANG_API_URL = API_CONFIG.SUCHUANG.BASE_URL
const SUCHUANG_API_KEY = API_CONFIG.SUCHUANG.API_KEY
const VEO_COST_PER_VIDEO = API_CONFIG.COSTS.VEO3

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // 验证用户登录状态
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return createErrorResponse(Errors.unauthorized("用户未登录"))
    }

    // 解析请求体
    const body = await request.json()
    const { 
      prompt, 
      images = [], 
      duration = 5, 
      aspectRatio = "16:9",
      model = "veo3",
      watermark = ""
    } = body

    // 验证必需参数
    const validation = validateRequired({ prompt }, ["prompt"])
    if (!validation.isValid) {
      return createErrorResponse(Errors.validationError(`缺少必需参数: ${validation.missingFields.join(", ")}`))
    }

    if (prompt.trim().length === 0) {
      return createErrorResponse(Errors.validationError("视频描述不能为空"))
    }

    if (prompt.length > 500) {
      return createErrorResponse(Errors.validationError("视频描述不能超过500个字符"))
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

      // 查询用户当前积分和过期时间
      const userResult = await client.query(
        `SELECT u.id, u.name, u.email,
                COALESCE(uca.available_credits, 0) as available_credits,
                uca.package_expires_at,
                uca.is_expired,
                uca.package_name
         FROM users u 
         LEFT JOIN user_credit_accounts uca ON u.id = uca.user_id 
         WHERE u.email = $1`,
        [session.user.email]
      )

      if (userResult.rows.length === 0) {
        await client.query('ROLLBACK')
        return createErrorResponse(Errors.notFound("用户"))
      }

      const user = userResult.rows[0]
      const availableCredits = user.available_credits || 0
      const expiresAt = user.package_expires_at
      const isExpired = user.is_expired

      // 1. 检查套餐是否已过期
      if (isExpired) {
        await client.query('ROLLBACK')
        return createErrorResponse(
          Errors.forbidden(`您的套餐"${user.package_name}"已过期，请购买新套餐后继续使用`)
        )
      }

      // 2. 检查套餐是否已到期（如果有过期时间）
      if (expiresAt) {
        const now = new Date()
        const expires = new Date(expiresAt)
        
        if (expires < now) {
          // 标记为已过期
          await client.query(
            'UPDATE user_credit_accounts SET is_expired = true WHERE user_id = $1',
            [user.id]
          )
          await client.query('ROLLBACK')
          return createErrorResponse(
            Errors.forbidden(`您的套餐"${user.package_name}"已于 ${expires.toLocaleDateString('zh-CN')} 过期，请购买新套餐后继续使用`)
          )
        }
      }

      // 3. 检查积分是否足够
      if (availableCredits < totalCredits) {
        await client.query('ROLLBACK')
        
        // 如果积分不足，发送提醒邮件（异步）
        if (availableCredits < 15 && user.email) {
          import('@/lib/email').then(({ EmailService }) => {
            EmailService.sendCreditLow({
              email: user.email,
              userName: user.name || user.email.split('@')[0],
              availableCredits
            }).catch(err => logger.error('发送积分不足邮件失败', { error: err }))
          })
        }
        
        return createErrorResponse(
          Errors.insufficientCredits(totalCredits, availableCredits)
        )
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

      // 调用速创API生成视频
      const veoResponse = await callSuchuangAPI({
        prompt,
        images,
        videoId,
        duration,
        aspectRatio,
        model,
        watermark
      })
      
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

        // 如果是API余额不足或服务不可用，发送管理员通知邮件
        if (veoResponse.error && (
          veoResponse.error.includes("余额不足") || 
          veoResponse.error.includes("服务暂时不可用") ||
          veoResponse.error.includes("服务配置异常")
        )) {
          import('@/lib/email').then(({ EmailService }) => {
            EmailService.sendAdminAlert({
              subject: "🚨 紧急：速创API服务异常",
              message: `速创API出现异常，影响视频生成功能。请立即检查并处理。\n\n错误详情：${veoResponse.error}\n时间：${new Date().toLocaleString('zh-CN')}\n\n可能原因：\n1. API账户余额不足，需要充值\n2. API密钥过期或无效\n3. API服务暂时故障\n\n请登录速创API管理后台查看详情。`,
              adminEmail: "3533912007@qq.com"
            }).catch(err => logger.error('发送管理员通知邮件失败', { error: err }))
          })
        }

        return createErrorResponse(Errors.externalServiceError("速创API", veoResponse.error || "视频生成失败"))
      }

      // 更新视频生成记录
      await pool.query(
        `UPDATE video_generations 
         SET external_task_id = $1,
             updated_at = NOW()
         WHERE id = $2`,
        [veoResponse.taskId, videoId]
      )

      // 记录API成本
      await pool.query(
        `INSERT INTO api_cost_records 
         (user_id, video_id, api_provider, model, cost, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [user.id, videoId, 'suchuang', model, VEO_COST_PER_VIDEO]
      )

      const executionTime = measurePerformance(startTime)
      logger.info("视频生成请求成功", {
        user_email: session.user.email,
        video_id: videoId,
        task_id: veoResponse.taskId,
        duration: executionTime
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
    const executionTime = measurePerformance(startTime)
    logger.error("视频生成失败", { 
      error: error instanceof Error ? error.message : String(error),
      duration: executionTime
    })
    return createErrorResponse(error instanceof Error ? error : new Error(String(error)))
  }
}

export async function GET(request: NextRequest) {
  try {
    // 验证用户登录状态
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return createErrorResponse(Errors.unauthorized("用户未登录"))
    }

    // 获取查询参数
    const { searchParams } = new URL(request.url)
    const taskId = searchParams.get('taskId')

    if (!taskId) {
      return createErrorResponse(Errors.validationError("缺少taskId参数"))
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
      return createErrorResponse(Errors.notFound("视频生成任务"))
    }

    const video = result.rows[0]

    // 如果状态是processing，查询速创API获取最新状态
    if (video.status === 'PROCESSING') {
      const veoStatus = await checkSuchuangStatus(taskId)
      
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
    return createErrorResponse(error instanceof Error ? error : new Error(String(error)))
  }
}

// 调用速创API生成视频
async function callSuchuangAPI(options: {
  prompt: string
  images: string[]
  videoId: string
  duration?: number
  aspectRatio?: string
  model?: string
  watermark?: string
}) {
  try {
    if (!SUCHUANG_API_KEY) {
      throw new Error("速创API密钥未配置")
    }

    const { prompt, images, videoId, aspectRatio = "16:9", model = "veo3" } = options

    // 确定视频类型
    const type = images && images.length > 0 
      ? API_CONFIG.SUCHUANG.TYPES.IMAGE_TO_VIDEO 
      : API_CONFIG.SUCHUANG.TYPES.TEXT_TO_VIDEO

    // 构建请求载荷（根据速创API文档格式）
    const payload: any = {
      model: model,
      prompt: prompt,
      type: type,
      ratio: aspectRatio
    }

    // 如果是图生视频，添加图片URL
    if (type === API_CONFIG.SUCHUANG.TYPES.IMAGE_TO_VIDEO && images.length > 0) {
      payload.img_url = images // 速创API支持数组格式
    }

    logger.info("调用速创API", { 
      prompt, 
      type, 
      ratio: aspectRatio, 
      model, 
      imageCount: images.length 
    })

    const response = await fetch(`${SUCHUANG_API_URL}${API_CONFIG.SUCHUANG.ENDPOINTS.GENERATE}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset:utf-8;',
        'Authorization': SUCHUANG_API_KEY
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(30000) // 30秒超时
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      logger.error("速创API返回错误", { 
        status: response.status, 
        error: errorData,
        url: `${SUCHUANG_API_URL}${API_CONFIG.SUCHUANG.ENDPOINTS.GENERATE}`
      })
      
      // 特殊处理常见错误
      let errorMessage = errorData.msg || `速创API错误: ${response.status}`
      
      if (response.status === 402 || response.status === 403) {
        errorMessage = "服务暂时不可用，请稍后重试或联系我们"
        // 发送管理员紧急通知（异步，不阻塞）
        import('@/lib/email').then(({ EmailService }) => {
          EmailService.sendAdminAlert({
            subject: "🚨 紧急：速创API余额不足",
            message: `速创API返回余额不足错误（状态码：${response.status}），无法生成视频。\n\n请立即登录速创API管理后台充值。\n\n错误详情：${JSON.stringify(errorData)}\n时间：${new Date().toLocaleString('zh-CN')}`,
            adminEmail: "3533912007@qq.com"
          }).catch(err => logger.error('发送管理员通知失败', { error: err }))
        })
      } else if (response.status === 401) {
        errorMessage = "服务配置异常，请联系我们"
        // 发送管理员通知
        import('@/lib/email').then(({ EmailService }) => {
          EmailService.sendAdminAlert({
            subject: "🚨 紧急：速创API密钥异常",
            message: `速创API返回认证失败错误（状态码：401），可能是API密钥过期或无效。\n\n请检查并更新API密钥配置。\n\n错误详情：${JSON.stringify(errorData)}\n时间：${new Date().toLocaleString('zh-CN')}`,
            adminEmail: "3533912007@qq.com"
          }).catch(err => logger.error('发送管理员通知失败', { error: err }))
        })
      } else if (response.status === 429) {
        errorMessage = "请求过于频繁，请稍后重试"
      } else if (response.status >= 500) {
        errorMessage = "服务暂时不可用，请稍后重试"
      }
      
      throw new Error(errorMessage)
    }

    const result = await response.json()
    
    // 速创API响应格式: { code: 200, data: { taskId: "..." }, msg: "success" }
    if (result.code !== 200 || !result.data) {
      throw new Error(result.msg || "速创API返回数据格式错误")
    }

    // 速创API返回的taskId可能在data中
    const taskId = result.data.taskId || result.data.task_id || result.data.id || JSON.stringify(result.data)

    logger.info("速创API调用成功", { taskId, videoId, response: result })
    
    return {
      success: true,
      taskId: taskId
    }

  } catch (error) {
    logger.error("速创API调用失败", { 
      error: error instanceof Error ? error.message : String(error), 
      prompt: options.prompt 
    })
    return {
      success: false,
      error: error instanceof Error ? error.message : "速创API调用失败"
    }
  }
}

// 检查速创API状态
async function checkSuchuangStatus(taskId: string) {
  try {
    if (!SUCHUANG_API_KEY) {
      throw new Error("速创API密钥未配置")
    }

    // 注意：速创API的查询接口需要根据实际文档确认
    // 这里假设查询接口格式，如有不同请根据实际文档调整
    const response = await fetch(
      `${SUCHUANG_API_URL}/api/video/veoPlus/query?taskId=${taskId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': SUCHUANG_API_KEY
        },
        signal: AbortSignal.timeout(10000) // 10秒超时
      }
    )

    if (!response.ok) {
      throw new Error(`速创API状态查询错误: ${response.status}`)
    }

    const result = await response.json()
    
    // 速创API响应格式（根据通用API平台规范推测）:
    // {
    //   code: 200,
    //   msg: "success",
    //   data: {
    //     status: "pending" | "processing" | "completed" | "failed",
    //     videoUrl: "https://...",
    //     errorMessage: "..."
    //   }
    // }
    
    if (result.code !== 200 || !result.data) {
      throw new Error(result.msg || "速创API返回数据格式错误")
    }

    const data = result.data
    
    // 根据status判断状态
    if (data.status === 'completed' && data.videoUrl) {
      // 成功生成
      return {
        success: true,
        status: 'completed',
        videoUrl: data.videoUrl || data.video_url || data.url,
        error: null
      }
    } else if (data.status === 'failed') {
      // 生成失败
      return {
        success: true,
        status: 'failed',
        videoUrl: null,
        error: data.errorMessage || data.error_message || data.error || '视频生成失败'
      }
    } else {
      // 仍在处理中（pending或processing）
      return {
        success: true,
        status: 'processing',
        videoUrl: null,
        error: null
      }
    }

  } catch (error) {
    logger.error("速创API状态查询失败", { 
      error: error instanceof Error ? error.message : String(error), 
      taskId 
    })
    return {
      success: false,
      error: error instanceof Error ? error.message : "状态查询失败"
    }
  }
}
