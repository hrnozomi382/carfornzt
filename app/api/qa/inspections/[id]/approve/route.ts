export const dynamic = "force-dynamic"
import { executeQuery } from "@/lib/db"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verify } from "jsonwebtoken"

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get("auth_token")
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verify(token.value, process.env.JWT_SECRET || "your-secret-key") as {
      id: number
    }

    const inspectionId = params.id

    await executeQuery(
      `UPDATE QAInspections 
       SET status = 'approved', approvedBy = ?, approvedAt = NOW() 
       WHERE id = ?`,
      [decoded.id, inspectionId]
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error approving inspection:", error)
    return NextResponse.json(
      { error: "Failed to approve inspection" },
      { status: 500 }
    )
  }
}