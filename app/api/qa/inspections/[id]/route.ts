import { NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const inspectionId = parseInt(params.id)

    // Delete inspection results first (foreign key constraint)
    await executeQuery(
      "DELETE FROM QAInspectionResults WHERE inspectionId = ?",
      [inspectionId]
    )

    // Delete the inspection
    await executeQuery(
      "DELETE FROM QAInspections WHERE id = ?",
      [inspectionId]
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting inspection:", error)
    return NextResponse.json(
      { error: "Failed to delete inspection" },
      { status: 500 }
    )
  }
}