import { readJson, writeJson } from "./store";
import {
  AI_FEATURES,
  AI_MODELS,
  type AiFeature,
  type AiModel,
  type AiSettings,
} from "./types";

const AI_SETTINGS_FILE = "ai-settings.json";

const DEFAULT_SETTINGS: AiSettings = {
  apiKey: "",
  models: {
    phan_tich_lead: "claude-sonnet-5",
    tong_hop_khach_hang: "claude-opus-5",
  },
  updatedAt: new Date(0).toISOString(),
};

/** Đọc cấu hình AI hiện tại — luôn trả về đủ field cho mọi feature, kể cả feature mới thêm sau này. */
export async function getAiSettings(): Promise<AiSettings> {
  const saved = await readJson<Partial<AiSettings>>(AI_SETTINGS_FILE, {});
  return {
    ...DEFAULT_SETTINGS,
    ...saved,
    models: { ...DEFAULT_SETTINGS.models, ...saved.models },
  };
}

/** API key thực dùng để gọi Claude: ưu tiên key nhập trong trang cài đặt, sau đó mới tới biến môi trường. */
export function resolveApiKey(settings: AiSettings): string | undefined {
  return settings.apiKey || process.env.ANTHROPIC_API_KEY || undefined;
}

export type AiSettingsFormErrors = Partial<Record<"apiKey" | AiFeature, string>>;

export type ParsedAiSettings = {
  apiKey: string;
  models: Record<AiFeature, AiModel>;
};

/**
 * Đọc form cài đặt AI. Để trống ô API key nghĩa là GIỮ NGUYÊN key cũ — trang
 * không bao giờ hiện lại key thật ra input để tránh lộ qua màn hình/lịch sử
 * trình duyệt.
 */
export function parseAiSettingsForm(
  formData: FormData,
  currentApiKey: string,
): { ok: true; data: ParsedAiSettings } | { ok: false; errors: AiSettingsFormErrors } {
  const errors: AiSettingsFormErrors = {};

  const rawApiKey = String(formData.get("apiKey") ?? "").trim();
  const apiKey = rawApiKey === "" ? currentApiKey : rawApiKey;

  const models = {} as Record<AiFeature, AiModel>;
  for (const feature of AI_FEATURES) {
    const value = String(formData.get(`model_${feature}`) ?? "");
    if (!AI_MODELS.includes(value as AiModel)) {
      errors[feature] = "Vui lòng chọn một model hợp lệ.";
      continue;
    }
    models[feature] = value as AiModel;
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, data: { apiKey, models } };
}

export async function saveAiSettings(data: ParsedAiSettings): Promise<AiSettings> {
  const next: AiSettings = { ...data, updatedAt: new Date().toISOString() };
  await writeJson(AI_SETTINGS_FILE, next);
  return next;
}
