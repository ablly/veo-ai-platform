/**
 * 直接测试SORA2 API响应格式
 */

const API_URL = 'https://api.wuyinkeji.com/api/sora2/submit';
const API_KEY = '1SJzUaIeipJPoCxwCd3Z2wRc3P';

async function testSora2API() {
  console.log('🔍 测试SORA2 API...\n');
  
  const formData = new URLSearchParams({
    prompt: '测试：一只可爱的小猫在玩耍',
    aspectRatio: '9:16',
    duration: '10'
  });

  try {
    console.log('📤 发送请求到:', `${API_URL}?key=${API_KEY}`);
    console.log('📝 请求参数:', formData.toString());
    
    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;',
        'Authorization': API_KEY
      },
      body: formData
    });

    console.log('\n📊 HTTP状态码:', response.status);
    console.log('📋 响应头:', Object.fromEntries(response.headers.entries()));
    
    const result = await response.json();
    
    console.log('\n✅ 完整响应体:');
    console.log(JSON.stringify(result, null, 2));
    
    console.log('\n🔍 关键字段分析:');
    console.log('- code:', result.code, '(类型:', typeof result.code + ')');
    console.log('- message:', result.message);
    console.log('- msg:', result.msg);
    console.log('- data:', result.data);
    console.log('- data.id:', result.data?.id);
    
    console.log('\n💡 判断逻辑:');
    console.log('- code === 0:', result.code === 0);
    console.log('- code === 200:', result.code === 200);
    console.log('- code === "0":', result.code === "0");
    console.log('- code === "200":', result.code === "200");
    
  } catch (error) {
    console.error('\n❌ 错误:', error.message);
    console.error('详细:', error);
  }
}

testSora2API();
