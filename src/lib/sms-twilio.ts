import twilio from 'twilio'

// Twilio 客户端初始化
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
)

/**
 * 发送短信验证码
 * @param phone 手机号（需要包含国家代码，如 +86）
 * @param code 验证码
 * @returns Promise<boolean> 发送是否成功
 */
export async function sendSMS(phone: string, code: string): Promise<boolean> {
  try {
    // 确保手机号包含国家代码
    const formattedPhone = phone.startsWith('+') ? phone : `+86${phone}`
    
    const message = await client.messages.create({
      body: `【VEO AI】您的验证码是：${code}，5分钟内有效。请勿泄露给他人。`,
      from: process.env.TWILIO_PHONE_NUMBER!,
      to: formattedPhone
    })

    console.log(`✅ 短信发送成功 - SID: ${message.sid}, 手机号: ${formattedPhone}`)
    return true
  } catch (error: any) {
    console.error('❌ Twilio 短信发送失败:', error)
    
    // 详细错误信息
    if (error.code) {
      console.error(`错误代码: ${error.code}`)
      console.error(`错误信息: ${error.message}`)
    }
    
    return false
  }
}

/**
 * 验证手机号格式
 * @param phone 手机号
 * @returns boolean 是否为有效的中国手机号
 */
export function isValidChinesePhone(phone: string): boolean {
  // 中国手机号正则：1开头，第二位是3-9，总共11位
  const phoneRegex = /^1[3-9]\d{9}$/
  return phoneRegex.test(phone)
}

/**
 * 格式化手机号为国际格式
 * @param phone 手机号
 * @returns string 国际格式手机号
 */
export function formatPhoneNumber(phone: string): string {
  // 移除所有非数字字符
  const cleanPhone = phone.replace(/\D/g, '')
  
  // 如果是11位中国手机号，添加+86前缀
  if (cleanPhone.length === 11 && cleanPhone.startsWith('1')) {
    return `+86${cleanPhone}`
  }
  
  // 如果已经有+86前缀，直接返回
  if (phone.startsWith('+86')) {
    return phone
  }
  
  // 其他情况，假设是中国手机号
  return `+86${cleanPhone}`
}

/**
 * 获取 Twilio 账户余额（用于监控）
 */
export async function getTwilioBalance(): Promise<string> {
  try {
    const account = await client.api.accounts(process.env.TWILIO_ACCOUNT_SID!).fetch()
    return `账户余额: ${account.balance} ${account.currency}`
  } catch (error) {
    console.error('获取 Twilio 余额失败:', error)
    return '余额查询失败'
  }
}











