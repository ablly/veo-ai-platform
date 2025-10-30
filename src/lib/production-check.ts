import { PRODUCTION_CONFIG, validateProductionEnv } from "@/config/production"

/**
 * 生产环境启动检查
 * 确保所有必需的配置都已正确设置
 */
export function performProductionCheck() {
  console.log("🚀 正在启动生产环境检查...")

  try {
    // 1. 验证环境变量
    validateProductionEnv()
    console.log("✅ 环境变量检查通过")

    // 2. 验证数据库连接
    if (!process.env.DATABASE_URL) {
      throw new Error("数据库连接字符串未配置")
    }
    console.log("✅ 数据库配置检查通过")

    // 3. 验证邮件服务
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY.includes('placeholder')) {
      console.warn("⚠️  警告: Resend API密钥未正确配置，邮件功能可能无法正常工作")
    } else {
      console.log("✅ 邮件服务配置检查通过")
    }

    // 4. 验证NextAuth配置
    if (!process.env.NEXTAUTH_SECRET) {
      throw new Error("NextAuth密钥未配置")
    }
    console.log("✅ 身份验证配置检查通过")

    // 5. 显示生产环境配置摘要
    console.log("\n📋 生产环境配置摘要:")
    console.log(`   应用名称: ${PRODUCTION_CONFIG.APP_NAME}`)
    console.log(`   应用描述: ${PRODUCTION_CONFIG.APP_DESCRIPTION}`)
    console.log(`   新用户积分: ${PRODUCTION_CONFIG.CREDITS.NEW_USER_BONUS}`)
    console.log(`   视频生成消耗: ${PRODUCTION_CONFIG.CREDITS.VIDEO_GENERATION_COST} 积分/次`)
    console.log(`   验证码有效期: ${PRODUCTION_CONFIG.VERIFICATION_CODE.EXPIRY_MINUTES} 分钟`)
    console.log(`   支持的支付方式: ${PRODUCTION_CONFIG.PAYMENT.SUPPORTED_METHODS.join(', ')}`)
    console.log(`   客服邮箱: ${PRODUCTION_CONFIG.EMAIL.SUPPORT_EMAIL}`)
    console.log(`   工作时间: ${PRODUCTION_CONFIG.SUPPORT.WORK_HOURS}`)

    console.log("\n🎉 生产环境检查完成，所有系统就绪！")
    return true

  } catch (error) {
    console.error("❌ 生产环境检查失败:", error)
    console.error("请检查配置后重新启动应用")
    return false
  }
}

/**
 * 生产环境健康检查
 */
export async function healthCheck() {
  const checks = {
    database: false,
    email: false,
    auth: false
  }

  try {
    // 数据库连接检查
    const { Pool } = await import('pg')
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 1
    })
    
    const client = await pool.connect()
    await client.query('SELECT 1')
    client.release()
    await pool.end()
    checks.database = true

  } catch (error) {
    console.error("数据库健康检查失败:", error)
  }

  try {
    // 邮件服务检查
    if (process.env.RESEND_API_KEY && !process.env.RESEND_API_KEY.includes('placeholder')) {
      checks.email = true
    }
  } catch (error) {
    console.error("邮件服务健康检查失败:", error)
  }

  try {
    // 身份验证检查
    if (process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_URL) {
      checks.auth = true
    }
  } catch (error) {
    console.error("身份验证健康检查失败:", error)
  }

  return checks
}

/**
 * 获取系统状态
 */
export function getSystemStatus() {
  return {
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    features: {
      userRegistration: true,
      emailVerification: true,
      creditSystem: true,
      videoGeneration: true,
      paymentProcessing: true
    },
    limits: PRODUCTION_CONFIG.LIMITS,
    support: {
      email: PRODUCTION_CONFIG.EMAIL.SUPPORT_EMAIL,
      workHours: PRODUCTION_CONFIG.SUPPORT.WORK_HOURS,
      responseTime: `${PRODUCTION_CONFIG.SUPPORT.RESPONSE_TIME_HOURS}小时内回复`
    }
  }
}













