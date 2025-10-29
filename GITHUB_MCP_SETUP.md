# GitHub MCP 配置指南

## 🔍 问题诊断

如果您看到以下错误：
```
MCP error -32603: Authentication Failed: Bad credentials
```

这表示GitHub MCP需要配置Personal Access Token（个人访问令牌）。

---

## 📋 配置步骤

### 第1步：创建GitHub Personal Access Token

1. **登录GitHub**
   - 访问：https://github.com

2. **进入Token设置页面**
   - 点击右上角头像
   - 选择 "Settings"（设置）
   - 在左侧菜单最下方找到 "Developer settings"（开发者设置）
   - 选择 "Personal access tokens"
   - 选择 "Tokens (classic)"

   **或直接访问：**
   ```
   https://github.com/settings/tokens
   ```

3. **生成新Token**
   - 点击 "Generate new token"
   - 选择 "Generate new token (classic)"

4. **配置Token**
   ```
   Note (备注): VEO AI Platform MCP Token
   Expiration (过期时间): 90 days（或选择No expiration）
   ```

5. **选择权限范围 (Scopes)**
   
   **必需的权限：**
   - ✅ `repo` - Full control of private repositories
     - ✅ `repo:status` - Access commit status
     - ✅ `repo_deployment` - Access deployment status
     - ✅ `public_repo` - Access public repositories
     - ✅ `repo:invite` - Access repository invitations
   
   - ✅ `workflow` - Update GitHub Action workflows
   
   - ✅ `write:packages` - Upload packages to GitHub Package Registry
   
   - ✅ `admin:repo_hook` - Full control of repository hooks
     - ✅ `write:repo_hook` - Write repository hooks
     - ✅ `read:repo_hook` - Read repository hooks
   
   - ✅ `user` - Update ALL user data
     - ✅ `read:user` - Read ALL user profile data
     - ✅ `user:email` - Access user email addresses (read-only)

6. **生成Token**
   - 滚动到页面底部
   - 点击 "Generate token"
   - **重要：立即复制Token！**
   - Token只显示一次，离开页面后无法再次查看

   示例Token格式：
   ```
   ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

---

### 第2步：配置Cursor的GitHub MCP

GitHub MCP的配置取决于您使用的工具。以下是常见配置方法：

#### 方法A：通过环境变量配置

1. **Windows PowerShell（临时）：**
   ```powershell
   $env:GITHUB_TOKEN = "ghp_your_token_here"
   ```

2. **Windows系统环境变量（永久）：**
   - 按 `Win + R`，输入 `sysdm.cpl`
   - 点击 "高级" 标签
   - 点击 "环境变量"
   - 在 "用户变量" 中点击 "新建"
   - 变量名：`GITHUB_TOKEN`
   - 变量值：`ghp_your_token_here`
   - 点击 "确定"

3. **重启Cursor IDE**
   - 关闭Cursor
   - 重新打开Cursor
   - MCP会自动读取环境变量

#### 方法B：通过MCP配置文件

1. **查找MCP配置文件位置：**
   
   Windows默认位置：
   ```
   C:\Users\YourUsername\.cursor\mcp\config.json
   ```
   
   或：
   ```
   %APPDATA%\Cursor\mcp\config.json
   ```

2. **编辑配置文件：**
   ```json
   {
     "mcpServers": {
       "github": {
         "command": "node",
         "args": ["path/to/github-mcp/dist/index.js"],
         "env": {
           "GITHUB_TOKEN": "ghp_your_token_here"
         }
       }
     }
   }
   ```

3. **保存并重启Cursor**

#### 方法C：通过Git Credential Manager

1. **安装Git Credential Manager：**
   ```powershell
   winget install --id Git.Git -e --source winget
   ```

2. **配置GitHub凭据：**
   ```powershell
   git config --global credential.helper manager-core
   ```

3. **首次推送时会自动弹出GitHub登录窗口**
   - 使用Personal Access Token登录
   - 凭据会被安全存储

---

### 第3步：验证配置

#### 测试GitHub MCP连接

在Cursor中，尝试使用GitHub MCP功能，例如：

```
创建GitHub仓库测试
```

如果配置成功，应该能够正常创建仓库。

#### 或者通过命令行测试

```powershell
# 测试Token是否有效
curl -H "Authorization: token ghp_your_token_here" https://api.github.com/user
```

**成功响应示例：**
```json
{
  "login": "your_username",
  "id": 12345678,
  "name": "Your Name",
  ...
}
```

**失败响应示例：**
```json
{
  "message": "Bad credentials",
  "documentation_url": "https://docs.github.com/rest"
}
```

---

## 🔐 安全建议

### Token安全管理

1. **不要分享Token**
   - Token具有与您的GitHub账号相同的权限
   - 不要在公开场合或代码中暴露

2. **定期更换Token**
   - 建议每90天更换一次
   - 如果怀疑泄露，立即删除并重新生成

3. **使用最小权限原则**
   - 只勾选必需的权限
   - 不同用途使用不同的Token

4. **定期检查活跃Token**
   - 访问：https://github.com/settings/tokens
   - 删除不再使用的Token

### Token存储建议

❌ **不安全的做法：**
```javascript
// 不要在代码中硬编码
const token = "ghp_xxxxxxxxxxxx"
```

✅ **安全的做法：**
```javascript
// 使用环境变量
const token = process.env.GITHUB_TOKEN
```

---

## 🚨 常见问题

### 1. Token创建后立即失效
**原因：** 组织可能启用了SSO（单点登录）
**解决：** 在Token列表中点击 "Configure SSO" 并授权

### 2. 权限不足错误
**原因：** Token缺少必要权限
**解决：** 重新编辑Token，勾选缺失的权限

### 3. Token过期
**原因：** 超过了设置的过期时间
**解决：** 生成新Token并更新配置

### 4. 环境变量不生效
**原因：** 未重启应用或配置错误
**解决：** 
- 重启Cursor IDE
- 检查变量名拼写
- 确认变量值正确

---

## 🎯 配置检查清单

完成以下检查以确保配置正确：

- [ ] GitHub Personal Access Token已创建
- [ ] Token已复制并安全保存
- [ ] 勾选了所有必需的权限范围
- [ ] 环境变量已设置（`GITHUB_TOKEN`）
- [ ] Cursor IDE已重启
- [ ] 测试GitHub MCP功能正常

---

## 🔄 替代方案

如果GitHub MCP配置仍有问题，您可以使用：

### 方案1：直接使用Git命令
```powershell
git remote add origin https://github.com/username/repo.git
git push -u origin main
```

### 方案2：使用GitHub CLI
```powershell
# 安装GitHub CLI
winget install --id GitHub.cli

# 登录
gh auth login

# 创建仓库
gh repo create veo-ai-platform --public

# 推送代码
gh repo create veo-ai-platform --public --source=. --push
```

### 方案3：使用自动化脚本
```powershell
# 运行我们准备的部署脚本
.\deploy-github.bat
```

---

## 📞 获取帮助

如果配置过程中遇到问题：

1. **查看GitHub文档：**
   - https://docs.github.com/en/authentication

2. **检查Cursor日志：**
   - Cursor → Help → Toggle Developer Tools
   - 查看Console中的错误信息

3. **GitHub社区：**
   - https://github.community/

---

## ✅ 配置成功标志

当您成功配置GitHub MCP后，应该能够：

- ✅ 使用MCP创建GitHub仓库
- ✅ 直接推送文件到GitHub
- ✅ 管理仓库设置
- ✅ 创建Issue和Pull Request

恭喜！GitHub MCP配置完成！🎉
