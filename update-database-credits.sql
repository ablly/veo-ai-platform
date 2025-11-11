-- ============================================
-- VEO AI平台 - 积分系统数据库更新
-- 更新时间: 2025-10-22
-- 规则: 15积分 = 1个视频
-- ============================================

-- 1. 更新 credit_packages 表的套餐信息
-- ============================================

-- 删除旧的套餐数据（如果存在）
DELETE FROM credit_packages WHERE id IN ('basic', 'professional', 'enterprise');

-- 插入新的套餐配置（15积分=1视频）
INSERT INTO credit_packages (id, name, credits, price, original_price, description, features, is_popular, is_active, sort_order, created_at, updated_at)
VALUES 
  -- 基础套餐
  (
    'basic',
    '基础套餐',
    50,
    49.00,
    50.00,
    '适合个人创作者轻度使用',
    jsonb_build_object(
      'items', jsonb_build_array(
        '50积分额度',
        '基础AI模型',
        '标准生成速度',
        '30天有效期'
      )
    ),
    false,
    true,
    1,
    NOW(),
    NOW()
  ),
  
  -- 专业套餐（最受欢迎）
  (
    'professional',
    '专业套餐',
    150,
    99.00,
    150.00,
    '适合经常创作的内容创作者',
    jsonb_build_object(
      'items', jsonb_build_array(
        '150积分额度',
        '高级AI模型',
        '优先生成速度',
        '真实物理运动',
        '90天有效期',
        '商用许可'
      )
    ),
    true,
    true,
    2,
    NOW(),
    NOW()
  ),
  
  -- 企业套餐
  (
    'enterprise',
    '企业套餐',
    500,
    299.00,
    500.00,
    '为专业团队和重度使用者而设',
    jsonb_build_object(
      'items', jsonb_build_array(
        '500积分额度',
        '高级AI模型',
        '极速生成通道',
        '真实物理运动',
        '高级模型控制',
        '180天有效期',
        '完整商用许可',
        'API接口访问'
      )
    ),
    false,
    true,
    3,
    NOW(),
    NOW()
  )
ON CONFLICT (id) 
DO UPDATE SET
  credits = EXCLUDED.credits,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  description = EXCLUDED.description,
  features = EXCLUDED.features,
  is_popular = EXCLUDED.is_popular,
  updated_at = NOW();

-- 2. 创建 user_viva_api_keys 表（如果不存在）
-- ============================================
CREATE TABLE IF NOT EXISTS user_viva_api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  api_key VARCHAR(100) NOT NULL,
  api_secret VARCHAR(100),
  quota INTEGER NOT NULL DEFAULT 0,
  used INTEGER NOT NULL DEFAULT 0,
  package_name VARCHAR(100),
  package_id VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  UNIQUE(api_key)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_user_viva_api_keys_user_id ON user_viva_api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_user_viva_api_keys_api_key ON user_viva_api_keys(api_key);

-- 添加注释
COMMENT ON TABLE user_viva_api_keys IS '用户的VivaAPI密钥表';
COMMENT ON COLUMN user_viva_api_keys.quota IS '总配额（积分数）';
COMMENT ON COLUMN user_viva_api_keys.used IS '已使用积分数';

-- 3. 创建积分消耗配置表
-- ============================================
CREATE TABLE IF NOT EXISTS credit_consumption_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action_type VARCHAR(50) NOT NULL,
  description VARCHAR(200),
  base_cost INTEGER NOT NULL,
  duration_5s_cost INTEGER,
  duration_10s_cost INTEGER,
  image_cost_per_item INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 插入积分消耗规则
INSERT INTO credit_consumption_rules (action_type, description, base_cost, duration_5s_cost, duration_10s_cost, image_cost_per_item, is_active)
VALUES 
  (
    'video_generation',
    '视频生成积分消耗规则',
    15,  -- 基础消耗：15积分
    15,  -- 5秒视频：15积分
    30,  -- 10秒视频：30积分
    5,   -- 每张参考图片：5积分
    true
  )
ON CONFLICT DO NOTHING;

-- 4. 更新系统配置表
-- ============================================
CREATE TABLE IF NOT EXISTS system_config (
  key VARCHAR(100) PRIMARY KEY,
  value TEXT NOT NULL,
  description VARCHAR(500),
  type VARCHAR(50) DEFAULT 'string',
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 插入或更新积分配置
INSERT INTO system_config (key, value, description, type)
VALUES 
  ('credits_per_video', '15', '每个视频消耗的积分数', 'integer'),
  ('credits_per_image', '5', '每个参考图片消耗的积分数', 'integer'),
  ('welcome_credits', '10', '新用户注册赠送积分', 'integer'),
  ('video_duration_multiplier', '{"5":1,"10":2}', '视频时长倍数配置', 'json')
ON CONFLICT (key) 
DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = NOW();

-- 5. 验证数据
-- ============================================
SELECT 
  id,
  name,
  credits,
  price,
  is_popular,
  is_active
FROM credit_packages
ORDER BY sort_order;

-- 6. 更新现有用户的初始积分（可选）
-- ============================================
-- 为还没有积分账户的用户创建账户并赠送10积分
INSERT INTO user_credit_accounts (user_id, available_credits, total_credits, used_credits, frozen_credits, created_at, updated_at)
SELECT 
  u.id,
  10,  -- 赠送10积分
  10,
  0,
  0,
  NOW(),
  NOW()
FROM users u
WHERE NOT EXISTS (
  SELECT 1 FROM user_credit_accounts uca WHERE uca.user_id = u.id
)
ON CONFLICT (user_id) DO NOTHING;

-- 7. 完成
-- ============================================
SELECT '✅ 数据库更新完成！' AS status;
SELECT '积分规则：15积分 = 1个视频' AS rule;
SELECT COUNT(*) || ' 个套餐已配置' AS packages FROM credit_packages WHERE is_active = true;
SELECT COUNT(*) || ' 个用户拥有积分账户' AS users FROM user_credit_accounts;



