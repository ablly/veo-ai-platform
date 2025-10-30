import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { createErrorResponse, Errors } from "@/lib/error-handler"
import { logger } from "@/lib/logger"

// VEO API配置
const VEO_API_URL = process.env.VEO_API_URL || "https://api.veo3api.ai/api/v1"
const VEO_API_KEY = process.env.VEO_API_KEY

/**
 * 查询VEO 3 API剩余积分
 * 用于监控和同步系统积分
 */
export async function GET(request: NextRequest) {
  try {
    // 验证用户登录（仅管理员可查询）
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return createErrorResponse(Errors.UNAUTHORIZED, "用户未登录")
    }

    // 可选：添加管理员权限检查
    // if (session.user.role !== 'admin') {
    //   return createErrorResponse(Errors.FORBIDDEN, "仅管理员可查询VEO积分")
    // }

    if (!VEO_API_KEY) {
      return createErrorResponse(Errors.CONFIGURATION_ERROR, "VEO API密钥未配置")
    }

    logger.info("查询VEO API积分", { userEmail: session.user.email })

    // 调用VEO 3 API查询积分
    const response = await fetch(`${VEO_API_URL}/common/credit`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${VEO_API_KEY}`
      },
      signal: AbortSignal.timeout(10000) // 10秒超时
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      logger.error("VEO API查询积分失败", {
        status: response.status,
        error: errorData
      })
      return createErrorResponse(
        Errors.EXTERNAL_API_ERROR,
        errorData.msg || `查询积分失败: ${response.status}`
      )
    }

    const result = await response.json()

    // VEO 3 API 响应格式: { code: 200, data: 1234.5, msg: "success" }
    if (result.code !== 200 || typeof result.data === 'undefined') {
      logger.error("VEO API返回格式错误", { result })
      return createErrorResponse(
        Errors.EXTERNAL_API_ERROR,
        result.msg || "查询积分失败"
      )
    }

    const veoCredits = result.data

    logger.info("VEO API积分查询成功", {
      credits: veoCredits,
      userEmail: session.user.email
    })

    return NextResponse.json({
      success: true,
      veoCredits: veoCredits,
      message: "VEO积分查询成功"
    })

  } catch (error) {
    logger.error("查询VEO积分失败", {
      error: error instanceof Error ? error.message : String(error)
    })
    return createErrorResponse(Errors.INTERNAL_SERVER_ERROR, "服务器内部错误")
  }
}











