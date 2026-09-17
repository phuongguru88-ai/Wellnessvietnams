import type { Metadata } from "next";
import { Sparkles } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getCustomerInsightsReport } from "@/lib/customer-insights";
import { getActor } from "@/lib/scope";
import { AI_PROVIDER_LABELS } from "@/lib/types";
import { generateCustomerInsightsAction } from "./actions";

export const metadata: Metadata = {
  title: "Phân tích khách hàng",
  robots: { index: false, follow: false },
};

export default async function KhachHangPage({
  searchParams,
}: {
  searchParams: Promise<{ generated?: string; error?: string }>;
}) {
  const actor = await getActor();
  if (actor?.role !== "admin") redirect("/quan-tri");

  const sp = await searchParams;
  const report = await getCustomerInsightsReport();

  return (
    <div>
      <p className="eyebrow">Quản trị đối tác</p>
      <h1 className="mt-2 text-3xl">Phân tích khách hàng</h1>
      <p className="mt-2 text-sm text-ink-soft">
        AI tổng hợp insight từ toàn bộ khách để lại thông tin (lead) — phân khúc, xu hướng nhu cầu, đề xuất
        chăm sóc/marketing.
      </p>

      {sp.generated && (
        <p className="mt-4 rounded-xl border border-moss bg-card px-4 py-3 text-sm font-medium text-moss">
          Đã tạo phân tích mới.
        </p>
      )}
      {sp.error === "chua-cau-hinh" && (
        <p className="mt-4 rounded-xl border border-turmeric bg-card px-4 py-3 text-sm font-medium text-turmeric">
          Chưa cấu hình API key cho AI. Vào{" "}
          <Link href="/quan-tri/cai-dat-ai" className="underline">
            Cài đặt AI
          </Link>{" "}
          để thêm.
        </p>
      )}
      {sp.error === "loi" && (
        <p className="mt-4 rounded-xl border border-turmeric bg-card px-4 py-3 text-sm font-medium text-turmeric">
          Không tạo được phân tích — thử lại sau.
        </p>
      )}

      <form action={generateCustomerInsightsAction} className="mt-6">
        <button type="submit" className="btn btn-primary">
          <Sparkles aria-hidden size={15} strokeWidth={1.75} />
          {report ? "Tạo lại phân tích" : "Tạo phân tích"}
        </button>
      </form>

      {report ? (
        <div className="mt-6 space-y-6">
          <div className="rounded-card border border-line bg-card p-6">
            <p className="text-xs text-ink-soft">
              Dựa trên {report.leadCount} lead · {AI_PROVIDER_LABELS[report.provider]} ({report.model}) · tạo lúc{" "}
              {new Date(report.generatedAt).toLocaleString("vi-VN")}
            </p>
            <p className="mt-3 text-sm text-ink">{report.summary}</p>
          </div>

          {report.segments.length > 0 && (
            <div className="rounded-card border border-line bg-card p-6">
              <h2 className="text-lg font-semibold text-ink">Phân khúc khách hàng</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {report.segments.map((s, i) => (
                  <div key={i} className="rounded-xl border border-line p-4">
                    <p className="flex items-center justify-between gap-2 text-sm font-semibold text-ink">
                      {s.name}
                      <span className="shrink-0 rounded-full bg-ink px-2 py-0.5 text-xs text-bg">{s.count}</span>
                    </p>
                    <p className="mt-1 text-xs text-ink-soft">{s.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {report.trends.length > 0 && (
            <div className="rounded-card border border-line bg-card p-6">
              <h2 className="text-lg font-semibold text-ink">Xu hướng nhu cầu</h2>
              <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-ink-soft">
                {report.trends.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </div>
          )}

          {report.recommendations.length > 0 && (
            <div className="rounded-card border border-line bg-card p-6">
              <h2 className="text-lg font-semibold text-ink">Đề xuất</h2>
              <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-ink-soft">
                {report.recommendations.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <p className="mt-6 text-sm text-ink-soft">Chưa có phân tích nào — bấm nút phía trên để tạo lần đầu.</p>
      )}
    </div>
  );
}
