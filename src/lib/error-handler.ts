/**
 * 统一错误处理系统
 * 功能：
 * - 标准化错误响应格式
 * - 错误码定义
 * - 用户友好的错误消息
 * - 开发/生产环境区分
 */

import { NextResponse } from "next/server"
import { logger } from "./logger"

/**
 * 错误码定义
 */
export const ERROR_CODES = {
  // 认证相关 (1xxx)
  UNAUTHORIZED: 1001,
  INVALID_CREDENTIALS: 1002,
  SESSION_EXPIRED: 1003,
  TOKEN_INVALID: 1004,

  // 权限相关 (2xxx)
  FORBIDDEN: 2001,
  INSUFFICIENT_PERMISSIONS: 2002,

  // 请求相关 (3xxx)
  BAD_REQUEST: 3001,
  VALIDATION_ERROR: 3002,
  MISSING_PARAMETER: 3003,
  INVALID_PARAMETER: 3004,

  // 资源相关 (4xxx)
  NOT_FOUND: 4001,
  RESOURCE_EXISTS: 4002,
  RESOURCE_DELETED: 4003,

  // 业务逻辑 (5xxx)
  INSUFFICIENT_CREDITS: 5001,
  QUOTA_EXCEEDED: 5002,
  OPERATION_FAILED: 5003,
  DUPLICATE_OPERATION: 5004,

  // 文件上传 (6xxx)
  FILE_TOO_LARGE: 6001,
  INVALID_FILE_TYPE: 6002,
  UPLOAD_FAILED: 6003,
  FILE_NOT_FOUND: 6004,

  // 外部服务 (7xxx)
  EXTERNAL_SERVICE_ERROR: 7001,
  EXTERNAL_API_ERROR: 7001, // 别名
  VEO_API_ERROR: 7002,
  PAYMENT_FAILED: 7003,
  SMS_FAILED: 7004,
  EMAIL_FAILED: 7005,
  STORAGE_ERROR: 7006,

  // 服务器错误 (9xxx)
  INTERNAL_ERROR: 9001,
  DATABASE_ERROR: 9002,
  UNKNOWN_ERROR: 9999,
} as const

/**
 * 错误类型定义
 */
export class AppError extends Error {
  constructor(
    public code: number,
    message: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message)
    this.name = "AppError"
  }
}

/**
 * 预定义错误
 */
export const Errors = {
  // 认证错误
  unauthorized: (message = "未授权访问，请先登录") =>
    new AppError(ERROR_CODES.UNAUTHORIZED, message, 401),
  
  invalidCredentials: (message = "用户名或密码错误") =>
    new AppError(ERROR_CODES.INVALID_CREDENTIALS, message, 401),
  
  sessionExpired: (message = "登录已过期，请重新登录") =>
    new AppError(ERROR_CODES.SESSION_EXPIRED, message, 401),

  // 权限错误
  forbidden: (message = "没有权限执行此操作") =>
    new AppError(ERROR_CODES.FORBIDDEN, message, 403),

  // 请求错误
  badRequest: (message = "请求参数错误") =>
    new AppError(ERROR_CODES.BAD_REQUEST, message, 400),
  
  validationError: (message = "数据验证失败", details?: any) =>
    new AppError(ERROR_CODES.VALIDATION_ERROR, message, 400, details),
  
  missingParameter: (param: string) =>
    new AppError(ERROR_CODES.MISSING_PARAMETER, `缺少必需参数: ${param}`, 400),

  invalidParameter: (param: string, reason?: string) =>
    new AppError(
      ERROR_CODES.INVALID_PARAMETER,
      `参数 ${param} 无效${reason ? `: ${reason}` : ""}`,
      400
    ),

  // 资源错误
  notFound: (resource = "资源") =>
    new AppError(ERROR_CODES.NOT_FOUND, `${resource}不存在`, 404),
  
  resourceExists: (resource = "资源") =>
    new AppError(ERROR_CODES.RESOURCE_EXISTS, `${resource}已存在`, 409),

  // 业务逻辑错误
  insufficientCredits: (required: number, available: number) =>
    new AppError(
      ERROR_CODES.INSUFFICIENT_CREDITS,
      `积分不足，需要 ${required} 积分，当前余额 ${available} 积分`,
      400
    ),
  
  quotaExceeded: (message = "已超出配额限制") =>
    new AppError(ERROR_CODES.QUOTA_EXCEEDED, message, 429),

  // 文件上传错误
  fileTooLarge: (maxSize: string) =>
    new AppError(
      ERROR_CODES.FILE_TOO_LARGE,
      `文件大小超过限制，最大允许 ${maxSize}`,
      413
    ),
  
  invalidFileType: (allowedTypes: string[]) =>
    new AppError(
      ERROR_CODES.INVALID_FILE_TYPE,
      `文件类型不支持，仅支持: ${allowedTypes.join(", ")}`,
      400
    ),
  
  uploadFailed: (reason?: string) =>
    new AppError(
      ERROR_CODES.UPLOAD_FAILED,
      `文件上传失败${reason ? `: ${reason}` : ""}`,
      500
    ),

  // 外部服务错误
  externalServiceError: (service: string, message?: string) =>
    new AppError(
      ERROR_CODES.EXTERNAL_SERVICE_ERROR,
      `${service}服务暂时不可用${message ? `: ${message}` : ""}`,
      503
    ),

  storageError: (message = "存储服务错误") =>
    new AppError(ERROR_CODES.STORAGE_ERROR, message, 500),

  // 服务器错误
  internalError: (message = "服务器内部错误，请稍后重试") =>
    new AppError(ERROR_CODES.INTERNAL_ERROR, message, 500),
  
  databaseError: (message = "数据库操作失败") =>
    new AppError(ERROR_CODES.DATABASE_ERROR, message, 500),
}

