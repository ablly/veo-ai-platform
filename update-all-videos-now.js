#!/usr/bin/env node

/**
 * 立即更新所有PROCESSING状态的视频
 * 从速创API获取最新状态并更新数据库
 */

const SUCHUANG_API_KEY = '1SJzUaIeipJPoCxwCd3Z2wRc3P';
const SUCHUANG_API_URL = 'https://api.wuyinkeji.com';

// Supabase配置
const SUPABASE_URL = 'https://hblthmkkdfkzvpywlthq.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhibHRobWtrZGZrenZweXdsdGhxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDc1NTY3NywiZXhwIjoyMDUwMzMxNjc3fQ.m8EgJXs1ZAF46iG4Wx1oo8yIbqnfRqQwROoN0trZGrQ';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// 查询速创API状态
async function checkVideoStatus(taskId) {
  try {
    const url = `${SUCHUANG_API_URL}/api/video/veoDetail?key=${SUCHUANG_API_KEY}&id=${taskId}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json;charset:utf-8;',
        'Authorization': SUCHUANG_API_KEY
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json();
    
    if (result.code === 200 && result.data) {
      return {
        success: true,
        status: result.data.status,
        videoUrl: result.data.content,
        failReason: result.data.fail_reason
      };
    }
    
    return { success: false, error: result.msg };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// 更新数据库
async function updateDatabase(videoId, status, videoUrl, error) {
  try {
    const url = `${SUPABASE_URL}/rest/v1/video_generations?id=eq.${videoId}`;
    
    const updateData = {
      status: status,
      updated_at: new Date().toISOString()
    };
    
    if (status === 'COMPLETED' && videoUrl) {
      updateData.video_url = videoUrl;
      updateData.completed_at = new Date().toISOString();
    }
    
    if (status === 'FAILED' && error) {
      updateData.error_message = error;
    }
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(updateData)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// 获取所有PROCESSING状态的视频
async function getProcessingVideos() {
  try {
    const url = `${SUPABASE_URL}/rest/v1/video_generations?status=eq.PROCESSING&external_task_id=not.is.null&select=id,prompt,external_task_id,created_at&order=created_at.desc`;
    
    const response = await fetch(url, {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    log(`❌ 获取视频列表失败: ${error.message}`, 'red');
    return [];
  }
}

// 主函数
async function main() {
  log('\n🎬 开始更新所有视频状态\n', 'cyan');
  log('='.repeat(60), 'cyan');
  
  // 获取所有PROCESSING状态的视频
  const videos = await getProcessingVideos();
  
  if (videos.length === 0) {
    log('\n✅ 没有需要更新的视频', 'green');
    return;
  }
  
  log(`\n找到 ${videos.length} 个待更新的视频\n`, 'blue');
  
  let updated = 0;
  let failed = 0;
  let processing = 0;
  
  for (const video of videos) {
    log(`\n处理视频: ${video.prompt}`, 'cyan');
    log(`任务ID: ${video.external_task_id}`, 'blue');
    
    // 查询速创API
    const status = await checkVideoStatus(video.external_task_id);
    
    if (!status.success) {
      log(`❌ 查询失败: ${status.error}`, 'red');
      continue;
    }
    
    // 根据状态更新数据库
    if (status.status === 1 && status.videoUrl) {
      // 成功
      log(`✅ 视频生成成功`, 'green');
      log(`视频URL: ${status.videoUrl}`, 'green');
      
      const result = await updateDatabase(video.id, 'COMPLETED', status.videoUrl, null);
      if (result.success) {
        log(`✅ 数据库更新成功`, 'green');
        updated++;
      } else {
        log(`❌ 数据库更新失败: ${result.error}`, 'red');
      }
    } else if (status.status === 2) {
      // 失败
      log(`❌ 视频生成失败: ${status.failReason}`, 'red');
      
      const result = await updateDatabase(video.id, 'FAILED', null, status.failReason);
      if (result.success) {
        log(`✅ 数据库更新成功`, 'green');
        failed++;
      }
    } else {
      // 还在处理中
      log(`⏳ 视频还在生成中...`, 'yellow');
      processing++;
    }
    
    // 避免请求过快
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // 输出总结
  log('\n' + '='.repeat(60), 'cyan');
  log('\n📊 更新结果总结\n', 'cyan');
  log(`✅ 已完成: ${updated} 个`, 'green');
  log(`❌ 失败: ${failed} 个`, 'red');
  log(`⏳ 处理中: ${processing} 个`, 'yellow');
  log(`📝 总计: ${videos.length} 个\n`, 'blue');
  
  if (updated > 0) {
    log('🎉 视频URL已更新！用户现在可以看到视频了。', 'green');
  }
}

// 运行
main().catch(err => {
  log(`\n❌ 执行失败: ${err.message}`, 'red');
  process.exit(1);
});
