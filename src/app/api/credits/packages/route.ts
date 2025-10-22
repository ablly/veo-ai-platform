import { NextResponse } from "next/server"
import pool from "@/lib/db"

export async function GET() {
  const client = await pool.connect()
  try {
    const result = await client.query(
      `SELECT 
        id, 
        name, 
        description,
        credits,
        price::numeric as price,
        original_price::numeric as original_price,
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
      features: row.features,
      isPopular: row.is_popular,
      isActive: row.is_active
    }))

    return NextResponse.json({
      success: true,
      packages
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
