const mysql = require('mysql2/promise');

async function createQATables() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'carbookingsystem'
    });

    console.log('Connected to database');

    // สร้างตาราง MeasuringTools (เครื่องมือตรวจวัด)
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS MeasuringTools (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        model VARCHAR(100),
        serialNumber VARCHAR(100),
        location VARCHAR(255),
        status ENUM('active', 'inactive', 'maintenance') DEFAULT 'active',
        lastCalibration DATE,
        nextCalibration DATE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // สร้างตาราง ChecklistItems (รายการตรวจเช็ค)
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS ChecklistItems (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        isRequired BOOLEAN DEFAULT true,
        sortOrder INT DEFAULT 0,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // สร้างตาราง QAInspections (การตรวจเช็ค)
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS QAInspections (
        id INT AUTO_INCREMENT PRIMARY KEY,
        toolId INT NOT NULL,
        inspectorId INT NOT NULL,
        inspectionDate DATE NOT NULL,
        status ENUM('pending', 'completed', 'approved', 'rejected') DEFAULT 'pending',
        notes TEXT,
        approvedBy INT,
        approvedAt TIMESTAMP NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (toolId) REFERENCES MeasuringTools(id) ON DELETE CASCADE,
        FOREIGN KEY (inspectorId) REFERENCES Users(id) ON DELETE CASCADE,
        FOREIGN KEY (approvedBy) REFERENCES Users(id) ON DELETE SET NULL
      )
    `);

    // สร้างตาราง QAInspectionResults (ผลการตรวจเช็ค)
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS QAInspectionResults (
        id INT AUTO_INCREMENT PRIMARY KEY,
        inspectionId INT NOT NULL,
        checklistItemId INT NOT NULL,
        result ENUM('pass', 'fail', 'na') NOT NULL,
        notes TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (inspectionId) REFERENCES QAInspections(id) ON DELETE CASCADE,
        FOREIGN KEY (checklistItemId) REFERENCES ChecklistItems(id) ON DELETE CASCADE
      )
    `);

    // เพิ่มข้อมูลตัวอย่าง - เครื่องมือตรวจวัด
    await connection.execute(`
      INSERT IGNORE INTO MeasuringTools (name, model, serialNumber, location, lastCalibration, nextCalibration) VALUES
      ('Digital Caliper', 'Mitutoyo CD-6"', 'MIT001', 'QA Lab Room 1', '2024-01-15', '2025-01-15'),
      ('Micrometer', 'Mitutoyo 0-25mm', 'MIT002', 'QA Lab Room 1', '2024-02-10', '2025-02-10'),
      ('Height Gauge', 'Mitutoyo HG-600', 'MIT003', 'QA Lab Room 2', '2024-03-05', '2025-03-05'),
      ('Surface Roughness Tester', 'Mitutoyo SJ-210', 'MIT004', 'QA Lab Room 2', '2024-01-20', '2025-01-20')
    `);

    // เพิ่มข้อมูลตัวอย่าง - รายการตรวจเช็ค
    await connection.execute(`
      INSERT IGNORE INTO ChecklistItems (name, description, sortOrder) VALUES
      ('ความสะอาดภายนอก', 'ตรวจสอบความสะอาดของเครื่องมือภายนอก', 1),
      ('การทำงานของหน้าจอ', 'ตรวจสอบการแสดงผลของหน้าจอ', 2),
      ('ความแม่นยำการวัด', 'ทดสอบความแม่นยำด้วย Standard Block', 3),
      ('การเคลื่อนไหวของชิ้นส่วน', 'ตรวจสอบการเคลื่อนไหวของชิ้นส่วนต่างๆ', 4),
      ('สภาพสายไฟ/แบตเตอรี่', 'ตรวจสอบสภาพสายไฟและแบตเตอรี่', 5),
      ('การเก็บรักษา', 'ตรวจสอบกล่องเก็บและอุปกรณ์เสริม', 6)
    `);

    console.log('QA tables created successfully');
    await connection.end();
  } catch (error) {
    console.error('Error creating QA tables:', error);
  }
}

createQATables();