// 手动检查视频9410的状态
const SUCHUANG_API_KEY = '15GiukipJfvCwCG3Z2nfk3P';
const taskId = '9410';

async function checkVideo() {
  try {
    const url = `https://api.wuyinkeji.com/api/video/veoDetail?key=${SUCHUANG_API_KEY}&id=${taskId}`;
    
    console.log('正在查询视频状态...');
    console.log('URL:', url);
    
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
    console.log('\n=== 速创API响应 ===');
    console.log(JSON.stringify(result, null, 2));

    if (result.code === 200 && result.data) {
      const data = result.data;
      console.log('\n=== 视频信息 ===');
      console.log('ID:', data.id);
      console.log('状态:', data.status, getStatusText(data.status));
      console.log('视频URL:', data.content || '无');
      console.log('失败原因:', data.fail_reason || '无');
      console.log('创建时间:', data.created_at);
      console.log('更新时间:', data.updated_at);

      if (data.status === 1 && data.content) {
        console.log('\n✅ 视频生成成功！');
        console.log('请执行以下SQL更新数据库:');
        console.log(`
UPDATE video_generations
SET status = 'COMPLETED',
    video_url = '${data.content}',
    completed_at = NOW(),
    updated_at = NOW()
WHERE external_task_id = '${taskId}';
        `);
      } else if (data.status === 2) {
        console.log('\n❌ 视频生成失败！');
        console.log('失败原因:', data.fail_reason);
      } else {
        console.log('\n⏳ 视频还在生成中...');
      }
    }
  } catch (error) {
    console.error('❌ 查询失败:', error.message);
  }
}

function getStatusText(status) {
  switch(status) {
    case 0: return '排队中';
    case 1: return '成功';
    case 2: return '失败';
    case 3: return '生成中';
    default: return '未知';
  }
}

checkVideo();
