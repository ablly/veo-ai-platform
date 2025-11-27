/**
 * 从速创API获取正确的视频URL
 */

require('dotenv').config();

const SUCHUANG_API_URL = process.env.SUCHUANG_API_URL || 'https://api.wuyinkeji.com';
const SUCHUANG_API_KEY = process.env.SUCHUANG_API_KEY;
const TASK_ID = 'a25d28dc-be80-4dc9-9fb2-656d4d4c6bb3';

async function getCorrectVideoUrl() {
  console.log('🔍 从速创API查询正确的视频URL\n');
  console.log(`任务ID: ${TASK_ID}\n`);
  
  try {
    const url = `${SUCHUANG_API_URL}/api/sora2/detail?key=${SUCHUANG_API_KEY}&id=${TASK_ID}`;
    console.log(`API地址: ${url.replace(SUCHUANG_API_KEY, '***')}\n`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset:utf-8;',
        'Authorization': SUCHUANG_API_KEY
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const result = await response.json();
    
    console.log('========== API 响应 ==========');
    console.log(JSON.stringify(result, null, 2));
    console.log('==============================\n');
    
    if (result.code === 200 && result.data) {
      const data = result.data;
      
      console.log('视频信息:');
      console.log(`  状态: ${data.status} (0=排队中, 1=成功, 2=失败, 3=生成中)`);
      console.log(`  视频URL: ${data.remote_url || '无'}`);
      console.log(`  转存URL: ${data.transfer_url || '无'}`);
      console.log(`  PID: ${data.pid || '无'}`);
      console.log(`  失败原因: ${data.fail_reason || '无'}`);
      
      if (data.status === 1 && data.remote_url) {
        console.log('\n✅ 视频生成成功！');
        console.log(`\n正确的视频URL: ${data.remote_url}`);
        
        // 测试URL是否可访问
        console.log('\n测试URL访问...');
        const testResponse = await fetch(data.remote_url, { method: 'HEAD' });
        console.log(`状态码: ${testResponse.status}`);
        console.log(`Content-Type: ${testResponse.headers.get('content-type')}`);
        
        if (testResponse.ok) {
          console.log('✅ URL可以正常访问！');
        } else {
          console.log('❌ URL无法访问');
        }
      } else if (data.status === 2) {
        console.log('\n❌ 视频生成失败');
      } else {
        console.log('\n⏳ 视频仍在生成中');
      }
    } else {
      console.log('❌ API返回错误:', result.msg || result.message);
    }
    
  } catch (error) {
    console.error('❌ 查询失败:', error.message);
  }
}

getCorrectVideoUrl();
