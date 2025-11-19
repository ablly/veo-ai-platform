export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">退款政策 Refund Policy</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-8">
              最后更新日期：{new Date().toLocaleDateString('zh-CN')}
              <br />
              Last Updated: {new Date().toLocaleDateString('en-US')}
            </p>

            {/* 中文版本 */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. 退款政策概述</h2>
              <p className="text-gray-700 mb-4">
                感谢您选择 VEO AI 平台。我们致力于为您提供优质的 AI 视频生成服务。本退款政策适用于通过我们平台购买的所有积分套餐。
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. 退款条件</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">2.1 可退款情况</h3>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>购买后 14 天内，且未使用任何积分</li>
                <li>技术故障导致服务无法正常使用（经我们确认）</li>
                <li>重复购买或错误购买（需在 24 小时内申请）</li>
                <li>支付成功但积分未到账（经我们核实）</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">2.2 不可退款情况</h3>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>已使用部分或全部积分</li>
                <li>购买超过 14 天</li>
                <li>因用户自身原因（如操作失误、不满意生成结果等）</li>
                <li>促销或特价套餐（除非法律另有规定）</li>
                <li>账户被封禁或违反服务条款</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. 退款流程</h2>
              <ol className="list-decimal pl-6 mb-4 text-gray-700 space-y-3">
                <li>
                  <strong>提交申请：</strong>
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>发送邮件至：3533912007@qq.com</li>
                    <li>邮件标题：退款申请 - [订单号]</li>
                    <li>提供：订单号、购买日期、退款原因</li>
                  </ul>
                </li>
                <li>
                  <strong>审核处理：</strong>
                  我们将在 3-5 个工作日内审核您的申请
                </li>
                <li>
                  <strong>退款执行：</strong>
                  审核通过后，退款将在 7-14 个工作日内原路返回
                </li>
                <li>
                  <strong>确认通知：</strong>
                  退款完成后，我们会通过邮件通知您
                </li>
              </ol>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. 退款方式</h2>
              <p className="text-gray-700 mb-4">
                退款将通过原支付方式返回：
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li><strong>信用卡/借记卡：</strong>7-14 个工作日到账</li>
                <li><strong>PayPal：</strong>3-5 个工作日到账</li>
                <li><strong>支付宝：</strong>1-3 个工作日到账</li>
                <li><strong>微信支付：</strong>1-3 个工作日到账</li>
              </ul>
              <p className="text-gray-600 text-sm">
                注：具体到账时间可能因银行或支付平台而异
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. 部分退款</h2>
              <p className="text-gray-700 mb-4">
                在某些特殊情况下，我们可能提供部分退款：
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>服务中断导致部分功能不可用</li>
                <li>已使用少量积分但遇到重大技术问题</li>
                <li>其他经我们评估后认为合理的情况</li>
              </ul>
              <p className="text-gray-700">
                部分退款金额将根据已使用积分比例计算。
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. 争议解决</h2>
              <p className="text-gray-700 mb-4">
                如果您对退款决定有异议，可以：
              </p>
              <ol className="list-decimal pl-6 mb-4 text-gray-700 space-y-2">
                <li>联系我们的客服团队进行申诉</li>
                <li>提供额外的证明材料</li>
                <li>我们将在 5 个工作日内重新审核</li>
              </ol>
            </section>

            {/* 英文版本 */}
            <hr className="my-12 border-gray-300" />

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Refund Policy Overview</h2>
              <p className="text-gray-700 mb-4">
                Thank you for choosing VEO AI Platform. We are committed to providing you with high-quality AI video generation services. This refund policy applies to all credit packages purchased through our platform.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Refund Eligibility</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">2.1 Refundable Situations</h3>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Within 7 days of purchase and no credits have been used</li>
                <li>Technical failures preventing normal service use (verified by us)</li>
                <li>Duplicate or erroneous purchases (must apply within 24 hours)</li>
                <li>Payment successful but credits not received (verified by us)</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">2.2 Non-Refundable Situations</h3>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Credits have been partially or fully used</li>
                <li>More than 7 days since purchase</li>
                <li>User-related reasons (operational errors, dissatisfaction with results, etc.)</li>
                <li>Promotional or discounted packages (unless required by law)</li>
                <li>Account suspended or violation of terms of service</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Refund Process</h2>
              <ol className="list-decimal pl-6 mb-4 text-gray-700 space-y-3">
                <li>
                  <strong>Submit Request:</strong>
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Email: support@veo-ai.site</li>
                    <li>Subject: Refund Request - [Order Number]</li>
                    <li>Include: Order number, purchase date, reason for refund</li>
                  </ul>
                </li>
                <li>
                  <strong>Review:</strong>
                  We will review your request within 3-5 business days
                </li>
                <li>
                  <strong>Processing:</strong>
                  Once approved, refund will be processed within 7-14 business days
                </li>
                <li>
                  <strong>Confirmation:</strong>
                  You will receive an email notification once the refund is complete
                </li>
              </ol>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Refund Methods</h2>
              <p className="text-gray-700 mb-4">
                Refunds will be returned through the original payment method:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li><strong>Credit/Debit Card:</strong> 7-14 business days</li>
                <li><strong>PayPal:</strong> 3-5 business days</li>
                <li><strong>Alipay:</strong> 1-3 business days</li>
                <li><strong>WeChat Pay:</strong> 1-3 business days</li>
              </ul>
              <p className="text-gray-600 text-sm">
                Note: Actual processing time may vary depending on your bank or payment provider
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Partial Refunds</h2>
              <p className="text-gray-700 mb-4">
                In certain special circumstances, we may offer partial refunds:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Service interruption causing partial functionality unavailability</li>
                <li>Minor credit usage but encountering major technical issues</li>
                <li>Other situations deemed reasonable after our evaluation</li>
              </ul>
              <p className="text-gray-700">
                Partial refund amounts will be calculated based on the proportion of credits used.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Dispute Resolution</h2>
              <p className="text-gray-700 mb-4">
                If you disagree with a refund decision, you may:
              </p>
              <ol className="list-decimal pl-6 mb-4 text-gray-700 space-y-2">
                <li>Contact our customer service team to appeal</li>
                <li>Provide additional supporting documentation</li>
                <li>We will re-review within 5 business days</li>
              </ol>
            </section>

            {/* 联系信息 */}
            <section className="mb-12 bg-blue-50 p-6 rounded-lg">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">联系我们 Contact Us</h2>
              <div className="space-y-2 text-gray-700">
                <p><strong>邮箱 Email:</strong> 3533912007@qq.com</p>
                <p><strong>客服邮箱 Support:</strong> {process.env.NEXT_PUBLIC_ADMIN_EMAIL || '3533912007@qq.com'}</p>
                <p><strong>工作时间 Business Hours:</strong> 周一至周五 9:00-18:00 (GMT+8)</p>
              </div>
            </section>

            {/* 法律声明 */}
            <section className="mb-8 bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">法律声明 Legal Notice</h2>
              <p className="text-gray-600 text-sm">
                本退款政策受中华人民共和国法律管辖。我们保留随时修改本政策的权利，修改后的政策将在网站上公布。继续使用我们的服务即表示您接受修改后的政策。
              </p>
              <p className="text-gray-600 text-sm mt-3">
                This refund policy is governed by the laws of the People's Republic of China. We reserve the right to modify this policy at any time. Modified policies will be published on our website. Continued use of our services indicates your acceptance of the modified policy.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
