"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getAiSettings, parseAiSettingsForm, saveAiSettings, type AiSettingsFormErrors } from "@/lib/ai-settings";
import { getActor } from "@/lib/scope";

export type AiSettingsFormState = { errors: AiSettingsFormErrors } | null;

export async function saveAiSettingsAction(
  _prev: AiSettingsFormState,
  formData: FormData,
): Promise<AiSettingsFormState> {
  const actor = await getActor();
  if (actor?.role !== "admin") {
    return { errors: { apiKey_anthropic: "Bạn không có quyền thay đổi cài đặt này." } };
  }

  const current = await getAiSettings();
  const result = parseAiSettingsForm(formData, current);
  if (!result.ok) return { errors: result.errors };

  await saveAiSettings(result.data);
  revalidatePath("/quan-tri/cai-dat-ai");
  redirect("/quan-tri/cai-dat-ai?saved=1");
}
