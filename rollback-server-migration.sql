-- Rollback Migration สำหรับลบการเปลี่ยนแปลง server
-- ใช้ฐานข้อมูล
USE carbookingsystem;

-- ลบ index ที่สร้างขึ้น
DROP INDEX IF EXISTS idx_users_server_id ON Users;
DROP INDEX IF EXISTS idx_cars_server_id ON Cars;
DROP INDEX IF EXISTS idx_bookings_server_id ON Bookings;
DROP INDEX IF EXISTS idx_business_cards_server_id ON business_cards;
DROP INDEX IF EXISTS idx_car_types_server_id ON CarTypes;

-- ลบข้อมูลที่เพิ่มสำหรับ server2
DELETE FROM Users WHERE server_id = 'server2';
DELETE FROM CarTypes WHERE server_id = 'server2';

-- ลบคอลัมน์ server_id จากทุกตาราง
ALTER TABLE Users DROP COLUMN server_id;
ALTER TABLE Cars DROP COLUMN server_id;
ALTER TABLE Bookings DROP COLUMN server_id;
ALTER TABLE business_cards DROP COLUMN server_id;
ALTER TABLE CarTypes DROP COLUMN server_id;

COMMIT;