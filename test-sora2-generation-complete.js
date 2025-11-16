/**
 * 完整测试SORA2视频生成流程
 * 包括：提交任务 -> 获取taskId -> 查询状态 -> 保存到数据库
 */

require('dotenv').config();
const { Pool } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL;
const API_URL = 'https://api.wuyinkeji.com';
const API_KEY = '1SJzUaIeipJPoCxwCd3Z2wRc3P';

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function testSora2Generation() {
  console.log('🚀 开始测试SORA2完整生成流程\n');
  
  try {
    // 步骤1：提交生成任务
    console.log('📤 步骤1：提交SORA2生成任务...');
    const formData = new URLSearchParams({
      prompt: '测试修复：一只可爱的小猫在阳光下玩耍',
      aspectRatio: '9:16',
      duration: '10'
    });

    const submitResponse = await fetch(`${API_URL}/api/sora2/submit?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;',
        'Authorization': API_KEY
      },
      body: formData
    });

    const submitResult = await submitResponse.json();
    console.log('✅ 提交响应:', JSON.stringify(submitResult, null, 2));
    
    // 验证响应格式
    if (submitResult.code === 200 && submitResult.data?.id) {
      console.log('✅ 响应格式正确: code=200, 包含data.id');
      console.log('📝 任务ID:', submitResult.data.id);
    } else if (submitResult.code === 0 && submitResult.data?.id) {
      console.log('✅ 响应格式正确: code=0, 包含data.id');
      console.log('📝 任务ID:', submitResult.data.id);
    } else {
      console.error('❌ 响应格式异常:', submitResult);
      return;
    }
    
    const taskId = submitResult.data.id;
    
    // 步骤2：保存到数据库
    console.log('\n💾 步骤2：保存任务到Supabase数据库...');
    const insertResult = await pool.query(
      `INSERT INTO video_generations (user_id, prompt, model, external_task_id, status, duration)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, external_task_id, status`,
      [
        '96336063-052c-4d93-af03-c1fdead86097', // 测试用户ID (周启航)
        '测试修复：一只可爱的小猫在阳光下玩耍',
        'sora2',
        taskId,
        'PROCESSING',
        10
      ]
    );
    
    const videoData = insertResult.rows[0];
    console.log('✅ 数据库记录创建成功, ID:', videoData.id);
    console.log('📝 External Task ID:', videoData.external_task_id);
    
    // 步骤3：查询任务状态
    console.log('\n🔍 步骤3：查询任务状态...');
    const statusResponse = await fetch(
      `${API_URL}/api/sora2/detail?key=${API_KEY}&id=${taskId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;',
          'Authorization': API_KEY
        }
      }
    );
    
    const statusResult = await statusResponse.json();
    console.log('📊 状态响应:', JSON.stringify(statusResult, null, 2));
    
    if (statusResult.code === 200 && statusResult.data) {
      console.log('✅ 状态查询成功');
      console.log('📝 当前状态:', statusResult.data.status === 0 ? '处理中' : 
                                   statusResult.data.status === 1 ? '已完成' : 
                                   statusResult.data.status === 2 ? '失败' : '未知');
    }
    
    console.log('\n✅ 测试完成！SORA2 API集成正常工作');
    console.log('📝 任务ID:', taskId);
    console.log('📝 数据库记录ID:', videoData.id);
    console.log('\n💡 提示：视频生成需要时间，请稍后在"我的视频"页面查看结果');
    
  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    console.error('详细错误:', error);
  } finally {
    await pool.end();
  }
}

testSora2Generation();
