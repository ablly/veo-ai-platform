-- 数据库增强：添加短信发送状态追踪字段
-- 执行时间：2025-01-XX
-- 目的：记录腾讯云短信发送状态，便于监控和调试

-- 1. 为 phone_verification_codes 表添加发送状态字段
ALTER TABLE phone_verification_codes 
ADD COLUMN IF NOT EXISTS send_status VARCHAR(20) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS send_error TEXT,
ADD COLUMN IF NOT EXISTS tencent_request_id VARCHAR(100),
ADD COLUMN IF NOT EXISTS send_attempts INTEGER DEFAULT 0;

-- 2. 添加字段注释
COMMENT ON COLUMN phone_verification_codes.send_status IS '发送状态: pending(待发送), sent(已发送), failed(发送失败)';
COMMENT ON COLUMN phone_verification_codes.send_error IS '发送失败原因（如有）';
COMMENT ON COLUMN phone_verification_codes.tencent_request_id IS '腾讯云请求ID，用于追踪';
COMMENT ON COLUMN phone_verification_codes.send_attempts IS '发送尝试次数';

-- 3. 创建索引以提升查询性能
CREATE INDEX IF NOT EXISTS idx_phone_verification_codes_send_status 
ON phone_verification_codes(send_status);

CREATE INDEX IF NOT EXISTS idx_phone_verification_codes_tencent_request_id 
ON phone_verification_codes(tencent_request_id);

-- 4. 创建视图：查看最近的短信发送记录
CREATE OR REPLACE VIEW recent_sms_logs AS
SELECT 
    phone,
    code,
    send_status,
    send_error,
    tencent_request_id,
    send_attempts,
    expires_at,
    used,
    created_at
FROM phone_verification_codes
WHERE created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;

COMMENT ON VIEW recent_sms_logs IS '最近7天的短信发送记录';

-- 5. 创建统计视图：短信发送统计
CREATE OR REPLACE VIEW sms_statistics AS
SELECT 
    DATE(created_at) as date,
    COUNT(*) as total_sent,
    COUNT(*) FILTER (WHERE send_status = 'sent') as success_count,
    COUNT(*) FILTER (WHERE send_status = 'failed') as failed_count,
    COUNT(*) FILTER (WHERE send_status = 'pending') as pending_count,
    ROUND(
        COUNT(*) FILTER (WHERE send_status = 'sent')::NUMERIC / 
        NULLIF(COUNT(*), 0) * 100, 
        2
    ) as success_rate
FROM phone_verification_codes
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

COMMENT ON VIEW sms_statistics IS '短信发送统计（最近30天）';

-- 6. 查询示例

-- 查看最近的短信发送记录
-- SELECT * FROM recent_sms_logs LIMIT 20;

-- 查看短信发送统计
-- SELECT * FROM sms_statistics;

-- 查看失败的短信记录
-- SELECT * FROM phone_verification_codes 
-- WHERE send_status = 'failed' 
-- ORDER BY created_at DESC LIMIT 10;

-- 查看某个手机号的发送历史
-- SELECT * FROM phone_verification_codes 
-- WHERE phone = '13800138000' 
-- ORDER BY created_at DESC;











