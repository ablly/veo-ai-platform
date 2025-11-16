/**
 * 视频模型适配器
 * 统一VEO和SORA2的API调用接口
 */

import { API_CONFIG } from '@/config/api'
import { logger } from './logger'

const SUCHUANG_API_URL = API_CONFIG.SUCHUANG.BASE_URL
const SUCHUANG_API_KEY = API_CONFIG.SUCHUANG.API_KEY

interface GenerateParams {
  prompt: string
  images?: string[]
  duration?: number
  aspectRatio?: string
  size?: string
  remixTargetId?: string
}

interface GenerateResult {
  success: boolean
  taskId?: string
  error?: string
}

interface StatusResult {
  success: boolean
  status?: 'COMPLETED' | 'FAILED' | 'PROCESSING'
  videoUrl?: string
  error?: string
  remixPid?: string  // SORA2续作PID
}

/**
 * VEO模型API调用
 */
export async function callVeoAPI(params: GenerateParams): Promise<GenerateResult> {
  try {
    const { prompt, images = [], aspectRatio = '16:9' } = params

    const type = images.length > 0 
      ? API_CONFIG.SUCHUANG.TYPES.IMAGE_TO_VIDEO 
      : API_CONFIG.SUCHUANG.TYPES.TEXT_TO_VIDEO

    const payload: any = {
      model: 'veo3',
      prompt: prompt,
      type: type,
      ratio: aspectRatio
    }

    if (type === API_CONFIG.SUCHUANG.TYPES.IMAGE_TO_VIDEO && images.length > 0) {
      payload.img_url = images
    }

    logger.info('调用VEO API', { prompt, type, ratio: aspectRatio })

    const response = await fetch(`${SUCHUANG_API_URL}${API_CONFIG.SUCHUANG.ENDPOINTS.VEO_GENERATE}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset:utf-8;',
        'Authorization': SUCHUANG_API_KEY
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(30000)
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const result = await response.json()
    
    if (result.code !== 200 || !result.data) {
      throw new Error(result.msg || 'VEO API返回错误')
    }

    const taskId = result.data.id

    if (!taskId) {
      throw new Error('VEO API未返回任务ID')
    }

    logger.info('VEO API调用成功', { taskId })
    
    return {
      success: true,
      taskId: String(taskId)
    }

  } catch (error) {
    logger.error('VEO API调用失败', { error })
    return {
      success: false,
      error: error instanceof Error ? error.message : 'VEO API调用失败'
    }
  }
}

/**
 * SORA2模型API调用
 */
export async function callSora2API(params: GenerateParams): Promise<GenerateResult> {
  try {
    const { 
      prompt, 
      images = [], 
      duration = 10, 
      aspectRatio = '9:16',
      remixTargetId = ''
    } = params

    const formData = new URLSearchParams({
      prompt: prompt,
      aspectRatio: aspectRatio,
      duration: String(duration)
    })

    if (images.length > 0) {
      formData.append('url', images[0])
    }

    if (remixTargetId) {
      formData.append('remixTargetId', remixTargetId)
    }

    logger.info('调用SORA2 API', { prompt, duration, aspectRatio })

    const response = await fetch(
      `${SUCHUANG_API_URL}${API_CONFIG.SUCHUANG.ENDPOINTS.SORA2_SUBMIT}?key=${SUCHUANG_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset:utf-8;',
          'Authorization': SUCHUANG_API_KEY
        },
        body: formData,
        signal: AbortSignal.timeout(30000)
      }
    )

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const result = await response.json()
    
    // 记录完整的 API 响应用于调试
    logger.info('SORA2 API 原始响应', { 
      code: result.code, 
      message: result.message,
      msg: result.msg,
      data: result.data,
      fullResponse: JSON.stringify(result)
    })
    
    // SORA2 API 可能返回 code: 200 或 code: 0 表示成功
    // 兼容两种格式
    if ((result.code !== 0 && result.code !== 200) || !result.data) {
      const errorMsg = result.message || result.msg || `SORA2 API返回错误 (code: ${result.code})`
      throw new Error(errorMsg)
    }

    const taskId = result.data.id

    if (!taskId) {
      throw new Error('SORA2 API未返回任务ID')
    }

    logger.info('SORA2 API调用成功', { taskId })
    
    return {
      success: true,
      taskId: String(taskId)
    }

  } catch (error) {
    logger.error('SORA2 API调用失败', { error })
    return {
      success: false,
      error: error instanceof Error ? error.message : 'SORA2 API调用失败'
    }
  }
}

