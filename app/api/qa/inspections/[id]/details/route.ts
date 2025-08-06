import { NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const inspectionId = parseInt(params.id)

    const details = await executeQuery(`
      SELECT 
        c.name as checklistItemName,
        r.result,
        r.notes
      FROM QAInspectionResults r
      JOIN ChecklistItems c ON r.checklistItemId = c.id
      WHERE r.inspectionId = ?
      ORDER BY c.sortOrder
    `, [inspectionId])

    const detailsArray = Array.isArray(details) ? details : details.recordset || []
    return NextResponse.json(detailsArray)
  } catch (error) {
    console.error("Error fetching inspection details:", error)
    return NextResponse.json(
      { error: "Failed to fetch inspection details" },
      { status: 500 }
    )
  }
}