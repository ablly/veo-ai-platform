"use client"

import { useState, useEffect } from "react"
import { Save, RefreshCw, Key, Database, Mail, Shield, Globe, Zap } from "lucide-react"

interface SystemSettings {
  // API设置
  suchuang_api_key: string
  suchuang_api_url: string
  api_cost_per_request: number
  
  // 邮件设置
  smtp_host: string
  smtp_port: number
  smtp_user: string
  smtp_password: string
  
  // 系统设置
  site_name: string
  site_description: string
  maintenance_mode: boolean
  registration_enabled: boolean
  
  // 积分设置
  default_credits: number
  max_credits_per_user: number
  credit_expiry_days: number
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>({
    suchuang_api_key: '',
    suchuang_api_url: 'https://api.wuyinkeji.com',
    api_cost_per_request: 1.1,
    smtp_host: 'smtp.qq.com',
    smtp_port: 587,
    smtp_user: '',
    smtp_password: '',
    site_name: 'VEO AI',
    site_description: '革命性的AI视频生成技术',
    maintenance_mode: false,
    registration_enabled: true,
    default_credits: 10,
    max_credits_per_user: 10000,
    credit_expiry_days: 365
  })
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('api')

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/settings')
      if (response.ok) {
        const data = await response.json()
        setSettings({ ...settings, ...data.settings })
      }
    } catch (error) {
      console.error("获取设置失败:", error)
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ settings })
      })
      
      if (response.ok) {
        alert('设置保存成功！')
      } else {
        alert('保存失败，请重试')
      }
    } catch (error) {
      console.error("保存设置失败:", error)
      alert('保存失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  const [testingApi, setTestingApi] = useState(false)
  
  const testApiConnection = async () => {
    if (!settings.suchuang_api_key || !settings.suchuang_api_url) {
      alert('请先填写API密钥和地址')
      return
    }
    
    setTestingApi(true)
    try {
      const response = await fetch('/api/admin/settings/test-api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          api_key: settings.suchuang_api_key,
          api_url: settings.suchuang_api_url
        })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const result = await response.json()
      if (result.success) {
        const data = result.data || {}
        alert('✅ API连接测试成功！\n\n' + 
              `状态码: ${data.status || '200'}\n` +
              `内容类型: ${data.contentType || 'application/json'}\n` +
              `响应时间: 正常\n` +
              `API端点: ${settings.suchuang_api_url}/user/api-list?type=4`)
      } else {
        alert(`❌ API连接测试失败:\n\n${result.message}\n\n` +
              `请检查:\n` +
              `1. API密钥是否正确\n` +
              `2. API地址是否可访问\n` +
              `3. 网络连接是否正常\n` +
              `4. API服务是否正在运行`)
      }
    } catch (error: any) {
      console.error('API测试错误:', error)
      alert(`❌ API连接测试失败:\n\n${error.message || '网络错误，请检查网络连接'}`)
    } finally {
      setTestingApi(false)
    }
  }

  const [testingEmail, setTestingEmail] = useState(false)
  
  const testEmailConnection = async () => {
    if (!settings.smtp_host || !settings.smtp_user || !settings.smtp_password) {
      alert('请先填写完整的邮件服务器配置')
      return
    }
    
    setTestingEmail(true)
    try {
      const response = await fetch('/api/admin/settings/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          smtp_host: settings.smtp_host,
          smtp_port: settings.smtp_port,
          smtp_user: settings.smtp_user,
          smtp_password: settings.smtp_password
        })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const result = await response.json()
      if (result.success) {
        alert('✅ 邮件服务测试成功！\n\n测试邮件已发送到 3533912007@qq.com')
      } else {
        alert(`❌ 邮件服务测试失败:\n\n${result.message}`)
      }
    } catch (error: any) {
      console.error('邮件测试错误:', error)
      alert(`❌ 邮件服务测试失败:\n\n${error.message || '网络错误，请检查网络连接'}`)
    } finally {
      setTestingEmail(false)
    }
  }

  const tabs = [
    { id: 'api', name: 'API设置', icon: Key },
    { id: 'email', name: '邮件设置', icon: Mail },
    { id: 'system', name: '系统设置', icon: Globe },
    { id: 'credits', name: '积分设置', icon: Zap }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">系统设置</h2>
          <p className="text-gray-600 mt-1">配置系统参数和服务设置</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={fetchSettings}
            className="flex items-center px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            刷新
          </button>
          <button 
            onClick={saveSettings}
            disabled={saving}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? '保存中...' : '保存设置'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* 标签页导航 */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.name}
                </button>
              )
            })}
          </nav>
        </div>

        {/* 标签页内容 */}
        <div className="p-6">
          {/* API设置 */}
          {activeTab === 'api' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">速创API配置</h3>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      API密钥
                    </label>
                    <input
                      type="password"
                      value={settings.suchuang_api_key}
                      onChange={(e) => setSettings({...settings, suchuang_api_key: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="输入速创API密钥"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      API地址
                    </label>
                    <input
                      type="url"
                      value={settings.suchuang_api_url}
                      onChange={(e) => setSettings({...settings, suchuang_api_url: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      每次调用成本 (元)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={settings.api_cost_per_request}
                      onChange={(e) => setSettings({...settings, api_cost_per_request: parseFloat(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <button
                      onClick={testApiConnection}
                      disabled={testingApi}
                      className={`px-4 py-2 text-white rounded-lg flex items-center space-x-2 ${
                        testingApi 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : 'bg-green-600 hover:bg-green-700'
                      }`}
                    >
                      {testingApi && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      )}
                      <span>{testingApi ? '测试中...' : '测试API连接'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 邮件设置 */}
          {activeTab === 'email' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">SMTP邮件配置</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SMTP服务器
                    </label>
                    <input
                      type="text"
                      value={settings.smtp_host}
                      onChange={(e) => setSettings({...settings, smtp_host: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      端口
                    </label>
                    <input
                      type="number"
                      value={settings.smtp_port}
                      onChange={(e) => setSettings({...settings, smtp_port: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      用户名
                    </label>
                    <input
                      type="email"
                      value={settings.smtp_user}
                      onChange={(e) => setSettings({...settings, smtp_user: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      密码
                    </label>
                    <input
                      type="password"
                      value={settings.smtp_password}
                      onChange={(e) => setSettings({...settings, smtp_password: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <button
                    onClick={testEmailConnection}
                    disabled={testingEmail}
                    className={`px-4 py-2 text-white rounded-lg flex items-center space-x-2 ${
                      testingEmail 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {testingEmail && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    )}
                    <span>{testingEmail ? '测试中...' : '测试邮件服务'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 系统设置 */}
          {activeTab === 'system' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">基础设置</h3>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      网站名称
                    </label>
                    <input
                      type="text"
                      value={settings.site_name}
                      onChange={(e) => setSettings({...settings, site_name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      网站描述
                    </label>
                    <textarea
                      value={settings.site_description}
                      onChange={(e) => setSettings({...settings, site_description: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.maintenance_mode}
                        onChange={(e) => setSettings({...settings, maintenance_mode: e.target.checked})}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">维护模式</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.registration_enabled}
                        onChange={(e) => setSettings({...settings, registration_enabled: e.target.checked})}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">允许注册</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 积分设置 */}
          {activeTab === 'credits' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">积分系统配置</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      新用户默认积分
                    </label>
                    <input
                      type="number"
                      value={settings.default_credits}
                      onChange={(e) => setSettings({...settings, default_credits: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      用户最大积分
                    </label>
                    <input
                      type="number"
                      value={settings.max_credits_per_user}
                      onChange={(e) => setSettings({...settings, max_credits_per_user: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      积分有效期 (天)
                    </label>
                    <input
                      type="number"
                      value={settings.credit_expiry_days}
                      onChange={(e) => setSettings({...settings, credit_expiry_days: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
