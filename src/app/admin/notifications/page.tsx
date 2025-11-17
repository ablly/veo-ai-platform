"use client"

import { useState, useEffect } from "react"
import { Mail, Send, Users, User, CheckCircle, XCircle, Clock, History } from "lucide-react"
import { useToast } from "@/lib/toast-context"

interface User {
  id: string
  email: string
  name: string
}

interface EmailHistory {
  id: string
  recipient_email: string
  subject: string
  content: string
  status: 'SUCCESS' | 'FAILED'
  error_message?: string
  sent_at: string
}

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<'send' | 'history'>('send')
  const [recipients, setRecipients] = useState<'all' | 'selected' | 'single'>('all')
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [singleUserId, setSingleUserId] = useState('')
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [emailHistory, setEmailHistory] = useState<EmailHistory[]>([])
  const [historyPage, setHistoryPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [historyLoading, setHistoryLoading] = useState(false)
  
  const toast = useToast()

  // 加载用户列表
  useEffect(() => {
    if (recipients !== 'all') {
      fetchUsers()
    }
  }, [recipients])

  // 加载邮件历史
  useEffect(() => {
    if (activeTab === 'history') {
      fetchEmailHistory()
    }
  }, [activeTab, historyPage])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users/list?limit=1000')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
      }
    } catch (error) {
      console.error('获取用户列表失败:', error)
    }
  }

  const fetchEmailHistory = async () => {
    setHistoryLoading(true)
    try {
      const response = await fetch(`/api/admin/notifications/email-history?page=${historyPage}&limit=20`)
      if (response.ok) {
        const data = await response.json()
        setEmailHistory(data.history || [])
        setTotalPages(data.totalPages || 1)
      }
    } catch (error) {
      console.error('获取邮件历史失败:', error)
    } finally {
      setHistoryLoading(false)
    }
  }

  const handleSendEmail = async () => {
    if (!subject || !content) {
      toast.error('请填写邮件主题和内容')
      return
    }

    if (recipients === 'selected' && selectedUsers.length === 0) {
      toast.error('请选择至少一个收件人')
      return
    }

    if (recipients === 'single' && !singleUserId) {
      toast.error('请选择收件人')
      return
    }

    setSending(true)
    try {
      const response = await fetch('/api/admin/notifications/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipients,
          userIds: recipients === 'selected' ? selectedUsers : undefined,
          userId: recipients === 'single' ? singleUserId : undefined,
          subject,
          content,
          templateType: 'custom'
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast.success(data.message)
        // 清空表单
        setSubject('')
        setContent('')
        setSelectedUsers([])
        setSingleUserId('')
        // 切换到历史记录
        setActiveTab('history')
        fetchEmailHistory()
      } else {
        toast.error(data.error || '发送失败')
      }
    } catch (error) {
      toast.error('网络错误，请重试')
    } finally {
      setSending(false)
    }
  }

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN')
  }

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">消息通知</h2>
          <p className="text-gray-600 mt-1">向用户发送邮件通知</p>
        </div>
      </div>

      {/* 标签页 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('send')}
              className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'send'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Mail className="w-4 h-4 mr-2" />
              发送邮件
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'history'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <History className="w-4 h-4 mr-2" />
              发送历史
            </button>
          </nav>
        </div>

        {/* 发送邮件标签页 */}
        {activeTab === 'send' && (
          <div className="p-6 space-y-6">
            {/* 收件人选择 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                收件人
              </label>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={recipients === 'all'}
                    onChange={() => setRecipients('all')}
                    className="mr-2"
                  />
                  <Users className="w-4 h-4 mr-2 text-gray-500" />
                  <span>所有用户</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={recipients === 'selected'}
                    onChange={() => setRecipients('selected')}
                    className="mr-2"
                  />
                  <Users className="w-4 h-4 mr-2 text-gray-500" />
                  <span>选择用户</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={recipients === 'single'}
                    onChange={() => setRecipients('single')}
                    className="mr-2"
                  />
                  <User className="w-4 h-4 mr-2 text-gray-500" />
                  <span>单个用户</span>
                </label>
              </div>
            </div>

            {/* 用户选择器 */}
            {(recipients === 'selected' || recipients === 'single') && (
              <div>
                <input
                  type="text"
                  placeholder="搜索用户邮箱或姓名..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3"
                />
                <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-lg">
                  {filteredUsers.map(user => (
                    <label
                      key={user.id}
                      className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer"
                    >
                      {recipients === 'selected' ? (
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedUsers([...selectedUsers, user.id])
                            } else {
                              setSelectedUsers(selectedUsers.filter(id => id !== user.id))
                            }
                          }}
                          className="mr-3"
                        />
                      ) : (
                        <input
                          type="radio"
                          checked={singleUserId === user.id}
                          onChange={() => setSingleUserId(user.id)}
                          className="mr-3"
                        />
                      )}
                      <div>
                        <div className="font-medium text-gray-900">{user.name || '未设置'}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </label>
                  ))}
                </div>
                {recipients === 'selected' && selectedUsers.length > 0 && (
                  <p className="text-sm text-gray-600 mt-2">
                    已选择 {selectedUsers.length} 个用户
                  </p>
                )}
              </div>
            )}

            {/* 邮件主题 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                邮件主题
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="输入邮件主题..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* 邮件内容 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                邮件内容
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="输入邮件内容...&#10;&#10;提示：可以使用 {{userName}} 作为用户名占位符"
                rows={10}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-500 mt-2">
                💡 提示：邮件内容支持换行，系统会自动使用精美的邮件模板
              </p>
            </div>

            {/* 发送按钮 */}
            <div className="flex items-center space-x-3">
              <button
                onClick={handleSendEmail}
                disabled={sending}
                className={`flex items-center px-6 py-3 rounded-lg text-white font-medium ${
                  sending
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {sending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    发送中...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    发送邮件
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* 发送历史标签页 */}
        {activeTab === 'history' && (
          <div className="p-6">
            {historyLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">收件人</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">主题</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">状态</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">发送时间</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {emailHistory.length > 0 ? (
                        emailHistory.map((record) => (
                          <tr key={record.id} className="hover:bg-gray-50">
                            <td className="py-4 px-4 text-sm text-gray-900">
                              {record.recipient_email}
                            </td>
                            <td className="py-4 px-4 text-sm text-gray-900">
                              {record.subject}
                            </td>
                            <td className="py-4 px-4">
                              {record.status === 'SUCCESS' ? (
                                <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  成功
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                                  <XCircle className="w-3 h-3 mr-1" />
                                  失败
                                </span>
                              )}
                            </td>
                            <td className="py-4 px-4 text-sm text-gray-500">
                              {formatDate(record.sent_at)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="text-center py-12 text-gray-500">
                            暂无发送记录
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* 分页 */}
                {totalPages > 1 && (
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      第 {historyPage} 页，共 {totalPages} 页
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setHistoryPage(Math.max(1, historyPage - 1))}
                        disabled={historyPage === 1}
                        className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                      >
                        上一页
                      </button>
                      <button
                        onClick={() => setHistoryPage(Math.min(totalPages, historyPage + 1))}
                        disabled={historyPage === totalPages}
                        className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                      >
                        下一页
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
