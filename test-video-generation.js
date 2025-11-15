/**
 * 视频生成功能测试脚本
 * 用于验证速创API集成是否正常工作
 */

const SUCHUANG_API_URL = process.env.SUCHUANG_API_URL || 'https://api.wuyinkeji.com'
const SUCHUANG_API_KEY = process.env.SUCHUANG_API_KEY

if (!SUCHUANG_API_KEY) {
  console.error('❌ 错误：未设置 SUCHUANG_API_KEY 环境变量')
  process.exit(1)
}

console.log('🚀 开始测试速创API集成...\n')

// 测试1：提交视频生成请求
async function testVideoGeneration() {
  console.log('📝 测试1：提交视频生成请求')
  console.log('----------------------------------------')
  
  try {
    const payload = {
      model: 'veo3',
      prompt: '一只可爱的小猫在草地上玩耍',
      type: 'text2video',
      ratio: '16:9'
    }
    
    console.log('请求参数:', JSON.stringify(payload, null, 2))
    
    const response = await fetch(`${SUCHUANG_API_URL}/api/video/veoPlus`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset:utf-8;',
        'Authorization': SUCHUANG_API_KEY
      },
      body: JSON.stringify(payload)
    })
    
    const result = await response.json()
    
    console.log('响应状态:', response.status)
    console.log('响应数据:', JSON.stringify(result, null, 2))
    
    if (result.code === 200 && result.data && result.data.id) {
      console.log('✅ 测试1通过：成功提交视频生成请求')
      console.log(`   任务ID: ${result.data.id}\n`)
      return result.data.id
    } else {
      console.log('❌ 测试1失败：API返回异常')
      console.log(`   错误信息: ${result.msg || '未知错误'}\n`)
      return null
    }
  } catch (error) {
    console.log('❌ 测试1失败：请求异常')
    console.log(`   错误: ${error.message}\n`)
    return null
  }
}

// 测试2：查询视频生成状态
async function testVideoStatus(taskId) {
  console.log('📝 测试2：查询视频生成状态')
  console.log('----------------------------------------')
  
  if (!taskId) {
    console.log('⚠️  跳过测试2：没有有效的任务ID\n')
    return
  }
  
  try {
    const url = `${SUCHUANG_API_URL}/api/video/veoDetail?key=${SUCHUANG_API_KEY}&id=${taskId}`
    console.log('请求URL:', url)
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json;charset:utf-8;',
        'Authorization': SUCHUANG_API_KEY
      }
    })
    
    const result = await response.json()
    
    console.log('响应状态:', response.status)
    console.log('响应数据:', JSON.stringify(result, null, 2))
    
    if (result.code === 200 && result.data) {
      console.log('✅ 测试2通过：成功查询视频状态')
      
      const statusMap = {
        0: '排队中',
        1: '成功',
        2: '失败',
        3: '生成中'
      }
      
      console.log(`   状态: ${statusMap[result.data.status] || '未知'} (${result.data.status})`)
      
      if (result.data.status === 1 && result.data.content) {
        console.log(`   视频URL: ${result.data.content}`)
      } else if (result.data.status === 2) {
        console.log(`   失败原因: ${result.data.fail_reason || '未知'}`)
      }
      console.log()
    } else {
      console.log('❌ 测试2失败：API返回异常')
      console.log(`   错误信息: ${result.msg || '未知错误'}\n`)
    }
  } catch (error) {
    console.log('❌ 测试2失败：请求异常')
    console.log(`   错误: ${error.message}\n`)
  }
}

// 测试3：测试图片生成视频（可选）
async function testImageToVideo() {
  console.log('📝 测试3：测试图片生成视频（可选）')
  console.log('----------------------------------------')
  console.log('⚠️  此测试需要提供有效的图片URL，已跳过')
  console.log('   如需测试，请修改脚本中的图片URL\n')
  
  // 取消注释以下代码并提供有效的图片URL进行测试
  /*
  try {
    const payload = {
      model: 'veo3',
      prompt: '图片中的场景动起来',
      type: 'img2video',
      img_url: ['https://example.com/your-image.jpg'],
      ratio: '16:9'
    }
    
    const response = await fetch(`${SUCHUANG_API_URL}/api/video/veoPlus`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset:utf-8;',
        'Authorization': SUCHUANG_API_KEY
      },
      body: JSON.stringify(payload)
    })
    
    const result = await response.json()
    console.log('响应:', JSON.stringify(result, null, 2))
  } catch (error) {
    console.log('错误:', error.message)
  }
  */
}

// 运行所有测试
async function runAllTests() {
  console.log('='.repeat(50))
  console.log('速创API集成测试')
  console.log('='.repeat(50))
  console.log()
  
  // 测试1：提交视频生成请求
  const taskId = await testVideoGeneration()
  
  // 等待2秒
  if (taskId) {
    console.log('⏳ 等待2秒后查询状态...\n')
    await new Promise(resolve => setTimeout(resolve, 2000))
  }
  
  // 测试2：查询视频生成状态
  await testVideoStatus(taskId)
  
  // 测试3：图片生成视频（可选）
  await testImageToVideo()
  
  console.log('='.repeat(50))
  console.log('测试完成')
  console.log('='.repeat(50))
  console.log()
  console.log('💡 提示：')
  console.log('   - 如果测试1失败，请检查API密钥是否正确')
  console.log('   - 如果测试2失败，请检查查询接口是否正确')
  console.log('   - 视频生成通常需要几分钟时间，请耐心等待')
  console.log('   - 可以使用返回的任务ID多次查询状态')
}

// 执行测试
runAllTests().catch(error => {
  console.error('测试执行失败:', error)
  process.exit(1)
})
