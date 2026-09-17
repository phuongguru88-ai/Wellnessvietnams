import { readJson, writeJson } from "./store";
import {
  AI_FEATURES,
  AI_MODEL_OPTIONS,
  AI_PROVIDERS,
  type AiFeature,
  type AiProvider,
  type AiSettings,
} from "./types";

const AI_SETTINGS_FILE = "ai-settings.json";

const DEFAULT_SETTINGS: AiSettings = {
  apiKeys: { anthropic: "", openai: "", google: "" },
  models: {
    phan_tich_lead: { provider: "anthropic", model: "claude-sonnet-5" },
    tong_hop_khach_hang: { provider: "anthropic", model: "claude-opus-5" },
    tro_ly_wellness: { provider: "anthropic", model: "claude-sonnet-5" },
  },
  updatedAt: new Date(0).toISOString(),
};

/** Biến môi trường fallback cho từng provider khi ô API key trong trang cài đặt để trống. */
const ENV_VAR_BY_PROVIDER: Record<AiProvider, string> = {
  anthropic: "ANTHROPIC_API_KEY",
  openai: "OPENAI_API_KEY",
  google: "GOOGLE_API_KEY",
};

/** Đọc cấu hình AI hiện tại — luôn trả về đủ field cho mọi feature/provider, kể cả cái mới thêm sau này. */
export async function getAiSettings(): Promise<AiSettings> {
  const saved = await readJson<Partial<AiSettings>>(AI_SETTINGS_FILE, {});
  return {
    ...DEFAULT_SETTINGS,
    ...saved,
    apiKeys: { ...DEFAULT_SETTINGS.apiKeys, ...saved.apiKeys },
    models: { ...DEFAULT_SETTINGS.models, ...saved.models },
  };
}

/** API key thực dùng để gọi một provider: ưu tiên key nhập trong trang cài đặt, sau đó mới tới biến môi trường. */
export function resolveApiKey(settings: AiSettings, provider: AiProvider): string | undefined {
  return settings.apiKeys[provider] || process.env[ENV_VAR_BY_PROVIDER[provider]] || undefined;
}

export type AiSettingsFormErrors = Partial<Record<`apiKey_${AiProvider}` | AiFeature, string>>;

export type ParsedAiSettings = {
  apiKeys: Record<AiProvider, string>;
  models: Record<AiFeature, { provider: AiProvider; model: string }>;
};

/**
 * Đọc form cài đặt AI. Để trống một ô API key nghĩa là GIỮ NGUYÊN key cũ
 * của provider đó — trang không bao giờ hiện lại key thật ra input để
 * tránh lộ qua màn hình/lịch sử trình duyệt.
 */
export function parseAiSettingsForm(
  formData: FormData,
  current: AiSettings,
): { ok: true; data: ParsedAiSettings } | { ok: false; errors: AiSettingsFormErrors } {
  const errors: AiSettingsFormErrors = {};

  const apiKeys = {} as Record<AiProvider, string>;
  for (const provider of AI_PROVIDERS) {
    const raw = String(formData.get(`apiKey_${provider}`) ?? "").trim();
    apiKeys[provider] = raw === "" ? current.apiKeys[provider] : raw;
  }

  const validValues = new Set(AI_MODEL_OPTIONS.map((o) => `${o.provider}:${o.model}`));
  const models = {} as Record<AiFeature, { provider: AiProvider; model: string }>;
  for (const feature of AI_FEATURES) {
    const value = String(formData.get(`model_${feature}`) ?? "");
    if (!validValues.has(value)) {
      errors[feature] = "Vui lòng chọn một model hợp lệ.";
      continue;
    }
    const [provider, model] = value.split(":") as [AiProvider, string];
    models[feature] = { provider, model };
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, data: { apiKeys, models } };
}

export async function saveAiSettings(data: ParsedAiSettings): Promise<AiSettings> {
  const next: AiSettings = { ...data, updatedAt: new Date().toISOString() };
  await writeJson(AI_SETTINGS_FILE, next);
  return next;
}
