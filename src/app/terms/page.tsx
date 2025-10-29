'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export default function TermsPage() {
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
              服务条款
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
                欢迎使用VEO AI平台（以下简称"本平台"或"我们"）。在使用我们的服务之前，请仔细阅读本服务条款（以下简称"本条款"）。
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                使用本平台即表示您同意遵守本条款的所有规定。如果您不同意本条款的任何内容，请不要使用我们的服务。
              </p>
            </section>

            {/* 1. 服务说明 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="w-8 h-8 bg-blue-500 text-white rounded-lg flex items-center justify-center mr-3 text-sm">1</span>
                服务说明
              </h2>
              
              <div className="ml-11 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">1.1 服务内容</h3>
                  <p className="text-gray-700">
                    VEO AI是一个基于人工智能技术的视频生成平台，为用户提供文本到视频的AI生成服务。我们的服务包括但不限于：
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mt-2">
                    <li>AI视频生成功能</li>
                    <li>视频历史记录管理</li>
                    <li>积分充值和消费系统</li>
                    <li>用户账户管理</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">1.2 服务变更</h3>
                  <p className="text-gray-700">
                    我们保留随时修改、暂停或终止部分或全部服务的权利，恕不另行通知。对于服务的变更、中断或终止，我们将尽力提前通知，但不承担任何责任。
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">1.3 技术限制</h3>
                  <p className="text-gray-700">
                    AI生成的视频质量受多种因素影响，包括但不限于提示词质量、AI模型能力和服务器负载。我们不保证生成结果完全符合您的预期。
                  </p>
                </div>
              </div>
            </section>

            {/* 2. 账户注册 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="w-8 h-8 bg-purple-500 text-white rounded-lg flex items-center justify-center mr-3 text-sm">2</span>
                账户注册与使用
              </h2>
              
              <div className="ml-11 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">2.1 注册资格</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>您必须年满18周岁</li>
                    <li>您必须提供真实、准确的注册信息</li>
                    <li>每个用户只能注册一个账户</li>
                    <li>您有责任维护账户安全，对账户下的所有活动负责</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">2.2 账户安全</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>请妥善保管您的账户密码</li>
                    <li>不得将账户转让、出售或出借给他人</li>
                    <li>如发现账户被盗用，请立即联系我们</li>
                    <li>我们不对因您的疏忽导致的账户安全问题负责</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">2.3 账户终止</h3>
                  <p className="text-gray-700">
                    如果您违反本条款或从事任何非法、滥用行为，我们有权立即暂停或终止您的账户，且不予退款。
                  </p>
                </div>
              </div>
            </section>

            {/* 3. 用户行为规范 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="w-8 h-8 bg-green-500 text-white rounded-lg flex items-center justify-center mr-3 text-sm">3</span>
                用户行为规范
              </h2>
              
              <div className="ml-11">
                <p className="text-gray-700 mb-3">在使用我们的服务时，您不得：</p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>生成任何违法、淫秽、暴力、诽谤或侵犯他人权利的内容</li>
                  <li>利用服务进行欺诈、传播病毒或其他恶意行为</li>
                  <li>试图破解、攻击或干扰系统正常运行</li>
                  <li>使用自动化工具或机器人访问服务</li>
                  <li>逆向工程、反编译或试图获取源代码</li>
                  <li>批量注册账户或进行任何滥用行为</li>
                  <li>侵犯他人知识产权或其他合法权益</li>
                  <li>从事任何可能损害平台声誉的行为</li>
                </ul>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                  <p className="text-red-800 font-medium">⚠️ 违规后果</p>
                  <p className="text-red-700 text-sm mt-2">
                    违反上述规定可能导致账户被暂停或永久封禁，已购买的积分将不予退还，严重者我们将保留追究法律责任的权利。
                  </p>
                </div>
              </div>
            </section>

            {/* 4. 积分与付费 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="w-8 h-8 bg-yellow-500 text-white rounded-lg flex items-center justify-center mr-3 text-sm">4</span>
                积分系统与付费服务
              </h2>
              
              <div className="ml-11 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">4.1 积分规则</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>生成视频需要消耗相应的积分</li>
                    <li>积分通过充值获得，具体价格以页面显示为准</li>
                    <li>积分一旦购买不可退款</li>
                    <li>积分不可转让给其他用户</li>
                    <li>我们保留调整积分价格和消费规则的权利</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">4.2 支付方式</h3>
                  <p className="text-gray-700">
                    我们支持支付宝等第三方支付方式。所有支付均通过安全的第三方支付平台处理，我们不存储您的支付信息。
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">4.3 退款政策</h3>
                  <p className="text-gray-700">
                    除非法律另有规定，已购买的积分不予退款。如因系统故障导致积分扣除异常，请联系客服处理。
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">4.4 发票开具</h3>
                  <p className="text-gray-700">
                    如需开具发票，请在充值后联系客服，提供必要的开票信息。
                  </p>
                </div>
              </div>
            </section>

            {/* 5. 知识产权 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="w-8 h-8 bg-red-500 text-white rounded-lg flex items-center justify-center mr-3 text-sm">5</span>
                知识产权
              </h2>
              
              <div className="ml-11 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">5.1 平台知识产权</h3>
                  <p className="text-gray-700">
                    本平台的所有内容，包括但不限于文字、图片、图标、音频、视频、软件、源代码、界面设计等，均受版权、商标和其他知识产权法律保护，归VEO AI或其许可方所有。
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">5.2 用户生成内容</h3>
                  <p className="text-gray-700 mb-2">
                    您通过本平台生成的视频内容，其知识产权归属如下：
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>您对生成的内容拥有使用权</li>
                    <li>您授予我们非独占、全球性、免费的许可，用于展示、改进服务</li>
                    <li>您保证不会使用生成的内容侵犯他人权利</li>
                    <li>您对生成内容的使用承担全部责任</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">5.3 侵权投诉</h3>
                  <p className="text-gray-700">
                    如果您认为平台上的内容侵犯了您的知识产权，请通过{' '}
                    <Link href="/contact" className="text-blue-600 hover:underline">
                      联系我们
                    </Link>
                    页面提供相关证明材料，我们将及时处理。
                  </p>
                </div>
              </div>
            </section>

            {/* 6. 免责声明 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="w-8 h-8 bg-indigo-500 text-white rounded-lg flex items-center justify-center mr-3 text-sm">6</span>
                免责声明
              </h2>
              
              <div className="ml-11 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">6.1 服务可用性</h3>
                  <p className="text-gray-700">
                    我们努力提供稳定的服务，但不保证服务不会中断、延迟或出现错误。对于因不可抗力、系统维护、网络故障等原因造成的服务中断，我们不承担责任。
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">6.2 内容质量</h3>
                  <p className="text-gray-700">
                    AI生成的内容仅供参考，我们不保证其准确性、完整性或适用性。您应自行判断生成内容是否符合您的需求。
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">6.3 第三方链接</h3>
                  <p className="text-gray-700">
                    本平台可能包含第三方网站的链接。我们不对第三方网站的内容、隐私政策或做法负责。
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">6.4 责任限制</h3>
                  <p className="text-gray-700">
                    在法律允许的最大范围内，我们对任何间接、偶然、特殊、惩罚性或后果性损害不承担责任，包括但不限于利润损失、数据丢失或业务中断。
                  </p>
                </div>
              </div>
            </section>

            {/* 7. 争议解决 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="w-8 h-8 bg-pink-500 text-white rounded-lg flex items-center justify-center mr-3 text-sm">7</span>
                争议解决
              </h2>
              
              <div className="ml-11">
                <p className="text-gray-700 mb-3">
                  本条款的解释、效力及争议解决均适用中华人民共和国法律（不包括其冲突法规则）。
                </p>
                <p className="text-gray-700 mb-3">
                  如因本条款引起任何争议，双方应首先通过友好协商解决。协商不成的，任何一方均可向本平台所在地有管辖权的人民法院提起诉讼。
                </p>
              </div>
            </section>

            {/* 8. 条款修改 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="w-8 h-8 bg-teal-500 text-white rounded-lg flex items-center justify-center mr-3 text-sm">8</span>
                条款修改与通知
              </h2>
              
              <div className="ml-11">
                <p className="text-gray-700 mb-3">
                  我们保留随时修改本条款的权利。修改后的条款将在本页面发布，并在发布时立即生效。
                </p>
                <p className="text-gray-700 mb-3">
                  如果您在条款修改后继续使用服务，即视为您接受修改后的条款。如果您不同意修改后的条款，请停止使用我们的服务。
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                  <p className="text-blue-800 font-medium">📧 重要通知</p>
                  <p className="text-blue-700 text-sm mt-2">
                    对于重大条款变更，我们会通过电子邮件、网站公告或其他合理方式提前通知您。
                  </p>
                </div>
              </div>
            </section>

            {/* 9. 联系方式 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="w-8 h-8 bg-orange-500 text-white rounded-lg flex items-center justify-center mr-3 text-sm">9</span>
                联系我们
              </h2>
              
              <div className="ml-11">
                <p className="text-gray-700 mb-3">
                  如果您对本服务条款有任何疑问或需要帮助，请通过以下方式联系我们：
                </p>
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6 mt-4">
                  <div className="text-center">
                    <p className="text-gray-800 text-lg mb-2">
                      <strong>QQ邮箱</strong>
                    </p>
                    <a 
                      href="mailto:3533912007@qq.com" 
                      className="text-blue-600 hover:text-blue-700 text-xl font-semibold hover:underline"
                    >
                      3533912007@qq.com
                    </a>
                    <p className="text-gray-600 text-sm mt-3">
                      我们通常在1-2个工作日内回复
                    </p>
                  </div>
                </div>
                <div className="mt-6 text-center">
                  <Link
                    href="/contact"
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
                  >
                    查看更多联系方式
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </section>

            {/* 生效日期 */}
            <section className="border-t pt-6">
              <p className="text-gray-600 text-sm text-center">
                本服务条款自 {new Date().toLocaleDateString('zh-CN')} 起生效
              </p>
            </section>
          </div>

          {/* Footer Links */}
          <div className="mt-8 text-center space-x-6">
            <Link href="/privacy" className="text-gray-600 hover:text-gray-900 transition-colors">
              隐私政策
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






