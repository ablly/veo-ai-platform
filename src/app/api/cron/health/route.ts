/**
 * Cron 健康检查端点
 * 用于测试 cron-job.org 是否能正常访问 Vercel
 */

import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Cron health check OK",
    timestamp: new Date().toISOString(),
    env: {
      hasCronSecret: !!process.env.CRON_SECRET,
      cronSecretLength: process.env.CRON_SECRET?.length || 0
    }
  })
}
