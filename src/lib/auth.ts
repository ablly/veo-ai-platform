import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
// import EmailProvider from "next-auth/providers/email" // 暂时禁用邮箱登录
import bcryptjs from "bcryptjs"
import { Pool } from "pg"
import WeChatProvider from "./wechat-provider"
import { PRODUCTION_CONFIG } from "@/config/production"

// 临时直接创建连接池
const pool = new Pool({
  connectionString: "postgresql://postgres:bxbbyffb4y4djTx3@db.hblthmkkdfkzvpywlthq.supabase.co:5432/postgres",
  ssl: { rejectUnauthorized: false },
  max: 5,
})

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
    // 手机验证码登录
    CredentialsProvider({
      id: "phone-code",
      name: "phone-code",
      credentials: {
        phone: { label: "Phone", type: "text" },
        code: { label: "Code", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.code) {
          return null
        }

        try {
          // 调用验证码验证API
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
              email: data.user.email,
              name: data.user.name,
              image: data.user.avatar, // NextAuth 使用 image 字段
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
    // 微信登录
    WeChatProvider({
      clientId: process.env.WECHAT_APP_ID!,
      clientSecret: process.env.WECHAT_APP_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, trigger, session: updateSession }) {
      // 当用户首次登录时
      if (user) {
        return {
          ...token,
          id: user.id,
          image: user.image || user.avatar,
          openid: user.openid,
          unionid: user.unionid,
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
          id: token.id,
          image: token.image,
          openid: token.openid,
          unionid: token.unionid,
        },
      }
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === "wechat") {
        const client = await pool.connect()
        
        try {
          // 查找是否已存在微信用户
          let userResult = await client.query(
            'SELECT * FROM users WHERE wechat_openid = $1',
            [user.openid]
          )

          if (userResult.rows.length === 0) {
            // 创建新的微信用户
            const newUserResult = await client.query(
              `INSERT INTO users (wechat_openid, wechat_unionid, wechat_nickname, name, avatar, created_at) 
               VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *`,
              [user.openid, user.unionid, user.name, user.name, user.image]
            )
            
            const newUser = newUserResult.rows[0]
            user.id = newUser.id

            // 给新用户赠送积分
            await client.query(
              `INSERT INTO user_credits (user_id, balance, created_at, updated_at)
               VALUES ($1, $2, NOW(), NOW())`,
              [newUser.id, PRODUCTION_CONFIG.CREDITS.NEW_USER_BONUS]
            )

            // 记录积分交易
            await client.query(
              `INSERT INTO credit_transactions (user_id, type, amount, description, created_at)
               VALUES ($1, 'BONUS', $2, '新用户注册奖励', NOW())`,
              [newUser.id, PRODUCTION_CONFIG.CREDITS.NEW_USER_BONUS]
            )

            console.log(`✅ 新用户通过微信注册: ${user.name}, 赠送积分: ${PRODUCTION_CONFIG.CREDITS.NEW_USER_BONUS}`)
          } else {
            // 更新现有用户信息
            const existingUser = userResult.rows[0]
            user.id = existingUser.id
            
            await client.query(
              `UPDATE users SET wechat_nickname = $1, name = $2, avatar = $3, updated_at = NOW() 
               WHERE id = $4`,
              [user.name, user.name, user.image, existingUser.id]
            )

            console.log(`✅ 用户通过微信登录: ${user.name}`)
          }
          
          return true
        } catch (error) {
          console.error("❌ 微信登录处理失败:", error)
          return false
        } finally {
          client.release()
        }
      }
      
      return true
    },
  },
}
