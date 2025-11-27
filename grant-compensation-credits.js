/**
 * 发放补偿积分给所有用户
 * 因视频状态同步故障，赠送每位用户5积分
 */

require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const COMPENSATION_CREDITS = 5;
const REASON = '系统故障补偿 - 视频状态同步问题（2025-11-27）';

async function grantCompensationCredits() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log('🎁 开始发放补偿积分...\n');
    
    // 查询所有有积分账户的用户
    const result = await client.query(`
      SELECT u.id, u.name, u.email, uca.available_credits
      FROM users u
      LEFT JOIN user_credit_accounts uca ON u.id = uca.user_id
      WHERE u.email IS NOT NULL
      ORDER BY u.created_at DESC
    `);
    
    const users = result.rows;
    console.log(`找到 ${users.length} 个用户\n`);
    
    if (users.length === 0) {
      console.log('没有用户需要发放积分');
      await client.query('ROLLBACK');
      return;
    }
    
    let granted = 0;
    let created = 0;
    let failed = 0;
    
    for (const user of users) {
      try {
        const userName = user.name || user.email.split('@')[0];
        console.log(`处理用户: ${user.email} (${userName})`);
        
        // 检查是否已有积分账户
        if (user.available_credits !== null) {
          // 更新现有账户
          await client.query(`
            UPDATE user_credit_accounts
            SET available_credits = available_credits + $1,
                total_credits = total_credits + $1,
                updated_at = NOW()
            WHERE user_id = $2
          `, [COMPENSATION_CREDITS, user.id]);
          
          console.log(`  ✅ 增加 ${COMPENSATION_CREDITS} 积分 (原有: ${user.available_credits})`);
          granted++;
        } else {
          // 创建新账户
          await client.query(`
            INSERT INTO user_credit_accounts (
              user_id,
              available_credits,
              used_credits,
              total_credits,
              package_name,
              created_at,
              updated_at
            ) VALUES ($1, $2, 0, $2, '补偿积分', NOW(), NOW())
          `, [user.id, COMPENSATION_CREDITS]);
          
          console.log(`  ✅ 创建账户并赠送 ${COMPENSATION_CREDITS} 积分`);
          created++;
        }
        
        // 记录交易日志
        const balanceAfter = user.available_credits !== null 
          ? user.available_credits + COMPENSATION_CREDITS 
          : COMPENSATION_CREDITS;
        
        await client.query(`
          INSERT INTO credit_transactions (
            user_id,
            transaction_type,
            credit_amount,
            balance_before,
            balance_after,
            description,
            created_at
          ) VALUES (
            $1,
            'BONUS',
            $2,
            $3,
            $4,
            $5,
            NOW()
          )
        `, [
          user.id, 
          COMPENSATION_CREDITS, 
          user.available_credits || 0,
          balanceAfter,
          REASON
        ]);
        
      } catch (error) {
        console.log(`  ❌ 失败: ${error.message}`);
        failed++;
      }
    }
    
    await client.query('COMMIT');
    
    console.log('\n========== 发放完成 ==========');
    console.log(`✅ 更新账户: ${granted}`);
    console.log(`✅ 创建账户: ${created}`);
    console.log(`❌ 失败: ${failed}`);
    console.log(`📊 总计: ${users.length}`);
    console.log(`💰 总发放积分: ${(granted + created) * COMPENSATION_CREDITS}`);
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ 错误:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// 确认发放
console.log('⚠️  警告：即将向所有用户发放补偿积分');
console.log('');
console.log(`补偿金额: ${COMPENSATION_CREDITS} 积分/人`);
console.log(`补偿原因: ${REASON}`);
console.log('');
console.log('按 Ctrl+C 取消，或等待 5 秒后自动开始发放...');
console.log('');

setTimeout(() => {
  grantCompensationCredits();
}, 5000);
