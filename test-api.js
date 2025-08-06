const mysql = require('mysql2/promise');

async function testAPI() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'carbookingsystem'
  });

  try {
    console.log('=== ทดสอบ Query ใหม่ที่แก้ไขแล้ว ===');
    const [result] = await connection.execute(`
      SELECT 
        b.id, b.userId, b.carId, b.startDate, b.endDate, b.startTime, b.endTime, 
        b.purpose, b.destination, b.status, b.startMileage, b.endMileage, b.fuelLevel, b.notes, b.createdAt,
        u.name as userName, u.department, u.email, u.phone, u.avatar as profileImage,
        c.name as carName, c.licensePlate, c.currentMileage, c.type as carTypeName
      FROM Bookings b
      JOIN Users u ON b.userId = u.id
      JOIN Cars c ON b.carId = c.id
      WHERE (b.status = 'อนุมัติแล้ว' AND b.endMileage IS NULL) OR b.status = 'รอคืนรถ'
      ORDER BY b.startDate ASC, b.startTime ASC
    `);

    console.log('จำนวนรายการที่ควรแสดง:', result.length);
    result.forEach(booking => {
      console.log(`ID: ${booking.id}, User: ${booking.userName}, Status: ${booking.status}, EndMileage: ${booking.endMileage}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

testAPI();