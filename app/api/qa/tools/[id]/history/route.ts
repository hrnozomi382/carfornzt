export const dynamic = "force-dynamic"
import { executeQuery } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const toolId = params.id

    const inspections = await executeQuery(`
      SELECT 
        i.id,
        i.inspectionDate,
        i.status,
        i.notes,
        inspector.name as inspectorName,
        approver.name as approverName,
        i.approvedAt
      FROM QAInspections i
      JOIN Users inspector ON i.inspectorId = inspector.id
      LEFT JOIN Users approver ON i.approvedBy = approver.id
      WHERE i.toolId = ?
      ORDER BY i.inspectionDate DESC
    `, [toolId])

    const inspectionsArray = Array.isArray(inspections) ? inspections : inspections.recordset || []

    const historyWithResults = await Promise.all(
      inspectionsArray.map(async (inspection) => {
        const results = await executeQuery(`
          SELECT 
            r.result,
            r.notes,
            c.name as checklistItemName
          FROM QAInspectionResults r
          JOIN ChecklistItems c ON r.checklistItemId = c.id
          WHERE r.inspectionId = ?
          ORDER BY c.sortOrder
        `, [inspection.id])

        const resultsArray = Array.isArray(results) ? results : results.recordset || []

        return {
          ...inspection,
          results: resultsArray
        }
      })
    )

    return NextResponse.json(historyWithResults)
  } catch (error) {
    console.error("Error fetching inspection history:", error)
    return NextResponse.json(
      { error: "Failed to fetch inspection history" },
      { status: 500 }
    )
  }
}