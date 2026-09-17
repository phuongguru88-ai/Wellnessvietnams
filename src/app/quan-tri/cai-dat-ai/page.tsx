import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AiSettingsForm } from "@/components/admin/AiSettingsForm";
import { getAiSettings, resolveApiKey } from "@/lib/ai-settings";
import { getActor } from "@/lib/scope";
import { AI_PROVIDERS } from "@/lib/types";

export const metadata: Metadata = {
  title: "Cài đặt AI",
  robots: { index: false, follow: false },
};

export default async function CaiDatAiPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const actor = await getActor();
  if (actor?.role !== "admin") redirect("/quan-tri");

  const sp = await searchParams;
  const settings = await getAiSettings();

  return (
    <div>
      <p className="eyebrow">Quản trị đối tác</p>
      <h1 className="mt-2 text-3xl">Cài đặt AI</h1>
      <p className="mt-2 text-sm text-ink-soft">
        Nhập API key của một hoặc nhiều nhà cung cấp AI (Anthropic Claude, OpenAI, Google Gemini) và
        chọn model dùng cho từng chức năng AI trong hệ thống.
      </p>

      {sp.saved && (
        <p className="mt-4 rounded-xl border border-moss bg-card px-4 py-3 text-sm font-medium text-moss">
          Đã lưu cài đặt AI.
        </p>
      )}

      <div className="mt-6 max-w-xl rounded-card border border-line bg-card p-6">
        <AiSettingsForm
          hasApiKey={Object.fromEntries(
            AI_PROVIDERS.map((p) => [p, Boolean(resolveApiKey(settings, p))]),
          ) as Record<(typeof AI_PROVIDERS)[number], boolean>}
          models={settings.models}
        />
      </div>
    </div>
  );
}
