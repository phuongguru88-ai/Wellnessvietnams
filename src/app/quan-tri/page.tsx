import type { Metadata } from "next";
import { ArrowRight, Users } from "lucide-react";
import Link from "next/link";

import { listBookings } from "@/lib/bookings";
import { getBaiVietList, getExperiences, getPrograms, getProperties } from "@/lib/data";
import { ARTICLE_ICON, BOOKING_ICON, EXPERIENCE_ICON, PROGRAM_ICON, STAY_ICON } from "@/lib/icons";
import { listLeads } from "@/lib/leads";
import { getActor, scopeByPropertyRef, scopeProperties } from "@/lib/scope";

export const metadata: Metadata = {
  title: "Tổng quan quản trị",
  robots: { index: false, follow: false },
};

export default async function QuanTriPage() {
  const actor = await getActor();
  if (!actor) return null;
  const isAdmin = actor.role === "admin";

  const [properties, programs, experiences, baiViet, leads, bookingsRaw] = await Promise.all([
    getProperties(),
    getPrograms(),
    getExperiences(),
    isAdmin ? getBaiVietList() : Promise.resolve([]),
    isAdmin ? listLeads() : Promise.resolve([]),
    listBookings(),
  ]);
  const scopedProperties = scopeProperties(actor, properties);
  const scopedPrograms = scopeByPropertyRef(actor, programs);
  const scopedExperiences = scopeByPropertyRef(actor, experiences);
  const bookings = scopeByPropertyRef(actor, bookingsRaw);

  const chuaLienHe = leads.filter((l) => !l.contactedAt).length;
  const choXacNhan = bookings.filter((b) => b.status === "Chờ xác nhận").length;

  const cards = [
    { href: "/quan-tri/luu-tru", label: "Lưu trú", icon: STAY_ICON, count: scopedProperties.length },
    {
      href: "/quan-tri/dat-phong",
      label: "Yêu cầu đặt phòng",
      icon: BOOKING_ICON,
      count: bookings.length,
      badge: choXacNhan > 0 ? `${choXacNhan} chờ xác nhận` : undefined,
    },
    {
      href: "/quan-tri/chuong-trinh",
      label: "Chương trình",
      icon: PROGRAM_ICON,
      count: scopedPrograms.length,
    },
    {
      href: "/quan-tri/trai-nghiem",
      label: "Trải nghiệm",
      icon: EXPERIENCE_ICON,
      count: scopedExperiences.length,
    },
    ...(isAdmin
      ? [
          {
            href: "/quan-tri/bai-viet",
            label: "Kiến thức",
            icon: ARTICLE_ICON,
            count: baiViet.length,
          },
          {
            href: "/quan-tri/leads",
            label: "Khách để lại thông tin",
            icon: Users,
            count: leads.length,
            badge: chuaLienHe > 0 ? `${chuaLienHe} chưa liên hệ` : undefined,
          },
        ]
      : []),
  ];

  return (
    <div>
      <p className="eyebrow">Quản trị đối tác</p>
      <h1 className="mt-2 text-3xl">Tổng quan</h1>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="rounded-card border border-line bg-card p-6 transition hover:-translate-y-0.5 hover:shadow-lift"
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-bg text-turmeric">
              <c.icon aria-hidden size={19} strokeWidth={1.75} />
            </span>
            <p className="mt-4 font-display text-3xl">{c.count}</p>
            <p className="mt-1 text-sm text-ink-soft">{c.label}</p>
            {c.badge && (
              <p className="mt-2 text-xs font-semibold text-turmeric">{c.badge}</p>
            )}
          </Link>
        ))}
      </div>

      <div className="mt-10 rounded-card border border-line bg-card p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl">Yêu cầu đặt phòng gần đây</h2>
          <Link href="/quan-tri/dat-phong" className="inline-flex items-center gap-1 text-sm font-semibold text-turmeric">
            Xem tất cả
            <ArrowRight aria-hidden size={14} strokeWidth={2} />
          </Link>
        </div>
        <ul className="mt-4 divide-y divide-[color:var(--line)]">
          {bookings.slice(0, 5).map((b) => (
            <li key={b.id} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3 text-sm">
              <span className="font-medium">
                {b.name} · <a href={`tel:${b.phone}`} className="underline underline-offset-4">{b.phone}</a>
              </span>
              <span className="text-ink-soft">
                {b.propertyName} · {b.checkIn} → {b.checkOut} · {b.status}
              </span>
            </li>
          ))}
          {bookings.length === 0 && (
            <li className="py-3 text-sm text-ink-soft">Chưa có yêu cầu đặt phòng nào.</li>
          )}
        </ul>
      </div>

      {isAdmin && (
        <div className="mt-10 rounded-card border border-line bg-card p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl">Khách để lại thông tin gần đây</h2>
            <Link href="/quan-tri/leads" className="inline-flex items-center gap-1 text-sm font-semibold text-turmeric">
              Xem tất cả
              <ArrowRight aria-hidden size={14} strokeWidth={2} />
            </Link>
          </div>
          <ul className="mt-4 divide-y divide-[color:var(--line)]">
            {leads.slice(0, 5).map((l) => (
              <li key={l.id} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3 text-sm">
                <span className="font-medium">
                  {l.name} · <a href={`tel:${l.phone}`} className="underline underline-offset-4">{l.phone}</a>
                </span>
                <span className="text-ink-soft">
                  {l.loaiHinhQuanTam} · {new Date(l.createdAt).toLocaleString("vi-VN")}
                </span>
              </li>
            ))}
            {leads.length === 0 && (
              <li className="py-3 text-sm text-ink-soft">Chưa có ai để lại thông tin.</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
