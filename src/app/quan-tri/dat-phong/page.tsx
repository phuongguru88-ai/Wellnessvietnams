import type { Metadata } from "next";
import { Mail, Phone } from "lucide-react";
import Link from "next/link";

import { listBookings } from "@/lib/bookings";
import { formatVnd } from "@/lib/format";
import { getActor, scopeByPropertyRef } from "@/lib/scope";
import type { BookingStatus } from "@/lib/types";
import { setBookingStatusAction } from "./actions";

export const metadata: Metadata = {
  title: "Yêu cầu đặt phòng",
  robots: { index: false, follow: false },
};

const STATUS_STYLE: Record<BookingStatus, string> = {
  "Chờ xác nhận": "border-line text-ink-soft",
  "Đã xác nhận": "border-transparent bg-moss text-bg",
  "Đã huỷ": "border-transparent bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
};

export default async function BookingsPage() {
  const actor = await getActor();
  if (!actor) return null;
  const bookings = scopeByPropertyRef(actor, await listBookings());
  const choXacNhan = bookings.filter((b) => b.status === "Chờ xác nhận").length;

  return (
    <div>
      <p className="eyebrow">Quản trị đối tác</p>
      <h1 className="mt-2 text-3xl">Yêu cầu đặt phòng</h1>
      <p className="mt-2 text-sm text-ink-soft">
        {bookings.length} yêu cầu giữ chỗ gửi từ trang Lưu trú, mới nhất trước
        {choXacNhan > 0 && ` — ${choXacNhan} đang chờ xác nhận`}. Đây là giữ
        chỗ tạm, gọi lại khách để xác nhận phòng còn trống trước khi đổi
        trạng thái.
      </p>

      <div className="mt-6 overflow-x-auto rounded-card border border-line">
        <table className="w-full min-w-[960px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-line bg-card text-left text-xs uppercase tracking-wide text-ink-soft">
              <th className="px-4 py-3 font-semibold">Khách</th>
              <th className="px-4 py-3 font-semibold">Nơi ở</th>
              <th className="px-4 py-3 font-semibold">Ngày ở</th>
              <th className="px-4 py-3 font-semibold">Khách/Tạm tính</th>
              <th className="px-4 py-3 font-semibold">Gửi lúc</th>
              <th className="px-4 py-3 font-semibold">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id} className="border-b border-line last:border-b-0 align-top">
                <td className="px-4 py-3">
                  <p className="font-medium">{b.name}</p>
                  <a
                    href={`tel:${b.phone}`}
                    className="inline-flex items-center gap-1 text-ink-soft underline underline-offset-4"
                  >
                    <Phone aria-hidden size={12} strokeWidth={1.75} />
                    {b.phone}
                  </a>
                  {b.email && (
                    <a
                      href={`mailto:${b.email}`}
                      className="mt-0.5 flex items-center gap-1 text-ink-soft underline underline-offset-4"
                    >
                      <Mail aria-hidden size={12} strokeWidth={1.75} />
                      {b.email}
                    </a>
                  )}
                  {b.note && <p className="mt-1 max-w-[220px] text-xs text-ink-soft">{b.note}</p>}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/luu-tru/${b.propertySlug}`}
                    target="_blank"
                    className="font-medium underline-offset-4 hover:underline"
                  >
                    {b.propertyName}
                  </Link>
                  {b.roomTypeName && <p className="text-ink-soft">{b.roomTypeName}</p>}
                </td>
                <td className="px-4 py-3 text-ink-soft">
                  {b.checkIn} → {b.checkOut}
                  <p>{b.nights} đêm</p>
                </td>
                <td className="px-4 py-3 text-ink-soft">
                  {b.guests} khách
                  {b.estimatedTotal !== undefined && <p>{formatVnd(b.estimatedTotal)}</p>}
                </td>
                <td className="px-4 py-3 text-ink-soft">
                  {new Date(b.createdAt).toLocaleString("vi-VN")}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold ${STATUS_STYLE[b.status]}`}
                  >
                    {b.status}
                  </span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {b.status !== "Đã xác nhận" && (
                      <form action={setBookingStatusAction.bind(null, b.id, "Đã xác nhận")}>
                        <button type="submit" className="text-xs font-semibold text-moss underline-offset-4 hover:underline">
                          Xác nhận
                        </button>
                      </form>
                    )}
                    {b.status !== "Đã huỷ" && (
                      <form action={setBookingStatusAction.bind(null, b.id, "Đã huỷ")}>
                        <button type="submit" className="text-xs font-semibold text-rose-600 underline-offset-4 hover:underline dark:text-rose-400">
                          Huỷ
                        </button>
                      </form>
                    )}
                    {b.status !== "Chờ xác nhận" && (
                      <form action={setBookingStatusAction.bind(null, b.id, "Chờ xác nhận")}>
                        <button type="submit" className="text-xs font-medium text-ink-soft underline-offset-4 hover:underline">
                          Đặt lại chờ xác nhận
                        </button>
                      </form>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {bookings.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-ink-soft">
                  Chưa có yêu cầu đặt phòng nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
