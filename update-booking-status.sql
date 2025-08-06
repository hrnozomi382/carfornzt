-- เพิ่มสถานะ "รอคืนรถ" ในตาราง Bookings
ALTER TABLE Bookings MODIFY COLUMN status ENUM('รออนุมัติ', 'อนุมัติแล้ว', 'ปฏิเสธ', 'ยกเลิก', 'รอคืนรถ', 'เสร็จสิ้น') DEFAULT 'รออนุมัติ';