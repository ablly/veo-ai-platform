/**
 * 检查当前 PROCESSING 状态视频的实际状态
 */

require('dotenv').config()

const SUCHUANG_API_URL = process.env.SUCHUANG_API_URL || 'https://api.wuyinkeji.com'
const SUCHUANG_API_KEY = process.env.SUCHUANG_API_KEY

// 当前 PROCESSING 状态的视频
const processingVideos = [
  {
    id: '4d3c019f-d0ce-4649-846f-7cd595dc603a',
    taskId: '42761d58-f344-474e-9465-6ea417779fca',
    model: 'sora2',
    created: '2026-01-24 02:23:39'
  },
  {
    id: 'a9b36e1e-7c04-4fd7-8010-ebb1950e5f11',
    taskId: '091a01c4-df5f-4a1d-9fdb-3350f5d21a52',
    model: 'sora2',
    created: '2026-01-23 06:33:48'
  }
]

async function checkSora2Status(taskId) {
  try {
    const url = `${SUCHUANG_API_URL}/api/sora2/detail?key=${SUCHUANG_API_KEY}&id=${taskId}`
    console.log(`请求URL: ${url.replace(SUCHUANG_API_KEY, '***')}`)
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset:utf-8;',
        'Authorization': SUCHUANG_API_KEY
      }
    })

    const result = await response.json()
    return result
  } catch (error) {
    return { error: error.message }
  }
}

async function main() {
  console.log('='.repeat(60))
  console.log('检查 PROCESSING 状态视频')
  console.log('='.repeat(60))
  
  for (const video of processingVideos) {
    console.log(`\n📹 视频 ID: ${video.id}`)
    console.log(`   任务 ID: ${video.taskId}`)
    console.log(`   模型: ${video.model}`)
    console.log(`   创建时间: ${video.created}`)
    
    const result = await checkSora2Status(video.taskId)
    console.log(`   API 响应:`, JSON.stringify(result, null, 2))
    
    if (result.data) {
      const data = result.data
      console.log(`   状态码: ${data.status}`)
      console.log(`   状态说明: ${data.status === 0 ? '排队中' : data.status === 1 ? '成功' : data.status === 2 ? '失败' : data.status === 3 ? '生成中' : '未知'}`)
      if (data.remote_url) {
        console.log(`   视频URL: ${data.remote_url}`)
      }
      if (data.fail_reason) {
        console.log(`   失败原因: ${data.fail_reason}`)
      }
    }
    
    console.log('-'.repeat(60))
  }
}

main().catch(console.error)
