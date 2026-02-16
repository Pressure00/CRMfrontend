import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Пути, которые не требуют авторизации
const publicPaths = [
  '/login',
  '/register',
  '/company-setup',
  '/forgot-password',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/forgot-password',
  '/api/health',
];

// Пути для админа
const adminPaths = ['/admin'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Проверяем, является ли путь публичным
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Получаем токен из cookies
  const token = request.cookies.get('access_token')?.value;
  
  // Если нет токена, перенаправляем на логин
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Для админских путей проверяем роль (можно добавить проверку через API)
  if (adminPaths.some(path => pathname.startsWith(path))) {
    // Здесь можно добавить проверку роли через JWT или API
    // Пока просто пропускаем
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};