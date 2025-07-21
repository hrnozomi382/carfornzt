#!/bin/bash

# สคริปต์สำหรับสร้างฐานข้อมูลและตาราง
# สามารถรันด้วยคำสั่ง: bash setup-db.sh

# ตั้งค่าตัวแปร
DB_HOST=${DB_HOST:-"localhost"}
DB_USER=${DB_USER:-"root"}
DB_PASSWORD=${DB_PASSWORD:-""}
DB_NAME="carbookingsystem"

# แสดงข้อความเริ่มต้น
echo "เริ่มต้นการสร้างฐานข้อมูล $DB_NAME..."

# สร้างฐานข้อมูลและตาราง
mysql -h $DB_HOST -u $DB_USER ${DB_PASSWORD:+-p$DB_PASSWORD} < setup-database.sql

# ตรวจสอบสถานะการทำงาน
if [ $? -eq 0 ]; then
  echo "สร้างฐานข้อมูลและตารางเสร็จสมบูรณ์"
  
  # แสดงรายการตารางที่สร้าง
  echo "รายการตารางในฐานข้อมูล $DB_NAME:"
  mysql -h $DB_HOST -u $DB_USER ${DB_PASSWORD:+-p$DB_PASSWORD} -e "USE $DB_NAME; SHOW TABLES;"
else
  echo "เกิดข้อผิดพลาดในการสร้างฐานข้อมูล"
fi