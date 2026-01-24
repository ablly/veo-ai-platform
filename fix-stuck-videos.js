/**
 * 修复卡住的视频 - 手动运行脚本
 * 
 * 功能：
 * 1. 查询所有 PROCESSING 状态的视频
 * 2. 对有 external_task_id 的视频，调用 API 查询真实状态
 * 3. 对超过 7 天且无 task_id 的视频，标记为 FAILED
 * 
 * 运行方式：node fix-stuck-videos.js
 */

require('dotenv').config()

const API_URL = process.env.SUCHUANG_API_URL || 'https://api.wuyinkeji.com'
const API_KEY = process.env.SUCHUANG_API_KEY

// 数据库连接
const { Pool } = require('pg')
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

// 查询 SORA2 视频状态
async function checkSora2Status(taskId) {
  try {
    const url = `${API_URL}/sora2/detail?key=${API_KEY}&id=${taskId}`
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset:utf-8;',
        'Authorization': API_KEY
      }
    })

    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}` }
    }

    const result = await response.json()
    console.log(`  SORA2 API响应 [${taskId}]:`, JSON.stringify(result).substring(0, 200))

    if ((result.code !== 200 && result.code !== 0) || !result.data) {
      return { success: false, error: result.msg || result.message || '查询失败' }
    }

    const data = result.data

    // SORA2状态码：0=排队中，1=成功，2=失败，3=生成中
    if (data.status === 1 && data.remote_url) {
      return {
        success: true,
        status: 'COMPLETED',
        videoUrl: data.remote_url,
        remixPid: data.pid || null
      }
    } else if (data.status === 2) {
      return {
        success: true,
        status: 'FAILED',
        error: data.fail_reason || '视频生成失败'
      }
    } else {
      return {
        success: true,
        status: 'PROCESSING'
      }
    }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// 查询 VEO 视频状态
async function checkVeoStatus(taskId) {
  try {
    const url = `${API_URL}/veo/query?key=${API_KEY}&id=${taskId}`
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json;charset:utf-8;',
        'Authorization': API_KEY
      }
    })

    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}` }
    }

    const result = await response.json()
    console.log(`  VEO API响应 [${taskId}]:`, JSON.stringify(result).substring(0, 200))

    if (result.code !== 200 || !result.data) {
      return { success: false, error: result.msg || '查询失败' }
    }

    const data = result.data

    // VEO状态码：0=排队中，1=成功，2=失败，3=生成中
    if (data.status === 1 && data.content) {
      return {
        success: true,
        status: 'COMPLETED',
        videoUrl: data.content
      }
    } else if (data.status === 2) {
      return {
        success: true,
        status: 'FAILED',
        error: data.fail_reason || '视频生成失败'
      }
    } else {
      return {
        success: true,
        status: 'PROCESSING'
      }
    }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

async function fixStuckVideos() {
  console.log('🔧 开始修复卡住的视频...\n')
  console.log(`API URL: ${API_URL}`)
  console.log(`API Key: ${API_KEY ? API_KEY.substring(0, 10) + '...' : '未设置'}\n`)

  try {
    // 1. 查询所有 PROCESSING 状态的视频
    const result = await pool.query(`
      SELECT id, external_task_id, model, prompt, created_at, user_id
      FROM video_generations
      WHERE status = 'PROCESSING'
      ORDER BY created_at DESC
    `)

    const videos = result.rows
    console.log(`📊 找到 ${videos.length} 个卡住的视频\n`)

    if (videos.length === 0) {
      console.log('✅ 没有卡住的视频')
      return
    }

    let completed = 0
    let failed = 0
    let stillProcessing = 0
    let noTaskId = 0
    let apiError = 0

    for (const video of videos) {
      const createdAt = new Date(video.created_at)
      const ageHours = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60)
      const ageDays = Math.floor(ageHours / 24)

      console.log(`\n📹 视频 ${video.id.substring(0, 8)}...`)
      console.log(`   模型: ${video.model}`)
      console.log(`   创建: ${ageDays}天前 (${createdAt.toISOString()})`)
      console.log(`   TaskID: ${video.external_task_id || '无'}`)
      console.log(`   提示词: ${video.prompt.substring(0, 40)}...`)

      // 如果没有 task_id 且超过 7 天，标记为失败
      if (!video.external_task_id) {
        if (ageDays > 7) {
          await pool.query(`
            UPDATE video_generations
            SET status = 'FAILED',
                error_message = '任务创建失败，无外部任务ID',
                updated_at = NOW()
            WHERE id = $1
          `, [video.id])
          console.log(`   ❌ 标记为失败（无TaskID且超过7天）`)
          failed++
        } else {
          console.log(`   ⏳ 跳过（无TaskID但未超过7天）`)
          noTaskId++
        }
        continue
      }

      // 查询 API 状态
      let status
      if (video.model === 'sora2') {
        status = await checkSora2Status(video.external_task_id)
      } else if (video.model === 'veo3' || video.model === 'veo-2') {
        status = await checkVeoStatus(video.external_task_id)
      } else {
        console.log(`   ⚠️ 未知模型: ${video.model}`)
        continue
      }

      if (!status.success) {
        console.log(`   ⚠️ API查询失败: ${status.error}`)
        
        // 如果超过 7 天且 API 查询失败，标记为失败
        if (ageDays > 7) {
          await pool.query(`
            UPDATE video_generations
            SET status = 'FAILED',
                error_message = $1,
                updated_at = NOW()
            WHERE id = $2
          `, [`API查询失败: ${status.error}`, video.id])
          console.log(`   ❌ 标记为失败（API错误且超过7天）`)
          failed++
        } else {
          apiError++
        }
        continue
      }

      if (status.status === 'COMPLETED' && status.videoUrl) {
        await pool.query(`
          UPDATE video_generations
          SET status = 'COMPLETED',
              video_url = $1,
              remix_pid = $2,
              completed_at = NOW(),
              updated_at = NOW()
          WHERE id = $3
        `, [status.videoUrl, status.remixPid || null, video.id])
        console.log(`   ✅ 已完成！视频URL: ${status.videoUrl.substring(0, 50)}...`)
        completed++
      } else if (status.status === 'FAILED') {
        await pool.query(`
          UPDATE video_generations
          SET status = 'FAILED',
              error_message = $1,
              updated_at = NOW()
          WHERE id = $2
        `, [status.error || '生成失败', video.id])
        console.log(`   ❌ 已失败: ${status.error}`)
        failed++
      } else {
        // 如果超过 3 天还在处理中，可能是真的卡住了
        if (ageDays > 3) {
          await pool.query(`
            UPDATE video_generations
            SET status = 'FAILED',
                error_message = '生成超时（超过3天）',
                updated_at = NOW()
            WHERE id = $1
          `, [video.id])
          console.log(`   ❌ 标记为失败（超过3天仍在处理）`)
          failed++
        } else {
          console.log(`   ⏳ 仍在处理中`)
          stillProcessing++
        }
      }

      // 避免请求过快
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    console.log('\n' + '='.repeat(50))
    console.log('📊 修复结果汇总:')
    console.log(`   ✅ 已完成: ${completed}`)
    console.log(`   ❌ 已失败: ${failed}`)
    console.log(`   ⏳ 仍在处理: ${stillProcessing}`)
    console.log(`   ⚠️ 无TaskID: ${noTaskId}`)
    console.log(`   ⚠️ API错误: ${apiError}`)
    console.log('='.repeat(50))

  } catch (error) {
    console.error('❌ 执行失败:', error)
  } finally {
    await pool.end()
  }
}

fixStuckVideos()
