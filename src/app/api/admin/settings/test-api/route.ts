import { NextRequest, NextResponse } from "next/server"
import { createErrorResponse, Errors } from "@/lib/error-handler"
import { logger } from "@/lib/logger"
import { adminApiGuard } from "@/lib/admin-auth"

export async function POST(request: NextRequest) {
  // 严格的管理员权限验证
  const authError = await adminApiGuard(request)
  if (authError) return authError

  try {

    const { api_key, api_url } = await request.json()

    if (!api_key || !api_url) {
      return createErrorResponse(Errors.BAD_REQUEST, "API密钥和地址不能为空")
    }

    // 测试API连接
    try {
      // 使用AbortController实现超时控制
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)
      
      const testResponse = await fetch(`${api_url}/user/api-list?type=4`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${api_key}`,
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)

      // 先读取响应内容，避免重复读取body
      let responseText = ''
      let responseData = null
      const contentType = testResponse.headers.get('content-type') || ''
      
      try {
        responseText = await testResponse.text()
        
        // 尝试解析为JSON
        if (responseText && (contentType.includes('application/json') || responseText.trim().startsWith('{'))) {
          try {
            responseData = JSON.parse(responseText)
          } catch (jsonError) {
            // JSON解析失败，使用原始文本
            responseData = { message: "JSON解析失败", content: responseText.substring(0, 200) }
          }
        } else {
          // 非JSON响应
          responseData = { message: "非JSON响应", content: responseText.substring(0, 200) }
        }
      } catch (readError) {
        logger.error("读取响应内容失败", { error: readError, api_url })
        responseData = { message: "无法读取响应内容", error: readError.message }
      }

      if (testResponse.ok) {
        logger.info("API连接测试成功", {
          api_url,
          response_status: testResponse.status,
          contentType,
          responseSize: responseText.length
        })

        return NextResponse.json({
          success: true,
          message: "API连接测试成功",
          data: {
            status: testResponse.status,
            contentType,
            response: responseData
          }
        })
      } else {
        // 处理错误响应
        let errorDetails = `${testResponse.status} ${testResponse.statusText}`
        
        if (responseText) {
          // 如果是HTML错误页面，提取有用信息
          if (responseText.includes('<!DOCTYPE') || responseText.includes('<html>')) {
            errorDetails += ' (服务器返回HTML错误页面，可能是认证失败或端点不存在)'
          } else {
            errorDetails += ` - ${responseText.substring(0, 200)}`
          }
        }
        
        logger.warn("API连接测试失败", {
          api_url,
          status: testResponse.status,
          statusText: testResponse.statusText,
          contentType,
          responsePreview: responseText.substring(0, 100)
        })

        return NextResponse.json({
          success: false,
          message: `API连接失败: ${errorDetails}`
        })
      }
    } catch (fetchError: any) {
      let errorMessage = "未知错误"
      
      if (fetchError.name === 'AbortError') {
        errorMessage = "请求超时"
      } else if (fetchError.message) {
        errorMessage = fetchError.message
      } else if (fetchError.toString) {
        errorMessage = fetchError.toString()
      }
      
      logger.error("API连接测试异常", {
        api_url,
        error: errorMessage,
        errorType: fetchError.name || 'Unknown'
      })

      return NextResponse.json({
        success: false,
        message: `API连接异常: ${errorMessage}`
      })
    }

  } catch (error) {
    logger.error("API测试失败", { error })
    return createErrorResponse(Errors.INTERNAL_SERVER_ERROR, "API测试失败")
  }
}
