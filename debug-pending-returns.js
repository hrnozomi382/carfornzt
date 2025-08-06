const mysql = require('mysql2/promise');

async function debugPendingReturns() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'carbookingsystem'
  });

  try {
    console.log('=== ตรวจสอบการจองที่มี status "รอคืนรถ" ===');
    const [pendingReturns] = await connection.execute(`
      SELECT 
        b.id, b.userId, b.carId, b.status, b.startDate, b.endDate,
        b.startMileage, b.endMileage, b.fuelLevel, b.notes, b.createdAt,
        u.name as userName, c.name as carName, c.licensePlate
      FROM Bookings b
      JOIN Users u ON b.userId = u.id
      JOIN Cars c ON b.carId = c.id
      WHERE b.status = 'รอคืนรถ'
      ORDER BY b.id DESC
    `);
    
    console.log('การจองที่มี status "รอคืนรถ":', pendingReturns.length, 'รายการ');
    pendingReturns.forEach(booking => {
      console.log(`\nID: ${booking.id}`);
      console.log(`User: ${booking.userName}`);
      console.log(`Car: ${booking.carName} (${booking.licensePlate})`);
      console.log(`Status: ${booking.status}`);
      console.log(`StartMileage: ${booking.startMileage}`);
      console.log(`EndMileage: ${booking.endMileage}`);
      console.log(`FuelLevel: ${booking.fuelLevel}`);
      console.log(`Notes: ${booking.notes}`);
      console.log(`Date: ${booking.startDate} - ${booking.endDate}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

debugPendingReturns();