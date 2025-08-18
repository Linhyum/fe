import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtDecode } from 'jwt-decode'

interface DecodedToken {
   sub?: string
   roles?: string
   exp?: number
}

// Kiểm tra token có hợp lệ không
function isTokenValid(token: string | null): boolean {
   if (!token) return false

   try {
      const decoded = jwtDecode<DecodedToken>(token)
      if (!decoded.exp) return false

      // Kiểm tra token còn hạn không
      return decoded.exp * 1000 > Date.now()
   } catch {
      return false
   }
}

// Kiểm tra user có role admin không
function isAdmin(token: string | null): boolean {
   if (!token) return false

   try {
      const decoded = jwtDecode<DecodedToken>(token)
      return decoded.roles === 'ROLE_ADMIN'
   } catch {
      return false
   }
}

export function middleware(request: NextRequest) {
   const accessToken = request.cookies.get('access_token')?.value || request.headers.get('Authorization')?.split(' ')[1]

   // Các route cần auth
   const authRoutes = ['/dashboard', '/profile', '/purchase', '/wishlist']
   // Các route chỉ dành cho guest
   const guestRoutes = ['/login', '/register', '/forgot-password']
   // Các route chỉ dành cho admin
   const adminRoutes = ['/dashboard']

   const isAuthRoute = authRoutes.some((route) => request.nextUrl.pathname.startsWith(route))
   const isGuestRoute = guestRoutes.some((route) => request.nextUrl.pathname.startsWith(route))
   const isAdminRoute = adminRoutes.some((route) => request.nextUrl.pathname.startsWith(route))

   // Nếu token hợp lệ
   if (isTokenValid(accessToken ?? null)) {
      // Kiểm tra quyền admin cho các route admin
      if (isAdminRoute && !isAdmin(accessToken ?? null)) {
         // Nếu không phải admin mà cố truy cập route admin thì redirect về home
         return NextResponse.redirect(new URL('/', request.url))
      }

      // Nếu đã login mà cố truy cập route guest (login, register,...) thì redirect về home
      if (isGuestRoute) {
         return NextResponse.redirect(new URL('/', request.url))
      }
      // Cho phép truy cập các route khác
      return NextResponse.next()
   }

   // Nếu chưa login
   if (!isTokenValid(accessToken ?? null)) {
      // Nếu cố truy cập route cần auth thì redirect về login
      if (isAuthRoute) {
         const response = NextResponse.redirect(new URL('/login', request.url))
         response.cookies.delete('access_token')
         response.cookies.delete('refresh_token')
         return response
      }
      // Cho phép truy cập các route không cần auth
      return NextResponse.next()
   }

   return NextResponse.next()
}

export const config = {
   matcher: [
      /*
       * Match all request paths except for the ones starting with:
       * - api (API routes)
       * - _next/static (static files)
       * - _next/image (image optimization files)
       * - favicon.ico (favicon file)
       */
      '/((?!api|_next/static|_next/image|favicon.ico).*)'
   ]
}
