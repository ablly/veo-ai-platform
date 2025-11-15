#!/usr/bin/env node

/**
 * 完整流程测试脚本
 * 测试从视频生成到URL更新的完整流程
 */

const SUCHUANG_API_KEY = '1SJzUaIeipJPoCxwCd3Z2wRc3P';
const SUCHUANG_API_URL = 'https://api.wuyinkeji.com';

// 颜色输出
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

function success(message) {
  log(`✅ ${message}`, 'green');
}

function error(message) {
  log(`❌ ${message}`, 'red');
}

function info(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function warning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

// 测试1: 检查速创API连接
async function testApiConnection() {
  log('\n=== 测试1: 速创API连接 ===', 'cyan');
  
  try {
    const testTaskId = '9412'; // 使用已知的任务ID
    const url = `${SUCHUANG_API_URL}/api/video/veoDetail?key=${SUCHUANG_API_KEY}&id=${testTaskId}`;
    
    info(`请求URL: ${url}`);
    
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
    
    if (result.code === 200) {
      success('速创API连接成功');
      info(`响应: ${JSON.stringify(result, null, 2)}`);
      
      if (result.data && result.data.content) {
        success(`视频URL: ${result.data.content}`);
        return { success: true, videoUrl: result.data.content };
      }
    } else {
      error(`API返回错误: ${result.msg}`);
      return { success: false, error: result.msg };
    }
  } catch (err) {
    error(`连接失败: ${err.message}`);
    return { success: false, error: err.message };
  }
}

// 测试2: 检查视频URL可访问性
async function testVideoUrl(url) {
  log('\n=== 测试2: 视频URL可访问性 ===', 'cyan');
  
  try {
    info(`测试URL: ${url}`);
    
    const response = await fetch(url, { method: 'HEAD' });
    
    if (response.ok) {
      success(`视频URL可访问 (状态码: ${response.status})`);
      info(`Content-Type: ${response.headers.get('content-type')}`);
      info(`Content-Length: ${response.headers.get('content-length')} bytes`);
      return { success: true };
    } else {
      error(`视频URL不可访问 (状态码: ${response.status})`);
      return { success: false, status: response.status };
    }
  } catch (err) {
    error(`无法访问视频URL: ${err.message}`);
    warning('可能是CORS问题或网络问题');
    return { success: false, error: err.message };
  }
}

// 测试3: 检查本地API端点
async function testLocalApi() {
  log('\n=== 测试3: 本地API端点 ===', 'cyan');
  
  try {
    const url = 'http://localhost:3000/api/videos/my-videos?limit=5';
    info(`请求URL: ${url}`);
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.success) {
      success(`成功获取 ${data.data.videos.length} 个视频`);
      
      const completedVideos = data.data.videos.filter(v => v.status === 'COMPLETED');
      info(`已完成视频: ${completedVideos.length} 个`);
      
      if (completedVideos.length > 0) {
        const firstVideo = completedVideos[0];
        success(`第一个视频: ${firstVideo.prompt}`);
        info(`视频URL: ${firstVideo.videoUrl || '无'}`);
        
        if (firstVideo.videoUrl) {
          return { success: true, videoUrl: firstVideo.videoUrl };
        }
      }
      
      return { success: true, hasVideos: completedVideos.length > 0 };
    } else {
      error(`API返回错误: ${data.error}`);
      return { success: false, error: data.error };
    }
  } catch (err) {
    error(`请求失败: ${err.message}`);
    warning('确保开发服务器正在运行 (npm run dev)');
    return { success: false, error: err.message };
  }
}

// 测试4: 检查定时任务端点
async function testCronEndpoint() {
  log('\n=== 测试4: 定时任务端点 ===', 'cyan');
  
  try {
    const url = 'http://localhost:3000/api/cron/update-videos';
    info(`请求URL: ${url}`);
    warning('注意: 这会触发实际的视频状态更新');
    
    const response = await fetch(url, {
      headers: {
        'Authorization': 'Bearer your-secret-key'
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      success('定时任务执行成功');
      info(`已完成: ${data.updated} 个`);
      info(`失败: ${data.failed} 个`);
      info(`处理中: ${data.processing} 个`);
      info(`总计: ${data.total} 个`);
      return { success: true, data };
    } else {
      error(`定时任务失败: ${data.error}`);
      return { success: false, error: data.error };
    }
  } catch (err) {
    error(`请求失败: ${err.message}`);
    return { success: false, error: err.message };
  }
}

// 主测试流程
async function runTests() {
  log('\n🎬 开始完整流程测试\n', 'cyan');
  log('='.repeat(60), 'cyan');
  
  const results = {
    apiConnection: false,
    videoAccessible: false,
    localApi: false,
    cronEndpoint: false
  };
  
  // 测试1: API连接
  const apiTest = await testApiConnection();
  results.apiConnection = apiTest.success;
  
  // 测试2: 视频URL（如果测试1成功）
  if (apiTest.success && apiTest.videoUrl) {
    const urlTest = await testVideoUrl(apiTest.videoUrl);
    results.videoAccessible = urlTest.success;
  }
  
  // 测试3: 本地API
  const localApiTest = await testLocalApi();
  results.localApi = localApiTest.success;
  
  // 测试4: 定时任务（可选）
  log('\n是否测试定时任务端点？(这会触发实际更新)', 'yellow');
  log('跳过此测试，如需测试请手动访问: http://localhost:3000/admin/update-videos\n', 'yellow');
  
  // 输出总结
  log('\n' + '='.repeat(60), 'cyan');
  log('\n📊 测试结果总结\n', 'cyan');
  
  const tests = [
    { name: '速创API连接', result: results.apiConnection },
    { name: '视频URL可访问', result: results.videoAccessible },
    { name: '本地API端点', result: results.localApi },
  ];
  
  tests.forEach(test => {
    if (test.result) {
      success(`${test.name}: 通过`);
    } else {
      error(`${test.name}: 失败`);
    }
  });
  
  const passedTests = tests.filter(t => t.result).length;
  const totalTests = tests.length;
  
  log('\n' + '='.repeat(60), 'cyan');
  log(`\n总计: ${passedTests}/${totalTests} 测试通过\n`, passedTests === totalTests ? 'green' : 'yellow');
  
  if (passedTests === totalTests) {
    success('🎉 所有测试通过！系统运行正常。');
  } else {
    warning('⚠️  部分测试失败，请检查上述错误信息。');
  }
  
  log('\n下一步:', 'cyan');
  log('1. 访问 http://localhost:3000/test-video-display.html 进行可视化测试');
  log('2. 访问 http://localhost:3000/admin/update-videos 手动更新视频');
  log('3. 访问 http://localhost:3000/my-videos 查看视频列表\n');
}

// 运行测试
runTests().catch(err => {
  error(`测试失败: ${err.message}`);
  process.exit(1);
});
