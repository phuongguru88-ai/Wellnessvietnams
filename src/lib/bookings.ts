import { getPropertyById } from "./data";
import { normalizePhone } from "./leads";
import { readJson, writeJson } from "./store";
import { BOOKING_STATUS, type Booking, type BookingStatus } from "./types";

const BOOKINGS_FILE = "bookings.json";

export type BookingInput = {
  propertyId?: unknown;
  roomTypeId?: unknown;
  checkIn?: unknown;
  checkOut?: unknown;
  guests?: unknown;
  name?: unknown;
  phone?: unknown;
  email?: unknown;
  note?: unknown;
};

export type ValidationResult =
  | { ok: true; booking: Booking }
  | { ok: false; errors: Record<string, string> };

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
const isIsoDate = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v));

/** Số đêm giữa hai ngày ISO — giả định cùng múi giờ, không tính giờ trong ngày. */
function nightsBetween(checkIn: string, checkOut: string): number {
  const ms = Date.parse(checkOut) - Date.parse(checkIn);
  return Math.round(ms / 86_400_000);
}

/**
 * Đây là "yêu cầu giữ chỗ", không phải đặt phòng có thanh toán: không khoá
 * tồn kho, không kiểm tra trùng lịch giữa các khách. Tư vấn viên gọi xác
 * nhận phòng còn trống qua điện thoại rồi đổi trạng thái trong /quan-tri.
 */
export async function validateBooking(input: BookingInput): Promise<ValidationResult> {
  const errors: Record<string, string> = {};

  const propertyId = str(input.propertyId);
  const property = propertyId ? await getPropertyById(propertyId) : undefined;
  if (!property) errors.propertyId = "Không tìm thấy nơi lưu trú này.";

  const roomTypeId = str(input.roomTypeId) || undefined;
  const roomType = roomTypeId ? property?.roomTypes.find((r) => r.id === roomTypeId) : undefined;
  if (roomTypeId && !roomType) errors.roomTypeId = "Hạng phòng không hợp lệ.";

  const checkIn = str(input.checkIn);
  const checkOut = str(input.checkOut);
  if (!checkIn || !isIsoDate(checkIn)) errors.checkIn = "Chọn ngày nhận phòng hợp lệ.";
  if (!checkOut || !isIsoDate(checkOut)) errors.checkOut = "Chọn ngày trả phòng hợp lệ.";

  let nights = 0;
  if (!errors.checkIn && !errors.checkOut) {
    nights = nightsBetween(checkIn, checkOut);
    if (nights < 1) errors.checkOut = "Ngày trả phòng phải sau ngày nhận phòng ít nhất một đêm.";
    if (nights > 60) errors.checkOut = "Kỳ lưu trú quá dài — gọi trực tiếp để được tư vấn.";
  }

  const guestsRaw = str(input.guests);
  const guests = Number(guestsRaw);
  if (!guestsRaw || !Number.isInteger(guests) || guests < 1) {
    errors.guests = "Số khách phải là số nguyên dương.";
  } else if (roomType && guests > roomType.sucChua) {
    errors.guests = `Hạng phòng này chứa tối đa ${roomType.sucChua} khách.`;
  }

  const name = str(input.name);
  if (name.length < 2) errors.name = "Vui lòng nhập họ tên (từ 2 ký tự).";
  else if (name.length > 80) errors.name = "Họ tên quá dài.";

  const rawPhone = str(input.phone);
  const phone = normalizePhone(rawPhone);
  if (!rawPhone) errors.phone = "Vui lòng nhập số điện thoại.";
  else if (!phone) errors.phone = "Số điện thoại chưa đúng — cần 10 số, ví dụ 0909 000 000.";

  const email = str(input.email);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Email chưa đúng định dạng.";

  const note = str(input.note);
  if (note.length > 1500) errors.note = "Ghi chú tối đa 1500 ký tự.";

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  const unitPrice = roomType?.giaThamKhao ?? property!.giaThamKhao;

  return {
    ok: true,
    booking: {
      id: crypto.randomUUID(),
      propertyId: property!.id,
      propertyName: property!.name,
      propertySlug: property!.slug,
      roomTypeId: roomType?.id,
      roomTypeName: roomType?.name,
      checkIn,
      checkOut,
      nights,
      guests,
      name,
      phone: phone as string,
      email: email || undefined,
      note,
      estimatedTotal: unitPrice > 0 ? unitPrice * nights : undefined,
      status: "Chờ xác nhận",
      createdAt: new Date().toISOString(),
    },
  };
}

export async function listBookings(): Promise<Booking[]> {
  const bookings = await readJson<Booking[]>(BOOKINGS_FILE, []);
  return [...bookings].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/**
 * Lưu yêu cầu đặt phòng vào data/bookings.json và đẩy thêm sang
 * BOOKING_WEBHOOK_URL nếu được cấu hình (xem ghi chú bền vững ở lib/leads.ts
 * — filesystem serverless không bền, cần webhook để không mất yêu cầu).
 */
export async function saveBooking(booking: Booking) {
  const [file, webhook] = await Promise.allSettled([
    appendToStore(booking),
    sendToWebhook(booking),
  ]);

  if (file.status === "rejected") {
    console.error("[booking] ghi file thất bại:", file.reason);
  }
  if (webhook.status === "rejected") {
    console.error("[booking] gửi webhook thất bại:", webhook.reason);
  }

  const savedToFile = file.status === "fulfilled";
  const savedToWebhook = webhook.status === "fulfilled" && webhook.value === "sent";
  if (!savedToFile && !savedToWebhook) {
    throw new Error("Không lưu được yêu cầu đặt phòng qua bất kỳ kênh nào.");
  }
}

async function appendToStore(booking: Booking) {
  const bookings = await readJson<Booking[]>(BOOKINGS_FILE, []);
  await writeJson(BOOKINGS_FILE, [...bookings, booking]);
}

async function sendToWebhook(booking: Booking): Promise<"sent" | "skipped"> {
  const url = process.env.BOOKING_WEBHOOK_URL;
  if (!url) return "skipped";

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(booking),
  });
  if (!res.ok) {
    throw new Error(`Webhook trả về ${res.status}`);
  }
  return "sent";
}

/** Đổi trạng thái — dùng ở trang quản trị (xác nhận / huỷ). */
export async function setBookingStatus(id: string, status: BookingStatus): Promise<void> {
  if (!BOOKING_STATUS.includes(status)) return;
  const bookings = await readJson<Booking[]>(BOOKINGS_FILE, []);
  await writeJson(
    BOOKINGS_FILE,
    bookings.map((b) =>
      b.id === id
        ? {
            ...b,
            status,
            confirmedAt: status === "Đã xác nhận" ? new Date().toISOString() : b.confirmedAt,
          }
        : b,
    ),
  );
}
