@echo off
REM สคริปต์สำหรับสร้างฐานข้อมูลและตารางบน Windows
REM สามารถรันด้วยการดับเบิลคลิกที่ไฟล์หรือพิมพ์ setup-db.bat ในหน้าต่าง Command Prompt

REM ตั้งค่าตัวแปร
set DB_HOST=localhost
set DB_USER=root
set DB_PASSWORD=
set DB_NAME=carbookingsystem

echo เริ่มต้นการสร้างฐานข้อมูล %DB_NAME%...

REM ตรวจสอบว่ามี MySQL ในระบบหรือไม่
where mysql >nul 2>nul
if %ERRORLEVEL% neq 0 (
  echo ไม่พบคำสั่ง MySQL ในระบบ
  echo กรุณาตรวจสอบว่าได้ติดตั้ง MySQL หรือ MariaDB และเพิ่มในตัวแปร PATH แล้ว
  echo หรือแก้ไขเส้นทางไปยัง mysql.exe ในไฟล์นี้
  goto :EOF
)

REM สร้างฐานข้อมูลและตาราง
if "%DB_PASSWORD%"=="" (
  mysql -h %DB_HOST% -u %DB_USER% < setup-database.sql
) else (
  mysql -h %DB_HOST% -u %DB_USER% -p%DB_PASSWORD% < setup-database.sql
)

REM ตรวจสอบสถานะการทำงาน
if %ERRORLEVEL% equ 0 (
  echo สร้างฐานข้อมูลและตารางเสร็จสมบูรณ์
  
  REM แสดงรายการตารางที่สร้าง
  echo รายการตารางในฐานข้อมูล %DB_NAME%:
  if "%DB_PASSWORD%"=="" (
    mysql -h %DB_HOST% -u %DB_USER% -e "USE %DB_NAME%; SHOW TABLES;"
  ) else (
    mysql -h %DB_HOST% -u %DB_USER% -p%DB_PASSWORD% -e "USE %DB_NAME%; SHOW TABLES;"
  )
) else (
  echo เกิดข้อผิดพลาดในการสร้างฐานข้อมูล
)

echo.
echo กด Enter เพื่อปิดหน้าต่าง...
pause > nul