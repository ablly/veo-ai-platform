require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkVideoPid() {
  try {
    const videoId = 'd877756-5772-4f81-b063-1306edd83786'; // 从截图中的ID
    
    const result = await pool.query(
      `SELECT id, prompt, model, external_task_id, remix_pid, status, video_url
       FROM video_generations
       WHERE id = $1`,
      [videoId]
    );
    
    if (result.rows.length > 0) {
      console.log('📹 视频信息:');
      console.log(JSON.stringify(result.rows[0], null, 2));
      
      const video = result.rows[0];
      
      // 如果有external_task_id但没有remix_pid，尝试查询API获取
      if (video.external_task_id && !video.remix_pid && video.model === 'sora2') {
        console.log('\n🔍 视频有task_id但没有PID，尝试从API获取...');
        console.log('Task ID:', video.external_task_id);
        
        const API_URL = 'https://api.wuyinkeji.com';
        const API_KEY = '1SJzUaIeipJPoCxwCd3Z2wRc3P';
        
        const response = await fetch(
          `${API_URL}/api/sora2/detail?key=${API_KEY}&id=${video.external_task_id}`
        );
        
        const apiResult = await response.json();
        console.log('\n📊 API响应:');
        console.log(JSON.stringify(apiResult, null, 2));
        
        if (apiResult.code === 200 && apiResult.data && apiResult.data.pid) {
          console.log('\n✅ 找到PID:', apiResult.data.pid);
          console.log('可以更新数据库...');
          
          // 更新数据库
          await pool.query(
            'UPDATE video_generations SET remix_pid = $1 WHERE id = $2',
            [apiResult.data.pid, videoId]
          );
          console.log('✅ 数据库已更新');
        }
      }
    } else {
      console.log('❌ 未找到视频');
    }
  } catch (error) {
    console.error('❌ 错误:', error.message);
  } finally {
    await pool.end();
  }
}

checkVideoPid();
