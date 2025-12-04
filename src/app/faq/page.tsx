import { Metadata } from "next"

export const metadata: Metadata = {
  title: "常见问题FAQ - VEO AI视频生成平台",
  description: "VEO AI常见问题解答：如何使用SORA 2.0和VEO 3.1生成视频、积分充值、支付方式、退款政策等问题一站式解答。",
  keywords: ["VEO AI FAQ", "AI视频生成问题", "SORA使用教程", "VEO使用方法", "积分充值问题"],
  openGraph: {
    title: "常见问题FAQ - VEO AI",
    description: "关于AI视频生成的所有问题，这里都有答案",
    url: "https://www.veo-ai.site/faq",
  },
  alternates: {
    canonical: "https://www.veo-ai.site/faq",
  },
}

const faqs = [
  {
    category: "基础问题",
    questions: [
      {
        q: "VEO AI是什么？",
        a: "VEO AI是全球首家集成OpenAI SORA 2.0与Google VEO 3.1双AI引擎的视频生成平台。您可以通过文字描述或上传参考图片，在30-60秒内生成专业级视频内容。"
      },
      {
        q: "VEO AI支持哪些AI模型？",
        a: "目前支持两种顶级AI模型：1) SORA 2.0 - OpenAI出品，支持10-15秒视频生成，消耗10积分；2) VEO 3.1 - Google出品，生成5秒高质量视频，消耗15积分。"
      },
      {
        q: "生成一个视频需要多长时间？",
        a: "通常30-60秒即可完成视频生成。具体时间取决于视频长度、复杂度和当前服务器负载。"
      }
    ]
  },
  {
    category: "账户与积分",
    questions: [
      {
        q: "新用户有什么优惠？",
        a: "新用户注册即送10积分，可免费生成1个SORA 2.0视频体验。首次充值还额外赠送50%积分！"
      },
      {
        q: "积分如何获取？",
        a: "您可以通过以下方式获取积分：1) 新用户注册送10积分；2) 购买积分套餐；3) 参与平台活动获得奖励积分。"
      },
      {
        q: "积分有有效期吗？",
        a: "购买的积分永久有效，不会过期。赠送的积分可能有使用期限，请查看具体活动规则。"
      }
    ]
  },
  {
    category: "支付相关",
    questions: [
      {
        q: "支持哪些支付方式？",
        a: "国内用户支持支付宝支付；海外用户支持Stripe支付（包括Visa、Mastercard、Apple Pay、Google Pay等）。系统会根据您的地理位置自动推荐合适的支付方式。"
      },
      {
        q: "支付后积分多久到账？",
        a: "支付成功后积分即时到账。如遇特殊情况，最长不超过5分钟。如果超时未到账，请联系客服。"
      },
      {
        q: "可以退款吗？",
        a: "购买后14天内，如果未使用任何积分，可以申请全额退款。详情请查看退款政策页面。"
      }
    ]
  },
  {
    category: "视频生成",
    questions: [
      {
        q: "如何生成高质量视频？",
        a: "1) 使用详细、具体的文字描述；2) 上传高清参考图片；3) 选择合适的AI模型；4) 避免使用违规内容。"
      },
      {
        q: "支持哪些视频比例？",
        a: "支持16:9（横屏）、9:16（竖屏/短视频）、1:1（方形）三种常用比例。"
      },
      {
        q: "生成的视频可以商用吗？",
        a: "是的，您生成的视频拥有完整使用权，可用于个人或商业用途。但请确保输入内容不侵犯他人版权。"
      },
      {
        q: "为什么我的视频生成失败了？",
        a: "可能原因：1) 输入内容包含违规词汇；2) 网络连接不稳定；3) 服务器繁忙。建议修改描述后重试，失败不扣积分。"
      }
    ]
  },
  {
    category: "SORA 2.0 vs VEO 3.1",
    questions: [
      {
        q: "SORA 2.0和VEO 3.1有什么区别？",
        a: "SORA 2.0（OpenAI）：支持更长视频（10-15秒），动作连贯性好，适合叙事类内容，消耗10积分。VEO 3.1（Google）：视频更短（5秒）但画质更精细，适合产品展示，消耗15积分。"
      },
      {
        q: "应该选择哪个模型？",
        a: "如果需要较长的视频或讲故事，选SORA 2.0；如果追求极致画质或做产品展示，选VEO 3.1。新手建议先用SORA 2.0体验。"
      }
    ]
  }
]

export default function FAQPage() {
  // FAQ页面专属结构化数据 - 添加name字段修复Google警告
  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "name": "VEO AI 常见问题",
    "description": "关于VEO AI视频生成平台的常见问题解答",
    "mainEntity": faqs.flatMap(category => 
      category.questions.map(item => ({
        "@type": "Question",
        "name": item.q,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": item.a
        }
      }))
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      {/* 结构化数据 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />
      
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            常见问题 FAQ
          </h1>
          <p className="text-xl text-gray-600">
            关于VEO AI视频生成平台的所有问题，这里都有答案
          </p>
        </div>

        <div className="space-y-8">
          {faqs.map((category, categoryIndex) => (
            <div key={categoryIndex} className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b border-gray-200">
                {category.category}
              </h2>
              
              <div className="space-y-6">
                {category.questions.map((item, itemIndex) => (
                  <div key={itemIndex} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-start">
                      <span className="text-yellow-500 mr-2">Q:</span>
                      {item.q}
                    </h3>
                    <p className="text-gray-600 leading-relaxed pl-6">
                      <span className="text-green-500 font-semibold mr-2">A:</span>
                      {item.a}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* 联系我们 */}
        <div className="mt-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            还有其他问题？
          </h2>
          <p className="text-white/90 mb-6">
            如果您的问题没有在上面找到答案，欢迎联系我们的客服团队
          </p>
          <a
            href="mailto:3533912007@qq.com"
            className="inline-block bg-white text-orange-500 font-bold py-3 px-8 rounded-full hover:bg-gray-100 transition-colors"
          >
            联系客服
          </a>
        </div>
      </div>
    </div>
  )
}
