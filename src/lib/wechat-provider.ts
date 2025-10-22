import { OAuthConfig, OAuthUserConfig } from "next-auth/providers/oauth"

export interface WeChatProfile {
  openid: string
  nickname: string
  sex: number
  language: string
  city: string
  province: string
  country: string
  headimgurl: string
  privilege: string[]
  unionid?: string
}

export default function WeChatProvider<P extends WeChatProfile>(
  options: OAuthUserConfig<P>
): OAuthConfig<P> {
  return {
    id: "wechat",
    name: "WeChat",
    type: "oauth",
    authorization: {
      url: "https://open.weixin.qq.com/connect/qrconnect",
      params: {
        scope: "snsapi_login",
        response_type: "code",
      },
    },
    token: "https://api.weixin.qq.com/sns/oauth2/access_token",
    userinfo: {
      url: "https://api.weixin.qq.com/sns/userinfo",
      async request({ tokens, provider }) {
        const response = await fetch(
          `${provider.userinfo?.url}?access_token=${tokens.access_token}&openid=${tokens.openid}&lang=zh_CN`
        )
        return await response.json()
      },
    },
    profile(profile) {
      return {
        id: profile.openid,
        name: profile.nickname,
        email: null, // 微信不提供邮箱
        image: profile.headimgurl,
        // 自定义字段
        openid: profile.openid,
        unionid: profile.unionid,
        sex: profile.sex,
        city: profile.city,
        province: profile.province,
        country: profile.country,
      }
    },
    style: {
      logo: "https://res.wx.qq.com/connect/zh_CN/htmledition/res/assets/res-wx-logo.png",
      logoDark: "https://res.wx.qq.com/connect/zh_CN/htmledition/res/assets/res-wx-logo.png",
      bg: "#07c160",
      text: "#fff",
      bgDark: "#07c160",
      textDark: "#fff",
    },
    options,
  }
}



