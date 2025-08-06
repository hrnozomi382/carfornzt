export const dynamic = "force-dynamic"
import { executeQuery, executeQuerySingle } from "@/lib/db"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verify } from "jsonwebtoken"

export async function POST(request: Request) {
  try {
    // ตรวจสอบ authentication
    const cookieStore = cookies()
    const token = cookieStore.get("auth_token")
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verify(token.value, process.env.JWT_SECRET || "your-secret-key") as {
      id: number
      role: string
    }

    // ตรวจสอบว่าเป็นแผนก QA
    const user = await executeQuerySingle(
      "SELECT department FROM Users WHERE id = ?",
      [decoded.id]
    )

    if (!user || user.department !== "QA") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const { toolId, results, notes, generalNotes } = await request.json()

    // สร้างการตรวจเช็คใหม่
    const inspectionResult = await executeQuery(
      `INSERT INTO QAInspections (toolId, inspectorId, inspectionDate, status, notes) 
       VALUES (?, ?, CURDATE(), 'completed', ?)`,
      [toolId, decoded.id, generalNotes]
    )

    const inspectionId = (inspectionResult as any)?.insertId || (inspectionResult as any)?.recordset?.insertId

    // บันทึกผลการตรวจเช็คแต่ละรายการ
    for (const [itemId, result] of Object.entries(results)) {
      await executeQuery(
        `INSERT INTO QAInspectionResults (inspectionId, checklistItemId, result, notes) 
         VALUES (?, ?, ?, ?)`,
        [inspectionId, parseInt(itemId), result, notes[itemId] || null]
      )
    }

    return NextResponse.json({ 
      success: true, 
      inspectionId 
    })
  } catch (error) {
    console.error("Error creating inspection:", error)
    return NextResponse.json(
      { error: "Failed to create inspection" },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // ดึงรายการการตรวจเช็คที่รอการอนุมัติ
    const inspections = await executeQuery(`
      SELECT 
        i.*,
        t.name as toolName,
        t.model,
        t.serialNumber,
        u.name as inspectorName
      FROM QAInspections i
      JOIN MeasuringTools t ON i.toolId = t.id
      JOIN Users u ON i.inspectorId = u.id
      WHERE i.status = 'completed'
      ORDER BY i.createdAt DESC
    `)

    const inspectionsArray = Array.isArray(inspections) ? inspections : (inspections as any)?.recordset || []
    return NextResponse.json(inspectionsArray)
  } catch (error) {
    console.error("Error fetching inspections:", error)
    return NextResponse.json(
      { error: "Failed to fetch inspections" },
      { status: 500 }
    )
  }
}