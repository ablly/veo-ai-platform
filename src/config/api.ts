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
      VEO_GENERATE: '/api/video/veoPlus',
      // 视频生成详情查询接口
      VEO_QUERY: '/api/video/veoDetail',
      // SORA2视频生成接口
      SORA2_SUBMIT: '/api/sora2/submit',
      // SORA2视频详情查询接口
      SORA2_DETAIL: '/api/sora2/detail'
    },
    MODELS: {
      VEO3: 'veo3',
      SORA2: 'sora2'
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
    SORA2: parseFloat(process.env.SORA2_COST_PER_VIDEO || '1.5')
  },
  
  // 模型配置
  MODEL_CONFIGS: {
    sora2: {
      id: 'sora2',
      name: 'SORA 2.0',
      description: '专业级视频生成，支持更长时长',
      icon: '🎥',
      credits: 10,  // 基础10积分
      imageCredits: 2,  // 每张图片2积分
      maxDuration: 15,
      durations: [10, 15],
      aspectRatios: ['16:9', '9:16'],
      badge: '推荐'  // 显示推荐标签
    },
    veo3: {
      id: 'veo3',
      name: 'VEO 3.1',
      description: '稳定版本，质量更高',
      icon: '🎬',
      credits: 15,
      imageCredits: 5,  // 每张图片5积分
      maxDuration: 5,
      durations: [5],
      aspectRatios: ['16:9', '9:16', '1:1'],
      badge: '专业模型'  // 显示专业模型标签
    }
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




















