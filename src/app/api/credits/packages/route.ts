import { NextResponse, NextRequest } from "next/server"
import pool from "@/lib/db"

export async function GET(request: NextRequest) {
  const client = await pool.connect()
  try {
    // 从Cookie获取用户地区
    const region = request.cookies.get('user_region')?.value || 'INTL'
    
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
