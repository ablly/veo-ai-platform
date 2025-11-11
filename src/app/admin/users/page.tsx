"use client"

import { useState, useEffect } from "react"
import { Search, Eye, Edit, Trash2, Plus, Filter, X, Save } from "lucide-react"
import { useToast } from "@/lib/toast-context"

interface User {
  id: string
  email: string
  name: string
  avatar?: string
  created_at: string
  status: 'active' | 'inactive' | 'banned'
  available_credits: number
  total_credits: number
  used_credits: number
  total_orders: number
  total_videos: number
}


export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showUserModal, setShowUserModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
         const [editForm, setEditForm] = useState({
           credits: 0,
           action: 'add' as 'add' | 'set'
         })
  const [addForm, setAddForm] = useState({
    email: '',
    name: '',
    credits: 0,
    packageId: '',
    status: 'active' as 'active' | 'inactive' | 'banned'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const toast = useToast()

  useEffect(() => {
    fetchUsers()
  }, [currentPage, searchTerm, statusFilter])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20",
        search: searchTerm,
        status: statusFilter
      })
      
      const response = await fetch(`/api/admin/users/list?${params}`)
      
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
        setTotalPages(data.totalPages || 1)
      } else {
        toast.error("获取用户列表失败")
      }
    } catch (error) {
      toast.error("网络错误，请检查网络连接")
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: "正常", className: "bg-green-100 text-green-800" },
      inactive: { label: "未激活", className: "bg-yellow-100 text-yellow-800" },
      banned: { label: "已封禁", className: "bg-red-100 text-red-800" }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.className}`}>
        {config.label}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // 查看用户详情
  const handleViewUser = async (user: User) => {
    try {
      const response = await fetch(`/api/admin/users/${user.id}/details`)
      if (response.ok) {
        const data = await response.json()
        setSelectedUser(data.user)
        setShowUserModal(true)
      } else {
        toast.error("获取用户详情失败")
      }
    } catch (error) {
      toast.error("获取用户详情失败")
    }
  }

         // 编辑用户
         const handleEditUser = (user: User) => {
           setEditingUser(user)
           setEditForm({
             credits: 0,
             action: 'add'
           })
           setShowEditModal(true)
         }

  // 保存用户编辑
  const handleSaveUser = async () => {
    if (!editingUser || isSubmitting) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/admin/users/${editingUser.id}/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
      })

      if (response.ok) {
        toast.success("用户信息更新成功")
        setShowEditModal(false)
        fetchUsers() // 刷新用户列表
      } else {
        const data = await response.json()
        toast.error(data.error || "更新失败")
      }
    } catch (error) {
      toast.error("网络错误，请重试")
    } finally {
      setIsSubmitting(false)
    }
  }

  // 删除用户
  const handleDeleteUser = async (user: User) => {
    if (!confirm(`确定要删除用户 ${user.email} 吗？此操作不可恢复。`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success("用户删除成功")
        fetchUsers() // 刷新用户列表
      } else {
        toast.error("删除用户失败")
      }
    } catch (error) {
      toast.error("删除用户失败")
    }
  }

  // 添加用户
  const handleAddUser = () => {
    setAddForm({
      email: '',
      name: '',
      credits: 0,
      packageId: '',
      status: 'active'
    })
    setShowAddModal(true)
  }

  // 保存新用户
  const handleSaveNewUser = async () => {
    if (!addForm.email) {
      toast.error("邮箱不能为空")
      return
    }

    if (isSubmitting) return

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/admin/users/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(addForm)
      })

      if (response.ok) {
        toast.success("用户添加成功")
        setShowAddModal(false)
        setAddForm({
          email: '',
          name: '',
          credits: 0,
          packageId: '',
          status: 'active'
        })
        fetchUsers() // 刷新用户列表
      } else {
        const data = await response.json()
        toast.error(data.error || "添加用户失败")
      }
    } catch (error) {
      toast.error("网络错误，请重试")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">用户管理</h2>
          <p className="text-gray-600 mt-1">管理平台用户账户和权限</p>
        </div>
        <button 
          onClick={handleAddUser}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          添加用户
        </button>
      </div>

      {/* 搜索和筛选 */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="搜索用户邮箱或姓名..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">全部状态</option>
              <option value="active">正常</option>
              <option value="inactive">未激活</option>
              <option value="banned">已封禁</option>
            </select>
          </div>
        </div>
      </div>

      {/* 用户列表 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">用户信息</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">状态</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">积分信息</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">使用统计</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">注册时间</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.length > 0 ? (
                    users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              {user.avatar ? (
                                <img 
                                  src={user.avatar} 
                                  alt={user.name}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                <span className="text-blue-600 font-medium">
                                  {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{user.name || "未设置"}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          {getStatusBadge(user.status)}
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm">
                            <div className="text-gray-900">可用: {user.available_credits}</div>
                            <div className="text-gray-500">总计: {user.total_credits}</div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm">
                            <div className="text-gray-900">{user.total_orders} 笔订单</div>
                            <div className="text-gray-500">{user.total_videos} 个视频</div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-500">
                          {formatDate(user.created_at)}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-end space-x-2">
                            <button 
                              onClick={() => handleViewUser(user)}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                              title="查看详情"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleEditUser(user)}
                              className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg"
                              title="编辑用户"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteUser(user)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                              title="删除用户"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-gray-500">
                        暂无用户数据
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* 分页 */}
            {totalPages > 1 && (
              <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  第 {currentPage} 页，共 {totalPages} 页
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                  >
                    上一页
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
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

      {/* 用户详情模态框 */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">用户详情</h3>
              <button 
                onClick={() => setShowUserModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
                  <p className="text-sm text-gray-900">{selectedUser.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">姓名</label>
                  <p className="text-sm text-gray-900">{selectedUser.name || "未设置"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
                  {getStatusBadge(selectedUser.status)}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">注册时间</label>
                  <p className="text-sm text-gray-900">{formatDate(selectedUser.createdAt || selectedUser.created_at)}</p>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-2">积分信息</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">可用积分</label>
                    <p className="text-lg font-semibold text-green-600">{selectedUser.credits?.available || selectedUser.available_credits || 0}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">总积分</label>
                    <p className="text-lg font-semibold text-blue-600">{selectedUser.credits?.total || selectedUser.total_credits || 0}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">已使用</label>
                    <p className="text-lg font-semibold text-gray-600">{selectedUser.credits?.used || selectedUser.used_credits || 0}</p>
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-2">使用统计</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">订单数量</label>
                    <p className="text-lg font-semibold text-purple-600">{selectedUser.total_orders || 0}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">视频数量</label>
                    <p className="text-lg font-semibold text-orange-600">{selectedUser.total_videos || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 编辑用户模态框 */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">编辑用户</h3>
              <button 
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">用户邮箱</label>
                <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{editingUser.email}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">积分操作</label>
                <select
                  value={editForm.action}
                  onChange={(e) => setEditForm({...editForm, action: e.target.value as 'add' | 'set'})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="add">增加积分</option>
                  <option value="set">设置积分</option>
                </select>
              </div>
              
                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">积分数量</label>
                       <input
                         type="number"
                         value={editForm.credits}
                         onChange={(e) => setEditForm({...editForm, credits: parseInt(e.target.value) || 0})}
                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                         placeholder="输入积分数量"
                         min="0"
                       />
                     </div>
              
              <div className="flex items-center space-x-3 pt-4">
                <button
                  onClick={handleSaveUser}
                  disabled={isSubmitting}
                  className={`flex-1 flex items-center justify-center px-4 py-2 rounded-lg text-white ${
                    isSubmitting 
                      ? 'bg-blue-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {isSubmitting ? '保存中...' : '保存'}
                </button>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 添加用户模态框 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">添加用户</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">邮箱 *</label>
                <input
                  type="email"
                  value={addForm.email}
                  onChange={(e) => setAddForm({...addForm, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="输入用户邮箱"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">姓名</label>
                <input
                  type="text"
                  value={addForm.name}
                  onChange={(e) => setAddForm({...addForm, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="输入用户姓名（可选）"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">用户状态</label>
                <select
                  value={addForm.status}
                  onChange={(e) => setAddForm({...addForm, status: e.target.value as 'active' | 'inactive' | 'banned'})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">正常</option>
                  <option value="inactive">未激活</option>
                  <option value="banned">已封禁</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">初始积分</label>
                <input
                  type="number"
                  value={addForm.credits}
                  onChange={(e) => setAddForm({...addForm, credits: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="输入初始积分数量"
                  min="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">选择套餐</label>
                <select
                  value={addForm.packageId}
                  onChange={(e) => setAddForm({...addForm, packageId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">无套餐</option>
                  {packages.map(pkg => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.name} - {pkg.credits}积分 (¥{pkg.price})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center space-x-3 pt-4">
                <button
                  onClick={handleSaveNewUser}
                  disabled={isSubmitting}
                  className={`flex-1 flex items-center justify-center px-4 py-2 rounded-lg text-white ${
                    isSubmitting 
                      ? 'bg-blue-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {isSubmitting ? '添加中...' : '添加用户'}
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
