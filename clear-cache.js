// Next.js 缓存清理脚本
const fs = require('fs');
const path = require('path');

console.log('🧹 清理 Next.js 缓存...\n');

const cacheDirs = [
  '.next',
  'node_modules/.cache',
  '.vercel',
  'dist'
];

const clearDirectory = (dirPath) => {
  if (fs.existsSync(dirPath)) {
    console.log(`🗑️  清理目录: ${dirPath}`);
    fs.rmSync(dirPath, { recursive: true, force: true });
    console.log(`✅ 已清理: ${dirPath}`);
  } else {
    console.log(`⚠️  目录不存在: ${dirPath}`);
  }
};

cacheDirs.forEach(clearDirectory);

console.log('\n✅ 缓存清理完成！');
console.log('\n📋 建议执行以下命令重新启动:');
console.log('   npm run dev');
console.log('\n💡 如果仍有问题，请尝试:');
console.log('   1. 清理浏览器缓存');
console.log('   2. 使用无痕模式访问');
console.log('   3. 重启开发服务器');
