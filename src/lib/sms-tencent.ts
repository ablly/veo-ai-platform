/**
 * 腾讯云短信服务集成
 * 
 * 功能：
 * - 发送短信验证码
 * - 完整的错误处理
 * - 详细的日志记录
 * - 生产环境配置验证
 * 
 * 文档：https://cloud.tencent.com/document/product/382
 */

import { sms } from 'tencentcloud-sdk-nodejs-sms'
const { v4: uuidv4 } = require('uuid')

// 腾讯云短信客户端类型
const SmsClient = sms.v20210111.Client

/**
 * 腾讯云短信配置接口
 */
interface TencentSmsConfig {
  secretId: string
  secretKey: string
  sdkAppId: string
  signName: string
  templateId: string
}

/**
 * 短信发送结果接口
 */
interface SmsSendResult {
  success: boolean
  requestId?: string
  serialNo?: string
  fee?: number
  errorCode?: string
  errorMessage?: string
}

/**
 * 腾讯云短信服务类
 */
class TencentSmsService {
  private client: any
  private config: TencentSmsConfig

  constructor() {
    // 从环境变量加载配置
    this.config = {
      secretId: process.env.TENCENT_SMS_SECRET_ID || '',
      secretKey: process.env.TENCENT_SMS_SECRET_KEY || '',
      sdkAppId: process.env.TENCENT_SMS_SDK_APP_ID || '',
      signName: process.env.TENCENT_SMS_SIGN_NAME || '',
      templateId: process.env.TENCENT_SMS_TEMPLATE_ID || '',
    }

    // 验证配置
    this.validateConfig()

    // 初始化腾讯云客户端
    this.client = new SmsClient({
      credential: {
        secretId: this.config.secretId,
        secretKey: this.config.secretKey,
      },
      region: 'ap-guangzhou', // 地域参数，默认广州
      profile: {
        signMethod: 'HmacSHA256',
        httpProfile: {
          reqMethod: 'POST',
          reqTimeout: 30,
          endpoint: 'sms.tencentcloudapi.com',
        },
      },
    })

    console.log('✅ 腾讯云短信服务初始化成功')
  }

  /**
   * 验证配置完整性
   */
  private validateConfig(): void {
    const requiredFields = [
      'secretId',
      'secretKey',
      'sdkAppId',
      'signName',
      'templateId',
    ]

    const missingFields = requiredFields.filter(
      (field) => !this.config[field as keyof TencentSmsConfig]
    )

    if (missingFields.length > 0) {
      throw new Error(
        `❌ 腾讯云短信配置不完整，缺少: ${missingFields.join(', ')}\n` +
        `请检查环境变量: TENCENT_SMS_*`
      )
    }

    console.log('✅ 腾讯云短信配置验证通过')
  }

