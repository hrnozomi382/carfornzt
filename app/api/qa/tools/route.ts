export const dynamic = "force-dynamic"
import { executeQuery } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const tools = await executeQuery(`
      SELECT 
        t.*,
        i.inspectionDate as lastInspection,
        i.status as inspectionStatus
      FROM MeasuringTools t
      LEFT JOIN (
        SELECT 
          toolId,
          inspectionDate,
          status,
          ROW_NUMBER() OVER (PARTITION BY toolId ORDER BY inspectionDate DESC) as rn
        FROM QAInspections
      ) i ON t.id = i.toolId AND i.rn = 1
      ORDER BY t.name
    `)

    const toolsArray = Array.isArray(tools) ? tools : tools.recordset || []
    return NextResponse.json(toolsArray)
  } catch (error) {
    console.error("Error fetching tools:", error)
    return NextResponse.json(
      { error: "Failed to fetch tools" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    await executeQuery(
      `INSERT INTO MeasuringTools (name, model, serialNumber, location, status, lastCalibration, nextCalibration) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [data.name, data.model, data.serialNumber, data.location, data.status, data.lastCalibration, data.nextCalibration]
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error adding tool:", error)
    return NextResponse.json(
      { error: "Failed to add tool" },
      { status: 500 }
    )
  }
}