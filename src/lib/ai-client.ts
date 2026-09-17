import Anthropic from "@anthropic-ai/sdk";

import { getAiSettings, resolveApiKey } from "./ai-settings";
import type { AiFeature, AiModel } from "./types";

/** Ném ra khi chưa cấu hình API key — nơi gọi nên bắt lỗi này để hiện thông báo thân thiện. */
export class AiNotConfiguredError extends Error {
  constructor() {
    super("Chưa cấu hình API key cho AI. Vào /quan-tri/cai-dat-ai để thêm.");
    this.name = "AiNotConfiguredError";
  }
}

/** Client Claude + model đã chọn cho một chức năng cụ thể (xem AI_FEATURES). */
export async function getAiClientForFeature(
  feature: AiFeature,
): Promise<{ client: Anthropic; model: AiModel }> {
  const settings = await getAiSettings();
  const apiKey = resolveApiKey(settings);
  if (!apiKey) throw new AiNotConfiguredError();

  return { client: new Anthropic({ apiKey }), model: settings.models[feature] };
}

/**
 * Claude Haiku 4.5 không hỗ trợ output_config.effort (trả lỗi 400) — chỉ
 * Opus 5 / Sonnet 5 mới nhận tham số này. Dùng effort thấp cho các tác vụ
 * trích xuất JSON ngắn để tiết kiệm chi phí mà vẫn đủ chất lượng.
 */
export function effortConfigFor(model: AiModel, effort: "low" | "medium") {
  return model === "claude-haiku-4-5" ? undefined : { effort };
}

/** Trích JSON từ phần text trả lời — Claude đôi khi thêm khoảng trắng/markdown quanh JSON dù đã dặn không làm vậy. */
export function extractJsonObject(text: string): unknown {
  const match = text.match(/\{[\s\S]*\}/);
  return JSON.parse(match ? match[0] : text);
}
