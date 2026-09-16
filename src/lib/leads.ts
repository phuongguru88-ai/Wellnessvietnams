import { readJson, writeJson } from "./store";
import { LOAI_HINH, type Lead, type LoaiHinh } from "./types";

const LEADS_FILE = "leads.json";

const LOAI_HINH_CHOICES: Lead["loaiHinhQuanTam"][] = [
  ...LOAI_HINH,
  "Chưa rõ, cần tư vấn",
];

export type LeadInput = {
  name?: unknown;
  phone?: unknown;
  date?: unknown;
  loaiHinhQuanTam?: unknown;
  note?: unknown;
  source?: unknown;
};

export type ValidationResult =
  | { ok: true; lead: Lead }
  | { ok: false; errors: Record<string, string> };

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

/** Số VN: 0xxxxxxxxx / +84xxxxxxxxx, cho phép khoảng trắng, dấu chấm, gạch. */
export function normalizePhone(raw: string) {
  const digits = raw.replace(/[\s.()-]/g, "");
  if (/^\+?84\d{9}$/.test(digits)) return `0${digits.slice(-9)}`;
  if (/^0\d{9}$/.test(digits)) return digits;
  return null;
}

export function validateLead(input: LeadInput): ValidationResult {
  const errors: Record<string, string> = {};

  const name = str(input.name);
  if (name.length < 2) errors.name = "Vui lòng nhập họ tên (từ 2 ký tự).";
  else if (name.length > 80) errors.name = "Họ tên quá dài.";

  const rawPhone = str(input.phone);
  const phone = normalizePhone(rawPhone);
  if (!rawPhone) errors.phone = "Vui lòng nhập số điện thoại.";
  else if (!phone)
    errors.phone = "Số điện thoại chưa đúng — cần 10 số, ví dụ 0909 000 000.";

  const date = str(input.date);
  if (!date) {
    errors.date = "Vui lòng chọn thời gian bạn dự kiến đi.";
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date))) {
    errors.date = "Ngày không hợp lệ.";
  }

  const loaiHinhQuanTam = str(input.loaiHinhQuanTam) as LoaiHinh;
  if (!LOAI_HINH_CHOICES.includes(loaiHinhQuanTam)) {
    errors.loaiHinhQuanTam = "Vui lòng chọn loại hình bạn quan tâm.";
  }

  const note = str(input.note);
  if (note.length > 1500) errors.note = "Ghi chú tối đa 1500 ký tự.";

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    lead: {
      id: crypto.randomUUID(),
      name,
      phone: phone as string,
      date,
      loaiHinhQuanTam,
      note,
      createdAt: new Date().toISOString(),
      source: str(input.source) || undefined,
    },
  };
}

export async function listLeads(): Promise<Lead[]> {
  const leads = await readJson<Lead[]>(LEADS_FILE, []);
  return [...leads].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/**
 * Lưu lead vào data/leads.json và đẩy thêm sang LEAD_WEBHOOK_URL nếu được
 * cấu hình.
 *
 * Lưu ý khi deploy: filesystem của serverless (Vercel) không bền — hãy đặt
 * LEAD_WEBHOOK_URL (Google Sheet / CRM / email) để không mất lead.
 */
export async function saveLead(lead: Lead) {
  const [file, webhook] = await Promise.allSettled([
    appendToStore(lead),
    sendToWebhook(lead),
  ]);

  if (file.status === "rejected") {
    console.error("[lead] ghi file thất bại:", file.reason);
  }
  if (webhook.status === "rejected") {
    console.error("[lead] gửi webhook thất bại:", webhook.reason);
  }

  // Chỉ tính là đã lưu khi thực sự có một kênh giữ được dữ liệu.
  const savedToFile = file.status === "fulfilled";
  const savedToWebhook = webhook.status === "fulfilled" && webhook.value === "sent";
  if (!savedToFile && !savedToWebhook) {
    throw new Error("Không lưu được lead qua bất kỳ kênh nào.");
  }
}

async function appendToStore(lead: Lead) {
  const leads = await readJson<Lead[]>(LEADS_FILE, []);
  await writeJson(LEADS_FILE, [...leads, lead]);
}

/** Đánh dấu / bỏ đánh dấu một lead là đã liên hệ — dùng ở trang quản trị. */
export async function toggleLeadContacted(id: string): Promise<void> {
  const leads = await readJson<Lead[]>(LEADS_FILE, []);
  await writeJson(
    LEADS_FILE,
    leads.map((l) =>
      l.id === id ? { ...l, contactedAt: l.contactedAt ? undefined : new Date().toISOString() } : l,
    ),
  );
}

async function sendToWebhook(lead: Lead): Promise<"sent" | "skipped"> {
  const url = process.env.LEAD_WEBHOOK_URL;
  if (!url) return "skipped";

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(lead),
  });
  if (!res.ok) {
    throw new Error(`Webhook trả về ${res.status}`);
  }
  return "sent";
}
