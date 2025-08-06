export const dynamic = "force-dynamic"
import { executeQuery } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const bookingId = params.id

    // Get booking details
    const booking = await executeQuery(
      `SELECT b.carId, b.notes, c.name as carName FROM Bookings b JOIN Cars c ON b.carId = c.id WHERE b.id = ?`,
      [bookingId]
    )
    
    const bookingRecords = Array.isArray(booking) ? booking : (booking as any)?.recordset || [];
    if (bookingRecords.length > 0) {
      const bookingData = bookingRecords[0]
      
      // Create maintenance record
      await executeQuery(
        `INSERT INTO Maintenance (carId, serviceDate, serviceType, description, createdBy) VALUES (?, CURDATE(), 'ซ่อมแก้ไข', ?, 1)`,
        [bookingData.carId, bookingData.notes]
      )
      
      // Update car status to maintenance
      await executeQuery(
        `UPDATE Cars SET status = 'ซ่อมบำรุง' WHERE id = ?`,
        [bookingData.carId]
      )
    }

    // Update booking to mark as repaired
    await executeQuery(
      `UPDATE Bookings SET notes = CONCAT(notes, ' [แจ้งซ่อมแล้ว]') WHERE id = ?`,
      [bookingId]
    )

    return NextResponse.json({ 
      success: true, 
      status: "แจ้งซ่อมแล้ว" 
    })
  } catch (error) {
    console.error("Error marking as repaired:", error)
    return NextResponse.json(
      { error: "Failed to mark as repaired" },
      { status: 500 }
    )
  }
}