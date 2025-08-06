export const dynamic = "force-dynamic"
import { executeQuery, executeQuerySingle } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const toolId = params.id
    
    const tool = await executeQuerySingle(
      "SELECT * FROM MeasuringTools WHERE id = ?",
      [toolId]
    )

    if (!tool) {
      return NextResponse.json(
        { error: "Tool not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(tool)
  } catch (error) {
    console.error("Error fetching tool:", error)
    return NextResponse.json(
      { error: "Failed to fetch tool" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const toolId = params.id
    const data = await request.json()
    
    await executeQuery(
      `UPDATE MeasuringTools 
       SET name = ?, model = ?, serialNumber = ?, location = ?, status = ?, lastCalibration = ?, nextCalibration = ?
       WHERE id = ?`,
      [data.name, data.model, data.serialNumber, data.location, data.status, data.lastCalibration, data.nextCalibration, toolId]
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating tool:", error)
    return NextResponse.json(
      { error: "Failed to update tool" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const toolId = params.id
    
    await executeQuery(
      "DELETE FROM MeasuringTools WHERE id = ?",
      [toolId]
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting tool:", error)
    return NextResponse.json(
      { error: "Failed to delete tool" },
      { status: 500 }
    )
  }
}