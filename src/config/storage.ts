/**
 * Storage配置常量
 * 定义所有与文件存储相关的配置
 */

// Supabase Storage Buckets
export const STORAGE_BUCKETS = {
  VIDEO_REFERENCES: "video-references", // 视频参考图片
  USER_AVATARS: "user-avatars",         // 用户头像
  GENERATED_VIDEOS: "generated-videos", // 生成的视频（可选）
} as const

// 文件大小限制（字节）
export const FILE_SIZE_LIMITS = {
  IMAGE: 5 * 1024 * 1024,      // 5MB
  AVATAR: 2 * 1024 * 1024,     // 2MB
  VIDEO: 100 * 1024 * 1024,    // 100MB
} as const

// 文件大小限制（人类可读）
export const FILE_SIZE_LIMITS_LABEL = {
  IMAGE: "5MB",
  AVATAR: "2MB",
  VIDEO: "100MB",
} as const

// 允许的文件类型
export const ALLOWED_FILE_TYPES = {
  IMAGE: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
  AVATAR: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
  VIDEO: ["video/mp4", "video/webm", "video/quicktime"],
} as const

// 文件扩展名映射
export const FILE_EXTENSIONS = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "video/mp4": ".mp4",
  "video/webm": ".webm",
  "video/quicktime": ".mov",
} as const

// 图片上传限制
export const IMAGE_UPLOAD_LIMITS = {
  MAX_IMAGES_PER_REQUEST: 6,   // 单次最多上传6张
  MAX_DIMENSION: 4096,          // 最大尺寸 4096x4096
  MIN_DIMENSION: 256,           // 最小尺寸 256x256
} as const

// Storage配置
export const STORAGE_CONFIG = {
  // 参考图片配置
  REFERENCE_IMAGES: {
    BUCKET: STORAGE_BUCKETS.VIDEO_REFERENCES,
    MAX_SIZE: FILE_SIZE_LIMITS.IMAGE,
    ALLOWED_TYPES: ALLOWED_FILE_TYPES.IMAGE,
  },
  
  // 用户头像配置
  USER_AVATARS: {
    BUCKET: STORAGE_BUCKETS.USER_AVATARS,
    MAX_SIZE: FILE_SIZE_LIMITS.AVATAR,
    ALLOWED_TYPES: ALLOWED_FILE_TYPES.AVATAR,
  },
  
  // 公开访问的bucket
  PUBLIC_BUCKETS: [
    STORAGE_BUCKETS.VIDEO_REFERENCES,
    STORAGE_BUCKETS.USER_AVATARS,
  ],
  
  // 文件路径模板
  PATHS: {
    VIDEO_REFERENCE: (userId: string, filename: string) => 
      `${userId}/${filename}`,
    
    USER_AVATAR: (userId: string, filename: string) => 
      `${userId}/${filename}`,
  },
} as const

// 获取文件扩展名
export function getFileExtension(mimeType: string): string {
  return FILE_EXTENSIONS[mimeType as keyof typeof FILE_EXTENSIONS] || ""
}

// 生成唯一文件名
export function generateUniqueFileName(originalName: string, mimeType: string): string {
  const timestamp = Date.now()
  const randomStr = Math.random().toString(36).substring(2, 8)
  const extension = getFileExtension(mimeType)
  const safeName = originalName
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .substring(0, 50)
  
  return `${safeName}-${timestamp}-${randomStr}${extension}`
}

// 格式化文件大小
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}


