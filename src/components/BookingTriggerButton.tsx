"use client";

import { CalendarCheck } from "lucide-react";

import { useBooking } from "./PropertyBookingProvider";

/**
 * Nút mở popup đặt phòng dùng chung — đặt được nhiều nơi trên trang (sidebar,
 * thanh cố định mobile, từng thẻ hạng phòng), tất cả cùng mở một popup duy
 * nhất qua PropertyBookingProvider. Truyền roomTypeId để mở popup với đúng
 * hạng phòng đã chọn sẵn.
 */
export function BookingTriggerButton({
  roomTypeId,
  label = "Đặt phòng ngay",
  className = "btn btn-primary w-full",
  showIcon = true,
}: {
  roomTypeId?: string;
  label?: string;
  className?: string;
  showIcon?: boolean;
}) {
  const { openBooking } = useBooking();
  return (
    <button type="button" onClick={() => openBooking(roomTypeId)} className={className}>
      {showIcon && <CalendarCheck aria-hidden size={15} strokeWidth={2} />}
      {label}
    </button>
  );
}
