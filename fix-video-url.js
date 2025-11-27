/**
 * 修复特定用户的视频URL
 */

require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function fixVideoUrl() {
  const client = await pool.connect();
  
  try {
    // 查询该用户的视频
    const result = await client.query(`
      SELECT vg.id, vg.external_task_id, vg.video_url, vg.status, u.email
      FROM video_generations vg
      JOIN users u ON vg.user_id = u.id
      WHERE u.email = '2175083414@qq.com'
      AND vg.external_task_id = 'a25d28dc-be80-4dc9-9fb2-656d4d4c6bb3'
    `);
    
    if (result.rows.length === 0) {
      console.log('❌ 未找到该视频记录');
      return;
    }
    
    const video = result.rows[0];
    console.log('\n当前视频信息:');
    console.log('  ID:', video.id);
    console.log('  任务ID:', video.external_task_id);
    console.log('  状态:', video.status);
    console.log('  当前URL:', video.video_url);
    console.log('  用户:', video.email);
    
    // 正确的URL
    const correctUrl = 'https://openpt1.oss-cn-shanghai.aliyuncs.com/2ee8e1c84bd3471d805fba1103a0ee77.mp4';
    
    console.log('\n正确的URL:', correctUrl);
    
    // 更新视频URL
    await client.query(`
      UPDATE video_generations
      SET video_url = $1,
          status = 'COMPLETED',
          completed_at = NOW(),
          updated_at = NOW()
      WHERE id = $2
    `, [correctUrl, video.id]);
    
    console.log('\n✅ 视频URL已更新！');
    
    // 验证更新
    const verifyResult = await client.query(`
      SELECT video_url, status
      FROM video_generations
      WHERE id = $1
    `, [video.id]);
    
    console.log('\n更新后的信息:');
    console.log('  状态:', verifyResult.rows[0].status);
    console.log('  URL:', verifyResult.rows[0].video_url);
    
  } catch (error) {
    console.error('❌ 错误:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

fixVideoUrl();