/**
 * 错误响应格式化
 */
interface ErrorResponse {
  success: false
  error: {
    code: number
    message: string
    details?: any
  }
  timestamp: string
  requestId?: string
}

/**
 * 创建标准化错误响应
 */
export function createErrorResponse(
  error: AppError | Error | unknown,
  requestId?: string
): NextResponse<ErrorResponse> {
  const isDevelopment = process.env.NODE_ENV !== "production"

  let statusCode = 500
  let errorCode = ERROR_CODES.UNKNOWN_ERROR
  let message = "未知错误"
  let details: any = undefined

  if (error instanceof AppError) {
    statusCode = error.statusCode
    errorCode = error.code
    message = error.message
    details = isDevelopment ? error.details : undefined
    
    // 记录错误日志
    logger.error(`AppError: ${message}`, error, { code: errorCode, statusCode })
  } else if (error instanceof Error) {
    message = isDevelopment ? error.message : "服务器内部错误"
    details = isDevelopment ? { stack: error.stack } : undefined
    
    // 记录错误日志
    logger.error(`Error: ${error.message}`, error)
  } else {
    message = isDevelopment ? String(error) : "服务器内部错误"
    
    // 记录错误日志
    logger.error("Unknown error", error)
  }

  const response: ErrorResponse = {
    success: false,
    error: {
      code: errorCode,
      message,
      ...(details && { details }),
    },
    timestamp: new Date().toISOString(),
    ...(requestId && { requestId }),
  }

  return NextResponse.json(response, { status: statusCode })
}

/**
 * API路由错误处理包装器
 */
export function withErrorHandler<T extends any[], R>(
  handler: (...args: T) => Promise<NextResponse<R>>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args)
    } catch (error) {
      return createErrorResponse(error)
    }
  }
}

/**
 * 验证必需参数
 */
export function validateRequired(
  params: Record<string, any>,
  requiredFields: string[]
): { isValid: boolean; missingFields: string[] } {
  const missingFields: string[] = []
  
  for (const field of requiredFields) {
    if (params[field] === undefined || params[field] === null || params[field] === "") {
      missingFields.push(field)
    }
  }
  
  return {
    isValid: missingFields.length === 0,
    missingFields
  }
}

/**
 * 验证必需参数（抛出错误版本）
 */
export function validateRequiredThrow(
  params: Record<string, any>,
  requiredFields: string[]
): void {
  for (const field of requiredFields) {
    if (params[field] === undefined || params[field] === null || params[field] === "") {
      throw Errors.missingParameter(field)
    }
  }
}

/**
 * 验证文件类型
 */
export function validateFileType(
  fileType: string,
  allowedTypes: string[]
): void {
  if (!allowedTypes.includes(fileType)) {
    throw Errors.invalidFileType(allowedTypes)
  }
}

/**
 * 验证文件大小
 */
export function validateFileSize(
  fileSize: number,
  maxSize: number,
  maxSizeLabel: string
): void {
  if (fileSize > maxSize) {
    throw Errors.fileTooLarge(maxSizeLabel)
  }
}


