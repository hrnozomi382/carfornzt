export const dynamic = "force-dynamic"
import { executeQuery } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const toolType = searchParams.get('toolType')
    
    let query = "SELECT * FROM ChecklistItems"
    let params: any[] = []
    
    if (toolType) {
      query += " WHERE toolType = ?"
      params.push(toolType)
    }
    
    query += " ORDER BY sortOrder, id"
    
    const checklist = await executeQuery(query, params)

    const checklistArray = Array.isArray(checklist) ? checklist : checklist.recordset || []
    return NextResponse.json(checklistArray)
  } catch (error) {
    console.error("Error fetching checklist:", error)
    return NextResponse.json(
      { error: "Failed to fetch checklist" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    await executeQuery(
      `INSERT INTO ChecklistItems (name, description, toolType, sortOrder, isRequired) 
       VALUES (?, ?, ?, ?, ?)`,
      [data.name, data.description, data.toolType, data.sortOrder, data.isRequired]
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error adding checklist item:", error)
    return NextResponse.json(
      { error: "Failed to add checklist item" },
      { status: 500 }
    )
  }
}