import { NextResponse, type NextRequest } from "next/server";

import { ADMIN_COOKIE, verifySessionToken } from "@/lib/auth";

const LOGIN_PATH = "/quan-tri/dang-nhap";

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

/**
 * Hai việc trong một middleware:
 * 1. Chặn mọi route /quan-tri/* (trừ trang đăng nhập) nếu chưa có phiên
 *    quản trị hợp lệ — đây là lớp bảo vệ chính cho dữ liệu lead (có SĐT
 *    khách) và form sửa nội dung.
 * 2. Gắn header x-pathname cho mọi request để layout gốc (Server
 *    Component) biết đang ở /quan-tri hay trang công khai, từ đó quyết
 *    định có hiện header/footer marketing hay không — không cần "use
 *    client" hay tách route group.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/quan-tri") && pathname !== LOGIN_PATH) {
    const token = request.cookies.get(ADMIN_COOKIE)?.value;
    const ok = await verifySessionToken(token);
    if (!ok) {
      const url = request.nextUrl.clone();
      url.pathname = LOGIN_PATH;
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  const headers = new Headers(request.headers);
  headers.set("x-pathname", pathname);
  return NextResponse.next({ request: { headers } });
}
