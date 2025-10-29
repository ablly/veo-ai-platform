/**
 * API配置文件
 * 速创API集成配置
 */

export const API_CONFIG = {
  // 速创API配置
  SUCHUANG: {
    BASE_URL: process.env.SUCHUANG_API_URL || 'https://api.wuyinkeji.com',
    API_KEY: process.env.SUCHUANG_API_KEY || '',
    ENDPOINTS: {
      // VEO3视频生成接口
      GENERATE: '/api/video/veoPlus',
      // 查询接口（待确认，可能需要单独的查询接口）
      QUERY: '/api/video/veoPlus/query'
    },
    MODELS: {
      VEO3: 'veo3',
      VEO3_FAST: 'veo3-fast', 
      VEO3_PRO: 'veo3-pro'
    },
    TYPES: {
      TEXT_TO_VIDEO: 'text2video',
      IMAGE_TO_VIDEO: 'img2video'
    },
    RATIOS: {
      LANDSCAPE: '16:9',
      PORTRAIT: '9:16'
    }
  },
  
  // 成本配置（单位：元）
  COSTS: {
    VEO3: parseFloat(process.env.VEO_COST_PER_VIDEO || '1.1'),
    VEO3_FAST: 2.0,
    VEO3_PRO: 5.0
  },
  
  // 请求配置
  REQUEST: {
    TIMEOUT: 30000, // 30秒
    RETRY_TIMES: 3,
    RETRY_DELAY: 1000 // 1秒
  }
}

// 验证配置
export function validateApiConfig() {
  if (!API_CONFIG.SUCHUANG.API_KEY) {
    throw new Error('速创API密钥未配置，请在环境变量中设置SUCHUANG_API_KEY')
  }
  return true
}








