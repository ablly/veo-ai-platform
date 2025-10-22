/**
 * 积分系统配置
 * 统一管理积分消耗和赠送规则
 */

export const CREDIT_CONFIG = {
  // 新用户注册赠送积分
  NEW_USER_BONUS: 10,

  // 视频生成消耗积分
  VIDEO_GENERATION: {
    // 基础消耗（每次生成）
    BASE_COST: 10,
    
    // 每张参考图片额外消耗
    IMAGE_COST: 2,
    
    // 根据视频时长额外消耗（每秒）
    PER_SECOND_COST: 0.5,
    
    // 根据分辨率额外消耗
    RESOLUTION_MULTIPLIER: {
      '480p': 1.0,   // 基础倍率
      '720p': 1.0,   // 标准倍率
      '1080p': 1.5,  // 高清倍率
      '4K': 2.5      // 超清倍率
    }
  },

  // 积分有效期（天）
  EXPIRY_DAYS: {
    FREE: 30,        // 免费赠送积分30天有效
    BASIC: 30,       // 基础套餐30天有效
    PROFESSIONAL: 90, // 专业套餐90天有效
    ENTERPRISE: 180   // 企业套餐180天有效
  },

  // 单次视频生成最大消耗上限
  MAX_COST_PER_VIDEO: 50
}

/**
 * 计算视频生成所需积分
 * @param duration - 视频时长（秒）
 * @param resolution - 视频分辨率
 * @returns 所需积分数
 */
export function calculateVideoCredits(
  duration: number = 5,
  resolution: '480p' | '720p' | '1080p' | '4K' = '720p'
): number {
  const baseCost = CREDIT_CONFIG.VIDEO_GENERATION.BASE_COST
  const durationCost = duration * CREDIT_CONFIG.VIDEO_GENERATION.PER_SECOND_COST
  const multiplier = CREDIT_CONFIG.VIDEO_GENERATION.RESOLUTION_MULTIPLIER[resolution]
  
  const totalCost = Math.ceil((baseCost + durationCost) * multiplier)
  
  // 确保不超过最大上限
  return Math.min(totalCost, CREDIT_CONFIG.MAX_COST_PER_VIDEO)
}

/**
 * 格式化积分显示
 */
export function formatCredits(credits: number): string {
  return credits.toLocaleString('zh-CN')
}

/**
 * 检查积分是否足够
 */
export function hasEnoughCredits(available: number, required: number): boolean {
  return available >= required
}




