/**
 * SMTP详细诊断脚本
 * 检查所有可能的问题
 */

const nodemailer = require('nodemailer')
require('dotenv').config()

console.log('🔍 SMTP详细诊断开始...\n')
console.log('=' .repeat(60))

// 1. 检查环境变量
console.log('\n📋 步骤1：检查环境变量')
console.log('-'.repeat(60))

const config = {
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE,
  user: process.env.SMTP_USER,
  pass: process.env.SMTP_PASSWORD
}

console.log('SMTP_HOST:', config.host || '❌ 未设置')
console.log('SMTP_PORT:', config.port || '❌ 未设置')
console.log('SMTP_SECURE:', config.secure || '❌ 未设置')
console.log('SMTP_USER:', config.user || '❌ 未设置')
console.log('SMTP_PASSWORD:', config.pass ? `✅ 已设置 (${config.pass.length}位)` : '❌ 未设置')

if (!config.pass) {
  console.error('\n❌ 致命错误：SMTP_PASSWORD 未设置！')
  process.exit(1)
}

// 2. 检查授权码格式
console.log('\n🔐 步骤2：检查授权码格式')
console.log('-'.repeat(60))

const password = config.pass.trim()
console.log('授权码长度:', password.length)
console.log('是否包含空格:', password.includes(' ') ? '❌ 是（这会导致失败）' : '✅ 否')
console.log('是否包含引号:', password.includes('"') || password.includes("'") ? '❌ 是（这会导致失败）' : '✅ 否')
console.log('授权码预览:', password.substring(0, 4) + '****' + password.substring(password.length - 4))

if (password.length !== 16) {
  console.warn('⚠️  警告：QQ邮箱授权码通常是16位，当前长度不匹配')
}

// 3. 测试网络连接
console.log('\n🌐 步骤3：测试网络连接')
console.log('-'.repeat(60))

const net = require('net')

function testConnection(host, port) {
  return new Promise((resolve, reject) => {
    const socket = net.createConnection({ host, port, timeout: 5000 })
    
    socket.on('connect', () => {
      console.log(`✅ 可以连接到 ${host}:${port}`)
      socket.end()
      resolve(true)
    })
    
    socket.on('timeout', () => {
      console.log(`❌ 连接超时 ${host}:${port}`)
      socket.destroy()
      reject(new Error('Connection timeout'))
    })
    
    socket.on('error', (err) => {
      console.log(`❌ 连接失败 ${host}:${port} - ${err.message}`)
      reject(err)
    })
  })
}

async function runDiagnostics() {
  try {
    await testConnection(config.host, parseInt(config.port))
  } catch (error) {
    console.error('\n⚠️  网络连接问题，可能原因：')
    console.error('  - 防火墙阻止了465端口')
    console.error('  - 网络不稳定')
    console.error('  - 需要使用代理')
  }

  // 4. 测试SMTP认证
  console.log('\n🔌 步骤4：测试SMTP认证')
  console.log('-'.repeat(60))

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: parseInt(config.port),
    secure: config.secure === 'true',
    auth: {
      user: config.user,
      pass: password
    },
    debug: true, // 启用调试模式
    logger: false // 禁用日志输出到控制台
  })

  try {
    console.log('正在验证SMTP连接...')
    await transporter.verify()
    console.log('✅ SMTP认证成功！')
    
    // 5. 发送测试邮件
    console.log('\n📧 步骤5：发送测试邮件')
    console.log('-'.repeat(60))
    
    const info = await transporter.sendMail({
      from: `"VEO AI 测试" <${config.user}>`,
      to: config.user,
      subject: '✅ SMTP诊断测试成功',
      text: '如果您收到这封邮件，说明SMTP配置完全正确！',
      html: `
        <div style="font-family: Arial; padding: 20px; background: #f5f5f5;">
          <div style="background: white; padding: 30px; border-radius: 10px;">
            <h2 style="color: #28a745;">✅ SMTP诊断测试成功</h2>
            <p>恭喜！您的SMTP配置完全正确，邮件系统可以正常工作了。</p>
            <hr>
            <p><strong>配置信息：</strong></p>
            <ul>
              <li>SMTP主机: ${config.host}</li>
              <li>SMTP端口: ${config.port}</li>
              <li>发件邮箱: ${config.user}</li>
              <li>测试时间: ${new Date().toLocaleString('zh-CN')}</li>
            </ul>
            <p style="color: #666; font-size: 12px; margin-top: 30px;">
              此邮件由SMTP诊断脚本发送<br>
              VEO AI - 让创意生动起来
            </p>
          </div>
        </div>
      `
    })
    
    console.log('✅ 测试邮件发送成功！')
    console.log('Message ID:', info.messageId)
    
    console.log('\n' + '='.repeat(60))
    console.log('🎉 诊断完成：所有测试通过！')
    console.log('='.repeat(60))
    console.log('\n✅ SMTP配置完全正常')
    console.log('✅ 现在可以在管理后台发送邮件了')
    console.log('👉 访问: http://localhost:3000/admin/notifications')
    
  } catch (error) {
    console.log('\n' + '='.repeat(60))
    console.log('❌ 诊断失败')
    console.log('='.repeat(60))
    
    console.error('\n错误详情：')
    console.error('类型:', error.name)
    console.error('信息:', error.message)
    
    console.log('\n🔧 可能的原因和解决方案：')
    console.log('-'.repeat(60))
    
    if (error.message.includes('Invalid login') || error.message.includes('535')) {
      console.log('\n❌ 原因：授权码无效或SMTP服务未开启')
      console.log('\n解决方案：')
      console.log('1. 确认QQ邮箱SMTP服务已开启')
      console.log('   - 访问: https://mail.qq.com')
      console.log('   - 设置 → 账户 → POP3/IMAP/SMTP服务')
      console.log('   - 确保"SMTP服务"显示为"已开启"')
      console.log('')
      console.log('2. 重新生成授权码')
      console.log('   - 在同一页面点击"生成授权码"')
      console.log('   - 发送短信验证')
      console.log('   - 复制新的16位授权码')
      console.log('')
      console.log('3. 更新.env文件')
      console.log('   - 打开 .env 文件')
      console.log('   - 找到 SMTP_PASSWORD="xvxrxihgxrijcjbg"')
      console.log('   - 替换为新的授权码')
      console.log('   - 确保没有多余的空格或引号')
      console.log('')
      console.log('4. 重启服务器')
      console.log('   - 按 Ctrl+C 停止当前服务器')
      console.log('   - 运行: npm run dev')
      console.log('')
      console.log('5. 等待5-10分钟')
      console.log('   - QQ邮箱可能因为多次失败登录而临时限制')
      console.log('   - 等待一段时间后再试')
      
    } else if (error.message.includes('ECONNECTION') || error.message.includes('ETIMEDOUT')) {
      console.log('\n❌ 原因：网络连接问题')
      console.log('\n解决方案：')
      console.log('1. 检查网络连接')
      console.log('2. 检查防火墙设置（允许465端口）')
      console.log('3. 尝试使用VPN')
      console.log('4. 更换网络环境')
      
    } else {
      console.log('\n❌ 原因：未知错误')
      console.log('\n建议：')
      console.log('1. 检查.env文件格式')
      console.log('2. 确认授权码正确')
      console.log('3. 查看完整错误信息（见下方）')
    }
    
    console.log('\n完整错误堆栈：')
    console.error(error)
  }
}

runDiagnostics()
