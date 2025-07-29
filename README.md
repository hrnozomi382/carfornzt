# ระบบจองรถ

ระบบจองรถสำหรับองค์กร พัฒนาด้วย Next.js

## การติดตั้ง

1. ติดตั้ง dependencies:

```bash
npm install
```

2. สร้างไฟล์ `.env` จากไฟล์ `.env.example`:

```bash
cp .env.example .env
```

3. แก้ไขไฟล์ `.env` ตามการตั้งค่าของคุณ

4. สร้างฐานข้อมูล:

### วิธีที่ 1: ใช้ Node.js
```bash
npm run setup-db
```

### วิธีที่ 2: ใช้ Shell Script (Linux/macOS)
```bash
bash setup-db.sh
```

### วิธีที่ 3: ใช้ Batch Script (Windows)
```bash
setup-db.bat
```

### วิธีที่ 4: ใช้ MySQL Client โดยตรง
```bash
mysql -u root -p < setup-database.sql
```

## การใช้งาน

### การพัฒนา

```bash
npm run dev
```

### การ Build สำหรับ Production

```bash
npm run build
```

### การรันในโหมด Production

```bash
npm start
```

## การ Deploy บน Plesk

1. สร้าง Node.js Application ใน Plesk:
   - ไปที่ Plesk > Websites & Domains > doc.nozomi-th.com > Node.js
   - เปิดใช้งาน Node.js
   - ตั้งค่า Application root เป็นโฟลเดอร์ที่มีไฟล์ package.json
   - ตั้งค่า Application startup file เป็น `server.js`
   - ตั้งค่า Application mode เป็น `production`

2. อัปโหลดไฟล์และสร้างแอปพลิเคชัน:
   - อัปโหลดไฟล์ทั้งหมดไปยังเซิร์ฟเวอร์
   - เชื่อมต่อผ่าน SSH และรันคำสั่ง:
     ```bash
     cd /path/to/your/app
     npm install
     npm run build
     ```

3. สร้างฐานข้อมูล:
   - เชื่อมต่อผ่าน SSH และรันคำสั่ง:
     ```bash
     cd /path/to/your/app
     npm run setup-db
     ```
   - หรือใช้ phpMyAdmin ที่มีใน Plesk เพื่อนำเข้าไฟล์ setup-database.sql

4. ใช้ PM2 เพื่อให้แอปพลิเคชันทำงานต่อเนื่อง:
   ```bash
   npm install -g pm2
   pm2 start server.js --name "doc-nozomi"
   pm2 save
   pm2 startup
   ```

5. ตั้งค่า Environment Variables ใน Plesk:
   - ไปที่ Node.js settings ของโดเมน
   - เพิ่ม Environment Variables ตามที่กำหนดในไฟล์ .env

6. ตั้งค่า SSL Certificate:
   - ไปที่ SSL/TLS Certificates
   - เลือก Let's Encrypt เพื่อติดตั้ง SSL ฟรี