export const dynamic = "force-dynamic"
import { executeQuery } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    
    console.log('Fetching damage reports...', type)
    
    let whereCondition = ''
    if (type === 'history') {
      whereCondition = "AND b.notes LIKE '%[แจ้งซ่อมแล้ว]%'"
    } else {
      whereCondition = "AND b.notes NOT LIKE '%[แจ้งซ่อมแล้ว]%'"
    }
    
    const reports = await executeQuery(`
      SELECT 
        b.id,
        b.id as bookingId,
        b.carId,
        b.userId,
        'ไม่ปกติ' as carCondition,
        b.notes,
        b.createdAt as reportDate,
        b.startMileage,
        b.endMileage,
        CASE 
          WHEN b.notes LIKE '%[แจ้งซ่อมแล้ว]%' THEN 'แจ้งซ่อมแล้ว'
          ELSE 'รอดำเนินการ'
        END as status,
        c.name as carName,
        c.licensePlate as carLicensePlate,
        u.name as userName,
        u.department as userDepartment
      FROM Bookings b
      JOIN Cars c ON b.carId = c.id
      JOIN Users u ON b.userId = u.id
      WHERE b.status = 'เสร็จสิ้น'
        AND b.notes IS NOT NULL 
        AND b.notes != ''
        AND b.notes LIKE '%สภาพรถ: ไม่ปกติ%'
        ${whereCondition}
      ORDER BY b.createdAt DESC
    `)
    
    const reportsArray = Array.isArray(reports) ? reports : reports.recordset || []
    console.log('Found reports:', reportsArray.length, reportsArray)
    return NextResponse.json(reportsArray)
  } catch (error) {
    console.error("Error fetching damage reports:", error)
    return NextResponse.json(
      { error: "Failed to fetch damage reports" },
      { status: 500 }
    )
  }
}