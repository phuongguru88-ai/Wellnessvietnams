/** 2400000 -> "2.400.000đ" */
export function formatVnd(value: number) {
  return `${value.toLocaleString("vi-VN")}đ`;
}

/** 2400000, "đêm" -> "2.400.000đ / đêm" */
export function formatPrice(value: number, unit?: string) {
  return unit ? `${formatVnd(value)} / ${unit}` : formatVnd(value);
}

/** 180 -> "3 giờ"; 90 -> "90 phút"; 45 -> "45 phút" */
export function formatDuration(minutes: number) {
  if (minutes % 60 === 0 && minutes >= 120) return `${minutes / 60} giờ`;
  return `${minutes} phút`;
}

/** "2026-08-01" -> "1 thg 8, 2026" */
export function formatArticleDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("vi-VN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
