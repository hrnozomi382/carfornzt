import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // ตรวจสอบว่ามี auth_token ใน cookie หรือไม่
  const token = request.cookies.get('auth_token')
  
  console.log('Middleware - Token found:', token ? 'Yes' : 'No')
  if (token) {
    console.log('Middleware - Token value:', token.value.substring(0, 10) + '...')
  }
  
  // ถ้ามี token ใน cookie ให้เพิ่ม Authorization header
  if (token) {
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('Authorization', `Bearer ${token.value}`)
    console.log('Middleware - Setting Authorization header')
    
    // สร้าง response ใหม่ที่มี header ที่ต้องการ
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }
  
  return NextResponse.next()
}

// ระบุ path ที่ต้องการให้ middleware ทำงาน
export const config = {
  matcher: ['/api/:path*'],
}