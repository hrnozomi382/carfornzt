# คู่มือ Deploy บน Plesk Control Panel

## ข้อมูลโปรเจค
- **โดเมน**: doc.nozomi-th.com
- **Framework**: Next.js 14
- **Database**: MySQL
- **Node.js**: >= 18.0.0

## ขั้นตอนการ Deploy

### 1. เตรียมไฟล์
```bash
# Build โปรเจคก่อน deploy
npm run build
```

### 2. อัปโหลดไฟล์ไปยัง Plesk
- อัปโหลดไฟล์ทั้งหมดไปยัง `/var/www/vhosts/doc.nozomi-th.com/httpdocs/`
- ยกเว้นโฟลเดอร์: `node_modules`, `.next`, `.git`

### 3. ตั้งค่า Node.js Application ใน Plesk
1. เข้า **Plesk Panel > Websites & Domains > doc.nozomi-th.com**
2. คลิก **Node.js**
3. เปิดใช้งาน Node.js
4. ตั้งค่า:
   - **Node.js version**: 18.x หรือสูงกว่า
   - **Application mode**: `production`
   - **Application root**: `/httpdocs` (หรือโฟลเดอร์ที่มี package.json)
   - **Application startup file**: `server.js`
   - **Application URL**: `https://doc.nozomi-th.com`

### 4. ติดตั้ง Dependencies
```bash
# SSH เข้าเซิร์ฟเวอร์
ssh username@doc.nozomi-th.com

# ไปยังโฟลเดอร์แอป
cd /var/www/vhosts/doc.nozomi-th.com/httpdocs

# ติดตั้ง dependencies
npm install --production

# Build แอป
npm run build
```

### 5. สร้างฐานข้อมูล
```bash
# วิธีที่ 1: ใช้ script
npm run setup-db

# วิธีที่ 2: ใช้ phpMyAdmin
# - เข้า Plesk > Databases > phpMyAdmin
# - Import ไฟล์ setup-database.sql
```

### 6. ตั้งค่า Environment Variables
ใน **Node.js Settings** ของ Plesk เพิ่ม:

```
NODE_ENV=production
PORT=3000
HOSTNAME=0.0.0.0

# Database
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name

# JWT
JWT_SECRET=your_jwt_secret_key

# API Keys (ถ้ามี)
ANTHROPIC_API_KEY=your_anthropic_api_key
```

### 7. ตั้งค่า PM2 (แนะนำ)
```bash
# ติดตั้ง PM2
npm install -g pm2

# เริ่มแอป
pm2 start server.js --name "doc-nozomi-carbook"

# บันทึกการตั้งค่า
pm2 save

# ตั้งค่าให้เริ่มอัตโนมัติ
pm2 startup
```

### 8. ตั้งค่า SSL Certificate
1. ไปที่ **SSL/TLS Certificates**
2. เลือก **Let's Encrypt**
3. เปิดใช้งาน **Force HTTPS redirect**

### 9. ตั้งค่า Proxy (ถ้าจำเป็น)
ใน **Apache & nginx Settings**:
```nginx
location / {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
}
```

## การตรวจสอบ

### ตรวจสอบสถานะแอป
```bash
# ดูสถานะ PM2
pm2 status

# ดู logs
pm2 logs doc-nozomi-carbook

# Restart แอป
pm2 restart doc-nozomi-carbook
```

### ตรวจสอบการเชื่อมต่อฐานข้อมูล
```bash
# ทดสอบการเชื่อมต่อ
node -e "
const mysql = require('mysql2');
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});
connection.connect(err => {
  if (err) console.error('Database connection failed:', err);
  else console.log('Database connected successfully');
  connection.end();
});
"
```

## การอัปเดต

### อัปเดตโค้ด
```bash
# Pull โค้ดใหม่
git pull origin main

# ติดตั้ง dependencies ใหม่
npm install --production

# Build ใหม่
npm run build

# Restart แอป
pm2 restart doc-nozomi-carbook
```

## Troubleshooting

### ปัญหาที่พบบ่อย
1. **Port ถูกใช้งาน**: เปลี่ยน PORT ใน environment variables
2. **Database connection error**: ตรวจสอบ DB credentials
3. **Permission denied**: ตั้งค่า file permissions
4. **Module not found**: รัน `npm install` ใหม่

### คำสั่งที่มีประโยชน์
```bash
# ดู process ที่ใช้ port
netstat -tulpn | grep :3000

# ดู disk space
df -h

# ดู memory usage
free -m

# ดู logs ของ Node.js
tail -f /var/log/nodejs/error.log
```