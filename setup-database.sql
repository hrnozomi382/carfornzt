-- สร้างฐานข้อมูล
CREATE DATABASE IF NOT EXISTS carbookingsystem CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ใช้ฐานข้อมูล
USE carbookingsystem;

-- สร้างตาราง Users
CREATE TABLE IF NOT EXISTS Users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  name_en VARCHAR(255),
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  department VARCHAR(100),
  phone VARCHAR(20),
  avatar VARCHAR(255),
  avatar_url VARCHAR(255),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- สร้างตาราง CarTypes
CREATE TABLE IF NOT EXISTS CarTypes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- สร้างตาราง Cars
CREATE TABLE IF NOT EXISTS Cars (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  licensePlate VARCHAR(20) NOT NULL,
  type VARCHAR(100) NOT NULL,
  currentMileage INT DEFAULT 0,
  status ENUM('available', 'in-use', 'maintenance') DEFAULT 'available',
  notes TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- สร้างตาราง Bookings
CREATE TABLE IF NOT EXISTS Bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  carId INT NOT NULL,
  startDate DATE NOT NULL,
  endDate DATE NOT NULL,
  startTime TIME NOT NULL,
  endTime TIME NOT NULL,
  purpose TEXT NOT NULL,
  destination VARCHAR(255) NOT NULL,
  status ENUM('รออนุมัติ', 'อนุมัติแล้ว', 'ปฏิเสธ', 'ยกเลิก', 'เสร็จสิ้น') DEFAULT 'รออนุมัติ',
  startMileage INT,
  endMileage INT,
  mileageDiff INT,
  fuelLevel VARCHAR(50),
  fuelCost DECIMAL(10, 2),
  notes TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  approvedAt TIMESTAMP NULL,
  approvedBy INT,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES Users(id),
  FOREIGN KEY (carId) REFERENCES Cars(id),
  FOREIGN KEY (approvedBy) REFERENCES Users(id)
);

-- สร้างตาราง BusinessCards
CREATE TABLE IF NOT EXISTS business_cards (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
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
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES Users(id)
);

-- เพิ่มข้อมูลตัวอย่าง - ผู้ใช้งาน
INSERT INTO Users (name, email, password, role, department, phone) VALUES
('ผู้ดูแลระบบ', 'admin@example.com', '$2b$10$1234567890123456789012uQiXTJ7xwKv9Yh5hAGRM0YKS1t1Jnm6', 'admin', 'IT', '0812345678'),
('ผู้ใช้งานทั่วไป', 'user@example.com', '$2b$10$1234567890123456789012uQiXTJ7xwKv9Yh5hAGRM0YKS1t1Jnm6', 'user', 'บัญชี', '0898765432');

-- เพิ่มข้อมูลตัวอย่าง - ประเภทรถ
INSERT INTO CarTypes (name, description) VALUES
('รถเก๋ง', 'รถยนต์นั่งส่วนบุคคล'),
('รถตู้', 'รถตู้สำหรับเดินทางเป็นกลุ่ม'),
('รถกระบะ', 'รถกระบะสำหรับขนส่ง');

-- เพิ่มข้อมูลตัวอย่าง - รถยนต์
INSERT INTO Cars (name, licensePlate, type, currentMileage, status) VALUES
('Toyota Camry', 'กข 1234 กรุงเทพ', 'รถเก๋ง', 15000, 'available'),
('Honda CRV', 'ขค 5678 กรุงเทพ', 'รถเก๋ง', 25000, 'available'),
('Toyota Commuter', 'งจ 9012 กรุงเทพ', 'รถตู้', 30000, 'available');

-- สร้าง Trigger สำหรับคำนวณระยะทางอัตโนมัติเมื่อมีการอัปเดตข้อมูลการจอง
DELIMITER //
CREATE TRIGGER calculate_mileage_diff BEFORE UPDATE ON Bookings
FOR EACH ROW
BEGIN
  IF NEW.endMileage IS NOT NULL AND NEW.startMileage IS NOT NULL THEN
    SET NEW.mileageDiff = NEW.endMileage - NEW.startMileage;
  END IF;
END //
DELIMITER ;