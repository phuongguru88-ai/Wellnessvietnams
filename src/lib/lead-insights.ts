import { effortConfigFor, extractJsonObject, getAiClientForFeature } from "./ai-client";
import { readJson, writeJson } from "./store";
import type { AiModel, Lead, LeadInsight } from "./types";

const LEAD_INSIGHTS_FILE = "lead-insights.json";

export async function getLeadInsight(leadId: string): Promise<LeadInsight | undefined> {
  const all = await readJson<LeadInsight[]>(LEAD_INSIGHTS_FILE, []);
  return all.find((i) => i.leadId === leadId);
}

/** Toàn bộ phân tích đã có, dùng để hiển thị hàng loạt (vd bảng danh sách lead) mà không đọc file nhiều lần. */
export async function listLeadInsights(): Promise<LeadInsight[]> {
  return readJson<LeadInsight[]>(LEAD_INSIGHTS_FILE, []);
}

/** Gọi Claude phân tích một lead cụ thể, lưu kết quả lại (ghi đè phân tích cũ của lead đó nếu có). */
export async function analyzeLead(lead: Lead): Promise<LeadInsight> {
  const { client, model } = await getAiClientForFeature("phan_tich_lead");

  const prompt = `Bạn là chuyên gia chăm sóc khách hàng cho một công ty du lịch nghỉ dưỡng/wellness tại Việt Nam.
Dưới đây là thông tin một khách để lại lời nhắn quan tâm (lead) qua form liên hệ trên website:
- Tên: ${lead.name}
- Số điện thoại: ${lead.phone}
- Ngày dự kiến đi: ${lead.date}
- Loại hình quan tâm: ${lead.loaiHinhQuanTam}
- Ghi chú của khách: ${lead.note || "(không có)"}
- Trang khách đang xem khi gửi form: ${lead.source ?? "không rõ"}

Hãy phân tích khách hàng này và trả lời DUY NHẤT một JSON hợp lệ đúng schema sau, không thêm chữ nào khác, không markdown, không giải thích thêm:
{
  "summary": "Tóm tắt ngắn gọn nhu cầu và mức độ tiềm năng của khách (2-3 câu)",
  "segment": "Tên phân khúc khách hàng ngắn gọn, ví dụ 'Gia đình nghỉ dưỡng cuối tuần' hoặc 'Doanh nghiệp tổ chức sự kiện'",
  "suggestedActions": ["Hành động tư vấn/chăm sóc cụ thể 1", "Hành động 2", "Hành động 3"]
}`;

  const response = await client.messages.create({
    model,
    max_tokens: 1536,
    ...effortConfigFor(model, "low"),
    messages: [{ role: "user", content: prompt }],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  const parsed = parseInsight(textBlock?.type === "text" ? textBlock.text : "{}");

  const insight: LeadInsight = {
    leadId: lead.id,
    ...parsed,
    model: model as AiModel,
    createdAt: new Date().toISOString(),
  };

  const all = await readJson<LeadInsight[]>(LEAD_INSIGHTS_FILE, []);
  await writeJson(LEAD_INSIGHTS_FILE, [...all.filter((i) => i.leadId !== lead.id), insight]);

  return insight;
}

function parseInsight(text: string): Pick<LeadInsight, "summary" | "segment" | "suggestedActions"> {
  try {
    const json = extractJsonObject(text) as Record<string, unknown>;
    return {
      summary: String(json.summary ?? "Không có tóm tắt."),
      segment: String(json.segment ?? "Chưa phân loại"),
      suggestedActions: Array.isArray(json.suggestedActions)
        ? json.suggestedActions.map(String)
        : [],
    };
  } catch {
    return {
      summary: "AI trả lời không đúng định dạng, vui lòng thử phân tích lại.",
      segment: "Chưa phân loại",
      suggestedActions: [],
    };
  }
}
