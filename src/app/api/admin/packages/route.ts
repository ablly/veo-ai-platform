import { NextRequest, NextResponse } from "next/server"
import { pool } from "@/lib/db"
import { createErrorResponse, Errors } from "@/lib/error-handler"
import { logger } from "@/lib/logger"
import { adminApiGuard } from "@/lib/admin-auth"

/**
 * 获取套餐列表（管理员）
 * GET /api/admin/packages
 */
export async function GET(request: NextRequest) {
  // 严格的管理员权限验证
  const authError = await adminApiGuard(request)
  if (authError) return authError

  try {
    const packagesResult = await pool.query(
      `SELECT id, name, credits, price, description, is_active, created_at
       FROM credit_packages 
       WHERE is_active = true
       ORDER BY price ASC`
    )

    logger.info("管理员查询套餐列表", {
      total_packages: packagesResult.rows.length
    })

    return NextResponse.json({
      success: true,
      packages: packagesResult.rows
    })

  } catch (error) {
    logger.error("查询套餐列表失败", { error })
    return createErrorResponse(Errors.INTERNAL_SERVER_ERROR, "查询套餐列表失败")
  }
}






