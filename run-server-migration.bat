@echo off
echo กำลังเพิ่ม server ใหม่...
mysql -u root -p < add-server-migration.sql
if %errorlevel% equ 0 (
    echo เพิ่ม server สำเร็จ!
) else (
    echo เกิดข้อผิดพลาดในการเพิ่ม server
)
pause