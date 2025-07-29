import { executeQuerySingle } from "@/lib/db"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verify } from "jsonwebtoken"

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // ตรวจสอบ Authorization header ก่อน
    const authHeader = request.headers.get("Authorization")
    console.log("ME API - Authorization header:", authHeader ? "Present" : "Not present")
    
    let tokenValue = null;
    
    // ถ้ามี Authorization header ให้ใช้ token จาก header
    if (authHeader && authHeader.startsWith("Bearer ")) {
      tokenValue = authHeader.substring(7)
      console.log("ME API - Using token from Authorization header")
    } else {
      // ถ้าไม่มี Authorization header ให้ดึง token จาก cookie
      const cookieStore = cookies()
      const token = cookieStore.get("auth_token")
      console.log("ME API - Token found in cookie:", token ? "Yes" : "No")
      
      if (token) {
        tokenValue = token.value
        console.log("ME API - Using token from cookie")
      }
    }
    
    if (!tokenValue) {
      return NextResponse.json({ error: "Unauthorized - No token found" }, { status: 401 })
    }

    // ตรวจสอบความถูกต้องของ token
    const decoded = verify(tokenValue, process.env.JWT_SECRET || "your-secret-key") as {
      id: number
    }

    console.log("ME API - Token verified, user ID:", decoded.id)

    // ดึงข้อมูลผู้ใช้จากฐานข้อมูล
    const user = await executeQuerySingle(
      `
      SELECT id, name, email, department, role, phone, employeeId, avatar
      FROM Users
      WHERE id = ?
      `,
      [decoded.id],
    )

    console.log("ME API - User found:", user ? "Yes" : "No")

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error fetching user data:", error)
    return NextResponse.json({ error: "Authentication failed" }, { status: 401 })
  }
}
