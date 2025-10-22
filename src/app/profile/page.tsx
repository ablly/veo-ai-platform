"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/lib/toast-context"
import { 
  User, Mail, Phone, Calendar, Shield, Coins, 
  Camera, Edit2, Save, X, Loader2, LogOut 
} from "lucide-react"
import { signOut } from "next-auth/react"

interface UserProfile {
  id: string
  email: string
  name: string
  phone?: string
  avatar?: string
  wechatNickname?: string
  createdAt: string
  credits: {
    available: number
    total: number
    used: number
  }
}

export default function ProfilePage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const { success, error: showError } = useToast()
  
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
  })

  // 加载用户资料
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }

    if (status === "authenticated") {
      fetchProfile()
    }
  }, [status, router])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/user/profile")
      const data = await response.json()

      if (data.success) {
        setProfile(data.data)
        setEditForm({
          name: data.data.name || "",
          phone: data.data.phone || "",
        })
      } else {
        showError("加载失败", data.error)
      }
    } catch (err) {
      showError("加载失败", "无法加载用户资料")
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 验证文件
    if (file.size > 2 * 1024 * 1024) {
      showError("文件过大", "头像大小不能超过2MB")
      return
    }

    if (!file.type.startsWith("image/")) {
      showError("文件类型错误", "请上传图片文件")
      return
    }

    try {
      setUploadingAvatar(true)

      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/user/avatar", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        success("上传成功", "头像已更新")
        // 更新 session 中的头像
        await update({
          user: {
            image: data.data.url
          }
        })
        // 重新获取个人资料
        await fetchProfile()
      } else {
        showError("上传失败", data.error)
      }
    } catch (err) {
      showError("上传失败", "头像上传失败")
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleSaveProfile = async () => {
    try {
      setSaving(true)

      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      })

      const data = await response.json()

      if (data.success) {
        success("保存成功", "个人信息已更新")
        setEditing(false)
        await fetchProfile()
        await update() // 更新session
      } else {
        showError("保存失败", data.error)
      }
    } catch (err) {
      showError("保存失败", "无法保存个人信息")
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" })
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    )
  }

  if (!profile) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">个人中心</h1>
          <p className="text-white/70">管理您的账号信息和设置</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* 左侧 - 头像和基本信息 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardHeader>
                <CardTitle>个人资料</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 头像 */}
                <div className="flex flex-col items-center">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center overflow-hidden">
                      {profile.avatar ? (
                        <img
                          src={profile.avatar}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-16 h-16 text-white" />
                      )}
                    </div>
                    
                    <label
                      className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center"
                    >
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarUpload}
                        disabled={uploadingAvatar}
                      />
                      {uploadingAvatar ? (
                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                      ) : (
                        <Camera className="w-6 h-6 text-white" />
                      )}
                    </label>
                  </div>
                  <p className="mt-2 text-sm text-white/60">点击更换头像</p>
                </div>

                {/* 基本信息 */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <User className="w-4 h-4 text-yellow-400" />
                    <span>{profile.name || "未设置昵称"}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="w-4 h-4 text-blue-400" />
                    <span className="truncate">{profile.email}</span>
                  </div>
                  
                  {profile.phone && (
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="w-4 h-4 text-green-400" />
                      <span>{profile.phone}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="w-4 h-4 text-purple-400" />
                    <span>注册于 {new Date(profile.createdAt).toLocaleDateString("zh-CN")}</span>
                  </div>
                </div>

                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  退出登录
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* 右侧 - 详细信息和编辑 */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* 积分信息 */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-yellow-400" />
                  我的积分
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-white/5 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-400">
                      {profile.credits.available}
                    </div>
                    <div className="text-sm text-white/60 mt-1">可用积分</div>
                  </div>
                  
                  <div className="text-center p-4 bg-white/5 rounded-lg">
                    <div className="text-2xl font-bold text-green-400">
                      {profile.credits.total}
                    </div>
                    <div className="text-sm text-white/60 mt-1">累计获得</div>
                  </div>
                  
                  <div className="text-center p-4 bg-white/5 rounded-lg">
                    <div className="text-2xl font-bold text-blue-400">
                      {profile.credits.used}
                    </div>
                    <div className="text-sm text-white/60 mt-1">已使用</div>
                  </div>
                </div>

                <div className="mt-4 flex gap-3">
                  <Button
                    onClick={() => router.push("/pricing")}
                    className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black"
                  >
                    充值积分
                  </Button>
                  <Button
                    onClick={() => router.push("/credits")}
                    className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black"
                  >
                    查看明细
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 编辑信息 */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-400" />
                    账号信息
                  </CardTitle>
                  {!editing && (
                    <Button
                      onClick={() => setEditing(true)}
                      size="sm"
                      className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black"
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      编辑
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {editing ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="name">昵称</Label>
                      <Input
                        id="name"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="bg-white/5 border-white/20 text-white"
                        placeholder="输入昵称"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">手机号</Label>
                      <Input
                        id="phone"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value.replace(/\D/g, "").slice(0, 11) })}
                        className="bg-white/5 border-white/20 text-white"
                        placeholder="输入手机号"
                        maxLength={11}
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button
                        onClick={handleSaveProfile}
                        disabled={saving}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        {saving ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            保存中...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            保存
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => {
                          setEditing(false)
                          setEditForm({
                            name: profile.name || "",
                            phone: profile.phone || "",
                          })
                        }}
                        className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black"
                      >
                        <X className="w-4 h-4 mr-2" />
                        取消
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-white/60">昵称</Label>
                        <p className="mt-1">{profile.name || "未设置"}</p>
                      </div>

                      <div>
                        <Label className="text-white/60">邮箱</Label>
                        <p className="mt-1">{profile.email}</p>
                      </div>

                      <div>
                        <Label className="text-white/60">手机号</Label>
                        <p className="mt-1">{profile.phone || "未绑定"}</p>
                      </div>

                      {profile.wechatNickname && (
                        <div>
                          <Label className="text-white/60">微信</Label>
                          <p className="mt-1">{profile.wechatNickname}</p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* 快捷入口 */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardHeader>
                <CardTitle>快捷入口</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => router.push("/my-videos")}
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black"
                  >
                    我的视频
                  </Button>
                  <Button
                    onClick={() => router.push("/generate")}
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black"
                  >
                    创作视频
                  </Button>
                  <Button
                    onClick={() => router.push("/gallery")}
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black"
                  >
                    视频广场
                  </Button>
                  <Button
                    onClick={() => router.push("/docs")}
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black"
                  >
                    帮助文档
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

