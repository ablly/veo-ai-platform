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

        const client = await pool.connect()
        
        try {
          // 直接查询数据库验证验证码
          const codeResult = await client.query(
            `SELECT id, email, code, expires_at, used 
             FROM email_verification_codes 
             WHERE email = $1 
               AND code = $2 
               AND used = false 
               AND expires_at > NOW()
             ORDER BY created_at DESC 
             LIMIT 1`,
            [credentials.email, credentials.code]
          )

          if (codeResult.rows.length === 0) {
            console.log("❌ 邮箱验证码无效或已过期")
            return null
          }

          const verificationCode = codeResult.rows[0]

          // 标记验证码为已使用
          await client.query(
            'UPDATE email_verification_codes SET used = true WHERE id = $1',
            [verificationCode.id]
          )

          // 获取用户信息
          const userResult = await client.query(
            'SELECT id, email, name, avatar, email_verified FROM users WHERE email = $1',
            [credentials.email]
          )

          if (userResult.rows.length === 0) {
            console.log("❌ 用户不存在")
            return null
          }

          const user = userResult.rows[0]

          // 标记邮箱为已验证（如果还未验证）
          if (!user.email_verified) {
            await client.query(
              'UPDATE users SET email_verified = NOW() WHERE id = $1',
              [user.id]
            )
          }

          console.log("✅ 邮箱验证码登录成功:", user.email)

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.avatar, // NextAuth 使用 image 字段
            avatar: user.avatar,
          }
        } catch (error) {
          console.error("❌ 邮箱验证码登录错误:", error)
          return null
        } finally {
          client.release()
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
