/**
 * 测试视频生成功能
 * 测试 SORA 2.0 和 VEO 3.1 两个模型的 API 调用
 */

const BASE_URL = 'http://localhost:3000'

// 测试配置
const TEST_CONFIG = {
  // 测试用户的 session cookie（需要先登录获取）
  sessionCookie: '', // 需要从浏览器复制
  
  // 测试提示词
  testPrompts: {
    sora2: '一只可爱的小猫在草地上玩耍，阳光明媚，卡通风格',
    veo3: '城市夜景，霓虹灯闪烁，车流穿梭'
  }
}

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

// 测试 SORA 2.0 模型
async function testSora2() {
  log('\n=== 测试 SORA 2.0 模型 ===', 'cyan')
  
  try {
    log('1. 发送生成请求...', 'blue')
    const response = await fetch(`${BASE_URL}/api/generate/video`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': TEST_CONFIG.sessionCookie
      },
      body: JSON.stringify({
        prompt: TEST_CONFIG.testPrompts.sora2,
        model: 'sora2',
        duration: 10,
        aspectRatio: '9:16',
        images: []
      })
    })

    const data = await response.json()
    
    if (!response.ok) {
      log(`❌ 请求失败: ${data.error?.message || data.message}`, 'red')
      return null
    }

    log(`✅ 请求成功`, 'green')
    log(`   任务ID: ${data.taskId}`, 'blue')
    log(`   视频ID: ${data.videoId}`, 'blue')
    log(`   模型: ${data.model}`, 'blue')
    log(`   消耗积分: ${data.creditsUsed}`, 'blue')
    
    return {
      taskId: data.taskId,
      videoId: data.videoId,
      model: data.model
    }
    
  } catch (error) {
    log(`❌ 测试失败: ${error.message}`, 'red')
    return null
  }
}

// 测试 VEO 3.1 模型
async function testVeo3() {
  log('\n=== 测试 VEO 3.1 模型 ===', 'cyan')
  
  try {
    log('1. 发送生成请求...', 'blue')
    const response = await fetch(`${BASE_URL}/api/generate/video`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': TEST_CONFIG.sessionCookie
      },
      body: JSON.stringify({
        prompt: TEST_CONFIG.testPrompts.veo3,
        model: 'veo3',
        aspectRatio: '16:9',
        images: []
      })
    })

    const data = await response.json()
    
    if (!response.ok) {
      log(`❌ 请求失败: ${data.error?.message || data.message}`, 'red')
      return null
    }

    log(`✅ 请求成功`, 'green')
    log(`   任务ID: ${data.taskId}`, 'blue')
    log(`   视频ID: ${data.videoId}`, 'blue')
    log(`   模型: ${data.model}`, 'blue')
    log(`   消耗积分: ${data.creditsUsed}`, 'blue')
    
    return {
      taskId: data.taskId,
      videoId: data.videoId,
      model: data.model
    }
    
  } catch (error) {
    log(`❌ 测试失败: ${error.message}`, 'red')
    return null
  }
}

// 查询视频状态
async function checkVideoStatus(taskId, model) {
  log(`\n2. 查询视频状态 (任务ID: ${taskId})...`, 'blue')
  
  let attempts = 0
  const maxAttempts = 40 // 最多等待2分钟
  
  while (attempts < maxAttempts) {
    try {
      const response = await fetch(`${BASE_URL}/api/generate/video?taskId=${taskId}`, {
        headers: {
          'Cookie': TEST_CONFIG.sessionCookie
        }
      })

      const data = await response.json()
      
      if (data.status === 'COMPLETED') {
        log(`✅ 视频生成完成！`, 'green')
        log(`   视频URL: ${data.videoUrl}`, 'blue')
        return data.videoUrl
      } else if (data.status === 'FAILED') {
        log(`❌ 视频生成失败: ${data.error}`, 'red')
        return null
      } else {
        process.stdout.write(`   等待中... (${attempts + 1}/${maxAttempts})\r`)
        await new Promise(resolve => setTimeout(resolve, 3000))
        attempts++
      }
    } catch (error) {
      log(`❌ 查询失败: ${error.message}`, 'red')
      return null
    }
  }
  
  log(`\n⚠️  超时：视频生成时间超过2分钟`, 'yellow')
  return null
}

// 主测试函数
async function runTests() {
  log('\n' + '='.repeat(60), 'cyan')
  log('视频生成功能测试', 'cyan')
  log('='.repeat(60), 'cyan')
  
  // 检查配置
  if (!TEST_CONFIG.sessionCookie) {
    log('\n⚠️  警告: 未设置 sessionCookie', 'yellow')
    log('请先登录网站，然后从浏览器开发者工具中复制 Cookie', 'yellow')
    log('在脚本中设置 TEST_CONFIG.sessionCookie', 'yellow')
    log('\n提示: 你也可以跳过这个测试，直接在浏览器中手动测试', 'blue')
    return
  }
  
  const results = {
    sora2: null,
    veo3: null
  }
  
  // 测试 SORA 2.0
  const sora2Result = await testSora2()
  if (sora2Result) {
    const videoUrl = await checkVideoStatus(sora2Result.taskId, sora2Result.model)
    results.sora2 = { success: !!videoUrl, videoUrl }
  }
  
  // 等待一下再测试下一个
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // 测试 VEO 3.1
  const veo3Result = await testVeo3()
  if (veo3Result) {
    const videoUrl = await checkVideoStatus(veo3Result.taskId, veo3Result.model)
    results.veo3 = { success: !!videoUrl, videoUrl }
  }
  
  // 输出测试结果
  log('\n' + '='.repeat(60), 'cyan')
  log('测试结果汇总', 'cyan')
  log('='.repeat(60), 'cyan')
  
  log('\nSORA 2.0:', 'blue')
  if (results.sora2?.success) {
    log('  ✅ 测试通过', 'green')
    log(`  视频URL: ${results.sora2.videoUrl}`, 'blue')
  } else {
    log('  ❌ 测试失败', 'red')
  }
  
  log('\nVEO 3.1:', 'blue')
  if (results.veo3?.success) {
    log('  ✅ 测试通过', 'green')
    log(`  视频URL: ${results.veo3.videoUrl}`, 'blue')
  } else {
    log('  ❌ 测试失败', 'red')
  }
  
  log('\n' + '='.repeat(60), 'cyan')
  
  const totalTests = 2
  const passedTests = (results.sora2?.success ? 1 : 0) + (results.veo3?.success ? 1 : 0)
  
  if (passedTests === totalTests) {
    log(`\n🎉 所有测试通过！(${passedTests}/${totalTests})`, 'green')
  } else {
    log(`\n⚠️  部分测试失败 (${passedTests}/${totalTests})`, 'yellow')
  }
}

// 运行测试
runTests().catch(error => {
  log(`\n❌ 测试过程出错: ${error.message}`, 'red')
  console.error(error)
})
