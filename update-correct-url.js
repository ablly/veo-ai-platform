/**
 * 更新数据库中的正确视频URL
 */

require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const CORRECT_URL = 'https://openpt1.oss-cn-shanghai.aliyuncs.com/2ee8e1c84bd3471d89dfba1103a0ee77.mp4';
const TASK_ID = 'a25d28dc-be80-4dc9-9fb2-656d4d4c6bb3';
const PID = 's_6926daca157481918c162a93e0fd924c';

async function updateCorrectUrl() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 更新数据库中的视频URL\n');
    
    // 查询当前记录
    const current = await client.query(`
      SELECT id, video_url, status
      FROM video_generations
      WHERE external_task_id = $1
    `, [TASK_ID]);
    
    if (current.rows.length === 0) {
      console.log('❌ 未找到视频记录');
      return;
    }
    
    console.log('当前记录:');
    console.log(`  ID: ${current.rows[0].id}`);
    console.log(`  状态: ${current.rows[0].status}`);
    console.log(`  旧URL: ${current.rows[0].video_url}`);
    console.log(`\n正确URL: ${CORRECT_URL}`);
    console.log(`PID: ${PID}\n`);
    
    // 更新URL和PID
    await client.query(`
      UPDATE video_generations
      SET video_url = $1,
          remix_pid = $2,
          status = 'COMPLETED',
          completed_at = NOW(),
          updated_at = NOW()
      WHERE external_task_id = $3
    `, [CORRECT_URL, PID, TASK_ID]);
    
    console.log('✅ 更新成功！\n');
    
    // 验证更新
    const updated = await client.query(`
      SELECT video_url, remix_pid, status
      FROM video_generations
      WHERE external_task_id = $1
    `, [TASK_ID]);
    
    console.log('更新后的记录:');
    console.log(`  状态: ${updated.rows[0].status}`);
    console.log(`  URL: ${updated.rows[0].video_url}`);
    console.log(`  PID: ${updated.rows[0].remix_pid}`);
    
  } catch (error) {
    console.error('❌ 更新失败:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

updateCorrectUrl();
