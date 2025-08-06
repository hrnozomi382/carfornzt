export const dynamic = "force-dynamic"
import { executeQuerySingle } from "@/lib/db"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verify } from "jsonwebtoken"

export async function GET(request: Request) {
  try {
    // ตรวจสอบ Authorization header ก่อน
    const authHeader = request.headers.get("Authorization")
    let tokenValue = null;
    let decoded;
    
    // ถ้ามี Authorization header ให้ใช้ token จาก header
    if (authHeader && authHeader.startsWith("Bearer ")) {
      tokenValue = authHeader.substring(7)
      decoded = verify(tokenValue, process.env.JWT_SECRET || "your-secret-key") as {
        id: number
        role: string
      }
    } else {
      // ถ้าไม่มี Authorization header ให้ดึง token จาก cookie
      const cookieStore = cookies()
      const token = cookieStore.get("auth_token")
      
      if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
      
      // ตรวจสอบความถูกต้องของ token
      tokenValue = token.value
      decoded = verify(tokenValue, process.env.JWT_SECRET || "your-secret-key") as {
        id: number
        role: string
      }
    }

    // รับพารามิเตอร์จาก URL
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")
    const userId = searchParams.get("userId")

    if (!email || !userId) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    // ตรวจสอบว่าอีเมลซ้ำหรือไม่ (ยกเว้นอีเมลของผู้ใช้คนนี้)
    const existingUser = await executeQuerySingle(
      `
      SELECT id FROM Users WHERE email = ? AND id != ?
      `,
      [email, userId],
    )

    return NextResponse.json({ exists: !!existingUser })
  } catch (error) {
    console.error("Error checking email:", error)
    return NextResponse.json({ error: "Failed to check email" }, { status: 500 })
  }
}
