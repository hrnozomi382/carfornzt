import { executeQuery, executeQuerySingle } from "@/lib/db"
import { NextResponse } from "next/server"

// POST: ผู้ใช้ขอคืนรถ
export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const bookingId = Number.parseInt(params.id, 10)
    if (isNaN(bookingId)) {
      return NextResponse.json({ error: "รหัสการจองไม่ถูกต้อง" }, { status: 400 })
    }

    // รับข้อมูลจาก request body
    const data = await request.json()
    const { endMileage, carCondition, fuelLevel, notes } = data

    // ตรวจสอบว่าการจองมีอยู่จริงและอยู่ในสถานะที่ถูกต้อง
    const booking = await executeQuerySingle(
      "SELECT id, status FROM Bookings WHERE id = ?",
      [bookingId]
    )

    if (!booking) {
      return NextResponse.json({ error: "ไม่พบข้อมูลการจอง" }, { status: 404 })
    }

    if (booking.status !== "อนุมัติแล้ว") {
      return NextResponse.json({ error: "การจองนี้ไม่อยู่ในสถานะที่สามารถขอคืนรถได้" }, { status: 400 })
    }

    // อัปเดตสถานะเป็น "รอคืนรถ" พร้อมบันทึกข้อมูลที่ user ส่งมา
    await executeQuery(
      `UPDATE Bookings SET 
        status = 'รอคืนรถ',
        endMileage = ?,
        fuelLevel = ?,
        notes = CONCAT(COALESCE(notes, ''), '\n--- ข้อมูลจาก User ---\nสภาพรถ: ', ?, '\nปริมาณน้ำมัน: ', ?, COALESCE(CONCAT('\nหมายเหตุ: ', ?), ''))
      WHERE id = ?`,
      [endMileage, fuelLevel, carCondition, fuelLevel, notes || '', bookingId]
    )

    return NextResponse.json({
      success: true,
      message: "ส่งคำขอคืนรถเรียบร้อยแล้ว"
    })
  } catch (error) {
    console.error("Error requesting return:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการส่งคำขอคืนรถ" }, { status: 500 })
  }
}