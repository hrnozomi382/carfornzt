# การ Deploy บน Vercel

## ขั้นตอนการ Deploy

### 1. เตรียมฐานข้อมูล

#### ตัวเลือกที่ 1: ใช้ Vercel Postgres (แนะนำ)
1. ไปที่ Vercel Dashboard
2. เลือกโปรเจกต์ของคุณ
3. ไปที่ Storage > Create Database > Postgres
4. คัดลอก environment variables ที่ได้

#### ตัวเลือกที่ 2: ใช้ External MySQL Database
- PlanetScale (ฟรี)
- Railway (ฟรี tier)
- AWS RDS
- Google Cloud SQL

### 2. ตั้งค่า Environment Variables ใน Vercel

ไปที่ Project Settings > Environment Variables และเพิ่ม:

#### สำหรับ Vercel Postgres:
```
POSTGRES_URL=your-postgres-url
POSTGRES_PRISMA_URL=your-postgres-prisma-url
POSTGRES_URL_NO_SSL=your-postgres-no-ssl-url
POSTGRES_URL_NON_POOLING=your-postgres-non-pooling-url
POSTGRES_USER=your-postgres-user
POSTGRES_HOST=your-postgres-host
POSTGRES_PASSWORD=your-postgres-password
POSTGRES_DATABASE=your-postgres-database
JWT_SECRET=your-secret-key-here
NODE_ENV=production
```

#### สำหรับ External MySQL:
```
DB_HOST=your-mysql-host
DB_PORT=3306
DB_USER=your-mysql-user
DB_PASSWORD=your-mysql-password
DB_NAME=your-database-name
JWT_SECRET=your-secret-key-here
NODE_ENV=production
```

### 3. Deploy

1. Push โค้ดไปยัง GitHub repository
2. เชื่อมต่อ repository กับ Vercel
3. Vercel จะ deploy อัตโนมัติ

### 4. สร้างฐานข้อมูล

หลังจาก deploy แล้ว ให้รันสคริปต์สร้างฐานข้อมูล:

#### สำหรับ Vercel Postgres:
```bash
node scripts/setup-vercel-db.js
```

#### สำหรับ External MySQL:
ใช้ไฟล์ `setup-database.sql` เพื่อสร้างตารางในฐานข้อมูล

## การแก้ไขปัญหา

### ปัญหา: Database connection failed
- ตรวจสอบ environment variables
- ตรวจสอบการเชื่อมต่อฐานข้อมูล
- ดู logs ใน Vercel Dashboard

### ปัญหา: Function timeout
- เพิ่ม `maxDuration` ใน vercel.json
- ปรับปรุงการ query ให้เร็วขึ้น

## ข้อจำกัดของ Vercel

- Serverless functions มี timeout 10 วินาที (hobby plan)
- ไม่สามารถใช้ local MySQL ได้
- ต้องใช้ external database service