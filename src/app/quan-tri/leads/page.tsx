import type { Metadata } from "next";
import { CheckCircle2, Circle, Phone, Sparkles } from "lucide-react";
import { redirect } from "next/navigation";

import { listLeadInsights } from "@/lib/lead-insights";
import { listLeads } from "@/lib/leads";
import { getActor } from "@/lib/scope";
import { analyzeLeadAction, toggleContactedAction } from "./actions";

export const metadata: Metadata = {
  title: "Khách để lại thông tin",
  robots: { index: false, follow: false },
};

export default async function LeadsPage() {
  // Lead không gắn với một Property cụ thể — chỉ đội trung tâm (role admin)
  // được xem, tránh lộ số điện thoại khách của toàn hệ thống cho đối tác.
  const actor = await getActor();
  if (actor?.role !== "admin") redirect("/quan-tri");

  const [leads, insights] = await Promise.all([listLeads(), listLeadInsights()]);
  const insightByLeadId = new Map(insights.map((i) => [i.leadId, i]));

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
              <th className="px-4 py-3 font-semibold">Phân tích AI</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => {
              const insight = insightByLeadId.get(l.id);
              return (
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
                <td className="max-w-[260px] px-4 py-3">
                  {insight ? (
                    <div className="space-y-1.5">
                      <p className="inline-flex items-center gap-1 rounded-full bg-ink px-2.5 py-1 text-xs font-semibold text-bg">
                        <Sparkles aria-hidden size={12} strokeWidth={1.75} />
                        {insight.segment}
                      </p>
                      <p className="text-xs text-ink-soft">{insight.summary}</p>
                      {insight.suggestedActions.length > 0 && (
                        <ul className="list-disc space-y-0.5 pl-4 text-xs text-ink-soft">
                          {insight.suggestedActions.map((a, i) => (
                            <li key={i}>{a}</li>
                          ))}
                        </ul>
                      )}
                      <form action={analyzeLeadAction.bind(null, l.id)}>
                        <button
                          type="submit"
                          className="text-xs font-semibold text-ink-soft underline underline-offset-4 hover:text-ink"
                        >
                          Phân tích lại
                        </button>
                      </form>
                    </div>
                  ) : (
                    <form action={analyzeLeadAction.bind(null, l.id)}>
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-ink-soft hover:border-ink-soft hover:text-ink"
                      >
                        <Sparkles aria-hidden size={14} strokeWidth={1.75} />
                        Phân tích AI
                      </button>
                    </form>
                  )}
                </td>
              </tr>
              );
            })}
            {leads.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-ink-soft">
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
