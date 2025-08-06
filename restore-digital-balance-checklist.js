const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'carbookingsystem'
};

async function restoreDigitalBalanceChecklist() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to database');

    const checklistItems = [
      {
        name: 'ตรวจสอบความสะอาดของตัวเครื่อง',
        description: 'ตรวจสอบว่าตัวเครื่องสะอาด ไม่มีฝุ่นหรือสิ่งสกปรก',
        toolType: 'Digital Balance',
        sortOrder: 1,
        isRequired: true
      },
      {
        name: 'ตรวจสอบการทำงานของจอแสดงผล',
        description: 'ตรวจสอบว่าจอแสดงผลชัดเจน ไม่มีจุดดับหรือเส้นผิดปกติ',
        toolType: 'Digital Balance',
        sortOrder: 2,
        isRequired: true
      },
      {
        name: 'ตรวจสอบการ Zero/Tare',
        description: 'ทดสอบการตั้งค่า Zero และ Tare ว่าทำงานปกติ',
        toolType: 'Digital Balance',
        sortOrder: 3,
        isRequired: true
      },
      {
        name: 'ตรวจสอบความแม่นยำด้วยน้ำหนักมาตรฐาน',
        description: 'ใช้น้ำหนักมาตรฐานทดสอบความแม่นยำของเครื่อง',
        toolType: 'Digital Balance',
        sortOrder: 4,
        isRequired: true
      },
      {
        name: 'ตรวจสอบความเสถียรของการชั่ง',
        description: 'ทดสอบการชั่งซ้ำๆ ว่าได้ผลลัพธ์คงที่',
        toolType: 'Digital Balance',
        sortOrder: 5,
        isRequired: true
      },
      {
        name: 'ตรวจสอบระดับน้ำฟอง (Level)',
        description: 'ตรวจสอบว่าเครื่องตั้งระดับถูกต้อง',
        toolType: 'Digital Balance',
        sortOrder: 6,
        isRequired: true
      },
      {
        name: 'ตรวจสอบสายไฟและปลั๊ก',
        description: 'ตรวจสอบสายไฟและปลั๊กไฟว่าไม่ชำรุด',
        toolType: 'Digital Balance',
        sortOrder: 7,
        isRequired: true
      }
    ];

    for (const item of checklistItems) {
      // ตรวจสอบว่ามีอยู่แล้วหรือไม่
      const [existing] = await connection.execute(
        'SELECT id FROM ChecklistItems WHERE name = ? AND toolType = ?',
        [item.name, item.toolType]
      );

      if (existing.length === 0) {
        await connection.execute(
          'INSERT INTO ChecklistItems (name, description, toolType, sortOrder, isRequired) VALUES (?, ?, ?, ?, ?)',
          [item.name, item.description, item.toolType, item.sortOrder, item.isRequired]
        );
        console.log(`✓ Added: ${item.name}`);
      } else {
        console.log(`- Already exists: ${item.name}`);
      }
    }

    console.log('\nDigital Balance checklist restoration completed!');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

restoreDigitalBalanceChecklist();