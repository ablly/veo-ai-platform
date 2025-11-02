const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:bxbbyffb4y4djTx3@db.hblthmkkdfkzvpywlthq.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false },
  max: 5,
});

async function verifyDatabaseRealtime() {
  const client = await pool.connect();
  
  try {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║       🔍 数据库实时数据验证 - VEO AI Platform        ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    
    // 1. 用户表数据
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 用户表 (users) - 最新5条记录');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    const users = await client.query(`
      SELECT 
        id,
        email,
        name,
        phone,
        wechat_openid,
        wechat_nickname,
        created_at,
        updated_at,
        status
      FROM users 
      ORDER BY created_at DESC 
      LIMIT 5
    `);
    
    if (users.rows.length === 0) {
      console.log('  ⚠️  暂无用户数据\n');
    } else {
      users.rows.forEach((user, index) => {
        console.log(`  ${index + 1}. 用户信息:`);
        console.log(`     📧 邮箱: ${user.email || '未设置'}`);
        console.log(`     👤 姓名: ${user.name || '未设置'}`);
        console.log(`     📱 手机: ${user.phone || '未绑定'}`);
        console.log(`     💬 微信: ${user.wechat_nickname || '未绑定'} ${user.wechat_openid ? '(已绑定)' : ''}`);
        console.log(`     📅 注册时间: ${new Date(user.created_at).toLocaleString('zh-CN')}`);
        console.log(`     🔄 更新时间: ${new Date(user.updated_at).toLocaleString('zh-CN')}`);
        console.log(`     ✅ 状态: ${user.status || 'active'}`);
        console.log('');
      });
    }
    
    // 2. 积分账户数据
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💰 积分账户 (user_credit_accounts) - 最新5条');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    const credits = await client.query(`
      SELECT 
        uca.user_id,
        u.email,
        u.name,
        uca.total_credits,
        uca.available_credits,
        uca.used_credits,
        uca.frozen_credits,
        uca.created_at,
        uca.updated_at
      FROM user_credit_accounts uca
      JOIN users u ON uca.user_id = u.id
      ORDER BY uca.created_at DESC
      LIMIT 5
    `);
    
    if (credits.rows.length === 0) {
      console.log('  ⚠️  暂无积分账户数据\n');
    } else {
      credits.rows.forEach((credit, index) => {
        console.log(`  ${index + 1}. 积分账户:`);
        console.log(`     👤 用户: ${credit.name} (${credit.email})`);
        console.log(`     💎 总积分: ${credit.total_credits}`);
        console.log(`     ✅ 可用积分: ${credit.available_credits}`);
        console.log(`     📊 已用积分: ${credit.used_credits}`);
        console.log(`     🔒 冻结积分: ${credit.frozen_credits}`);
        console.log(`     📅 创建时间: ${new Date(credit.created_at).toLocaleString('zh-CN')}`);
        console.log(`     🔄 更新时间: ${new Date(credit.updated_at).toLocaleString('zh-CN')}`);
        console.log('');
      });
    }
    
    // 3. 积分交易记录
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📜 积分交易记录 (credit_transactions) - 最新10条');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    const transactions = await client.query(`
      SELECT 
        ct.id,
        u.email,
        u.name,
        ct.transaction_type,
        ct.credit_amount,
        ct.balance_before,
        ct.balance_after,
        ct.description,
        ct.created_at
      FROM credit_transactions ct
      JOIN users u ON ct.user_id = u.id
      ORDER BY ct.created_at DESC
      LIMIT 10
    `);
    
    if (transactions.rows.length === 0) {
      console.log('  ⚠️  暂无交易记录\n');
    } else {
      transactions.rows.forEach((tx, index) => {
        const typeEmoji = tx.transaction_type === 'BONUS' ? '🎁' : 
                         tx.transaction_type === 'PURCHASE' ? '💳' : 
                         tx.transaction_type === 'DEDUCT' ? '📉' : '📊';
        const amountColor = tx.credit_amount > 0 ? '+' : '';
        
        console.log(`  ${index + 1}. ${typeEmoji} ${tx.transaction_type}`);
        console.log(`     👤 用户: ${tx.name} (${tx.email})`);
        console.log(`     💰 金额: ${amountColor}${tx.credit_amount} 积分`);
        console.log(`     📊 余额变化: ${tx.balance_before} → ${tx.balance_after}`);
        console.log(`     📝 说明: ${tx.description}`);
        console.log(`     📅 时间: ${new Date(tx.created_at).toLocaleString('zh-CN')}`);
        console.log('');
      });
    }
    
    // 4. 邮箱验证码记录
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔐 邮箱验证码 (email_verification_codes) - 最新5条');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    const codes = await client.query(`
      SELECT 
        email,
        code,
        expires_at,
        used,
        created_at
      FROM email_verification_codes
      ORDER BY created_at DESC
      LIMIT 5
    `);
    
    if (codes.rows.length === 0) {
      console.log('  ⚠️  暂无验证码记录\n');
    } else {
      codes.rows.forEach((code, index) => {
        const now = new Date();
        const expiresAt = new Date(code.expires_at);
        const isExpired = now > expiresAt;
        const status = code.used ? '✅ 已使用' : isExpired ? '⏰ 已过期' : '🟢 有效';
        
        console.log(`  ${index + 1}. 验证码:`);
        console.log(`     📧 邮箱: ${code.email}`);
        console.log(`     🔑 验证码: ${code.code}`);
        console.log(`     ⏰ 过期时间: ${expiresAt.toLocaleString('zh-CN')}`);
        console.log(`     📊 状态: ${status}`);
        console.log(`     📅 创建时间: ${new Date(code.created_at).toLocaleString('zh-CN')}`);
        console.log('');
      });
    }
    
    // 5. 统计总览
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📈 数据统计总览');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    const stats = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM users WHERE wechat_openid IS NOT NULL) as wechat_users,
        (SELECT COUNT(*) FROM user_credit_accounts) as credit_accounts,
        (SELECT SUM(available_credits) FROM user_credit_accounts) as total_available_credits,
        (SELECT SUM(used_credits) FROM user_credit_accounts) as total_used_credits,
        (SELECT COUNT(*) FROM credit_transactions) as total_transactions,
        (SELECT COUNT(*) FROM email_verification_codes WHERE used = false AND expires_at > NOW()) as valid_codes
    `);
    
    const stat = stats.rows[0];
    console.log(`  👥 总用户数: ${stat.total_users}`);
    console.log(`  💬 微信绑定用户: ${stat.wechat_users}`);
    console.log(`  💳 积分账户数: ${stat.credit_accounts}`);
    console.log(`  💎 总可用积分: ${stat.total_available_credits || 0}`);
    console.log(`  📊 总已用积分: ${stat.total_used_credits || 0}`);
    console.log(`  📜 总交易记录: ${stat.total_transactions}`);
    console.log(`  🔐 有效验证码: ${stat.valid_codes}`);
    
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                  ✅ 数据验证完成！                    ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    
    console.log('💡 提示:');
    console.log('   1. 现在可以进行注册/登录操作');
    console.log('   2. 操作后重新运行此脚本查看数据变化');
    console.log('   3. 观察用户、积分、交易记录的实时更新\n');
    
  } catch (error) {
    console.error('\n❌ 验证失败:', error.message);
    console.error('详细错误:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

verifyDatabaseRealtime();



















