// 手机号登录功能测试脚本
// 使用方法: node test-phone-login.js

const testPhoneLogin = async () => {
  const baseUrl = 'http://localhost:3000';
  
  console.log('🧪 开始测试手机号登录功能...\n');
  
  try {
    // 测试1: 发送手机验证码
    console.log('📱 测试1: 发送手机验证码');
    const phoneCodeResponse = await fetch(`${baseUrl}/api/auth/send-phone-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '13800138000' })
    });
    
    const phoneCodeResult = await phoneCodeResponse.json();
    console.log('   状态:', phoneCodeResponse.status);
    console.log('   响应:', phoneCodeResult);
    
    if (phoneCodeResult.devCode) {
      console.log('   🔑 开发环境验证码:', phoneCodeResult.devCode);
    }
    
    // 测试2: 发送邮箱验证码
    console.log('\n📧 测试2: 发送邮箱验证码');
    const emailCodeResponse = await fetch(`${baseUrl}/api/auth/send-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com' })
    });
    
    const emailCodeResult = await emailCodeResponse.json();
    console.log('   状态:', emailCodeResponse.status);
    console.log('   响应:', emailCodeResult);
    
    if (emailCodeResult.devCode) {
      console.log('   🔑 开发环境验证码:', emailCodeResult.devCode);
    }
    
    console.log('\n✅ 测试完成！');
    console.log('\n📋 测试结果总结:');
    console.log('   - 手机验证码API:', phoneCodeResponse.ok ? '✅ 正常' : '❌ 异常');
    console.log('   - 邮箱验证码API:', emailCodeResponse.ok ? '✅ 正常' : '❌ 异常');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
};

// 运行测试
testPhoneLogin();












