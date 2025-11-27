/**
 * 批量修复所有视频URL中的域名错误
 * opengpt1 -> openpt1
 */

require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function fixAllVideoUrls() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 查找所有包含错误域名的视频...\n');
    
    // 查找所有包含 opengpt1 的视频URL
    const result = await client.query(`
      SELECT id, video_url, external_task_id
      FROM video_generations
      WHERE video_url LIKE '%opengpt1.oss-cn-shanghai.aliyuncs.com%'
      AND status = 'COMPLETED'
    `);
    
    console.log(`找到 ${result.rows.length} 个需要修复的视频\n`);
    
    if (result.rows.length === 0) {
      console.log('✅ 没有需要修复的视频');
      return;
    }
    
    let fixed = 0;
    
    for (const video of result.rows) {
      const oldUrl = video.video_url;
      const newUrl = oldUrl.replace('opengpt1.oss-cn-shanghai.aliyuncs.com', 'openpt1.oss-cn-shanghai.aliyuncs.com');
      
      console.log(`修复视频 ${video.id}:`);
      console.log(`  旧URL: ${oldUrl}`);
      console.log(`  新URL: ${newUrl}`);
      
      await client.query(`
        UPDATE video_generations
        SET video_url = $1,
            updated_at = NOW()
        WHERE id = $2
      `, [newUrl, video.id]);
      
      fixed++;
      console.log(`  ✅ 已修复\n`);
    }
    
    console.log(`\n========== 修复完成 ==========`);
    console.log(`✅ 共修复 ${fixed} 个视频URL`);
    
  } catch (error) {
    console.error('❌ 错误:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

fixAllVideoUrls();
