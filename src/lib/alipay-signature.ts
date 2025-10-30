import crypto from 'crypto'

/**
 * 验证支付宝签名
 * @param params 支付宝回调参数
 * @returns 签名是否有效
 */
export function verifyAlipaySignature(params: any): boolean {
  const { sign, sign_type, ...otherParams } = params
  
  if (!sign || sign_type !== 'RSA2') {
    console.error('❌ 签名或签名类型无效')
    return false
  }

  // 获取支付宝公钥
  const ALIPAY_PUBLIC_KEY = process.env.ALIPAY_PUBLIC_KEY
  if (!ALIPAY_PUBLIC_KEY) {
    console.error('❌ 支付宝公钥未配置')
    return false
  }

  try {
    // 构建待签名字符串
    const signString = Object.keys(otherParams)
      .filter(key => {
        const value = otherParams[key]
        return value !== '' && value !== null && value !== undefined
      })
      .sort()
      .map(key => `${key}=${otherParams[key]}`)
      .join('&')

    console.log('🔍 待验证签名字符串:', signString)

    // 构建完整的公钥格式
    const publicKey = `-----BEGIN PUBLIC KEY-----\n${ALIPAY_PUBLIC_KEY}\n-----END PUBLIC KEY-----`
    
    // 验证签名
    const verifier = crypto.createVerify('RSA-SHA256')
    verifier.update(signString, 'utf8')
    const isValid = verifier.verify(publicKey, sign, 'base64')

    if (isValid) {
      console.log('✅ 支付宝签名验证成功')
    } else {
      console.error('❌ 支付宝签名验证失败')
    }

    return isValid

  } catch (error) {
    console.error('❌ 签名验证过程中发生错误:', error)
    return false
  }
}

/**
 * 验证订单金额是否匹配
 * @param orderAmount 订单金额
 * @param paidAmount 实际支付金额
 * @returns 金额是否匹配
 */
export function validatePaymentAmount(orderAmount: number, paidAmount: number): boolean {
  const difference = Math.abs(orderAmount - paidAmount)
  const isValid = difference <= 0.01 // 允许1分钱的误差

  if (!isValid) {
    console.error(`❌ 支付金额不匹配: 订单${orderAmount}元, 实付${paidAmount}元, 差额${difference}元`)
  } else {
    console.log(`✅ 支付金额验证通过: ${paidAmount}元`)
  }

  return isValid
}

/**
 * 验证交易状态是否为成功状态
 * @param tradeStatus 支付宝交易状态
 * @returns 是否为成功状态
 */
export function validateTradeStatus(tradeStatus: string): boolean {
  const validStatuses = ['TRADE_SUCCESS', 'TRADE_FINISHED']
  const isValid = validStatuses.includes(tradeStatus)

  if (!isValid) {
    console.log(`ℹ️ 交易状态不是成功状态: ${tradeStatus}`)
  } else {
    console.log(`✅ 交易状态验证通过: ${tradeStatus}`)
  }

  return isValid
}

