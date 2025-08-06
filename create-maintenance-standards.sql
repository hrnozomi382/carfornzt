CREATE TABLE IF NOT EXISTS MaintenanceStandards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    intervalKm INT NOT NULL,
    intervalMonths INT NOT NULL,
    priority ENUM('high', 'medium', 'low') DEFAULT 'medium',
    description TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- เพิ่มข้อมูลเริ่มต้น
INSERT INTO MaintenanceStandards (name, category, intervalKm, intervalMonths, priority, description) VALUES
('เปลี่ยนน้ำมันเครื่อง', 'น้ำมันและของเหลว', 5000, 6, 'high', 'เปลี่ยนน้ำมันเครื่องและกรองน้ำมัน'),
('ตรวจน้ำหล่อเย็น', 'น้ำมันและของเหลว', 10000, 12, 'medium', 'ตรวจสอบระดับและคุณภาพน้ำหล่อเย็น'),
('ตรวจน้ำมันเบรก', 'น้ำมันและของเหลว', 20000, 24, 'high', 'ตรวจสอบและเปลี่ยนน้ำมันเบรก'),
('เปลี่ยนกรองอากาศ', 'ระบบเครื่องยนต์', 10000, 12, 'medium', 'เปลี่ยนกรองอากาศเครื่องยนต์'),
('เปลี่ยนหัวเทียน', 'ระบบเครื่องยนต์', 30000, 36, 'medium', 'เปลี่ยนหัวเทียนจุดระเบิด'),
('ตรวจผ้าเบรก', 'ระบบเบรก', 15000, 12, 'high', 'ตรวจสอบความหนาผ้าเบรก'),
('หมุนยาง', 'ยางและล้อ', 8000, 6, 'medium', 'หมุนตำแหน่งยางเพื่อการสึกหรอสม่ำเสมอ'),
('ตรวจลมยาง', 'ยางและล้อ', 1000, 1, 'high', 'ตรวจสอบความดันลมยาง'),
('ตรวจแบตเตอรี่', 'ระบบไฟฟ้า', 15000, 12, 'medium', 'ตรวจสอบแรงดันและขั้วแบตเตอรี่'),
('เปลี่ยนกรองแอร์', 'อื่นๆ', 15000, 12, 'low', 'เปลี่ยนกรองอากาศเครื่องปรับอากาศ');