/**
 * 生产级日志系统
 * 功能：
 * - 统一的日志记录接口
 * - 环境感知（开发/生产）
 * - 日志级别控制
 * - 结构化日志输出
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

interface LogContext {
  [key: string]: any
}

class Logger {
  private minLevel: LogLevel
  private isDevelopment: boolean

  constructor() {
    this.isDevelopment = process.env.NODE_ENV !== "production"
    this.minLevel = this.isDevelopment ? LogLevel.DEBUG : LogLevel.INFO
  }

  /**
   * 格式化日志消息
   */
  private formatMessage(level: string, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString()
    const contextStr = context ? ` | ${JSON.stringify(context)}` : ""
    return `[${timestamp}] [${level}] ${message}${contextStr}`
  }

  /**
   * 检查是否应该记录此级别的日志
   */
  private shouldLog(level: LogLevel): boolean {
    return level >= this.minLevel
  }

  /**
   * DEBUG级别日志 - 仅开发环境
   */
  debug(message: string, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return
    
    if (this.isDevelopment) {
      console.log(this.formatMessage("DEBUG", message, context))
    }
  }

  /**
   * INFO级别日志
   */
  info(message: string, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.INFO)) return
    
    console.log(this.formatMessage("INFO", message, context))
  }

  /**
   * WARN级别日志
   */
  warn(message: string, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.WARN)) return
    
    console.warn(this.formatMessage("WARN", message, context))
  }

  /**
   * ERROR级别日志
   */
  error(message: string, error?: Error | unknown, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.ERROR)) return
    
    const errorContext = {
      ...context,
      error: error instanceof Error ? {
        message: error.message,
        stack: this.isDevelopment ? error.stack : undefined,
        name: error.name,
      } : error,
    }
    
    console.error(this.formatMessage("ERROR", message, errorContext))
  }

  /**
   * API请求日志
   */
  apiRequest(method: string, path: string, context?: LogContext): void {
    this.info(`API Request: ${method} ${path}`, context)
  }

  /**
   * API响应日志
   */
  apiResponse(method: string, path: string, status: number, duration?: number): void {
    const level = status >= 400 ? LogLevel.ERROR : status >= 300 ? LogLevel.WARN : LogLevel.INFO
    const message = `API Response: ${method} ${path} - ${status}${duration ? ` (${duration}ms)` : ""}`
    
    if (level === LogLevel.ERROR) {
      this.error(message)
    } else if (level === LogLevel.WARN) {
      this.warn(message)
    } else {
      this.info(message)
    }
  }

  /**
   * 数据库操作日志
   */
  database(operation: string, table: string, context?: LogContext): void {
    this.debug(`DB: ${operation} ${table}`, context)
  }

  /**
   * 用户操作日志
   */
  userAction(userId: string, action: string, context?: LogContext): void {
    this.info(`User Action: ${action}`, { userId, ...context })
  }

  /**
   * 安全相关日志
   */
  security(event: string, context?: LogContext): void {
    this.warn(`Security Event: ${event}`, context)
  }
}

// 导出单例
export const logger = new Logger()

// 性能监控辅助函数
export function measurePerformance<T>(
  operation: string,
  fn: () => T | Promise<T>
): Promise<T> {
  const start = Date.now()
  
  const logCompletion = (duration: number) => {
    logger.debug(`Performance: ${operation} completed in ${duration}ms`)
  }

  try {
    const result = fn()
    
    if (result instanceof Promise) {
      return result.then((value) => {
        logCompletion(Date.now() - start)
        return value
      }).catch((error) => {
        const duration = Date.now() - start
        logger.error(`Performance: ${operation} failed after ${duration}ms`, error)
        throw error
      })
    }
    
    logCompletion(Date.now() - start)
    return Promise.resolve(result)
  } catch (error) {
    const duration = Date.now() - start
    logger.error(`Performance: ${operation} failed after ${duration}ms`, error)
    throw error
  }
}


