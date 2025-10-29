# 手机号登录功能设置指南

## 📱 功能概述

已成功将微信登录替换为手机号登录功能，支持：
- 手机号验证码登录
- 邮箱验证码登录  
- 账户密码登录
- 手机号注册

## 🗄️ 数据库迁移

### 执行数据库迁移脚本

```bash
# 连接到您的PostgreSQL数据库并执行以下脚本
psql -h your-host -U your-user -d your-database -f database-phone-migration.sql
```

或者手动执行 `database-phone-migration.sql` 中的SQL语句。

### 迁移内容

1. **用户表添加手机号字段**
   ```sql
   ALTER TABLE users ADD COLUMN phone VARCHAR(11) UNIQUE;
   ```

2. **创建手机号验证码表**
   ```sql
   CREATE TABLE phone_verification_codes (
     id SERIAL PRIMARY KEY,
     phone VARCHAR(11) NOT NULL,
     code VARCHAR(6) NOT NULL,
     expires_at TIMESTAMP NOT NULL,
     used BOOLEAN DEFAULT FALSE,
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

3. **创建相关索引和清理函数**

## 🚀 功能特性

### 登录方式

1. **账户密码登录** - 使用邮箱+密码
2. **邮箱验证码登录** - 使用邮箱+6位验证码
3. **手机验证码登录** - 使用手机号+6位验证码

### 注册功能

- 支持邮箱+手机号+密码注册
- 自动验证手机号格式（中国大陆11位手机号）
- 新用户自动获得积分奖励

### 验证码功能

- 6位数字验证码
- 5分钟有效期
- 1分钟内不能重复发送
- 开发环境下控制台显示验证码

## 📁 文件结构

```
src/
├── app/
│   ├── login/page.tsx                    # 登录页面（已更新）
│   ├── register/page.tsx                 # 注册页面（已更新）
│   └── api/auth/
│       ├── register/route.ts             # 注册API（已更新）
│       ├── send-phone-code/route.ts      # 发送手机验证码API（新增）
│       └── verify-phone-code/route.ts    # 验证手机验证码API（新增）
└── lib/
    └── auth.ts                           # NextAuth配置（已更新）
```

## 🔧 开发环境测试

### 测试手机号登录

1. 访问登录页面
2. 选择"手机验证码"登录方式
3. 输入测试手机号：`13800138000`
4. 点击"获取验证码"
5. 查看控制台获取验证码（开发环境）
6. 输入验证码完成登录

### 测试注册功能

1. 访问注册页面
2. 填写姓名、邮箱、手机号、密码
3. 提交注册
4. 系统自动创建账户并赠送积分

## 🔒 安全特性

- 手机号格式验证（正则表达式）
- 验证码有效期控制（5分钟）
- 防重复发送机制（1分钟间隔）
- 验证码使用后自动标记为已使用
- 数据库事务保证数据一致性

## 📱 生产环境部署

### 短信服务集成

目前验证码发送在开发环境下通过控制台显示，生产环境需要集成短信服务：

1. **推荐的短信服务商：**
   - 阿里云短信服务
   - 华为云短信服务
   - 网易云信
   - 容联云通讯

2. **集成步骤：**
   - 在 `src/app/api/auth/send-phone-code/route.ts` 中添加短信发送逻辑
   - 配置相应的环境变量
   - 测试短信发送功能

### 环境变量

确保以下环境变量已配置：

```bash
# 数据库连接
DATABASE_URL=your_database_url

# NextAuth配置
NEXTAUTH_URL=your_app_url
NEXTAUTH_SECRET=your_secret

# 短信服务配置（根据选择的服务商）
SMS_API_KEY=your_sms_api_key
SMS_SECRET=your_sms_secret
```

## 🧪 测试清单

- [ ] 手机号登录功能
- [ ] 邮箱登录功能  
- [ ] 密码登录功能
- [ ] 注册功能
- [ ] 验证码发送和验证
- [ ] 数据库数据正确性
- [ ] 积分系统集成
- [ ] 错误处理和用户提示

## 🔄 回滚方案

如需回滚到微信登录，请：

1. 恢复 `src/lib/auth.ts` 中的微信登录配置
2. 恢复登录和注册页面的微信按钮
3. 保留手机号相关数据库字段（可选）

## 📞 技术支持

如遇到问题，请检查：
1. 数据库迁移是否正确执行
2. 环境变量是否正确配置
3. 控制台是否有错误信息
4. 网络连接是否正常
