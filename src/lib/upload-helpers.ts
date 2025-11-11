/**
 * 文件上传辅助函数
 * 提供文件验证、处理等工具函数
 */

import { Errors } from "./error-handler"
import {
  ALLOWED_FILE_TYPES,
  FILE_SIZE_LIMITS,
  FILE_SIZE_LIMITS_LABEL,
  IMAGE_UPLOAD_LIMITS,
  generateUniqueFileName,
} from "@/config/storage"

/**
 * 文件验证选项
 */
interface FileValidationOptions {
  maxSize: number
  maxSizeLabel: string
  allowedTypes: string[]
  checkDimensions?: boolean
}

/**
 * 验证上传的文件
 */
export async function validateUploadedFile(
  file: File,
  options: FileValidationOptions
): Promise<void> {
  // 验证文件是否存在
  if (!file) {
    throw Errors.badRequest("未找到文件")
  }

  // 验证文件大小
  validateFileSize(file.size, options.maxSize, options.maxSizeLabel)

  // 验证文件类型
  validateFileType(file.type, options.allowedTypes)

  // 如果是图片，验证尺寸
  if (options.checkDimensions && file.type.startsWith("image/")) {
    await validateImageDimensions(file)
  }
}

/**
 * 验证图片尺寸
 */
async function validateImageDimensions(file: File): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)

      const { width, height } = img

      if (
        width > IMAGE_UPLOAD_LIMITS.MAX_DIMENSION ||
        height > IMAGE_UPLOAD_LIMITS.MAX_DIMENSION
      ) {
        reject(
          Errors.validationError(
            `图片尺寸过大，最大允许 ${IMAGE_UPLOAD_LIMITS.MAX_DIMENSION}x${IMAGE_UPLOAD_LIMITS.MAX_DIMENSION}`
          )
        )
      }

      if (
        width < IMAGE_UPLOAD_LIMITS.MIN_DIMENSION ||
        height < IMAGE_UPLOAD_LIMITS.MIN_DIMENSION
      ) {
        reject(
          Errors.validationError(
            `图片尺寸过小，最小要求 ${IMAGE_UPLOAD_LIMITS.MIN_DIMENSION}x${IMAGE_UPLOAD_LIMITS.MIN_DIMENSION}`
          )
        )
      }

      resolve()
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(Errors.validationError("无效的图片文件"))
    }

    img.src = url
  })
}

/**
 * 验证图片文件（用于API）
 */
export async function validateImageFile(file: File): Promise<void> {
  await validateUploadedFile(file, {
    maxSize: FILE_SIZE_LIMITS.IMAGE,
    maxSizeLabel: FILE_SIZE_LIMITS_LABEL.IMAGE,
    allowedTypes: ALLOWED_FILE_TYPES.IMAGE,
    checkDimensions: false, // 服务端不验证尺寸（浏览器环境才能验证）
  })
}

/**
 * 验证头像文件
 */
export async function validateAvatarFile(file: File): Promise<void> {
  await validateUploadedFile(file, {
    maxSize: FILE_SIZE_LIMITS.AVATAR,
    maxSizeLabel: FILE_SIZE_LIMITS_LABEL.AVATAR,
    allowedTypes: ALLOWED_FILE_TYPES.AVATAR,
    checkDimensions: false,
  })
}

/**
 * 将文件转换为Buffer（服务端）
 */
export async function fileToBuffer(file: File): Promise<Buffer> {
  try {
    const arrayBuffer = await file.arrayBuffer()
    return Buffer.from(arrayBuffer)
  } catch (error) {
    throw Errors.internalError("文件读取失败")
  }
}

/**
 * 生成安全的文件路径
 */
export function generateSafeFilePath(
  userId: string,
  originalFileName: string,
  mimeType: string
): string {
  // 清理用户ID（防止路径遍历攻击）
  const safeUserId = userId.replace(/[^a-zA-Z0-9-_]/g, "")
  
  // 生成唯一文件名
  const uniqueFileName = generateUniqueFileName(originalFileName, mimeType)
  
  return `${safeUserId}/${uniqueFileName}`
}

/**
 * 验证文件真实类型（通过文件头）
 * 注意：这需要在服务端执行
 */
export function validateFileSignature(buffer: Buffer, declaredType: string): boolean {
  // 文件签名（魔术数字）
  const signatures: Record<string, number[][]> = {
    "image/jpeg": [[0xff, 0xd8, 0xff]],
    "image/png": [[0x89, 0x50, 0x4e, 0x47]],
    "image/webp": [[0x52, 0x49, 0x46, 0x46]], // RIFF
    "video/mp4": [[0x00, 0x00, 0x00]], // 不够精确，但基本可用
  }

  const typeSignatures = signatures[declaredType]
  if (!typeSignatures) {
    return true // 未知类型，跳过验证
  }

  // 检查是否匹配任何一个签名
  return typeSignatures.some(signature => {
    if (buffer.length < signature.length) {
      return false
    }

    return signature.every((byte, index) => buffer[index] === byte)
  })
}

/**
 * 完整的文件验证（服务端）
 */
export async function validateFileForUpload(
  file: File,
  options: FileValidationOptions
): Promise<Buffer> {
  // 基础验证
  await validateUploadedFile(file, options)

  // 转换为Buffer
  const buffer = await fileToBuffer(file)

  // 验证文件签名（防止文件类型伪造）
  if (!validateFileSignature(buffer, file.type)) {
    throw Errors.validationError("文件类型与内容不匹配，可能是伪造的文件")
  }

  return buffer
}

/**
 * 批量验证文件
 */
export async function validateMultipleFiles(
  files: File[],
  maxFiles: number,
  options: FileValidationOptions
): Promise<void> {
  if (files.length === 0) {
    throw Errors.badRequest("未找到文件")
  }

  if (files.length > maxFiles) {
    throw Errors.validationError(`最多只能上传 ${maxFiles} 个文件`)
  }

  // 验证每个文件
  for (const file of files) {
    await validateUploadedFile(file, options)
  }
}

/**
 * 验证文件类型（内部使用）
 */
function validateFileType(fileType: string, allowedTypes: string[]): void {
  if (!allowedTypes.includes(fileType)) {
    throw Errors.invalidFileType(allowedTypes)
  }
}

/**
 * 验证文件大小（内部使用）
 */
function validateFileSize(fileSize: number, maxSize: number, maxSizeLabel: string): void {
  if (fileSize > maxSize) {
    throw Errors.fileTooLarge(maxSizeLabel)
  }
  
  if (fileSize === 0) {
    throw Errors.badRequest("文件为空")
  }
}