  /**
   * 格式化手机号为国际格式
   * @param phone 手机号
   * @returns 国际格式手机号 (+86xxxxxxxxxx)
   */
  private formatPhoneNumber(phone: string): string {
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
   * 验证中国手机号格式
   * @param phone 手机号
   * @returns 是否为有效的中国手机号
   */
  public isValidChinesePhone(phone: string): boolean {
    // 中国手机号正则：1开头，第二位是3-9，总共11位
    const phoneRegex = /^1[3-9]\d{9}$/
    return phoneRegex.test(phone)
  }

  /**
   * 发送短信验证码
   * @param phone 手机号（11位中国手机号）
   * @param code 验证码（6位数字）
   * @returns Promise<SmsSendResult> 发送结果
   */
  public async sendVerificationCode(
    phone: string,
    code: string
  ): Promise<SmsSendResult> {
    const startTime = Date.now()

    try {
      // 验证手机号格式
      if (!this.isValidChinesePhone(phone)) {
        console.error(`❌ 手机号格式错误: ${phone}`)
        return {
          success: false,
          errorCode: 'INVALID_PHONE',
          errorMessage: '手机号格式不正确',
        }
      }

      // 格式化手机号
      const formattedPhone = this.formatPhoneNumber(phone)

      // 构建请求参数
      const params = {
        SmsSdkAppId: this.config.sdkAppId,
        SignName: this.config.signName,
        TemplateId: this.config.templateId,
        PhoneNumberSet: [formattedPhone],
        TemplateParamSet: [code, '5'], // 参数1: 验证码, 参数2: 有效期（分钟）
        SessionContext: uuidv4(), // 用户的session内容，腾讯云会原样返回
      }

      console.log(`📱 准备发送短信验证码到: ${phone}`)
      console.log(`🔧 腾讯云请求参数:`, {
        phone: formattedPhone,
        signName: this.config.signName,
        templateId: this.config.templateId,
      })

      // 调用腾讯云API
      const response = await this.client.SendSms(params)

      const duration = Date.now() - startTime
      console.log(`⏱️ 腾讯云API响应时间: ${duration}ms`)

      // 检查发送状态
      if (response.SendStatusSet && response.SendStatusSet.length > 0) {
        const status = response.SendStatusSet[0]

        if (status.Code === 'Ok') {
          console.log('✅ 短信发送成功:', {
            phone,
            requestId: response.RequestId,
            serialNo: status.SerialNo,
            fee: status.Fee,
          })

          return {
            success: true,
            requestId: response.RequestId,
            serialNo: status.SerialNo,
            fee: status.Fee,
          }
        } else {
          console.error('❌ 短信发送失败:', {
            phone,
            code: status.Code,
            message: status.Message,
            requestId: response.RequestId,
          })

          return {
            success: false,
            requestId: response.RequestId,
            errorCode: status.Code,
            errorMessage: this.getErrorMessage(status.Code, status.Message),
          }
        }
      }

      // 未知错误
      console.error('❌ 腾讯云API返回异常:', response)
      return {
        success: false,
        errorCode: 'UNKNOWN_ERROR',
        errorMessage: '短信发送失败，请稍后重试',
      }
    } catch (error: any) {
      const duration = Date.now() - startTime
      console.error(`❌ 短信发送异常 (${duration}ms):`, error)

      return {
        success: false,
        errorCode: error.code || 'NETWORK_ERROR',
        errorMessage: this.getErrorMessage(error.code, error.message),
      }
    }
  }

  /**
   * 获取友好的错误提示
   * @param errorCode 错误代码
   * @param originalMessage 原始错误信息
   * @returns 用户友好的错误提示
   */
  private getErrorMessage(errorCode?: string, originalMessage?: string): string {
    // 常见错误码映射
    const errorMessages: Record<string, string> = {
      // 签名相关
      'FailedOperation.SignatureIncorrectOrUnapproved': '签名未审核通过，请联系管理员',
      'FailedOperation.SignatureIncorrect': '签名格式错误，请联系管理员',
      
      // 模板相关
      'FailedOperation.TemplateIncorrectOrUnapproved': '模板未审核通过，请联系管理员',
      'FailedOperation.TemplateIncorrect': '模板格式错误，请联系管理员',
      
      // 余额相关
      'FailedOperation.InsufficientBalanceInSmsPackage': '短信余额不足，请联系管理员',
      'LimitExceeded.PhoneNumberDailyLimit': '该手机号今日发送次数已达上限',
      'LimitExceeded.PhoneNumberThirtySecondLimit': '发送过于频繁，请稍后再试',
      'LimitExceeded.PhoneNumberOneHourLimit': '该手机号1小时内发送次数已达上限',
      
      // 其他错误
      'InvalidParameter': '参数错误，请联系管理员',
      'InvalidParameterValue.IncorrectPhoneNumber': '手机号格式不正确',
      'UnauthorizedOperation.SdkAppIdIsDisabled': '短信服务已停用，请联系管理员',
      'AuthFailure.SecretIdNotFound': 'SecretId配置错误，请联系管理员',
      
      // 通用错误
      'INVALID_PHONE': '手机号格式不正确',
      'NETWORK_ERROR': '网络连接失败，请稍后重试',
      'UNKNOWN_ERROR': '短信发送失败，请稍后重试',
    }

    // 返回映射的错误信息，如果没有则返回原始信息
    return errorMessages[errorCode || ''] || originalMessage || '短信发送失败'
  }

  /**
   * 获取当前配置（脱敏）
   * 用于调试和日志记录
   */
  public getConfig(): object {
    return {
      secretId: this.config.secretId.substring(0, 10) + '***',
      sdkAppId: this.config.sdkAppId,
      signName: this.config.signName,
      templateId: this.config.templateId,
    }
  }
}

// 导出单例实例
let smsService: TencentSmsService | null = null

/**
 * 获取腾讯云短信服务实例（单例模式）
 */
export function getTencentSmsService(): TencentSmsService {
  if (!smsService) {
    smsService = new TencentSmsService()
  }
  return smsService
}

/**
 * 发送短信验证码（便捷方法）
 * @param phone 手机号
 * @param code 验证码
 * @returns Promise<SmsSendResult> 发送结果
 */
export async function sendVerificationCode(
  phone: string,
  code: string
): Promise<SmsSendResult> {
  const service = getTencentSmsService()
  return await service.sendVerificationCode(phone, code)
}

/**
 * 验证手机号格式（便捷方法）
 * @param phone 手机号
 * @returns 是否为有效的中国手机号
 */
export function isValidChinesePhone(phone: string): boolean {
  const service = getTencentSmsService()
  return service.isValidChinesePhone(phone)
}

export default TencentSmsService