/**
 * VEO状态查询
 */
export async function checkVeoStatus(taskId: string): Promise<StatusResult> {
  try {
    const response = await fetch(
      `${SUCHUANG_API_URL}${API_CONFIG.SUCHUANG.ENDPOINTS.VEO_QUERY}?key=${SUCHUANG_API_KEY}&id=${taskId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json;charset:utf-8;',
          'Authorization': SUCHUANG_API_KEY
        },
        signal: AbortSignal.timeout(10000)
      }
    )

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const result = await response.json()
    
    if (result.code !== 200 || !result.data) {
      throw new Error(result.msg || '查询失败')
    }

    const data = result.data
    
    if (data.status === 1 && data.content) {
      return {
        success: true,
        status: 'COMPLETED',
        videoUrl: data.content
      }
    } else if (data.status === 2) {
      // 检测是否为内容违规
      const failReason = data.fail_reason || '生成失败'
      let errorMessage = failReason
      
      if (failReason.toLowerCase().includes('violation')) {
        errorMessage = '您的提示词包含违规内容，请修改后重试。提示：避免涉及暴力、色情、政治敏感或侵犯版权的内容。'
      }
      
      return {
        success: true,
        status: 'FAILED',
        error: errorMessage
      }
    } else {
      return {
        success: true,
        status: 'PROCESSING'
      }
    }
  } catch (error) {
    logger.error('VEO状态查询失败', { taskId, error })
    return {
      success: false,
      error: error instanceof Error ? error.message : '查询失败'
    }
  }
}

/**
 * SORA2状态查询
 */
export async function checkSora2Status(taskId: string): Promise<StatusResult> {
  try {
    const response = await fetch(
      `${SUCHUANG_API_URL}${API_CONFIG.SUCHUANG.ENDPOINTS.SORA2_DETAIL}?key=${SUCHUANG_API_KEY}&id=${taskId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset:utf-8;',
          'Authorization': SUCHUANG_API_KEY
        },
        signal: AbortSignal.timeout(10000)
      }
    )

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const result = await response.json()
    
    // 记录原始响应用于调试
    logger.info('SORA2状态查询原始响应', { 
      taskId,
      code: result.code,
      data: result.data,
      fullResponse: JSON.stringify(result)
    })
    
    // 兼容 code: 200 和 code: 0
    if ((result.code !== 200 && result.code !== 0) || !result.data) {
      throw new Error(result.msg || result.message || '查询失败')
    }

    const data = result.data
    
    // SORA2 API 状态码：0=排队中，1=成功，2=失败，3=生成中
    if (data.status === 1 && data.remote_url) {
      logger.info('✅ SORA2视频生成成功', { taskId, videoUrl: data.remote_url, pid: data.pid })
      return {
        success: true,
        status: 'COMPLETED',
        videoUrl: data.remote_url,
        remixPid: data.pid || null  // 保存续作PID
      }
    } else if (data.status === 2) {
      // 检测是否为内容违规
      const failReason = data.fail_reason || '生成失败'
      let errorMessage = failReason
      
      if (failReason.toLowerCase().includes('violation')) {
        errorMessage = '您的提示词包含违规内容，请修改后重试。提示：避免涉及暴力、色情、政治敏感或侵犯版权的内容。'
      }
      
      return {
        success: true,
        status: 'FAILED',
        error: errorMessage
      }
    } else {
      // status 0 或 3 表示处理中
      return {
        success: true,
        status: 'PROCESSING'
      }
    }
  } catch (error) {
    logger.error('SORA2状态查询失败', { taskId, error })
    return {
      success: false,
      error: error instanceof Error ? error.message : '查询失败'
    }
  }
}

/**
 * 根据模型调用对应的API
 */
export async function generateVideo(model: string, params: GenerateParams): Promise<GenerateResult> {
  if (model === 'sora2') {
    return callSora2API(params)
  } else {
    return callVeoAPI(params)
  }
}

/**
 * 根据模型查询状态
 */
export async function checkVideoStatus(model: string, taskId: string): Promise<StatusResult> {
  if (model === 'sora2') {
    return checkSora2Status(taskId)
  } else {
    return checkVeoStatus(taskId)
  }
}
