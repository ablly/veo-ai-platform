/**
 * 测试SORA2状态查询修复
 */

const API_URL = 'https://api.wuyinkeji.com';
const API_KEY = '1SJzUaIeipJPoCxwCd3Z2wRc3P';
const TASK_ID = '74ef45dc-634b-4504-9a60-cae3b143ff00'; // 你的测试任务ID

async function testSora2StatusQuery() {
  console.log('🔍 测试SORA2状态查询...\n');
  
  try {
    console.log('📤 查询任务:', TASK_ID);
    console.log('🔗 API端点:', `${API_URL}/api/sora2/detail`);
    
    const response = await fetch(
      `${API_URL}/api/sora2/detail?key=${API_KEY}&id=${TASK_ID}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;',
          'Authorization': API_KEY
        }
      }
    );

    console.log('\n📊 HTTP状态码:', response.status);
    
    const result = await response.json();
    
    console.log('\n✅ 完整响应:');
    console.log(JSON.stringify(result, null, 2));
    
    if (result.code === 200 && result.data) {
      console.log('\n🎯 关键信息:');
      console.log('- 状态:', result.data.status === 0 ? '处理中' : 
                              result.data.status === 1 ? '已完成' : 
                              result.data.status === 2 ? '失败' : '未知');
      console.log('- 视频URL:', result.data.remote_url || '(生成中)');
      console.log('- PID:', result.data.pid || '(无)');
      console.log('- 失败原因:', result.data.fail_reason || '(无)');
      
      if (result.data.status === 1 && result.data.remote_url) {
        console.log('\n✅ 视频生成成功！');
        console.log('📹 视频地址:', result.data.remote_url);
      } else if (result.data.status === 2) {
        console.log('\n❌ 视频生成失败');
        console.log('原因:', result.data.fail_reason);
      } else {
        console.log('\n⏳ 视频正在生成中...');
      }
    }
    
  } catch (error) {
    console.error('\n❌ 错误:', error.message);
    console.error('详细:', error);
  }
}

testSora2StatusQuery();
