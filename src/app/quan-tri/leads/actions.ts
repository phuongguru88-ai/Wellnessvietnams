"use server";

import { revalidatePath } from "next/cache";

import { AiNotConfiguredError } from "@/lib/ai-client";
import { analyzeLead } from "@/lib/lead-insights";
import { listLeads, toggleLeadContacted } from "@/lib/leads";
import { getActor } from "@/lib/scope";

export async function toggleContactedAction(id: string) {
  const actor = await getActor();
  if (actor?.role !== "admin") return;

  await toggleLeadContacted(id);
}

export async function analyzeLeadAction(id: string) {
  const actor = await getActor();
  if (actor?.role !== "admin") return;

  const lead = (await listLeads()).find((l) => l.id === id);
  if (!lead) return;

  try {
    await analyzeLead(lead);
  } catch (error) {
    // Lỗi (chưa cấu hình API key, API lỗi...) chỉ ghi log — giống cách
    // saveLead xử lý lỗi webhook, không chặn luồng của admin. Admin thấy
    // ngay là chưa có kết quả vì nút "Phân tích AI" vẫn còn hiển thị.
    const message = error instanceof AiNotConfiguredError ? error.message : String(error);
    console.error("[lead-insight] phân tích thất bại:", message);
    return;
  }

  revalidatePath("/quan-tri/leads");
}
