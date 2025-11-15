# 🗄️ Supabase数据库迁移指南 - 短信功能

> **VEO AI - 腾讯云短信数据库迁移**
> 
> 本指南将帮助您在Supabase数据库中添加短信发送相关的字段和视图

---

## 📋 迁移内容

本次迁移将为 `phone_verification_codes` 表添加以下字段：

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `send_status` | VARCHAR(20) | 发送状态（pending/sent/failed）|
| `send_error` | TEXT | 发送失败原因 |
| `tencent_request_id` | VARCHAR(100) | 腾讯云请求ID |
| `send_attempts` | INTEGER | 发送尝试次数 |

并创建：
- 2个索引（提升查询性能）
- 2个视图（方便统计和查询）

---

## 🚀 执行步骤

### 步骤1：登录Supabase控制台

1. 访问：https://supabase.com/dashboard
2. 选择您的项目
3. 点击左侧菜单的 **SQL Editor**

---

### 步骤2：执行迁移SQL

#### 方法1：使用SQL Editor（推荐）

在SQL Editor中，点击 **+ New query**，然后粘贴以下完整SQL：

```sql
-- ==========================================
-- VEO AI - 短信功能数据库迁移
-- 执行时间：2025-01-14
-- ==========================================

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

-- 6. 验证迁移是否成功
SELECT 
    'phone_verification_codes 表字段' as check_type,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'phone_verification_codes'
    AND column_name IN ('send_status', 'send_error', 'tencent_request_id', 'send_attempts')
ORDER BY column_name;
```

点击右下角的 **RUN** 按钮执行。

---

### 步骤3：验证迁移结果

执行以下SQL验证迁移是否成功：

```sql
-- 验证字段是否添加成功
SELECT 
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'phone_verification_codes'
    AND column_name IN ('send_status', 'send_error', 'tencent_request_id', 'send_attempts')
ORDER BY column_name;
```

**预期结果：** 应该看到4个新字段

| column_name | data_type | column_default | is_nullable |
|-------------|-----------|----------------|-------------|
| send_attempts | integer | 0 | YES |
| send_error | text | NULL | YES |
| send_status | character varying | 'pending' | YES |
| tencent_request_id | character varying | NULL | YES |

---

### 步骤4：验证索引创建

```sql
-- 验证索引是否创建成功
SELECT 
    indexname,
    tablename,
    indexdef
FROM pg_indexes
WHERE tablename = 'phone_verification_codes'
    AND indexname LIKE 'idx_phone_verification_codes_%'
ORDER BY indexname;
```

**预期结果：** 应该看到2个新索引

---

### 步骤5：验证视图创建

```sql
-- 验证视图是否创建成功
SELECT 
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
    AND table_name IN ('recent_sms_logs', 'sms_statistics')
ORDER BY table_name;
```

**预期结果：** 应该看到2个视图

---

## ✅ 测试查询

### 查询1：查看最近的短信发送记录

```sql
SELECT * FROM recent_sms_logs LIMIT 10;
```

### 查询2：查看短信发送统计

```sql
SELECT * FROM sms_statistics;
```

### 查询3：查看所有字段

```sql
SELECT * FROM phone_verification_codes 
ORDER BY created_at DESC 
LIMIT 5;
```

应该能看到新添加的字段：
- `send_status`
- `send_error`
- `tencent_request_id`
- `send_attempts`

---

## 🔄 回滚（如果需要）

如果需要撤销本次迁移，执行以下SQL：

```sql
-- 警告：此操作将删除所有短信发送状态数据！

-- 删除视图
DROP VIEW IF EXISTS recent_sms_logs;
DROP VIEW IF EXISTS sms_statistics;

-- 删除索引
DROP INDEX IF EXISTS idx_phone_verification_codes_send_status;
DROP INDEX IF EXISTS idx_phone_verification_codes_tencent_request_id;

-- 删除字段
ALTER TABLE phone_verification_codes 
DROP COLUMN IF EXISTS send_status,
DROP COLUMN IF EXISTS send_error,
DROP COLUMN IF EXISTS tencent_request_id,
DROP COLUMN IF EXISTS send_attempts;
```

---

## 📊 迁移后的表结构

执行迁移后，`phone_verification_codes` 表的完整结构：

