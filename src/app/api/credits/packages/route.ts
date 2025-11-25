import { NextResponse, NextRequest } from "next/server"
import pool from "@/lib/db"

// 智能地区检测函数
function detectRegion(request: NextRequest): 'CN' | 'INTL' {
  // 1. 优先使用Cookie中的用户选择
  const cookieRegion = request.cookies.get('user_region')?.value
  if (cookieRegion === 'CN' || cookieRegion === 'INTL') {
    return cookieRegion as 'CN' | 'INTL'
  }

  // 2. 检测Cloudflare的国家代码（如果使用Cloudflare CDN）
  const cfCountry = request.headers.get('CF-IPCountry')
  if (cfCountry === 'CN') {
    return 'CN'
  }

  // 3. 检测Accept-Language头
  const acceptLanguage = request.headers.get('Accept-Language') || ''
  if (acceptLanguage.includes('zh-CN') || acceptLanguage.includes('zh')) {
    return 'CN'
  }

  // 4. 检测X-Forwarded-For或其他IP相关头（简单判断）
  const forwardedFor = request.headers.get('X-Forwarded-For')
  // 这里可以添加更复杂的IP地址库查询，暂时简化处理

  // 5. 默认返回CN（因为主要用户群体是国内）
  return 'CN'
}

export async function GET(request: NextRequest) {
  const client = await pool.connect()
  try {
    // 使用智能地区检测
    const region = detectRegion(request)
    
    const result = await client.query(
      `SELECT 
        id, 
        name, 
        description,
        credits,
        price::numeric as price,
        original_price::numeric as original_price,
        usd_price::numeric as usd_price,
        stripe_price_id,
        features,
        is_popular,
        is_active,
        sort_order
      FROM credit_packages 
      WHERE is_active = true
      ORDER BY sort_order ASC, price ASC`
    )

    const packages = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      credits: row.credits,
      price: parseFloat(row.price),
      originalPrice: parseFloat(row.original_price),
      usdPrice: row.usd_price ? parseFloat(row.usd_price) : null,
      stripePriceId: row.stripe_price_id,
      features: Array.isArray(row.features) 
        ? row.features 
        : (typeof row.features === 'string' 
          ? JSON.parse(row.features) 
          : []),
      isPopular: row.is_popular,
      isActive: row.is_active,
      region: region
    }))

    return NextResponse.json({
      success: true,
      packages,
      region
    })
  } catch (error) {
    console.error("获取积分套餐失败:", error)
    return NextResponse.json(
      { error: "获取积分套餐失败", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  } finally {
    client.release()
  }
}
