import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";

import { getAiSettings, resolveApiKey } from "./ai-settings";
import { AI_PROVIDER_LABELS, type AiFeature, type AiProvider } from "./types";

/** Ném ra khi chưa cấu hình API key cho provider đang được chọn — nơi gọi nên bắt lỗi này để hiện thông báo thân thiện. */
export class AiNotConfiguredError extends Error {
  constructor(provider: AiProvider) {
    super(
      `Chưa cấu hình API key cho ${AI_PROVIDER_LABELS[provider]}. Vào /quan-tri/cai-dat-ai để thêm.`,
    );
    this.name = "AiNotConfiguredError";
  }
}

/** Claude Haiku 4.5 không hỗ trợ output_config.effort (trả lỗi 400) — chỉ Opus 5 / Sonnet 5 mới nhận tham số này. */
function anthropicEffortConfig(model: string, effort: "low" | "medium") {
  return model === "claude-haiku-4-5" ? undefined : { effort };
}

async function generateWithAnthropic(apiKey: string, model: string, prompt: string, maxTokens: number, effort: "low" | "medium") {
  const client = new Anthropic({ apiKey });
  const effortConfig = anthropicEffortConfig(model, effort);
  const response = await client.messages.create({
    model,
    max_tokens: maxTokens,
    ...(effortConfig ? { output_config: effortConfig } : {}),
    messages: [{ role: "user", content: prompt }],
  });
  const block = response.content.find((b) => b.type === "text");
  return block?.type === "text" ? block.text : "";
}

async function generateWithOpenAI(apiKey: string, model: string, prompt: string, maxTokens: number) {
  const client = new OpenAI({ apiKey });
  const response = await client.chat.completions.create({
    model,
    max_completion_tokens: maxTokens,
    messages: [{ role: "user", content: prompt }],
  });
  return response.choices[0]?.message?.content ?? "";
}

async function generateWithGoogle(apiKey: string, model: string, prompt: string, maxTokens: number) {
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: { maxOutputTokens: maxTokens },
  });
  return response.text ?? "";
}

/**
 * Gọi AI cho một chức năng cụ thể (xem AI_FEATURES) — tự chọn đúng
 * provider/model admin đã cấu hình ở /quan-tri/cai-dat-ai và gọi đúng SDK
 * tương ứng, trả về text thuần để nơi gọi tự parse JSON/hiển thị.
 */
export async function generateText(params: {
  feature: AiFeature;
  prompt: string;
  maxTokens: number;
  /** Chỉ áp dụng khi provider là Anthropic — các provider khác bỏ qua tham số này. */
  anthropicEffort?: "low" | "medium";
}): Promise<{ text: string; provider: AiProvider; model: string }> {
  const settings = await getAiSettings();
  const { provider, model } = settings.models[params.feature];
  const apiKey = resolveApiKey(settings, provider);
  if (!apiKey) throw new AiNotConfiguredError(provider);

  let text: string;
  switch (provider) {
    case "anthropic":
      text = await generateWithAnthropic(apiKey, model, params.prompt, params.maxTokens, params.anthropicEffort ?? "low");
      break;
    case "openai":
      text = await generateWithOpenAI(apiKey, model, params.prompt, params.maxTokens);
      break;
    case "google":
      text = await generateWithGoogle(apiKey, model, params.prompt, params.maxTokens);
      break;
  }

  return { text, provider, model };
}

/** Trích JSON từ phần text trả lời — model đôi khi thêm khoảng trắng/markdown quanh JSON dù đã dặn không làm vậy. */
export function extractJsonObject(text: string): unknown {
  const match = text.match(/\{[\s\S]*\}/);
  return JSON.parse(match ? match[0] : text);
}
