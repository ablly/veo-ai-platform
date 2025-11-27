/**
 * 手动同步SORA2视频状态脚本
 * 用于修复SORA2视频状态不同步的问题
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
const SUCHUANG_API_URL = process.env.SUCHUANG_API_URL || 'https://api.wuyinkeji.com';
const SUCHUANG_API_KEY = process.env.SUCHUANG_API_KEY;

console.log('配置检查:');
console.log('  SUPABASE_URL:', SUPABASE_URL ? '✓' : '✗');
console.log('  SUPABASE_KEY:', SUPABASE_KEY ? '✓' : '✗');
console.log('  SUCHUANG_API_URL:', SUCHUANG_API_URL);
console.log('  SUCHUANG_API_KEY:', SUCHUANG_API_KEY ? '✓' : '✗');
console.log('');

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// 检查SORA2视频状态
async function checkSora2Status(taskId) {
  try {
    const url = `${SUCHUANG_API_URL}/api/sora2/detail?key=${SUCHUANG_API_KEY}&id=${taskId}`;
    console.log(`  查询API: ${url.replace(SUCHUANG_API_KEY, '***')}`);
    
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
    console.log(`  API响应: code=${result.code}, status=${result.data?.status}`);
    
    if ((result.code !== 200 && result.code !== 0) || !result.data) {
      throw new Error(result.msg || result.message || '查询失败');
    }

    const data = result.data;
    
    // SORA2状态码：0=排队中，1=成功，2=失败，3=生成中
    if (data.status === 1 && data.remote_url) {
      return {
        success: true,
        status: 'COMPLETED',
        videoUrl: data.remote_url,
        remixPid: data.pid || null
      };
    } else if (data.status === 2) {
      return {
        success: true,
        status: 'FAILED',
        error: data.fail_reason || '视频生成失败'
      };
    } else {
      return {
        success: true,
        status: 'PROCESSING'
      };
    }
  } catch (error) {
    console.error(`  查询失败: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

async function syncSora2Videos() {
  console.log('🔄 开始同步SORA2视频状态...\n');
  
  // 查询所有PROCESSING状态的SORA2视频
  const { data: videos, error } = await supabase
    .from('video_generations')
    .select('id, external_task_id, prompt, model, created_at')
    .eq('status', 'PROCESSING')
    .eq('model', 'sora2')
    .not('external_task_id', 'is', null)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('查询数据库失败:', error);
    return;
  }

  console.log(`找到 ${videos.length} 个待同步的SORA2视频\n`);

  let updated = 0;
  let failed = 0;
  let stillProcessing = 0;

  for (const video of videos) {
    console.log(`\n处理视频: ${video.id}`);
    console.log(`  任务ID: ${video.external_task_id}`);
    console.log(`  提示词: ${video.prompt.substring(0, 50)}...`);
    
    const status = await checkSora2Status(video.external_task_id);
    
    if (!status.success) {
      console.log(`  ❌ 查询失败: ${status.error}`);
      continue;
    }

    if (status.status === 'COMPLETED' && status.videoUrl) {
      // 更新为完成状态
      const { error: updateError } = await supabase
        .from('video_generations')
        .update({
          status: 'COMPLETED',
          video_url: status.videoUrl,
          remix_pid: status.remixPid,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', video.id);

      if (updateError) {
        console.log(`  ❌ 更新失败: ${updateError.message}`);
      } else {
        console.log(`  ✅ 已完成! 视频URL: ${status.videoUrl}`);
        updated++;
      }
    } else if (status.status === 'FAILED') {
      // 更新为失败状态
      const { error: updateError } = await supabase
        .from('video_generations')
        .update({
          status: 'FAILED',
          error_message: status.error || '生成失败',
          updated_at: new Date().toISOString()
        })
        .eq('id', video.id);

      if (updateError) {
        console.log(`  ❌ 更新失败: ${updateError.message}`);
      } else {
        console.log(`  ⚠️ 生成失败: ${status.error}`);
        failed++;
      }
    } else {
      console.log(`  ⏳ 仍在处理中...`);
      stillProcessing++;
    }

    // 避免请求过快
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n========== 同步完成 ==========');
  console.log(`✅ 已完成: ${updated}`);
  console.log(`❌ 失败: ${failed}`);
  console.log(`⏳ 处理中: ${stillProcessing}`);
  console.log(`📊 总计: ${videos.length}`);
}

syncSora2Videos().catch(console.error);
