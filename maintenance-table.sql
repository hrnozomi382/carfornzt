-- สร้างตาราง Maintenance สำหรับบันทึกการซ่อมบำรุง
CREATE TABLE IF NOT EXISTS Maintenance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    carId INT NOT NULL,
    serviceDate DATE NOT NULL,
    serviceType VARCHAR(100) NOT NULL,
    description TEXT,
    cost DECIMAL(10,2),
    mileage INT,
    nextServiceDate DATE,
    nextServiceMileage INT,
    createdBy INT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (carId) REFERENCES Cars(id) ON DELETE CASCADE,
    FOREIGN KEY (createdBy) REFERENCES Users(id) ON DELETE SET NULL
);

-- เพิ่มข้อมูลตัวอย่าง
INSERT INTO Maintenance (carId, serviceDate, serviceType, description, cost, mileage) VALUES
(1, '2024-01-15', 'เปลี่ยนน้ำมันเครื่อง', 'เปลี่ยนน้ำมันเครื่องและกรองน้ำมัน', 1500.00, 50000),
(2, '2024-01-20', 'ตรวจเช็คทั่วไป', 'ตรวจเช็คระบบเบรก ยาง และไฟ', 800.00, 45000);