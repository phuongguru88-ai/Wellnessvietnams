import type { Metadata } from "next";

import { AdminHeader } from "@/components/admin/AdminHeader";
import { getActor } from "@/lib/scope";

// Khu vực quản trị không dành cho công cụ tìm kiếm.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function QuanTriLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // middleware.ts đã chặn truy cập khi chưa đăng nhập; đọc lại actor ở đây
  // chỉ để quyết định có hiện thanh điều hướng quản trị hay không (trang
  // đăng nhập thì không) và để thanh đó biết đang hiện nav cho ai.
  const actor = await getActor();

  return (
    <div className="min-h-dvh bg-bg text-ink">
      {actor && <AdminHeader actor={actor} />}
      <main className="shell py-8 sm:py-10">{children}</main>
    </div>
  );
}
