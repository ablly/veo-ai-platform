'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            VEO AI
          </Link>
          <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
            返回首页
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Title */}
          <div className="text-center mb-16">
            <motion.h1 
              className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              联系我们
            </motion.h1>
            <motion.p 
              className="text-gray-600 text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              有任何问题或建议？我们随时为您服务
            </motion.p>
          </div>

          {/* Contact Cards Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* QQ邮箱卡片 */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300"
            >
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">QQ邮箱</h2>
                  <p className="text-gray-600 text-sm">首选联系方式</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-6">
                  <p className="text-gray-700 mb-3">
                    <strong className="text-gray-900">邮箱地址：</strong>
                  </p>
                  <a 
                    href="mailto:3533912007@qq.com"
                    className="text-2xl font-bold text-red-600 hover:text-red-700 hover:underline block mb-4 break-all"
                  >
                    3533912007@qq.com
                  </a>
                  <a
                    href="mailto:3533912007@qq.com"
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:from-red-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl w-full justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    发送邮件
                  </a>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>工作日通常在 <strong>4-8小时</strong> 内回复</span>
                  </div>
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>适用于账户、技术、合作等所有问题</span>
                  </div>
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>请详细描述您的问题，附上截图更佳</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* 微信卡片 */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300"
            >
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                  <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 2.733-6.578 1.984-1.237 4.389-1.611 6.638-1.076.333-.654.514-1.385.514-2.154 0-4.054-3.891-7.342-8.691-7.342zm-.84 3.694a.843.843 0 11.002 1.687.843.843 0 01-.002-1.687zm-3.95 0a.843.843 0 11.002 1.687.843.843 0 01-.002-1.687z"/>
                    <path d="M24 14.525c0-3.228-2.912-5.84-6.51-5.84-3.6 0-6.512 2.612-6.512 5.84 0 3.229 2.913 5.842 6.511 5.842.696 0 1.372-.087 2.022-.252a.665.665 0 01.55.075l1.464.856a.25.25 0 00.129.041.226.226 0 00.227-.227.397.397 0 00-.037-.164l-.3-1.138a.453.453 0 01.164-.513C22.797 18.292 24 16.581 24 14.525zm-8.79-1.85a.65.65 0 11.002 1.3.65.65 0 01-.002-1.3zm3.603 0a.65.65 0 11.002 1.3.65.65 0 01-.002-1.3z"/>
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">微信</h2>
                  <p className="text-gray-600 text-sm">扫码添加好友</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 flex flex-col items-center">
                  <p className="text-gray-700 mb-4 text-center">
                    <strong className="text-gray-900">扫描二维码添加微信</strong>
                  </p>
                  <div className="bg-white p-4 rounded-xl shadow-lg mb-4">
                    <Image
                      src="/images/thumbnails/wechat-qrcode.jpg"
                      alt="微信二维码"
                      width={200}
                      height={200}
                      className="rounded-lg"
                      priority
                      unoptimized={true}
                    />
                  </div>
                  <p className="text-sm text-gray-600 text-center">
                    使用微信扫一扫添加好友
                  </p>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>快速实时沟通</span>
                  </div>
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>适合紧急问题咨询</span>
                  </div>
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>工作时间优先响应</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* 工作时间和常见问题 */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* 工作时间 */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-2xl shadow-xl p-8"
            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">工作时间</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <span className="font-semibold text-gray-800">周一至周五</span>
                  <span className="text-blue-600 font-bold">9:00 - 18:00</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                  <span className="font-semibold text-gray-800">周六至周日</span>
                  <span className="text-purple-600 font-bold">10:00 - 17:00</span>
                </div>
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>⏰ 提示：</strong>法定节假日响应可能延迟，我们会在工作日优先处理您的问题。
                  </p>
                </div>
              </div>
            </motion.div>

            {/* 常见问题 */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white rounded-2xl shadow-xl p-8"
            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">联系须知</h2>
              </div>
              
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-start">
                  <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mr-3 mt-0.5 font-bold">1</span>
                  <p><strong>账户问题：</strong>请提供您的注册邮箱，以便我们快速定位</p>
                </div>
                <div className="flex items-start">
                  <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mr-3 mt-0.5 font-bold">2</span>
                  <p><strong>技术问题：</strong>请附上错误截图或详细描述，有助于更快解决</p>
                </div>
                <div className="flex items-start">
                  <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center flex-shrink-0 mr-3 mt-0.5 font-bold">3</span>
                  <p><strong>充值问题：</strong>请提供订单号和支付凭证</p>
                </div>
                <div className="flex items-start">
                  <span className="w-6 h-6 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center flex-shrink-0 mr-3 mt-0.5 font-bold">4</span>
                  <p><strong>商务合作：</strong>请说明合作意向和联系方式</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* 底部信息卡片 */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white text-center"
          >
            <h2 className="text-3xl font-bold mb-4">我们重视每一位用户的反馈</h2>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              无论是使用问题、功能建议还是商务合作，我们都期待听到您的声音。您的每一条反馈都将帮助我们提供更好的服务。
            </p>
            <div className="flex items-center justify-center space-x-4">
              <a
                href="mailto:3533912007@qq.com"
                className="inline-flex items-center px-8 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl font-semibold"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                立即联系
              </a>
            </div>
          </motion.div>

          {/* Footer Links */}
          <div className="mt-12 text-center space-x-6">
            <Link href="/privacy" className="text-gray-600 hover:text-gray-900 transition-colors">
              隐私政策
            </Link>
            <Link href="/terms" className="text-gray-600 hover:text-gray-900 transition-colors">
              服务条款
            </Link>
            <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
              返回首页
            </Link>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="mt-20 py-8 border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-4 text-center text-gray-600 text-sm">
          <p>© {new Date().getFullYear()} VEO AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}


















