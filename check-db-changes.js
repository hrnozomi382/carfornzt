const mysql = require('mysql2/promise');

async function checkDatabaseChanges() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'carbookingsystem'
  });

  try {
    console.log('=== ตรวจสอบโครงสร้างฐานข้อมูลปัจจุบัน ===\n');
    
    // ตรวจสอบตารางทั้งหมด
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('ตารางทั้งหมดในฐานข้อมูล:');
    tables.forEach(table => {
      console.log(`- ${Object.values(table)[0]}`);
    });

    console.log('\n=== ตรวจสอบโครงสร้างตาราง Bookings ===');
    const [bookingColumns] = await connection.execute('DESCRIBE Bookings');
    console.log('คอลัมน์ในตาราง Bookings:');
    bookingColumns.forEach(col => {
      console.log(`- ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(NULL)' : '(NOT NULL)'} ${col.Key ? `[${col.Key}]` : ''} ${col.Default !== null ? `Default: ${col.Default}` : ''}`);
    });

    console.log('\n=== ตรวจสอบ status ที่มีในตาราง Bookings ===');
    const [statuses] = await connection.execute('SELECT DISTINCT status FROM Bookings ORDER BY status');
    console.log('Status ทั้งหมดที่มีในระบบ:');
    statuses.forEach(status => {
      console.log(`- ${status.status}`);
    });

    console.log('\n=== ตรวจสอบการจองล่าสุด (10 รายการ) ===');
    const [recentBookings] = await connection.execute(`
      SELECT id, userId, status, startDate, endDate, startMileage, endMileage, createdAt
      FROM Bookings 
      ORDER BY createdAt DESC 
      LIMIT 10
    `);
    console.log('การจองล่าสุด:');
    recentBookings.forEach(booking => {
      console.log(`ID: ${booking.id}, Status: ${booking.status}, Created: ${booking.createdAt}, StartMileage: ${booking.startMileage}, EndMileage: ${booking.endMileage}`);
    });

    console.log('\n=== ตรวจสอบตาราง Users ===');
    const [userColumns] = await connection.execute('DESCRIBE Users');
    console.log('คอลัมน์ในตาราง Users:');
    userColumns.forEach(col => {
      console.log(`- ${col.Field}: ${col.Type}`);
    });

    console.log('\n=== ตรวจสอบตาราง Cars ===');
    const [carColumns] = await connection.execute('DESCRIBE Cars');
    console.log('คอลัมน์ในตาราง Cars:');
    carColumns.forEach(col => {
      console.log(`- ${col.Field}: ${col.Type}`);
    });

    // ตรวจสอบว่ามีตารางใหม่หรือไม่
    console.log('\n=== ตรวจสอบตารางที่อาจเพิ่มใหม่ ===');
    const expectedTables = ['Users', 'Cars', 'Bookings', 'CarTypes', 'business_cards'];
    const actualTables = tables.map(t => Object.values(t)[0]);
    
    const newTables = actualTables.filter(table => !expectedTables.includes(table));
    if (newTables.length > 0) {
      console.log('ตารางที่เพิ่มใหม่:');
      newTables.forEach(table => console.log(`- ${table}`));
    } else {
      console.log('ไม่มีตารางใหม่');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

checkDatabaseChanges();