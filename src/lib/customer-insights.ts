import { extractJsonObject, generateText } from "./ai-client";
import { listLeads } from "./leads";
import { readJson, writeJson } from "./store";
import type { CustomerInsightsReport } from "./types";

const CUSTOMER_INSIGHTS_FILE = "customer-insights.json";

/** Báo cáo mới nhất đã tạo — undefined nếu admin chưa từng bấm "Tạo phân tích". */
export async function getCustomerInsightsReport(): Promise<CustomerInsightsReport | undefined> {
  return readJson<CustomerInsightsReport | undefined>(CUSTOMER_INSIGHTS_FILE, undefined);
}

/** Gọi AI tổng hợp insight từ toàn bộ lead hiện có, ghi đè báo cáo cũ. */
export async function generateCustomerInsights(): Promise<CustomerInsightsReport> {
  const leads = await listLeads();
  if (leads.length === 0) {
    throw new Error("Chưa có khách hàng (lead) nào để phân tích.");
  }

  const byLoaiHinh: Record<string, number> = {};
  for (const l of leads) {
    byLoaiHinh[l.loaiHinhQuanTam] = (byLoaiHinh[l.loaiHinhQuanTam] ?? 0) + 1;
  }
  const contactedCount = leads.filter((l) => l.contactedAt).length;

  // Giới hạn 200 lead gần nhất để tránh prompt quá dài khi hệ thống có nhiều dữ liệu.
  const sample = leads.slice(0, 200).map((l) => ({
    loaiHinhQuanTam: l.loaiHinhQuanTam,
    note: l.note,
    date: l.date,
    contacted: Boolean(l.contactedAt),
    source: l.source ?? null,
    createdAt: l.createdAt,
  }));

  const prompt = `Bạn là chuyên gia phân tích khách hàng cho một công ty du lịch nghỉ dưỡng/wellness tại Việt Nam.
Tổng số khách để lại lead: ${leads.length}. Đã liên hệ: ${contactedCount}.
Phân bố theo loại hình quan tâm: ${JSON.stringify(byLoaiHinh)}.

Dữ liệu chi tiết (tối đa 200 lead gần nhất, dạng JSON):
${JSON.stringify(sample)}

Hãy phân tích tệp khách hàng này và trả lời DUY NHẤT một JSON hợp lệ đúng schema sau, không thêm chữ nào khác, không markdown, không giải thích thêm:
{
  "summary": "Tóm tắt tổng quan về tệp khách hàng hiện tại (3-4 câu)",
  "segments": [{"name": "Tên phân khúc", "count": 0, "description": "Mô tả ngắn"}],
  "trends": ["Xu hướng nhu cầu quan sát được 1", "Xu hướng 2"],
  "recommendations": ["Đề xuất chiến lược chăm sóc/marketing 1", "Đề xuất 2"]
}`;

  const { text, provider, model } = await generateText({
    feature: "tong_hop_khach_hang",
    prompt,
    maxTokens: 4096,
    anthropicEffort: "medium",
  });

  const parsed = parseReport(text);

  const report: CustomerInsightsReport = {
    generatedAt: new Date().toISOString(),
    leadCount: leads.length,
    provider,
    model,
    ...parsed,
  };

  await writeJson(CUSTOMER_INSIGHTS_FILE, report);
  return report;
}

function parseReport(
  text: string,
): Pick<CustomerInsightsReport, "summary" | "segments" | "trends" | "recommendations"> {
  try {
    const json = extractJsonObject(text) as Record<string, unknown>;
    const segments = Array.isArray(json.segments)
      ? json.segments.map((s) => {
          const item = s as Record<string, unknown>;
          return {
            name: String(item.name ?? ""),
            count: Number(item.count ?? 0),
            description: String(item.description ?? ""),
          };
        })
      : [];

    return {
      summary: String(json.summary ?? ""),
      segments,
      trends: Array.isArray(json.trends) ? json.trends.map(String) : [],
      recommendations: Array.isArray(json.recommendations) ? json.recommendations.map(String) : [],
    };
  } catch {
    return {
      summary: "AI trả lời không đúng định dạng, vui lòng thử tạo lại.",
      segments: [],
      trends: [],
      recommendations: [],
    };
  }
}
