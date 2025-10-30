-- 数据库迁移：添加手机号登录支持
-- 执行时间：2025-01-14

-- 1. 为用户表添加手机号字段
ALTER TABLE users ADD COLUMN phone VARCHAR(11) UNIQUE;

-- 2. 创建手机号验证码表
CREATE TABLE IF NOT EXISTS phone_verification_codes (
    id SERIAL PRIMARY KEY,
    phone VARCHAR(11) NOT NULL,
    code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. 为手机号验证码表创建索引
CREATE INDEX idx_phone_verification_codes_phone ON phone_verification_codes(phone);
CREATE INDEX idx_phone_verification_codes_created_at ON phone_verification_codes(created_at);
CREATE INDEX idx_phone_verification_codes_expires_at ON phone_verification_codes(expires_at);

-- 4. 创建清理过期验证码的函数
CREATE OR REPLACE FUNCTION cleanup_expired_phone_codes()
RETURNS void AS $$
BEGIN
    DELETE FROM phone_verification_codes 
    WHERE expires_at < NOW() - INTERVAL '1 day';
END;
$$ LANGUAGE plpgsql;

-- 5. 移除微信相关字段（如果不再需要）
-- 注意：这些字段可能包含重要数据，请谨慎删除
-- ALTER TABLE users DROP COLUMN IF EXISTS wechat_openid;
-- ALTER TABLE users DROP COLUMN IF EXISTS wechat_unionid;
-- ALTER TABLE users DROP COLUMN IF EXISTS wechat_nickname;

-- 6. 更新用户表的约束，确保至少有一种联系方式
-- ALTER TABLE users ADD CONSTRAINT check_contact_method 
-- CHECK (email IS NOT NULL OR phone IS NOT NULL);

COMMENT ON TABLE phone_verification_codes IS '手机号验证码表';
COMMENT ON COLUMN phone_verification_codes.phone IS '手机号码';
COMMENT ON COLUMN phone_verification_codes.code IS '6位验证码';
COMMENT ON COLUMN phone_verification_codes.expires_at IS '过期时间';
COMMENT ON COLUMN phone_verification_codes.used IS '是否已使用';

COMMENT ON COLUMN users.phone IS '用户手机号码';


