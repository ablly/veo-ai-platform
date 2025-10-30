-- 修复数据库字段问题
-- 检查并添加缺失的字段

-- 1. 检查 credit_orders 表的当前结构
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'credit_orders' 
ORDER BY ordinal_position;

-- 2. 添加可能缺失的字段
DO $$
BEGIN
    -- 添加 credits 字段（如果不存在）
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'credit_orders' AND column_name = 'credits'
    ) THEN
        ALTER TABLE credit_orders ADD COLUMN credits INTEGER;
        RAISE NOTICE '✅ 已添加 credits 字段';
    ELSE
        RAISE NOTICE '✅ credits 字段已存在';
    END IF;

    -- 添加 credits_amount 字段（如果不存在）
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'credit_orders' AND column_name = 'credits_amount'
    ) THEN
        ALTER TABLE credit_orders ADD COLUMN credits_amount INTEGER;
        RAISE NOTICE '✅ 已添加 credits_amount 字段';
    ELSE
        RAISE NOTICE '✅ credits_amount 字段已存在';
    END IF;

    -- 添加 payment_amount 字段（如果不存在）
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'credit_orders' AND column_name = 'payment_amount'
    ) THEN
        ALTER TABLE credit_orders ADD COLUMN payment_amount DECIMAL(10,2);
        RAISE NOTICE '✅ 已添加 payment_amount 字段';
    ELSE
        RAISE NOTICE '✅ payment_amount 字段已存在';
    END IF;

    -- 检查 amount 字段类型
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'credit_orders' AND column_name = 'amount' AND data_type != 'numeric'
    ) THEN
        ALTER TABLE credit_orders ALTER COLUMN amount TYPE DECIMAL(10,2);
        RAISE NOTICE '✅ 已修改 amount 字段类型为 DECIMAL(10,2)';
    ELSE
        RAISE NOTICE '✅ amount 字段类型正确';
    END IF;

END $$;

-- 3. 显示修复后的表结构
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'credit_orders' 
ORDER BY ordinal_position;

