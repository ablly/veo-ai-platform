/**
 * 积分系统配置
 */

export const CREDIT_CONFIG = {
  // 视频生成积分消耗配置
  VIDEO_GENERATION: {
    BASE_COST: 15,        // 基础消耗：15积分/视频（5秒）
    IMAGE_COST: 5,        // 每个参考图片额外消耗：5积分
    DURATION_MULTIPLIER: {
      5: 1,               // 5秒视频：15积分
      10: 2,              // 10秒视频：30积分（15×2）
    }
  },

  // 新用户注册赠送
  WELCOME_CREDITS: 10,    // 新用户注册赠送10积分（不够生成1个视频，引导购买）

  // 积分套餐配置
  PACKAGES: [
    {
      id: 'basic',
      name: '基础套餐',
      credits: 50,
      price: 49,
      originalPrice: 50,
      canGenerate: 3,     // 可生成3个视频（50÷15≈3）
      description: '适合个人创作者轻度使用',
      features: [
        '50积分额度',
        '可生成约3个视频',
        '基础AI模型',
        '标准生成速度',
        '30天有效期'
      ]
    },
    {
      id: 'professional',
      name: '专业套餐',
      credits: 150,
      price: 99,
      originalPrice: 150,
      canGenerate: 10,    // 可生成10个视频（150÷15=10）
      popular: true,      // 最受欢迎
      description: '适合经常创作的内容创作者',
      features: [
        '150积分额度',
        '可生成约10个视频',
        '高级AI模型',
        '优先生成速度',
        '真实物理运动',
        '90天有效期',
        '商用许可'
      ]
    },
    {
      id: 'enterprise',
      name: '企业套餐',
      credits: 500,
      price: 299,
      originalPrice: 500,
      canGenerate: 33,    // 可生成33个视频（500÷15≈33）
      description: '为专业团队和重度使用者而设',
      features: [
        '500积分额度',
        '可生成约33个视频',
        '高级AI模型',
        '极速生成通道',
        '真实物理运动',
        '高级模型控制',
        '180天有效期',
        '完整商用许可',
        'API接口访问'
      ]
    }
  ],

  // 积分有效期（天）
  EXPIRY_DAYS: {
    basic: 30,
    professional: 90,
    enterprise: 180
  },

  // 最小购买限制
  MIN_PURCHASE: 10,

  // 积分转换规则
  CONVERSION: {
    CREDITS_PER_VIDEO: 15,           // 每个视频消耗15积分
    CREDITS_PER_IMAGE: 5,            // 每个参考图片额外5积分
    CREDITS_PER_10_SECONDS: 30,      // 10秒视频消耗30积分
  },

  // VivaAPI成本（内部参考，不对外显示）
  VIVA_API_COST: {
    FAST_MODE: 2.80,    // veo3-fast: ¥2.80/视频
    QUALITY_MODE: 14.00 // veo3标准: ¥14.00/视频
  }
}

/**
 * 计算视频生成所需积分
 */
export function calculateVideoCredits(options: {
  duration?: number      // 视频时长（秒）
  imageCount?: number    // 参考图片数量
}): number {
  const { duration = 5, imageCount = 0 } = options
  
  let credits = CREDIT_CONFIG.VIDEO_GENERATION.BASE_COST
  
  // 根据时长调整积分
  if (duration === 10) {
    credits = CREDIT_CONFIG.VIDEO_GENERATION.BASE_COST * 2 // 30积分
  }
  
  // 添加图片成本
  credits += imageCount * CREDIT_CONFIG.VIDEO_GENERATION.IMAGE_COST
  
  return credits
}

/**
 * 计算用户可生成的视频数量
 */
export function calculateAvailableVideos(credits: number, duration: number = 5): number {
  const creditsPerVideo = duration === 5 
    ? CREDIT_CONFIG.VIDEO_GENERATION.BASE_COST 
    : CREDIT_CONFIG.VIDEO_GENERATION.BASE_COST * 2
    
  return Math.floor(credits / creditsPerVideo)
}

/**
 * 获取套餐信息
 */
export function getPackageInfo(packageId: string) {
  return CREDIT_CONFIG.PACKAGES.find(pkg => pkg.id === packageId)
}
