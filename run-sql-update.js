const mysql = require('mysql2/promise');
const fs = require('fs');

async function updateDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'carbookingsystem'
    });

    console.log('Connected to database');

    // อัปเดตสถานะในตาราง Bookings
    await connection.execute(`
      ALTER TABLE Bookings MODIFY COLUMN status 
      ENUM('รออนุมัติ', 'อนุมัติแล้ว', 'ปฏิเสธ', 'ยกเลิก', 'รอคืนรถ', 'เสร็จสิ้น') 
      DEFAULT 'รออนุมัติ'
    `);

    console.log('Database updated successfully');
    await connection.end();
  } catch (error) {
    console.error('Error updating database:', error);
  }
}

updateDatabase();