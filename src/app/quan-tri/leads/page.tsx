import type { Metadata } from "next";
import { CheckCircle2, Circle, Phone } from "lucide-react";
import { redirect } from "next/navigation";

import { listLeads } from "@/lib/leads";
import { getActor } from "@/lib/scope";
import { toggleContactedAction } from "./actions";

export const metadata: Metadata = {
  title: "Khách để lại thông tin",
  robots: { index: false, follow: false },
};

export default async function LeadsPage() {
  // Lead không gắn với một Property cụ thể — chỉ đội trung tâm (role admin)
  // được xem, tránh lộ số điện thoại khách của toàn hệ thống cho đối tác.
  const actor = await getActor();
  if (actor?.role !== "admin") redirect("/quan-tri");

  const leads = await listLeads();

  return (
    <div>
      <p className="eyebrow">Quản trị đối tác</p>
      <h1 className="mt-2 text-3xl">Khách để lại thông tin</h1>
      <p className="mt-2 text-sm text-ink-soft">
        {leads.length} lượt để lại thông tin qua form liên hệ, mới nhất trước.
      </p>

      <div className="mt-6 overflow-x-auto rounded-card border border-line">
        <table className="w-full min-w-[820px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-line bg-card text-left text-xs uppercase tracking-wide text-ink-soft">
              <th className="px-4 py-3 font-semibold">Khách</th>
              <th className="px-4 py-3 font-semibold">Quan tâm</th>
              <th className="px-4 py-3 font-semibold">Dự kiến đi</th>
              <th className="px-4 py-3 font-semibold">Ghi chú</th>
              <th className="px-4 py-3 font-semibold">Nguồn</th>
              <th className="px-4 py-3 font-semibold">Gửi lúc</th>
              <th className="px-4 py-3 font-semibold">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l.id} className="border-b border-line last:border-b-0 align-top">
                <td className="px-4 py-3">
                  <p className="font-medium">{l.name}</p>
                  <a
                    href={`tel:${l.phone}`}
                    className="inline-flex items-center gap-1 text-ink-soft underline underline-offset-4"
                  >
                    <Phone aria-hidden size={12} strokeWidth={1.75} />
                    {l.phone}
                  </a>
                </td>
                <td className="px-4 py-3">{l.loaiHinhQuanTam}</td>
                <td className="px-4 py-3 text-ink-soft">{l.date}</td>
                <td className="max-w-[240px] px-4 py-3 text-ink-soft">{l.note || "—"}</td>
                <td className="px-4 py-3 text-ink-soft">{l.source ?? "—"}</td>
                <td className="px-4 py-3 text-ink-soft">
                  {new Date(l.createdAt).toLocaleString("vi-VN")}
                </td>
                <td className="px-4 py-3">
                  <form action={toggleContactedAction.bind(null, l.id)}>
                    <button
                      type="submit"
                      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold ${
                        l.contactedAt
                          ? "border-transparent bg-moss text-bg"
                          : "border-line text-ink-soft hover:border-ink-soft hover:text-ink"
                      }`}
                    >
                      {l.contactedAt ? (
                        <CheckCircle2 aria-hidden size={14} strokeWidth={2} />
                      ) : (
                        <Circle aria-hidden size={14} strokeWidth={1.75} />
                      )}
                      {l.contactedAt ? "Đã liên hệ" : "Đánh dấu đã liên hệ"}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {leads.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-ink-soft">
                  Chưa có ai để lại thông tin.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
