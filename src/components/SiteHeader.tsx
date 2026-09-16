"use client";

import { Menu, PhoneCall, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { NAV, SITE_NAME } from "@/lib/site";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Đóng menu khi chuyển trang.
  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur-md">
      <div className="shell flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5">
          <Leaf />
          <span className="font-display text-lg font-semibold tracking-tight">
            {SITE_NAME}
          </span>
        </Link>

        <nav aria-label="Điều hướng chính" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-medium transition ${
                      active
                        ? "bg-card text-ink"
                        : "text-ink-soft hover:text-ink"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/lien-he" className="btn btn-primary hidden sm:inline-flex">
            <PhoneCall aria-hidden size={15} strokeWidth={2} />
            Nhận tư vấn
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="menu-mobile"
            className="btn btn-ghost px-3 py-2 lg:hidden"
          >
            <span className="sr-only">Mở menu</span>
            {open ? (
              <X aria-hidden size={18} strokeWidth={1.75} />
            ) : (
              <Menu aria-hidden size={18} strokeWidth={1.75} />
            )}
          </button>
        </div>
      </div>

      {open && (
        <nav
          id="menu-mobile"
          aria-label="Điều hướng chính (di động)"
          className="border-t border-line bg-bg lg:hidden"
        >
          <ul className="shell flex flex-col py-2">
            {[...NAV, { href: "/lien-he", label: "Nhận tư vấn" }].map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block border-b border-line py-3 text-base font-medium last:border-b-0"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}

function Leaf() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden>
      <circle cx="13" cy="13" r="13" fill="var(--moss)" opacity="0.18" />
      <path
        d="M13 21c0-5 1-9 6-13-6 0-10 3-10 8 0 2 1.5 4 4 5Z"
        fill="var(--moss)"
      />
      <path d="M13 21c0-4 .8-7.5 6-11" stroke="var(--bg)" strokeWidth="1.1" fill="none" />
    </svg>
  );
}
