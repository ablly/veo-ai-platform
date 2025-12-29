import { NextResponse } from "next/server"

// IndexNow API Key - 用于向搜索引擎提交URL更新
// 从 Bing Webmaster Tools 生成的密钥
const INDEXNOW_KEY = "3c443b360baa41c6b8d938a4988bbf62"

// 支持的搜索引擎
const SEARCH_ENGINES = [
  "https://api.indexnow.org/indexnow",
  "https://www.bing.com/indexnow",
  "https://yandex.com/indexnow",
]

/**
 * GET /api/indexnow - 返回 IndexNow 密钥（用于验证）
 */
export async function GET() {
  return new NextResponse(INDEXNOW_KEY, {
    headers: {
      "Content-Type": "text/plain",
    },
  })
}

/**
 * POST /api/indexnow - 提交URL到搜索引擎
 * 
 * Body: { urls: string[] } 或 { url: string }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const urls: string[] = body.urls || (body.url ? [body.url] : [])

    if (urls.length === 0) {
      return NextResponse.json(
        { error: "请提供要提交的URL" },
        { status: 400 }
      )
    }

    const host = "www.veo-ai.site"
    const keyLocation = `https://${host}/3c443b360baa41c6b8d938a4988bbf62.txt`

    const results = []

    for (const engine of SEARCH_ENGINES) {
      try {
        const response = await fetch(engine, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            host,
            key: INDEXNOW_KEY,
            keyLocation,
            urlList: urls,
          }),
        })

        results.push({
          engine,
          status: response.status,
          success: response.status === 200 || response.status === 202,
        })
      } catch (error) {
        results.push({
          engine,
          status: 0,
          success: false,
          error: (error as Error).message,
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: "URL已提交到搜索引擎",
      results,
      submittedUrls: urls,
    })
  } catch (error) {
    console.error("IndexNow提交错误:", error)
    return NextResponse.json(
      { error: "提交失败", details: (error as Error).message },
      { status: 500 }
    )
  }
}
