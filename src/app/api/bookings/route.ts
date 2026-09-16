import { NextResponse } from "next/server";

import { saveBooking, validateBooking, type BookingInput } from "@/lib/bookings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: BookingInput;
  try {
    body = (await request.json()) as BookingInput;
  } catch {
    return NextResponse.json(
      { ok: false, message: "Dữ liệu gửi lên không đọc được." },
      { status: 400 },
    );
  }

  const result = await validateBooking(body);
  if (!result.ok) {
    return NextResponse.json(
      {
        ok: false,
        errors: result.errors,
        message: "Bạn kiểm tra lại các ô được đánh dấu nhé.",
      },
      { status: 422 },
    );
  }

  try {
    await saveBooking(result.booking);
  } catch (error) {
    console.error("[booking] lưu thất bại:", error);
    return NextResponse.json(
      {
        ok: false,
        message:
          "Hệ thống đang lỗi khi lưu yêu cầu. Bạn gọi trực tiếp 0909 000 000 giúp chúng tôi nhé.",
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, booking: result.booking });
}
