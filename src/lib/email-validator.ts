import { isTempEmail, getEmailDomain } from './email-blacklist'

/**
 * 邮箱验证结果
 */
export interface EmailValidationResult {
  valid: boolean
  error?: string
  domain?: string
}

/**
 * 验证邮箱格式
 */
export function validateEmailFormat(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * 完整的邮箱验证
 * 包括格式验证和黑名单检查
 */
export function validateEmail(email: string): EmailValidationResult {
  // 1. 检查邮箱格式
  if (!validateEmailFormat(email)) {
    return {
      valid: false,
      error: '邮箱格式不正确'
    }
  }

  // 2. 获取域名
  const domain = getEmailDomain(email)
  if (!domain) {
    return {
      valid: false,
      error: '邮箱格式不正确'
    }
  }

  // 3. 检查是否为临时邮箱
  if (isTempEmail(email)) {
    return {
      valid: false,
      error: '请使用真实邮箱注册，不支持临时邮箱服务',
      domain
    }
  }

  // 4. 验证通过
  return {
    valid: true,
    domain
  }
}

/**
 * 检查邮箱是否为主流邮箱服务商
 * 用于额外的信任度判断
 */
export function isMainstreamEmail(email: string): boolean {
  const domain = getEmailDomain(email)
  const mainstreamDomains = [
    // 国际主流
    'gmail.com',
    'outlook.com',
    'hotmail.com',
    'yahoo.com',
    'icloud.com',
    'protonmail.com',
    
    // 中国主流
    'qq.com',
    '163.com',
    '126.com',
    'sina.com',
    'sohu.com',
    'yeah.net',
    'foxmail.com',
    'aliyun.com',
    
    // 企业邮箱常见后缀
    // 注意：这里只是示例，实际企业邮箱域名各不相同
  ]
  
  return mainstreamDomains.includes(domain)
}

/**
 * 获取邮箱服务商名称（用于显示）
 */
export function getEmailProvider(email: string): string {
  const domain = getEmailDomain(email)
  
  const providers: Record<string, string> = {
    'gmail.com': 'Gmail',
    'outlook.com': 'Outlook',
    'hotmail.com': 'Hotmail',
    'yahoo.com': 'Yahoo',
    'icloud.com': 'iCloud',
    'qq.com': 'QQ邮箱',
    '163.com': '网易邮箱',
    '126.com': '网易邮箱',
    'sina.com': '新浪邮箱',
    'sohu.com': '搜狐邮箱',
    'foxmail.com': 'Foxmail',
  }
  
  return providers[domain] || domain
}
