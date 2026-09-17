import { readFile } from "node:fs/promises";
import path from "node:path";

import { generateText } from "./ai-client";

const KNOWLEDGE_DIR = path.join(process.cwd(), "data", "wellness-knowledge");
const KNOWLEDGE_FILES = ["ngu-hanh-tang-phu.md", "the-chat-co-the.md", "thien-loi-song.md"];

export interface WellnessChatTurn {
  role: "user" | "assistant";
  content: string;
}

let knowledgeCache: string | undefined;

/** Đọc và ghép toàn bộ tài liệu tham khảo — cache trong bộ nhớ vì nội dung tĩnh, không đổi giữa các request. */
async function loadKnowledge(): Promise<string> {
  if (knowledgeCache) return knowledgeCache;
  const parts = await Promise.all(
    KNOWLEDGE_FILES.map((file) => readFile(path.join(KNOWLEDGE_DIR, file), "utf8")),
  );
  knowledgeCache = parts.join("\n\n---\n\n");
  return knowledgeCache;
}

const SYSTEM_PROMPT = `Bạn là trợ lý tư vấn wellness của Wellness Vietnam, chuyên tư vấn xây dựng lối sống cân bằng dựa trên nguyên lý Y học phương Đông (ngũ hành, thể chất) kết hợp thiền/thở.

Nguyên tắc bắt buộc:
- Chỉ tư vấn lối sống (ăn uống, ngủ nghỉ, vận động, thiền/thở) dựa trên tài liệu tham khảo được cung cấp — KHÔNG chẩn đoán bệnh, KHÔNG kê thuốc hay thảo dược với liều lượng cụ thể.
- Trả lời ngắn gọn, gần gũi, tiếng Việt tự nhiên — tối đa khoảng 200-250 chữ mỗi lượt, tránh liệt kê dài.
- Khi thông tin người dùng cung cấp chưa đủ để gợi ý cụ thể, hỏi lại đúng 1 câu để làm rõ trước khi tư vấn.
- Nếu người dùng mô tả dấu hiệu cấp cứu hoặc tâm lý nghiêm trọng (đau ngực, khó thở, ý định tự hại...), dừng tư vấn lối sống và khuyên liên hệ cơ sở y tế/chuyên gia ngay.
- Luôn nói rõ đây là gợi ý tham khảo, không thay thế chẩn đoán/điều trị y khoa khi đưa ra kết luận về thể chất hoặc mất cân bằng tạng phủ.

Tài liệu tham khảo (dùng để căn cứ câu trả lời, không trích dẫn nguyên văn dài):
---
{{KNOWLEDGE}}
---`;

/** Trả lời một lượt hỏi-đáp của trợ lý wellness, có thể kèm lịch sử hội thoại trước đó để giữ ngữ cảnh. */
export async function askWellnessAssistant(
  question: string,
  history: WellnessChatTurn[] = [],
): Promise<{ answer: string; provider: string; model: string }> {
  const knowledge = await loadKnowledge();
  const system = SYSTEM_PROMPT.replace("{{KNOWLEDGE}}", knowledge);

  const conversation = history
    .slice(-6)
    .map((turn) => `${turn.role === "user" ? "Người dùng" : "Trợ lý"}: ${turn.content}`)
    .join("\n");

  const prompt = `${system}

${conversation ? `Lịch sử hội thoại gần nhất:\n${conversation}\n\n` : ""}Người dùng: ${question}

Trợ lý:`;

  const { text, provider, model } = await generateText({
    feature: "tro_ly_wellness",
    prompt,
    maxTokens: 1024,
    anthropicEffort: "low",
  });

  return { answer: text.trim(), provider, model };
}
