import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * 生产环境安全中间件
 * 包括：XSS防护、CSRF防护、请求限流、SQL注入防护
 */

// 简单的内存存储请求计数（生产环境应使用Redis）
const requestCounts = new Map<string, { count: number; resetTime: number }>()

// 请求限流配置
const RATE_LIMIT_WINDOW = 60 * 1000 // 1分钟
const RATE_LIMIT_MAX_REQUESTS = 100 // 每分钟最多100次请求

/**
 * 请求限流
 */
export function rateLimit(identifier: string): boolean {
  const now = Date.now()
  const record = requestCounts.get(identifier)

  if (!record || now > record.resetTime) {
    // 创建新记录或重置
    requestCounts.set(identifier, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW
    })
    return true
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false // 超出限制
  }

  record.count++
  return true
}

/**
 * 清理过期的请求记录（定期执行）
 */
setInterval(() => {
  const now = Date.now()
  for (const [key, record] of requestCounts.entries()) {
    if (now > record.resetTime) {
      requestCounts.delete(key)
    }
  }
}, 60 * 1000) // 每分钟清理一次

/**
 * XSS防护：清理危险HTML标签和脚本
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return input

  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
}

/**
 * SQL注入防护：检测常见SQL注入模式
 */
export function detectSQLInjection(input: string): boolean {
  if (typeof input !== 'string') return false

  const sqlInjectionPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/i,
    /(--|;|\/\*|\*\/)/,
    /(\bOR\b.*=.*\b)/i,
    /('.*--)/,
    /(1=1)/
  ]

  return sqlInjectionPatterns.some(pattern => pattern.test(input))
}

/**
 * 验证请求来源（CSRF防护）
 */
export function validateOrigin(req: NextRequest): boolean {
  const origin = req.headers.get('origin')
  const host = req.headers.get('host')
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || []

  // 允许同源请求
  if (!origin || origin.includes(host || '')) {
    return true
  }

  // 检查白名单
  return allowedOrigins.some(allowed => origin.includes(allowed))
}

/**
 * 生成请求ID（用于日志跟踪）
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
}

/**
 * 安全响应头
 */
export function setSecurityHeaders(response: NextResponse): NextResponse {
  // XSS Protection
  response.headers.set('X-XSS-Protection', '1; mode=block')
  
  // Prevent MIME sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff')
  
  // Clickjacking protection
  response.headers.set('X-Frame-Options', 'DENY')
  
  // Strict Transport Security (HTTPS only)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  }
  
  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;"
  )
  
  return response
}

/**
 * 敏感数据脱敏
 */
export function maskSensitiveData(data: any): any {
  if (typeof data !== 'object' || data === null) return data

  const sensitiveKeys = ['password', 'token', 'apiKey', 'secret', 'privateKey']
  const masked = { ...data }

  for (const key of Object.keys(masked)) {
    if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk.toLowerCase()))) {
      masked[key] = '***MASKED***'
    } else if (typeof masked[key] === 'object') {
      masked[key] = maskSensitiveData(masked[key])
    }
  }

  return masked
}



