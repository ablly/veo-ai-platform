import { NextResponse } from 'next/server'

export async function GET() {
  const envCheck = {
    SUPABASE_URL: !!process.env.SUPABASE_URL,
    SUPABASE_SERVICE_KEY: !!process.env.SUPABASE_SERVICE_KEY,
    CRON_SECRET: !!process.env.CRON_SECRET,
    RESEND_API_KEY: !!process.env.RESEND_API_KEY,
    DATABASE_URL: !!process.env.DATABASE_URL,
    
    // 显示前几个字符用于验证
    SUPABASE_URL_PREFIX: process.env.SUPABASE_URL?.substring(0, 20) || 'NOT SET',
    CRON_SECRET_PREFIX: process.env.CRON_SECRET?.substring(0, 10) || 'NOT SET',
  }

  return NextResponse.json({
    success: true,
    environment: process.env.NODE_ENV,
    envCheck
  })
}
