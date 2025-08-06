const mysql = require('mysql2/promise');

async function debugBookings() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'carbookingsystem'
  });

  try {
    console.log('=== ตรวจสอบข้อมูลการจองทั้งหมด ===');
    const [allBookings] = await connection.execute(`
      SELECT id, userId, carId, status, startDate, endDate, startMileage, endMileage, createdAt
      FROM Bookings 
      ORDER BY createdAt DESC
    `);
    console.log('การจองทั้งหมด:', allBookings.length, 'รายการ');
    allBookings.forEach(booking => {
      console.log(`ID: ${booking.id}, Status: ${booking.status}, StartMileage: ${booking.startMileage}, EndMileage: ${booking.endMileage}`);
    });

    console.log('\n=== ตรวจสอบการจองที่ควรแสดงในหน้ารับคืนรถ ===');
    const [activeBookings] = await connection.execute(`
      SELECT 
        b.id, b.userId, b.carId, b.startDate, b.endDate, b.status, 
        b.startMileage, b.endMileage, b.fuelLevel, b.notes,
        u.name as userName, c.name as carName, c.licensePlate
      FROM Bookings b
      JOIN Users u ON b.userId = u.id
      JOIN Cars c ON b.carId = c.id
      WHERE (b.status = 'อนุมัติแล้ว' OR b.status = 'รอคืนรถ') AND b.endMileage IS NULL
      ORDER BY b.startDate ASC, b.startTime ASC
    `);
    
    console.log('การจองที่ควรแสดง:', activeBookings.length, 'รายการ');
    activeBookings.forEach(booking => {
      console.log(`ID: ${booking.id}, User: ${booking.userName}, Car: ${booking.carName}, Status: ${booking.status}`);
    });

    console.log('\n=== ตรวจสอบการจองที่มี endMileage แล้ว ===');
    const [completedBookings] = await connection.execute(`
      SELECT id, userId, carId, status, startMileage, endMileage
      FROM Bookings 
      WHERE endMileage IS NOT NULL
      ORDER BY id DESC
    `);
    console.log('การจองที่มี endMileage:', completedBookings.length, 'รายการ');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

debugBookings();