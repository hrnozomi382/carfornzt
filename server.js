const { createServer } = require('http');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// ใช้พอร์ตจาก environment variable หรือใช้ค่าเริ่มต้น 3000
const port = process.env.PORT || 3000;
const hostname = process.env.HOSTNAME || '0.0.0.0';

app.prepare().then(() => {
  createServer((req, res) => {
    handle(req, res);
  }).listen(port, hostname, (err) => {
    if (err) throw err;
    console.log(`> Server running on http://${hostname}:${port}`);
  });
});