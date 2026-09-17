import { Brain, ExternalLink, LayoutDashboard, LogOut, Settings, ShieldCheck, Users } from "lucide-react";
import Link from "next/link";

import { logoutAction } from "@/app/quan-tri/actions";
import type { Actor } from "@/lib/auth";
import { ARTICLE_ICON, BOOKING_ICON, EXPERIENCE_ICON, PROGRAM_ICON, STAY_ICON } from "@/lib/icons";

const BASE_LINKS = [
  { href: "/quan-tri", label: "Tổng quan", icon: LayoutDashboard },
  { href: "/quan-tri/dat-phong", label: "Đặt phòng", icon: BOOKING_ICON },
  { href: "/quan-tri/luu-tru", label: "Lưu trú", icon: STAY_ICON },
  { href: "/quan-tri/chuong-trinh", label: "Chương trình", icon: PROGRAM_ICON },
  { href: "/quan-tri/trai-nghiem", label: "Trải nghiệm", icon: EXPERIENCE_ICON },
] as const;

// Liên hệ (lead), Phân tích khách hàng, Kiến thức, Đối tác và Cài đặt AI
// không gắn với một Property cụ thể nào — chỉ đội ngũ trung tâm (role admin)
// mới thấy, tránh lộ số điện thoại khách của toàn hệ thống cho từng đối tác
// riêng lẻ.
const ADMIN_ONLY_LINKS = [
  { href: "/quan-tri/leads", label: "Liên hệ", icon: Users },
  { href: "/quan-tri/khach-hang", label: "Khách hàng", icon: Brain },
  { href: "/quan-tri/bai-viet", label: "Kiến thức", icon: ARTICLE_ICON },
  { href: "/quan-tri/doi-tac", label: "Đối tác", icon: ShieldCheck },
  { href: "/quan-tri/cai-dat-ai", label: "Cài đặt AI", icon: Settings },
] as const;

export function AdminHeader({ actor }: { actor: Actor }) {
  const links = actor.role === "admin" ? [...BASE_LINKS, ...ADMIN_ONLY_LINKS] : BASE_LINKS;

  return (
    <header className="border-b border-line bg-card">
      <div className="shell flex h-16 items-center justify-between gap-4">
        <Link
          href="/quan-tri"
          className="shrink-0 whitespace-nowrap font-display text-lg font-semibold"
        >
          Quản trị đối tác
        </Link>

        <nav aria-label="Điều hướng quản trị" className="hidden xl:block">
          <ul className="flex items-center gap-1">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium text-ink-soft hover:bg-bg hover:text-ink"
                >
                  <l.icon aria-hidden size={15} strokeWidth={1.75} />
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <p className="hidden whitespace-nowrap text-sm text-ink-soft sm:block">
            {actor.name} <span className="text-xs">({actor.role === "admin" ? "quản trị" : "đối tác"})</span>
          </p>
          <Link
            href="/"
            title="Xem trang công khai"
            aria-label="Xem trang công khai"
            className="hidden shrink-0 items-center justify-center rounded-full p-2 text-ink-soft hover:bg-bg hover:text-ink sm:inline-flex"
          >
            <ExternalLink aria-hidden size={17} strokeWidth={1.75} />
          </Link>
          <form action={logoutAction}>
            <button type="submit" className="btn btn-ghost whitespace-nowrap">
              <LogOut aria-hidden size={15} strokeWidth={1.75} />
              Đăng xuất
            </button>
          </form>
        </div>
      </div>

      <nav
        aria-label="Điều hướng quản trị (di động)"
        className="shell flex gap-2 overflow-x-auto pb-3 xl:hidden"
      >
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-line px-3 py-1.5 text-xs font-medium text-ink-soft"
          >
            <l.icon aria-hidden size={13} strokeWidth={1.75} />
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
