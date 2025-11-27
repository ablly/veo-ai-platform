/**
 * 测试视频URL是否可访问
 */

const videoUrl = 'https://openpt1.oss-cn-shanghai.aliyuncs.com/2ee8e1c84bd3471d805fba1103a0ee77.mp4';

async function testVideoUrl() {
  console.log('🧪 测试视频URL访问\n');
  console.log(`URL: ${videoUrl}\n`);
  
  try {
    console.log('📡 发送 HEAD 请求...');
    
    const response = await fetch(videoUrl, {
      method: 'HEAD'
    });
    
    console.log(`\n状态码: ${response.status} ${response.statusText}`);
    console.log('\n响应头:');
    console.log('  Content-Type:', response.headers.get('content-type'));
    console.log('  Content-Length:', response.headers.get('content-length'));
    console.log('  Last-Modified:', response.headers.get('last-modified'));
    console.log('  ETag:', response.headers.get('etag'));
    
    if (response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('video')) {
        console.log('\n✅ 视频URL可以正常访问！');
      } else {
        console.log(`\n⚠️ 警告: Content-Type 不是视频格式: ${contentType}`);
      }
    } else {
      console.log('\n❌ 视频URL无法访问');
      
      // 尝试GET请求获取错误详情
      console.log('\n尝试获取错误详情...');
      const getResponse = await fetch(videoUrl);
      const text = await getResponse.text();
      console.log('\n错误响应:');
      console.log(text.substring(0, 500));
    }
    
  } catch (error) {
    console.error('\n❌ 请求失败:', error.message);
  }
}

testVideoUrl();
