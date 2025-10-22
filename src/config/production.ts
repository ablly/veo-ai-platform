/**
 * 生产环境配置
 * 所有商用级功能的配置中心
 */

export const PRODUCTION_CONFIG = {
  // 应用信息
  APP_NAME: "VEO AI",
  APP_DESCRIPTION: "AI视频创作平台",
  COMPANY_NAME: "VEO AI",
  
  // 邮件配置
  EMAIL: {
    FROM_NAME: "VEO AI",
    FROM_ADDRESS: "noreply@veo-ai.com",
    SUPPORT_EMAIL: "support@veo-ai.com",
    NO_REPLY_EMAIL: "noreply@veo-ai.com"
  },

  // 验证码配置
  VERIFICATION_CODE: {
    LENGTH: 6,
    EXPIRY_MINUTES: 5,
    RESEND_COOLDOWN_SECONDS: 60,
    MAX_ATTEMPTS_PER_HOUR: 10
  },

  // 积分系统配置
  CREDITS: {
    NEW_USER_BONUS: 10,
    VIDEO_GENERATION_COST: 5,
    EXPIRY_DAYS: {
      FREE: 30,
      BASIC: 30,
      PROFESSIONAL: 90,
      ENTERPRISE: 180
    }
  },

  // 支付配置
  PAYMENT: {
    CURRENCY: "CNY",
    SUPPORTED_METHODS: ["ALIPAY", "WECHAT", "UNIONPAY"],
    REFUND_POLICY_DAYS: 7
  },

  // 安全配置
  SECURITY: {
    PASSWORD_MIN_LENGTH: 8,
    MAX_LOGIN_ATTEMPTS: 5,
    LOCKOUT_DURATION_MINUTES: 15,
    SESSION_TIMEOUT_HOURS: 24
  },

  // 业务限制
  LIMITS: {
    MAX_VIDEO_DURATION_SECONDS: 60,
    MAX_FILE_SIZE_MB: 100,
    MAX_VIDEOS_PER_DAY: 100,
    MAX_CONCURRENT_GENERATIONS: 3
  },

  // 客服配置
  SUPPORT: {
    WORK_HOURS: "9:00-18:00 (工作日)",
    RESPONSE_TIME_HOURS: 24,
    EMERGENCY_CONTACT: "+86-400-123-4567"
  },

  // 法律信息
  LEGAL: {
    TERMS_URL: "/terms",
    PRIVACY_URL: "/privacy",
    REFUND_URL: "/refund-policy",
    COPYRIGHT: "© 2025 VEO AI. 保留所有权利"
  }
}

/**
 * 获取邮件模板配置
 */
export function getEmailTemplate(type: 'verification' | 'welcome' | 'purchase') {
  const baseStyle = `
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    line-height: 1.6;
    color: #333;
  `

  const templates = {
    verification: {
      subject: `${PRODUCTION_CONFIG.APP_NAME} 登录验证码`,
      headerColor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      codeColor: "linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%)"
    },
    welcome: {
      subject: `欢迎加入 ${PRODUCTION_CONFIG.APP_NAME}！`,
      headerColor: "linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)",
      codeColor: "linear-gradient(135deg, #00b894 0%, #00cec9 100%)"
    },
    purchase: {
      subject: `${PRODUCTION_CONFIG.APP_NAME} 购买确认`,
      headerColor: "linear-gradient(135deg, #fd79a8 0%, #e84393 100%)",
      codeColor: "linear-gradient(135deg, #fdcb6e 0%, #e17055 100%)"
    }
  }

  return templates[type]
}

/**
 * 验证生产环境必需的环境变量
 */
export function validateProductionEnv() {
  const required = [
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
    'RESEND_API_KEY',
    'EMAIL_FROM'
  ]

  const missing = required.filter(key => !process.env[key])
  
  if (missing.length > 0) {
    throw new Error(`生产环境缺少必需的环境变量: ${missing.join(', ')}`)
  }

  return true
}

/**
 * 检查是否为生产环境
 */
export function isProduction() {
  return process.env.NODE_ENV === 'production'
}

/**
 * 获取完整的邮件发送配置
 */
export function getEmailConfig() {
  return {
    from: `${PRODUCTION_CONFIG.EMAIL.FROM_NAME} <${process.env.EMAIL_FROM || PRODUCTION_CONFIG.EMAIL.FROM_ADDRESS}>`,
    replyTo: PRODUCTION_CONFIG.EMAIL.SUPPORT_EMAIL
  }
}



