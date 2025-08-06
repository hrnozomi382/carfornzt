export const dynamic = "force-dynamic"
import { executeQuery } from "@/lib/db"
import { NextResponse } from "next/server"

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const itemId = params.id
    const data = await request.json()
    
    await executeQuery(
      `UPDATE ChecklistItems 
       SET name = ?, description = ?, toolType = ?, sortOrder = ?, isRequired = ?
       WHERE id = ?`,
      [data.name, data.description, data.toolType, data.sortOrder, data.isRequired, itemId]
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating checklist item:", error)
    return NextResponse.json(
      { error: "Failed to update checklist item" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const itemId = params.id
    
    await executeQuery(
      "DELETE FROM ChecklistItems WHERE id = ?",
      [itemId]
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting checklist item:", error)
    return NextResponse.json(
      { error: "Failed to delete checklist item" },
      { status: 500 }
    )
  }
}