```sql
-- 查看完整表结构
\d phone_verification_codes

-- 或者使用标准SQL
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'phone_verification_codes'
ORDER BY ordinal_position;
```

**完整字段列表：**
1. `id` - SERIAL PRIMARY KEY
2. `phone` - VARCHAR(11) NOT NULL
3. `code` - VARCHAR(6) NOT NULL
4. `expires_at` - TIMESTAMP NOT NULL
5. `used` - BOOLEAN DEFAULT FALSE
6. `created_at` - TIMESTAMP DEFAULT NOW()
7. `updated_at` - TIMESTAMP DEFAULT NOW()
8. **`send_status`** - VARCHAR(20) DEFAULT 'pending' ⭐ 新增
9. **`send_error`** - TEXT ⭐ 新增
10. **`tencent_request_id`** - VARCHAR(100) ⭐ 新增
11. **`send_attempts`** - INTEGER DEFAULT 0 ⭐ 新增

---

## 🎯 使用示例

### 示例1：查看发送成功的短信

```sql
SELECT 
    phone,
    code,
    tencent_request_id,
    created_at
FROM phone_verification_codes
WHERE send_status = 'sent'
ORDER BY created_at DESC
LIMIT 10;
```

### 示例2：查看发送失败的短信及原因

```sql
SELECT 
    phone,
    send_error,
    tencent_request_id,
    send_attempts,
    created_at
FROM phone_verification_codes
WHERE send_status = 'failed'
ORDER BY created_at DESC
LIMIT 10;
```

### 示例3：查看某个手机号的发送历史

```sql
SELECT 
    phone,
    code,
    send_status,
    send_error,
    tencent_request_id,
    created_at
FROM phone_verification_codes
WHERE phone = '13800138000'
ORDER BY created_at DESC;
```

### 示例4：统计今日发送情况

```sql
SELECT 
    send_status,
    COUNT(*) as count
FROM phone_verification_codes
WHERE created_at >= CURRENT_DATE
GROUP BY send_status;
```

---

## ⚠️ 注意事项

1. **权限要求**
   - 需要Supabase项目的管理员权限
   - 确保有权限执行ALTER TABLE和CREATE VIEW

2. **数据安全**
   - 本次迁移不会删除任何现有数据
   - 只是添加新字段，默认值为NULL或'pending'

3. **性能影响**
   - 添加字段操作很快（通常<1秒）
   - 不会影响现有查询
   - 新创建的索引会提升查询性能

4. **兼容性**
   - 兼容PostgreSQL 12+
   - Supabase使用PostgreSQL，完全兼容

---

## 🚨 故障排查

### 问题1：权限不足

**错误信息：**
```
ERROR: permission denied for table phone_verification_codes
```

**解决方案：**
- 确保使用Supabase管理员账号
- 检查数据库用户权限

---

### 问题2：表不存在

**错误信息：**
```
ERROR: relation "phone_verification_codes" does not exist
```

**解决方案：**
1. 先执行基础表创建（`database-phone-migration.sql`）
2. 确认表名正确

---

### 问题3：字段已存在

**错误信息：**
```
ERROR: column "send_status" of relation "phone_verification_codes" already exists
```

**解决方案：**
- 这是正常的，说明迁移已经执行过
- 使用 `IF NOT EXISTS` 可以避免此错误（已包含在脚本中）

---

## ✅ 迁移完成确认

执行迁移后，请确认以下所有项：

- [ ] ✅ 4个新字段已添加
- [ ] ✅ 2个索引已创建
- [ ] ✅ 2个视图已创建
- [ ] ✅ 验证查询返回正确结果
- [ ] ✅ 现有功能正常工作

---

## 📞 需要帮助？

**Supabase文档：**
- SQL Editor: https://supabase.com/docs/guides/database/sql-editor
- 表管理: https://supabase.com/docs/guides/database/tables

**VEO AI文档：**
- 短信配置指南: `TENCENT_SMS_SETUP_GUIDE.md`
- 上线检查清单: `SMS_PRODUCTION_CHECKLIST.md`

---

**迁移完成后，短信功能的数据库部分就准备就绪了！** 🎉

**下一步：** 配置腾讯云环境变量（查看 `ENV_SMS_CONFIG_STEPS.md`）











