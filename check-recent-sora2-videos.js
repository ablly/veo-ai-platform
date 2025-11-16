require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkRecentVideos() {
  try {
    const result = await pool.query(
      `SELECT id, prompt, model, external_task_id, remix_pid, status, 
              LEFT(video_url, 50) as video_url_preview,
              created_at
       FROM video_generations
       WHERE model = 'sora2' AND status = 'COMPLETED'
       ORDER BY created_at DESC
       LIMIT 5`
    );
    
    console.log(`📹 最近的${result.rows.length}个SORA2视频:\n`);
    
    result.rows.forEach((video, index) => {
      console.log(`${index + 1}. ID: ${video.id}`);
      console.log(`   提示词: ${video.prompt.substring(0, 50)}...`);
      console.log(`   Task ID: ${video.external_task_id}`);
      console.log(`   PID: ${video.remix_pid || '(无)'}`);
      console.log(`   状态: ${video.status}`);
      console.log(`   创建时间: ${video.created_at}`);
      console.log('');
    });
    
    // 对于没有PID的视频，尝试从API获取
    const videosWithoutPid = result.rows.filter(v => !v.remix_pid && v.external_task_id);
    
    if (videosWithoutPid.length > 0) {
      console.log(`\n🔧 发现${videosWithoutPid.length}个视频没有PID，尝试从API获取...\n`);
      
      const API_URL = 'https://api.wuyinkeji.com';
      const API_KEY = '1SJzUaIeipJPoCxwCd3Z2wRc3P';
      
      for (const video of videosWithoutPid) {
        try {
          console.log(`查询视频: ${video.id.substring(0, 8)}...`);
          
          const response = await fetch(
            `${API_URL}/api/sora2/detail?key=${API_KEY}&id=${video.external_task_id}`
          );
          
          const apiResult = await response.json();
          
          if (apiResult.code === 200 && apiResult.data && apiResult.data.pid) {
            console.log(`  ✅ 找到PID: ${apiResult.data.pid}`);
            
            // 更新数据库
            await pool.query(
              'UPDATE video_generations SET remix_pid = $1 WHERE id = $2',
              [apiResult.data.pid, video.id]
            );
            console.log(`  ✅ 已更新到数据库\n`);
          } else {
            console.log(`  ❌ API未返回PID\n`);
          }
        } catch (err) {
          console.log(`  ❌ 查询失败: ${err.message}\n`);
        }
      }
    }
  } catch (error) {
    console.error('❌ 错误:', error.message);
  } finally {
    await pool.end();
  }
}

checkRecentVideos();
