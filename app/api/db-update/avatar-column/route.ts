import { executeQuery } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    // ตรวจสอบว่าคอลัมน์ avatar_url มีอยู่แล้วหรือไม่
    const checkColumnResult = await executeQuery(
      `
      SELECT COUNT(*) as count
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'Users'
      AND COLUMN_NAME = 'avatar_url'
      `,
      [],
    )

    const checkRecords = Array.isArray(checkColumnResult) ? checkColumnResult : (checkColumnResult as any)?.recordset || [];
    const columnExists = checkRecords.length > 0 && checkRecords[0].count > 0

    if (columnExists) {
      return NextResponse.json({ message: "Column avatar_url already exists in Users table" })
    } else {
      // เพิ่มคอลัมน์ avatar_url
      await executeQuery(
        `
        ALTER TABLE Users ADD avatar_url NVARCHAR(255) NULL
        `,
        [],
      )
      return NextResponse.json({ message: "Column avatar_url added successfully" })
    }
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to add avatar_url column" }, { status: 500 })
  }
}
