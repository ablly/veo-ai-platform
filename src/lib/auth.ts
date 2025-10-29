import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
// import EmailProvider from "next-auth/providers/email" // 暂时禁用邮箱登录
import bcryptjs from "bcryptjs"
import { pool } from "./db"
// import WeChatProvider from "./wechat-provider" // 移除微信登录
// import { PRODUCTION_CONFIG } from "@/config/production" // 暂时不需要

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const client = await pool.connect()
        
        try {
          // 从数据库查询用户
          const result = await client.query(
            'SELECT id, email, name, avatar, password FROM users WHERE email = $1',
            [credentials.email]
          )

          if (result.rows.length === 0) {
            return null
          }

          const user = result.rows[0]

          // 验证密码
          const isPasswordValid = await bcryptjs.compare(
            credentials.password,
            user.password || ""
          )

          if (!isPasswordValid) {
            return null
          }

          console.log("✅ 用户登录成功:", user.email)

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.avatar, // NextAuth 使用 image 字段
            avatar: user.avatar,
          }
        } catch (error) {
          console.error("❌ 登录认证错误:", error)
          return null
        } finally {
          client.release()
        }
      }
    }),
    CredentialsProvider({
      id: "email-code",
      name: "email-code",
      credentials: {
        email: { label: "Email", type: "email" },
        code: { label: "Code", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.code) {
          return null
        }

        try {
          // 调用验证码验证API
          const response = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/verify-code`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: credentials.email,
              code: credentials.code
            })
          })

          const data = await response.json()

          if (response.ok && data.success) {
            console.log("✅ 邮箱验证码登录成功:", data.user.email)
            return {
              id: data.user.id,
              email: data.user.email,
              name: data.user.name,
              image: data.user.avatar, // NextAuth 使用 image 字段
              avatar: data.user.avatar,
            }
          } else {
            console.log("❌ 邮箱验证码登录失败:", data.error)
            return null
          }
        } catch (error) {
          console.error("❌ 邮箱验证码登录错误:", error)
          return null
        }
      }
    }),
    CredentialsProvider({
      id: "phone-code",
      name: "phone-code",
      credentials: {
        phone: { label: "Phone", type: "tel" },
        code: { label: "Code", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.code) {
          return null
        }

        try {
          // 调用手机验证码验证API
          const response = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/verify-phone-code`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              phone: credentials.phone,
              code: credentials.code
            })
          })

          const data = await response.json()

          if (response.ok && data.success) {
            console.log("✅ 手机验证码登录成功:", data.user.phone)
            return {
              id: data.user.id,
              phone: data.user.phone,
              name: data.user.name,
              image: data.user.avatar,
              avatar: data.user.avatar,
            }
          } else {
            console.log("❌ 手机验证码登录失败:", data.error)
            return null
          }
        } catch (error) {
          console.error("❌ 手机验证码登录错误:", error)
          return null
        }
      }
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session: updateSession }) {
      // 当用户首次登录时
      if (user) {
        return {
          ...token,
          id: user.id,
          phone: (user as any).phone,
          image: user.image || (user as any).avatar,
        }
      }
      
      // 当session更新时（如头像更新后）
      if (trigger === "update" && updateSession) {
        return {
          ...token,
          image: updateSession.user?.image || token.image,
        }
      }
      
      return token
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id as string,
          phone: token.phone as string,
          image: token.image as string,
        },
      }
    },
    async signIn() {
      // 移除微信登录处理，现在只支持邮箱和手机号登录
      return true
    },
  },
}
