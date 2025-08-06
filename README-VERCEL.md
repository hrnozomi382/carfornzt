# Vercel Deployment Setup

## Environment Variables ที่ต้องตั้งค่าใน Vercel Dashboard:

1. ไปที่ Vercel Dashboard > Project Settings > Environment Variables
2. เพิ่มตัวแปรต่อไปนี้:

```
DB_HOST=your-mysql-host
DB_USER=your-mysql-username  
DB_PASSWORD=your-mysql-password
DB_NAME=your-database-name
JWT_SECRET=your-jwt-secret-key
NODE_ENV=production
```

## ตัวเลือกสำหรับ Database:

### 1. PlanetScale (แนะนำ)
- ฟรี MySQL-compatible database
- รองรับ serverless
- ตั้งค่าง่าย

### 2. Railway
- ฟรี MySQL database
- เชื่อมต่อง่าย

### 3. Aiven
- ฟรี MySQL database
- รองรับหลาย cloud provider

### 4. Vercel Postgres + Prisma
- ใช้ Postgres แทน MySQL
- ต้องแก้ไข schema

## หลังจากตั้งค่า Environment Variables:
1. Redeploy ใน Vercel
2. ทดสอบการเชื่อมต่อที่ `/api/test-db`