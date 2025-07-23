const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// อ่านไฟล์ SQL
const sqlFilePath = path.join(__dirname, 'setup-database.sql');
const sqlScript = fs.readFileSync(sqlFilePath, 'utf8');

// แยกคำสั่ง SQL
const sqlCommands = sqlScript
  .replace(/(\r\n|\n|\r)/gm, ' ') // แทนที่การขึ้นบรรทัดด้วยช่องว่าง
  .replace(/\s+/g, ' ') // แทนที่ช่องว่างหลายช่องด้วยช่องว่างเดียว
  .split(';') // แยกคำสั่งตาม ;
  .filter(command => command.trim() !== ''); // ลบคำสั่งว่าง

async function setupDatabase() {
  // ข้อมูลการเชื่อมต่อฐานข้อมูล
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
  };

  try {
    // สร้างการเชื่อมต่อ
    const connection = await mysql.createConnection(dbConfig);
    console.log('เชื่อมต่อฐานข้อมูลสำเร็จ');

    // ประมวลผลคำสั่ง SQL ทีละคำสั่ง
    for (const command of sqlCommands) {
      if (command.trim()) {
        try {
          await connection.query(command);
          console.log('ประมวลผลคำสั่ง SQL สำเร็จ:', command.substring(0, 50) + '...');
        } catch (err) {
          console.error('เกิดข้อผิดพลาดในการประมวลผลคำสั่ง SQL:', command);
          console.error('รายละเอียดข้อผิดพลาด:', err.message);
        }
      }
    }

    console.log('สร้างฐานข้อมูลและตารางเสร็จสมบูรณ์');
    await connection.end();
  } catch (err) {
    console.error('เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล:', err);
  }
}

// เรียกใช้ฟังก์ชัน
setupDatabase();