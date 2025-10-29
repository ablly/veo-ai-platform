# 🚀 GitHub MCP 快速修复指南

## ⚡ 5分钟解决MCP认证问题

### 问题症状
```
MCP error -32603: Authentication Failed: Bad credentials
```

### 快速解决方案

---

## 步骤1️⃣：获取GitHub Token（2分钟）

### 🔗 直接访问创建页面
```
https://github.com/settings/tokens/new
```

### 📝 填写信息
```
Note: VEO AI MCP Token
Expiration: 90 days
```

### ✅ 勾选权限（重要！）
```
必选项：
☑ repo (完整勾选，包括所有子项)
☑ workflow
☑ write:packages
☑ admin:repo_hook
☑ user
```

### 💾 生成并复制Token
1. 点击页面底部绿色按钮 "Generate token"
2. **立即复制Token**（格式：`ghp_xxxxx...`）
3. Token只显示一次，请妥善保存

---

## 步骤2️⃣：配置Token（2分钟）

### Windows用户（推荐）

#### 方法A：设置环境变量（永久）

1. **打开环境变量设置**
   - 按 `Win + R`
   - 输入：`rundll32 sysdm.cpl,EditEnvironmentVariables`
   - 回车

2. **添加变量**
   - 点击 "用户变量" 下的 "新建"
   - 变量名：`GITHUB_TOKEN`
   - 变量值：粘贴您的Token（`ghp_xxxxx...`）
   - 点击 "确定"

3. **重启Cursor**
   - 关闭Cursor IDE
   - 重新打开

#### 方法B：PowerShell临时设置（快速测试）

```powershell
# 在PowerShell中运行
$env:GITHUB_TOKEN = "ghp_your_token_here"

# 在同一个PowerShell窗口启动Cursor
cursor
```

---

## 步骤3️⃣：验证配置（1分钟）

### 测试1：命令行验证
```powershell
# 测试Token是否有效
curl -H "Authorization: token ghp_your_token_here" https://api.github.com/user
```

**看到您的用户信息 = 成功！✅**

### 测试2：尝试使用GitHub MCP
在Cursor中运行任何GitHub MCP操作，应该不再报错。

---

## 🎯 一键配置脚本

创建文件 `setup-github-mcp.bat`：

```batch
@echo off
echo 🔧 GitHub MCP 配置向导
echo ================================

set /p TOKEN="请粘贴您的GitHub Token: "

echo.
echo 正在设置环境变量...
setx GITHUB_TOKEN "%TOKEN%"

if %errorlevel% == 0 (
    echo ✅ 配置成功！
    echo.
    echo 请重启Cursor IDE使配置生效
    echo.
    pause
) else (
    echo ❌ 配置失败，请手动设置环境变量
    pause
)
```

**使用方法：**
1. 将上述内容保存为 `setup-github-mcp.bat`
2. 双击运行
3. 粘贴Token
4. 重启Cursor

---

## 🔍 配置验证清单

完成配置后，检查以下项：

- [ ] Token已创建（格式：`ghp_xxxxx...`）
- [ ] 权限包含 `repo`
- [ ] 环境变量 `GITHUB_TOKEN` 已设置
- [ ] Cursor已重启
- [ ] MCP不再报认证错误

---

## 🚨 仍然有问题？

### 问题1：环境变量不生效
```powershell
# 检查环境变量是否设置成功
echo $env:GITHUB_TOKEN

# 应该显示您的Token
# 如果显示为空，说明未设置成功
```

**解决方案：**
- 确保重启了Cursor
- 尝试注销Windows账户后重新登录
- 使用管理员权限运行PowerShell

### 问题2：Token权限不足
**症状：** 仍然报错但不是认证失败

**解决方案：**
1. 访问 https://github.com/settings/tokens
2. 找到您的Token，点击 "Edit"
3. 勾选所有 `repo` 相关权限
4. 点击 "Update token"

### 问题3：Token已过期
**症状：** 之前可用，现在不行

**解决方案：**
1. 删除旧Token
2. 创建新Token（选择 "No expiration" 永不过期）
3. 更新环境变量

---

## 💡 临时绕过方案

如果MCP配置仍有问题，使用以下替代方案：

### 方案A：使用部署脚本
```powershell
# 直接运行自动化部署脚本
.\deploy-github.bat
```

### 方案B：手动Git命令
```powershell
# 1. 创建仓库（在GitHub网站）
# 2. 推送代码
git remote add origin https://github.com/YOUR_USERNAME/veo-ai-platform.git
git branch -M main
git push -u origin main
```

### 方案C：使用GitHub Desktop
1. 下载GitHub Desktop：https://desktop.github.com/
2. 登录GitHub账号
3. 添加本地仓库
4. 点击 "Publish repository"

---

## 📖 相关文档

- **详细配置指南：** [GITHUB_MCP_SETUP.md](./GITHUB_MCP_SETUP.md)
- **快速部署指南：** [QUICK_START.md](./QUICK_START.md)
- **完整部署文档：** [GITHUB_DEPLOYMENT_GUIDE.md](./GITHUB_DEPLOYMENT_GUIDE.md)

---

## ✅ 配置完成后

您就可以使用GitHub MCP进行：
- ✅ 创建GitHub仓库
- ✅ 推送代码
- ✅ 管理Issues和PR
- ✅ 自动化GitHub操作

**现在就开始配置吧！只需5分钟！** 🚀
