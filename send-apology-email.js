/**
 * 发送道歉邮件给所有用户
 * 关于视频状态同步故障的说明和补偿
 */

require('dotenv').config();
const { Resend } = require('resend');
const { Pool } = require('pg');

const resend = new Resend(process.env.RESEND_API_KEY);
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// 邮件模板
function getApologyEmailHTML(userName) {
  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>关于视频生成服务临时故障的说明</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden;">
          
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">VEO AI Platform</h1>
              <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">关于服务临时故障的说明</p>
            </td>
          </tr>

          <tr>
            <td style="padding: 40px 30px;">
              
              <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                尊敬的 <strong>${userName}</strong>，您好！
              </p>

              <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; color: #856404; font-size: 15px; line-height: 1.6;">
                  <strong>我们诚挚地向您道歉</strong><br>
                  今天（2025年11月27日），我们的视频生成服务出现了技术故障，部分用户的视频显示为"生成中"状态，但实际上视频已经生成完成。这给您的使用体验带来了不便，我们深感抱歉。
                </p>
              </div>

              <h2 style="margin: 30px 0 15px 0; color: #333333; font-size: 20px; font-weight: 600;">问题说明</h2>
              <p style="margin: 0 0 15px 0; color: #666666; font-size: 15px; line-height: 1.8;">
                由于系统升级过程中的技术问题，导致：
              </p>
              <ul style="margin: 0 0 20px 0; padding-left: 20px; color: #666666; font-size: 15px; line-height: 1.8;">
                <li style="margin-bottom: 8px;">部分视频状态未能及时更新</li>
                <li style="margin-bottom: 8px;">已完成的视频显示为"生成中"</li>
                <li style="margin-bottom: 8px;">视频链接暂时无法访问</li>
              </ul>

              <h2 style="margin: 30px 0 15px 0; color: #333333; font-size: 20px; font-weight: 600;">解决方案</h2>
              <div style="background-color: #d4edda; border-left: 4px solid #28a745; padding: 20px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0 0 10px 0; color: #155724; font-size: 15px; line-height: 1.6;">
                  <strong>✅ 问题已完全修复</strong>
                </p>
                <p style="margin: 0; color: #155724; font-size: 15px; line-height: 1.8;">
                  我们的技术团队已经紧急修复了这个问题，并实施了以下改进措施：
                </p>
                <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #155724; font-size: 15px; line-height: 1.8;">
                  <li style="margin-bottom: 8px;">修复了视频状态同步机制</li>
                  <li style="margin-bottom: 8px;">所有受影响的视频已恢复正常</li>
                  <li style="margin-bottom: 8px;">实施了五层防护机制，确保不再发生类似问题</li>
                  <li style="margin-bottom: 8px;">增加了自动监控和修复系统</li>
                </ul>
              </div>

              <h2 style="margin: 30px 0 15px 0; color: #333333; font-size: 20px; font-weight: 600;">您需要做什么</h2>
              <div style="background-color: #d1ecf1; border-left: 4px solid #17a2b8; padding: 20px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0 0 10px 0; color: #0c5460; font-size: 15px; line-height: 1.6;">
                  <strong>无需任何操作</strong>
                </p>
                <p style="margin: 0; color: #0c5460; font-size: 15px; line-height: 1.8;">
                  您之前生成的视频现在已经可以正常访问了。请刷新页面或重新登录，即可查看您的视频。
                </p>
              </div>

              <h2 style="margin: 30px 0 15px 0; color: #333333; font-size: 20px; font-weight: 600;">补偿措施</h2>
              <p style="margin: 0 0 15px 0; color: #666666; font-size: 15px; line-height: 1.8;">
                为了表达我们的歉意，我们将为所有用户提供：
              </p>
              <div style="background-color: #f8f9fa; border: 2px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: center;">
                <p style="margin: 0 0 10px 0; color: #667eea; font-size: 24px; font-weight: 700;">🎁 免费赠送</p>
                <p style="margin: 0 0 5px 0; color: #333333; font-size: 32px; font-weight: 700;">5 积分</p>
                <p style="margin: 0; color: #666666; font-size: 14px;">感谢您的理解与支持</p>
              </div>
              <p style="margin: 15px 0 0 0; color: #666666; font-size: 14px; line-height: 1.6; text-align: center;">
                积分将在 24 小时内自动发放到您的账户
              </p>

              <h2 style="margin: 30px 0 15px 0; color: #333333; font-size: 20px; font-weight: 600;">我们的承诺</h2>
              <p style="margin: 0 0 15px 0; color: #666666; font-size: 15px; line-height: 1.8;">
                我们深知您的信任对我们至关重要。为了确保类似问题不再发生，我们已经：
              </p>
              <ul style="margin: 0 0 20px 0; padding-left: 20px; color: #666666; font-size: 15px; line-height: 1.8;">
                <li style="margin-bottom: 8px;">✅ 实施了五层防护机制</li>
                <li style="margin-bottom: 8px;">✅ 增加了实时监控系统</li>
                <li style="margin-bottom: 8px;">✅ 建立了自动修复机制</li>
                <li style="margin-bottom: 8px;">✅ 加强了系统测试流程</li>
              </ul>

              <div style="background-color: #f8f9fa; padding: 20px; margin: 30px 0 0 0; border-radius: 8px;">
                <p style="margin: 0 0 10px 0; color: #333333; font-size: 15px; font-weight: 600;">如有任何问题，请随时联系我们：</p>
                <p style="margin: 0; color: #666666; font-size: 14px; line-height: 1.6;">
                  📧 邮箱：3533912007@qq.com<br>
                  🌐 网站：https://www.veo-ai.site<br>
                  ⏰ 客服时间：周一至周日 9:00-21:00
                </p>
              </div>

              <p style="margin: 30px 0 0 0; color: #666666; font-size: 15px; line-height: 1.8;">
                再次感谢您对 VEO AI Platform 的支持与理解。我们会继续努力，为您提供更好的服务！
              </p>

              <p style="margin: 20px 0 0 0; color: #666666; font-size: 15px; line-height: 1.8;">
                此致<br>
                <strong style="color: #333333;">VEO AI Platform 团队</strong><br>
                <span style="color: #999999; font-size: 14px;">2025年11月27日</span>
              </p>

            </td>
          </tr>

          <tr>
            <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="margin: 0 0 10px 0; color: #999999; font-size: 13px;">
                © 2025 VEO AI Platform. All rights reserved.
              </p>
              <p style="margin: 0; color: #999999; font-size: 12px;">
                这是一封系统自动发送的邮件，请勿直接回复。
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

async function sendApologyEmails() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 查询所有用户...\n');
    
    // 查询所有有邮箱的用户
    const result = await client.query(`
      SELECT id, name, email
      FROM users
      WHERE email IS NOT NULL
      AND email != ''
      ORDER BY created_at DESC
    `);
    
    const users = result.rows;
    console.log(`找到 ${users.length} 个用户\n`);
    
    if (users.length === 0) {
      console.log('没有用户需要发送邮件');
      return;
    }
    
    let sent = 0;
    let failed = 0;
    
    for (const user of users) {
      try {
        const userName = user.name || user.email.split('@')[0];
        
        console.log(`发送邮件给: ${user.email} (${userName})`);
        
        const { data, error } = await resend.emails.send({
          from: 'VEO AI <noreply@veo-ai.site>',
          to: [user.email],
          subject: '【重要通知】关于视频生成服务临时故障的说明与补偿',
          html: getApologyEmailHTML(userName)
        });
        
        if (error) {
          console.log(`  ❌ 发送失败: ${error.message}`);
          failed++;
        } else {
          console.log(`  ✅ 发送成功 (ID: ${data.id})`);
          sent++;
        }
        
        // 避免发送过快，每封邮件间隔1秒
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.log(`  ❌ 发送失败: ${error.message}`);
        failed++;
      }
    }
    
    console.log('\n========== 发送完成 ==========');
    console.log(`✅ 成功: ${sent}`);
    console.log(`❌ 失败: ${failed}`);
    console.log(`📊 总计: ${users.length}`);
    
  } catch (error) {
    console.error('❌ 错误:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// 确认发送
console.log('⚠️  警告：即将向所有用户发送道歉邮件');
console.log('');
console.log('邮件主题: 【重要通知】关于视频生成服务临时故障的说明与补偿');
console.log('邮件内容: 道歉 + 问题说明 + 解决方案 + 5积分补偿');
console.log('');
console.log('按 Ctrl+C 取消，或等待 5 秒后自动开始发送...');
console.log('');

setTimeout(() => {
  sendApologyEmails();
}, 5000);
