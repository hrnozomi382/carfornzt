const { sql } = require('@vercel/postgres')

async function setupDatabase() {
  try {
    console.log('Setting up Vercel Postgres database...')

    // สร้างตาราง Users
    await sql`
      CREATE TABLE IF NOT EXISTS Users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        name_en VARCHAR(255),
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'user',
        department VARCHAR(100),
        phone VARCHAR(20),
        avatar VARCHAR(255),
        avatar_url VARCHAR(255),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // สร้างตาราง CarTypes
    await sql`
      CREATE TABLE IF NOT EXISTS CarTypes (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // สร้างตาราง Cars
    await sql`
      CREATE TABLE IF NOT EXISTS Cars (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        licensePlate VARCHAR(20) NOT NULL,
        type VARCHAR(100) NOT NULL,
        currentMileage INTEGER DEFAULT 0,
        status VARCHAR(20) DEFAULT 'available',
        notes TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // สร้างตาราง Bookings
    await sql`
      CREATE TABLE IF NOT EXISTS Bookings (
        id SERIAL PRIMARY KEY,
        userId INTEGER NOT NULL REFERENCES Users(id),
        carId INTEGER NOT NULL REFERENCES Cars(id),
        startDate DATE NOT NULL,
        endDate DATE NOT NULL,
        startTime TIME NOT NULL,
        endTime TIME NOT NULL,
        purpose TEXT NOT NULL,
        destination VARCHAR(255) NOT NULL,
        status VARCHAR(20) DEFAULT 'รออนุมัติ',
        startMileage INTEGER,
        endMileage INTEGER,
        mileageDiff INTEGER,
        fuelLevel VARCHAR(50),
        fuelCost DECIMAL(10, 2),
        notes TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        approvedAt TIMESTAMP,
        approvedBy INTEGER REFERENCES Users(id),
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // สร้างตาราง business_cards
    await sql`
      CREATE TABLE IF NOT EXISTS business_cards (
        id SERIAL PRIMARY KEY,
        userId INTEGER NOT NULL REFERENCES Users(id),
        name VARCHAR(255) NOT NULL,
        name_en VARCHAR(255),
        position VARCHAR(255) NOT NULL,
        position_en VARCHAR(255),
        department VARCHAR(255) NOT NULL,
        department_en VARCHAR(255),
        company VARCHAR(255) NOT NULL,
        company_en VARCHAR(255),
        branch VARCHAR(255),
        email VARCHAR(255) NOT NULL,
        tel VARCHAR(100) NOT NULL,
        company_tel VARCHAR(100),
        address TEXT NOT NULL,
        address_en TEXT,
        branch_address_th TEXT,
        branch_address_en TEXT,
        logo VARCHAR(255),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // สร้างตาราง Maintenance
    await sql`
      CREATE TABLE IF NOT EXISTS Maintenance (
        id SERIAL PRIMARY KEY,
        carId INTEGER NOT NULL REFERENCES Cars(id) ON DELETE CASCADE,
        serviceDate DATE NOT NULL,
        serviceType VARCHAR(100) NOT NULL,
        description TEXT,
        cost DECIMAL(10,2) DEFAULT 0,
        mileage INTEGER DEFAULT 0,
        nextServiceDate DATE,
        nextServiceMileage INTEGER,
        createdBy INTEGER REFERENCES Users(id) ON DELETE SET NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // เพิ่มข้อมูลตัวอย่าง
    await sql`
      INSERT INTO Users (name, email, password, role, department, phone) VALUES
      ('ผู้ดูแลระบบ', 'admin@example.com', '$2b$10$1234567890123456789012uQiXTJ7xwKv9Yh5hAGRM0YKS1t1Jnm6', 'admin', 'IT', '0812345678'),
      ('ผู้ใช้งานทั่วไป', 'user@example.com', '$2b$10$1234567890123456789012uQiXTJ7xwKv9Yh5hAGRM0YKS1t1Jnm6', 'user', 'บัญชี', '0898765432')
      ON CONFLICT (email) DO NOTHING
    `

    await sql`
      INSERT INTO CarTypes (name, description) VALUES
      ('รถเก๋ง', 'รถยนต์นั่งส่วนบุคคล'),
      ('รถตู้', 'รถตู้สำหรับเดินทางเป็นกลุ่ม'),
      ('รถกระบะ', 'รถกระบะสำหรับขนส่ง')
      ON CONFLICT DO NOTHING
    `

    await sql`
      INSERT INTO Cars (name, licensePlate, type, currentMileage, status) VALUES
      ('Toyota Camry', 'กข 1234 กรุงเทพ', 'รถเก๋ง', 15000, 'available'),
      ('Honda CRV', 'ขค 5678 กรุงเทพ', 'รถเก๋ง', 25000, 'available'),
      ('Toyota Commuter', 'งจ 9012 กรุงเทพ', 'รถตู้', 30000, 'available')
      ON CONFLICT DO NOTHING
    `

    console.log('Database setup completed successfully!')
  } catch (error) {
    console.error('Error setting up database:', error)
    process.exit(1)
  }
}

setupDatabase()