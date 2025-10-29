/**
 * 生产环境日志系统
 * 支持多级别日志、错误跟踪、性能监控
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  FATAL = 'FATAL'
}

export interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: Record<string, any>
  userId?: string
  requestId?: string
  email?: string
  error?: {
    name: string
    message: string
    stack?: string
  }
}

class Logger {
  private isDevelopment: boolean

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development'
  }

  private formatLog(entry: LogEntry): string {
    const { timestamp, level, message, context, userId, requestId, email, error } = entry
    
    let log = `[${timestamp}] [${level}]`
    
    if (requestId) log += ` [${requestId}]`
    if (userId) log += ` [User: ${userId}]`
    if (email) log += ` [Email: ${email}]`
    
    log += ` ${message}`
    
    if (context && Object.keys(context).length > 0) {
      log += `\nContext: ${JSON.stringify(context, null, 2)}`
    }
    
    if (error) {
      log += `\nError: ${error.name} - ${error.message}`
      if (error.stack && this.isDevelopment) {
        log += `\nStack: ${error.stack}`
      }
    }
    
    return log
  }

  private createEntry(
    level: LogLevel,
    message: string,
    meta?: {
      context?: Record<string, any>
      userId?: string
      requestId?: string
      email?: string
      error?: Error
    }
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: meta?.context,
      userId: meta?.userId,
      requestId: meta?.requestId,
      email: meta?.email,
      error: meta?.error ? {
        name: meta.error.name,
        message: meta.error.message,
        stack: meta.error.stack
      } : undefined
    }
  }

  private write(entry: LogEntry) {
    const formattedLog = this.formatLog(entry)
    
    // 控制台输出
    switch (entry.level) {
      case LogLevel.DEBUG:
        if (this.isDevelopment) console.debug(formattedLog)
        break
      case LogLevel.INFO:
        console.info(formattedLog)
        break
      case LogLevel.WARN:
        console.warn(formattedLog)
        break
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(formattedLog)
        break
    }

    // 生产环境可以将日志发送到外部服务（如：Sentry, LogRocket, etc.）
    if (!this.isDevelopment && entry.level === LogLevel.ERROR || entry.level === LogLevel.FATAL) {
      this.sendToExternalService(entry)
    }
  }

  private sendToExternalService(entry: LogEntry) {
    // TODO: 集成外部日志服务
    // 例如：Sentry, LogRocket, DataDog, etc.
    // Sentry.captureException(entry.error)
  }

  debug(message: string, context?: Record<string, any>) {
    this.write(this.createEntry(LogLevel.DEBUG, message, { context }))
  }

  info(message: string, meta?: {
    context?: Record<string, any>
    userId?: string
    requestId?: string
    email?: string
    code?: string
    result?: any
    expiresAt?: Date
  }) {
    this.write(this.createEntry(LogLevel.INFO, message, meta))
  }

  warn(message: string, meta?: {
    context?: Record<string, any>
    userId?: string
    requestId?: string
    email?: string
  }) {
    this.write(this.createEntry(LogLevel.WARN, message, meta))
  }

  error(message: string, meta?: {
    error?: Error
    context?: Record<string, any>
    userId?: string
    requestId?: string
    email?: string
  }) {
    this.write(this.createEntry(LogLevel.ERROR, message, meta))
  }

  fatal(message: string, meta?: {
    error?: Error
    context?: Record<string, any>
    userId?: string
    requestId?: string
    email?: string
  }) {
    this.write(this.createEntry(LogLevel.FATAL, message, meta))
  }

  // API调用日志
  apiCall(params: {
    method: string
    url: string
    status: number
    duration: number
    userId?: string
    requestId?: string
    error?: Error
  }) {
    const { method, url, status, duration, userId, requestId, error } = params
    
    const message = `API: ${method} ${url} - ${status} (${duration}ms)`
    const level = status >= 500 ? LogLevel.ERROR : status >= 400 ? LogLevel.WARN : LogLevel.INFO
    
    this.write(this.createEntry(level, message, {
      context: { method, url, status, duration },
      userId,
      requestId,
      error
    }))
  }

  // 数据库查询日志
  dbQuery(params: {
    query: string
    duration: number
    success: boolean
    error?: Error
  }) {
    const { query, duration, success, error } = params
    
    const message = `DB Query (${duration}ms): ${query.slice(0, 100)}...`
    const level = success ? LogLevel.DEBUG : LogLevel.ERROR
    
    this.write(this.createEntry(level, message, {
      context: { query, duration, success },
      error
    }))
  }

  // 业务事件日志
  businessEvent(params: {
    event: string
    userId?: string
    data?: Record<string, any>
  }) {
    const { event, userId, data } = params
    
    this.write(this.createEntry(LogLevel.INFO, `Business Event: ${event}`, {
      context: data,
      userId
    }))
  }
}

// 导出单例
export const logger = new Logger()

// 性能监控装饰器
export function measurePerformance() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const start = Date.now()
      try {
        const result = await originalMethod.apply(this, args)
        const duration = Date.now() - start
        
        logger.debug(`${propertyKey} completed in ${duration}ms`, {
          method: propertyKey,
          duration
        })
        
        return result
      } catch (error) {
        const duration = Date.now() - start
        logger.error(`${propertyKey} failed after ${duration}ms`, {
          error: error as Error,
          context: { method: propertyKey, duration }
        })
        throw error
      }
    }

    return descriptor
  }
}
