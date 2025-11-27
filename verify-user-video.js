/**
 * 验证用户视频是否可以正常播放
 */

require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const USER_EMAIL = '2175083414@qq.com';

async function verifyUserVideo() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 验证用户视频\n');
    console.log(`用户: ${USER_EMAIL}\n`);
    
    // 查询用户的所有视频
    const result = await client.query(`
      SELECT 
        vg.id,
        vg.external_task_id,
        vg.model,
        vg.status,
        vg.video_url,
        vg.remix_pid,
        vg.prompt,
        vg.created_at,
        vg.completed_at
      FROM video_generations vg
      JOIN users u ON vg.user_id = u.id
      WHERE u.email = $1
      ORDER BY vg.created_at DESC
      LIMIT 5
    `, [USER_EMAIL]);
    
    console.log(`找到 ${result.rows.length} 个视频\n`);
    
    for (const [index, video] of result.rows.entries()) {
      console.log(`========== 视频 ${index + 1} ==========`);
      console.log(`ID: ${video.id}`);
      console.log(`任务ID: ${video.external_task_id}`);
      console.log(`模型: ${video.model}`);
      console.log(`状态: ${video.status}`);
      console.log(`提示词: ${video.prompt.substring(0, 50)}...`);
      console.log(`创建时间: ${video.created_at}`);
      console.log(`完成时间: ${video.completed_at || '未完成'}`);
      console.log(`PID: ${video.remix_pid || '无'}`);
      
      if (video.video_url) {
        console.log(`视频URL: ${video.video_url}`);
        
        // 测试URL是否可访问
        try {
          const response = await fetch(video.video_url, { method: 'HEAD' });
          const contentType = response.headers.get('content-type');
          
          if (response.ok && contentType && contentType.includes('video')) {
            console.log(`✅ 视频可以正常访问 (${response.status})`);
          } else if (response.ok) {
            console.log(`⚠️ URL可访问但不是视频格式: ${contentType}`);
          } else {
            console.log(`❌ 视频无法访问 (${response.status})`);
          }
        } catch (error) {
          console.log(`❌ 测试失败: ${error.message}`);
        }
      } else {
        console.log(`⚠️ 没有视频URL`);
      }
      
      console.log('');
    }
    
    console.log('========== 验证完成 ==========\n');
    
  } catch (error) {
    console.error('❌ 验证失败:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

verifyUserVideo();
