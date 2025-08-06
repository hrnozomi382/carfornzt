-- Migration สำหรับเพิ่ม server ใหม่
-- ใช้ฐานข้อมูล
USE carbookingsystem;

-- เพิ่มคอลัมน์ server_id ในตาราง Users (สำหรับระบุว่าผู้ใช้อยู่ server ไหน)
ALTER TABLE Users 
ADD COLUMN server_id VARCHAR(50) DEFAULT 'main' COMMENT 'ระบุ server ที่ผู้ใช้สังกัด';

-- เพิ่มคอลัมน์ server_id ในตาราง Cars (สำหรับระบุว่ารถอยู่ server ไหน)
ALTER TABLE Cars 
ADD COLUMN server_id VARCHAR(50) DEFAULT 'main' COMMENT 'ระบุ server ที่รถสังกัด';

-- เพิ่มคอลัมน์ server_id ในตาราง Bookings (สำหรับระบุว่าการจองอยู่ server ไหน)
ALTER TABLE Bookings 
ADD COLUMN server_id VARCHAR(50) DEFAULT 'main' COMMENT 'ระบุ server ที่การจองสังกัด';

-- เพิ่มคอลัมน์ server_id ในตาราง business_cards (สำหรับระบุว่านามบัตรอยู่ server ไหน)
ALTER TABLE business_cards 
ADD COLUMN server_id VARCHAR(50) DEFAULT 'main' COMMENT 'ระบุ server ที่นามบัตรสังกัด';

-- เพิ่มคอลัมน์ server_id ในตาราง CarTypes (สำหรับระบุว่าประเภทรถอยู่ server ไหน)
ALTER TABLE CarTypes 
ADD COLUMN server_id VARCHAR(50) DEFAULT 'main' COMMENT 'ระบุ server ที่ประเภทรถสังกัด';

-- สร้าง index สำหรับ server_id เพื่อเพิ่มประสิทธิภาพในการค้นหา
CREATE INDEX idx_users_server_id ON Users(server_id);
CREATE INDEX idx_cars_server_id ON Cars(server_id);
CREATE INDEX idx_bookings_server_id ON Bookings(server_id);
CREATE INDEX idx_business_cards_server_id ON business_cards(server_id);
CREATE INDEX idx_car_types_server_id ON CarTypes(server_id);

-- อัปเดตข้อมูลเดิมให้เป็น 'main' server (ถ้ายังไม่ได้ตั้งค่า)
UPDATE Users SET server_id = 'main' WHERE server_id IS NULL;
UPDATE Cars SET server_id = 'main' WHERE server_id IS NULL;
UPDATE Bookings SET server_id = 'main' WHERE server_id IS NULL;
UPDATE business_cards SET server_id = 'main' WHERE server_id IS NULL;
UPDATE CarTypes SET server_id = 'main' WHERE server_id IS NULL;

-- เพิ่มข้อมูลตัวอย่างสำหรับ server ใหม่ (server2)
INSERT INTO CarTypes (name, description, server_id) VALUES
('รถเก๋ง', 'รถยนต์นั่งส่วนบุคคล', 'server2'),
('รถตู้', 'รถตู้สำหรับเดินทางเป็นกลุ่ม', 'server2'),
('รถกระบะ', 'รถกระบะสำหรับขนส่ง', 'server2');

-- เพิ่มผู้ดูแลระบบสำหรับ server ใหม่
INSERT INTO Users (name, email, password, role, department, phone, server_id) VALUES
('ผู้ดูแลระบบ Server 2', 'admin2@example.com', '$2b$10$1234567890123456789012uQiXTJ7xwKv9Yh5hAGRM0YKS1t1Jnm6', 'admin', 'IT', '0812345679', 'server2');

COMMIT;