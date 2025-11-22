/**
 * 测试支付宝notify_url配置
 */

require('dotenv').config()

console.log('🔍 检查支付宝回调URL配置\n')

const NEXTAUTH_URL = process.env.NEXTAUTH_URL
const ALIPAY_NOTIFY_URL = process.env.ALIPAY_NOTIFY_URL
const ALIPAY_RETURN_URL = process.env.ALIPAY_RETURN_URL

console.log('环境变量:')
console.log('  NEXTAUTH_URL:', NEXTAUTH_URL || '❌ 未配置')
console.log('  ALIPAY_NOTIFY_URL:', ALIPAY_NOTIFY_URL || '❌ 未配置')
console.log('  ALIPAY_RETURN_URL:', ALIPAY_RETURN_URL || '❌ 未配置')
console.log('')

// 模拟代码中的逻辑
const NOTIFY_URL = ALIPAY_NOTIFY_URL || NEXTAUTH_URL + '/api/payment/alipay/callback'
const RETURN_URL = ALIPAY_RETURN_URL || NEXTAUTH_URL + '/payment/alipay/success'

console.log('实际使用的URL:')
console.log('  notify_url:', NOTIFY_URL)
console.log('  return_url:', RETURN_URL)
console.log('')

console.log('验证:')
if (NOTIFY_URL.includes('/callback')) {
  console.log('  ✅ notify_url 使用 /callback')
} else if (NOTIFY_URL.includes('/notify')) {
  console.log('  ⚠️  notify_url 使用 /notify（可能不匹配支付宝配置）')
} else {
  console.log('  ❌ notify_url 格式异常')
}

if (NOTIFY_URL.startsWith('https://')) {
  console.log('  ✅ 使用 HTTPS')
} else {
  console.log('  ❌ 未使用 HTTPS')
}

if (NOTIFY_URL.includes('www.veo-ai.site')) {
  console.log('  ✅ 域名正确')
} else if (NOTIFY_URL.includes('localhost')) {
  console.log('  ❌ 使用 localhost（生产环境不可用）')
} else {
  console.log('  ⚠️  域名:', NOTIFY_URL.split('/')[2])
}

console.log('')
console.log('建议:')
if (!ALIPAY_NOTIFY_URL) {
  console.log('  💡 在Vercel中添加环境变量:')
  console.log('     ALIPAY_NOTIFY_URL=https://www.veo-ai.site/api/payment/alipay/callback')
}

console.log('')
console.log('测试URL可访问性:')
console.log('  在浏览器访问:', NOTIFY_URL)
console.log('  预期返回: {"success":true,"message":"Alipay callback endpoint is ready"}')
