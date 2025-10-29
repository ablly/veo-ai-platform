import { NextRequest, NextResponse } from "next/server"
import { pool } from "@/lib/db"
import { createErrorResponse, Errors } from "@/lib/error-handler"
import { logger } from "@/lib/logger"
import { adminApiGuard } from "@/lib/admin-auth"

export async function GET(request: NextRequest) {
  // 严格的管理员权限验证
  const authError = await adminApiGuard(request)
  if (authError) return authError

  try {

    // 查询系统设置
    const settingsResult = await pool.query(
      "SELECT key, value FROM system_settings"
    )

    const settings: any = {
      suchuang_api_key: process.env.SUCHUANG_API_KEY || '',
      suchuang_api_url: process.env.SUCHUANG_API_URL || 'https://api.wuyinkeji.com',
      api_cost_per_request: 1.1,
      smtp_host: process.env.SMTP_HOST || 'smtp.qq.com',
      smtp_port: parseInt(process.env.SMTP_PORT || '587'),
      smtp_user: process.env.SMTP_USER || '',
      smtp_password: process.env.SMTP_PASSWORD || '',
      site_name: 'VEO AI',
      site_description: '革命性的AI视频生成技术',
      maintenance_mode: false,
      registration_enabled: true,
      default_credits: 10,
      max_credits_per_user: 10000,
      credit_expiry_days: 365
    }

    // 从数据库覆盖设置
    settingsResult.rows.forEach(row => {
      try {
        settings[row.key] = JSON.parse(row.value)
      } catch {
        settings[row.key] = row.value
      }
    })

    logger.info("管理员查询系统设置", {})

    return NextResponse.json({
      success: true,
      settings
    })

  } catch (error) {
    logger.error("查询系统设置失败", { error })
    return createErrorResponse(Errors.INTERNAL_SERVER_ERROR, "查询系统设置失败")
  }
}

export async function POST(request: NextRequest) {
  // 严格的管理员权限验证
  const authError = await adminApiGuard(request)
  if (authError) return authError

  try {

    const { settings } = await request.json()

    // 确保system_settings表存在
    await pool.query(`
      CREATE TABLE IF NOT EXISTS system_settings (
        key VARCHAR(255) PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // 保存设置到数据库
    for (const [key, value] of Object.entries(settings)) {
      const jsonValue = typeof value === 'object' ? JSON.stringify(value) : String(value)
      
      await pool.query(`
        INSERT INTO system_settings (key, value, updated_at)
        VALUES ($1, $2, CURRENT_TIMESTAMP)
        ON CONFLICT (key) 
        DO UPDATE SET value = $2, updated_at = CURRENT_TIMESTAMP
      `, [key, jsonValue])
    }

    logger.info("管理员更新系统设置", {
      settings_keys: Object.keys(settings)
    })

    return NextResponse.json({
      success: true,
      message: "设置保存成功"
    })

  } catch (error) {
    logger.error("保存系统设置失败", { error })
    return createErrorResponse(Errors.INTERNAL_SERVER_ERROR, "保存系统设置失败")
  }
}
