-- 数据库字段检查和修复脚本
-- 用于确保支付相关表的字段完整性

-- 1. 检查 credit_orders 表结构
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'credit_orders' 
ORDER BY ordinal_position;

-- 2. 检查必需字段是否存在
DO $$
BEGIN
    -- 检查 alipay_trade_no 字段
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'credit_orders' AND column_name = 'alipay_trade_no'
    ) THEN
        ALTER TABLE credit_orders ADD COLUMN alipay_trade_no VARCHAR(64);
        RAISE NOTICE '✅ 已添加 alipay_trade_no 字段';
    ELSE
        RAISE NOTICE '✅ alipay_trade_no 字段已存在';
    END IF;

    -- 检查 paid_at 字段
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'credit_orders' AND column_name = 'paid_at'
    ) THEN
        ALTER TABLE credit_orders ADD COLUMN paid_at TIMESTAMP;
        RAISE NOTICE '✅ 已添加 paid_at 字段';
    ELSE
        RAISE NOTICE '✅ paid_at 字段已存在';
    END IF;

    -- 检查 updated_at 字段
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'credit_orders' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE credit_orders ADD COLUMN updated_at TIMESTAMP DEFAULT NOW();
        RAISE NOTICE '✅ 已添加 updated_at 字段';
    ELSE
        RAISE NOTICE '✅ updated_at 字段已存在';
    END IF;

    -- 检查 buyer_id 字段（支付宝买家ID）
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'credit_orders' AND column_name = 'buyer_id'
    ) THEN
        ALTER TABLE credit_orders ADD COLUMN buyer_id VARCHAR(32);
        RAISE NOTICE '✅ 已添加 buyer_id 字段';
    ELSE
        RAISE NOTICE '✅ buyer_id 字段已存在';
    END IF;
END $$;

-- 3. 检查索引
-- 为订单号创建索引（如果不存在）
CREATE INDEX IF NOT EXISTS idx_credit_orders_order_number 
ON credit_orders(order_number);

-- 为用户ID创建索引（如果不存在）
CREATE INDEX IF NOT EXISTS idx_credit_orders_user_id 
ON credit_orders(user_id);

-- 为支付宝交易号创建索引（如果不存在）
CREATE INDEX IF NOT EXISTS idx_credit_orders_alipay_trade_no 
ON credit_orders(alipay_trade_no);

-- 为订单状态创建索引（如果不存在）
CREATE INDEX IF NOT EXISTS idx_credit_orders_status 
ON credit_orders(status);

-- 4. 检查约束
-- 确保订单号唯一
ALTER TABLE credit_orders 
ADD CONSTRAINT IF NOT EXISTS uk_credit_orders_order_number 
UNIQUE (order_number);

-- 确保支付宝交易号唯一（如果不为空）
CREATE UNIQUE INDEX IF NOT EXISTS uk_credit_orders_alipay_trade_no 
ON credit_orders(alipay_trade_no) 
WHERE alipay_trade_no IS NOT NULL;

-- 5. 检查数据完整性
-- 查找可能的数据问题
SELECT 
    '订单状态分布' as check_type,
    status,
    COUNT(*) as count
FROM credit_orders 
GROUP BY status
UNION ALL
SELECT 
    '空订单号检查' as check_type,
    CASE WHEN order_number IS NULL THEN 'NULL' ELSE 'NOT NULL' END as status,
    COUNT(*) as count
FROM credit_orders 
GROUP BY (order_number IS NULL)
UNION ALL
SELECT 
    '空金额检查' as check_type,
    CASE WHEN amount IS NULL THEN 'NULL' ELSE 'NOT NULL' END as status,
    COUNT(*) as count
FROM credit_orders 
GROUP BY (amount IS NULL);

-- 6. 显示最终表结构
\d credit_orders;

RAISE NOTICE '🎯 数据库字段检查完成！';
RAISE NOTICE '📋 请检查上面的输出，确保所有必需字段都存在';
RAISE NOTICE '⚠️  如果有任何字段缺失，脚本已自动添加';











