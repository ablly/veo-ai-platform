/**
 * 测试视频状态同步功能
 */

require('dotenv').config();

const CRON_SECRET = process.env.CRON_SECRET || 'your-secret-key';
const API_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';

async function testVideoSync() {
  console.log('🧪 测试视频状态同步功能\n');
  console.log(`API地址: ${API_URL}`);
  console.log(`Cron密钥: ${CRON_SECRET.substring(0, 10)}...\n`);
  
  try {
    console.log('📡 调用 Cron API...');
    
    const response = await fetch(`${API_URL}/api/cron/update-videos`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CRON_SECRET}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    console.log('\n✅ API 调用成功！\n');
    console.log('========== 同步结果 ==========');
    console.log(`消息: ${result.message}`);
    console.log(`总计: ${result.total} 个视频`);
    console.log(`✅ 已完成: ${result.updated}`);
    console.log(`❌ 失败: ${result.failed}`);
    console.log(`⏳ 处理中: ${result.processing}`);
    
    if (result.videos && result.videos.length > 0) {
      console.log('\n========== 视频详情 ==========');
      result.videos.forEach((video, index) => {
        console.log(`\n${index + 1}. 视频 ${video.id}`);
        console.log(`   提示词: ${video.prompt}`);
        console.log(`   任务ID: ${video.taskId}`);
        console.log(`   模型: ${video.model}`);
        console.log(`   状态: ${video.status}`);
        if (video.videoUrl) {
          console.log(`   视频URL: ${video.videoUrl}`);
        }
        if (video.error) {
          console.log(`   错误: ${video.error}`);
        }
      });
    }
    
    console.log('\n========== 测试完成 ==========\n');
    
  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    console.error('\n请检查:');
    console.error('1. 开发服务器是否运行 (npm run dev)');
    console.error('2. CRON_SECRET 环境变量是否正确');
    console.error('3. 数据库连接是否正常');
  }
}

testVideoSync();
