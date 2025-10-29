'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            VEO AI
          </Link>
          <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
            返回首页
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Title */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              隐私政策
            </h1>
            <p className="text-gray-600">
              最后更新日期：{new Date().toLocaleDateString('zh-CN')}
            </p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
            {/* 引言 */}
            <section>
              <p className="text-gray-700 leading-relaxed">
                欢迎使用VEO AI平台（以下简称"本平台"）。我们非常重视您的隐私保护和个人信息安全。本隐私政策将帮助您了解我们如何收集、使用、存储和保护您的个人信息。
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                请您仔细阅读本隐私政策。如果您不同意本政策的任何内容，请不要使用我们的服务。
              </p>
            </section>

            {/* 1. 信息收集 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="w-8 h-8 bg-blue-500 text-white rounded-lg flex items-center justify-center mr-3 text-sm">1</span>
                我们收集的信息
              </h2>
              
              <div className="ml-11 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">1.1 您主动提供的信息</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li><strong>账户信息</strong>：用户名、密码、邮箱地址</li>
                    <li><strong>登录信息</strong>：微信授权登录时的昵称、头像等公开信息</li>
                    <li><strong>支付信息</strong>：订单信息、支付方式（不包括完整的支付账号）</li>
                    <li><strong>内容信息</strong>：您在使用视频生成服务时输入的提示词、生成的视频内容</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">1.2 自动收集的信息</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li><strong>设备信息</strong>：设备类型、操作系统、浏览器类型</li>
                    <li><strong>日志信息</strong>：IP地址、访问时间、页面浏览记录</li>
                    <li><strong>Cookie信息</strong>：用于保持登录状态和改善用户体验</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 2. 信息使用 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="w-8 h-8 bg-purple-500 text-white rounded-lg flex items-center justify-center mr-3 text-sm">2</span>
                信息使用方式
              </h2>
              
              <div className="ml-11">
                <p className="text-gray-700 mb-3">我们会将收集的信息用于以下目的：</p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>提供、维护和改进我们的服务</li>
                  <li>处理您的订单和支付请求</li>
                  <li>发送服务通知、技术更新和安全警告</li>
                  <li>响应您的客户服务请求</li>
                  <li>检测、预防和解决技术问题及欺诈行为</li>
                  <li>分析服务使用情况，优化用户体验</li>
                  <li>遵守法律法规和监管要求</li>
                </ul>
              </div>
            </section>

            {/* 3. 信息共享 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="w-8 h-8 bg-green-500 text-white rounded-lg flex items-center justify-center mr-3 text-sm">3</span>
                信息共享与披露
              </h2>
              
              <div className="ml-11">
                <p className="text-gray-700 mb-3">我们承诺不会出售您的个人信息。我们仅在以下情况下共享您的信息：</p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li><strong>经您同意</strong>：在获得您的明确同意后</li>
                  <li><strong>服务提供商</strong>：与协助我们提供服务的第三方（如支付处理、数据存储）共享必要信息</li>
                  <li><strong>法律要求</strong>：根据法律法规、法律程序、诉讼或政府要求</li>
                  <li><strong>保护权利</strong>：为保护我们或他人的权利、财产或安全</li>
                </ul>
              </div>
            </section>

            {/* 4. 信息安全 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="w-8 h-8 bg-red-500 text-white rounded-lg flex items-center justify-center mr-3 text-sm">4</span>
                信息安全保护
              </h2>
              
              <div className="ml-11">
                <p className="text-gray-700 mb-3">我们采取以下措施保护您的个人信息：</p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>使用加密技术（HTTPS/SSL）保护数据传输</li>
                  <li>密码采用bcrypt加密存储</li>
                  <li>定期进行安全审计和漏洞扫描</li>
                  <li>严格限制员工访问个人信息的权限</li>
                  <li>建立数据备份和灾难恢复机制</li>
                </ul>
                <p className="text-gray-700 mt-4">
                  尽管我们已采取合理措施保护您的信息，但请注意，互联网传输方法和电子存储方法并非100%安全。
                </p>
              </div>
            </section>

            {/* 5. Cookie政策 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="w-8 h-8 bg-yellow-500 text-white rounded-lg flex items-center justify-center mr-3 text-sm">5</span>
                Cookie使用说明
              </h2>
              
              <div className="ml-11">
                <p className="text-gray-700 mb-3">我们使用Cookie和类似技术来：</p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>记住您的登录状态</li>
                  <li>保存您的偏好设置</li>
                  <li>分析网站流量和使用模式</li>
                  <li>提供个性化内容和推荐</li>
                </ul>
                <p className="text-gray-700 mt-4">
                  您可以通过浏览器设置管理或删除Cookie。但请注意，禁用Cookie可能影响网站的正常功能。
                </p>
              </div>
            </section>

            {/* 6. 用户权利 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="w-8 h-8 bg-indigo-500 text-white rounded-lg flex items-center justify-center mr-3 text-sm">6</span>
                您的权利
              </h2>
              
              <div className="ml-11">
                <p className="text-gray-700 mb-3">根据相关法律法规，您享有以下权利：</p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li><strong>访问权</strong>：查询您的个人信息</li>
                  <li><strong>更正权</strong>：更正不准确的个人信息</li>
                  <li><strong>删除权</strong>：请求删除您的个人信息</li>
                  <li><strong>撤回同意</strong>：撤回您对信息处理的同意</li>
                  <li><strong>数据可携带</strong>：获取您的个人信息副本</li>
                  <li><strong>投诉权</strong>：向监管机构投诉</li>
                </ul>
                <p className="text-gray-700 mt-4">
                  如需行使上述权利，请通过{' '}
                  <Link href="/contact" className="text-blue-600 hover:underline">
                    联系我们
                  </Link>
                  页面与我们联系。
                </p>
              </div>
            </section>

            {/* 7. 未成年人保护 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="w-8 h-8 bg-pink-500 text-white rounded-lg flex items-center justify-center mr-3 text-sm">7</span>
                未成年人保护
              </h2>
              
              <div className="ml-11">
                <p className="text-gray-700">
                  我们的服务不面向18岁以下的未成年人。如果您是未成年人的监护人，发现未成年人在未经您同意的情况下向我们提供了个人信息，请联系我们，我们将及时删除相关信息。
                </p>
              </div>
            </section>

            {/* 8. 政策更新 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="w-8 h-8 bg-teal-500 text-white rounded-lg flex items-center justify-center mr-3 text-sm">8</span>
                隐私政策更新
              </h2>
              
              <div className="ml-11">
                <p className="text-gray-700">
                  我们可能会不时更新本隐私政策。重大变更时，我们会通过网站公告、电子邮件或其他方式通知您。更新后的政策将在发布时生效。建议您定期查看本页面以了解最新信息。
                </p>
              </div>
            </section>

            {/* 9. 联系我们 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="w-8 h-8 bg-orange-500 text-white rounded-lg flex items-center justify-center mr-3 text-sm">9</span>
                联系我们
              </h2>
              
              <div className="ml-11">
                <p className="text-gray-700 mb-3">
                  如果您对本隐私政策有任何疑问、意见或建议，或需要行使您的权利，请通过以下方式联系我们：
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                  <p className="text-gray-800">
                    <strong>QQ邮箱</strong>：{' '}
                    <a href="mailto:3533912007@qq.com" className="text-blue-600 hover:underline">
                      3533912007@qq.com
                    </a>
                  </p>
                  <p className="text-gray-600 text-sm mt-2">
                    我们将在收到您的请求后15个工作日内回复。
                  </p>
                </div>
                <div className="mt-4 text-center">
                  <Link
                    href="/contact"
                    className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
                  >
                    前往联系我们页面
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </section>
          </div>

          {/* Footer Links */}
          <div className="mt-8 text-center space-x-6">
            <Link href="/terms" className="text-gray-600 hover:text-gray-900 transition-colors">
              服务条款
            </Link>
            <Link href="/contact" className="text-gray-600 hover:text-gray-900 transition-colors">
              联系我们
            </Link>
            <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
              返回首页
            </Link>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="mt-20 py-8 border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 text-center text-gray-600 text-sm">
          <p>© {new Date().getFullYear()} VEO AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}






