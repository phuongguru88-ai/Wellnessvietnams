import type { Program } from "./types";

type ItineraryDay = Program["itinerary"][number];

/**
 * Lịch trình được soạn trong form quản trị bằng một textarea theo định
 * dạng đơn giản, để không cần UI thêm/bớt ngày phức tạp:
 *
 *   ## Ngày 1: Bắt mạch & hạ nhịp
 *   - 14:00 — Nhận phòng
 *   - 15:30 — Bắt mạch cùng lương y
 *
 *   ## Ngày 2: Trị liệu kinh lạc
 *   - 06:00 — Khí công buổi sớm
 *
 * Dòng bắt đầu bằng "##" mở một ngày mới ("Ngày X" trước dấu ":", tiêu đề
 * sau dấu ":"); các dòng "-" tiếp theo là mốc lịch trình trong ngày đó.
 */
export function parseItineraryText(text: string): ItineraryDay[] {
  const days: ItineraryDay[] = [];

  for (const rawLine of text.split("\n")) {
    const line = rawLine.trim();
    if (!line) continue;

    if (line.startsWith("##")) {
      const heading = line.replace(/^##\s*/, "");
      const sep = heading.indexOf(":");
      const day = (sep === -1 ? heading : heading.slice(0, sep)).trim();
      const title = sep === -1 ? "" : heading.slice(sep + 1).trim();
      days.push({ day: day || `Ngày ${days.length + 1}`, title, items: [] });
      continue;
    }

    const item = line.replace(/^[-*]\s*/, "");
    if (days.length === 0) {
      // Chưa có dòng "##" nào — tự mở "Ngày 1" để không mất nội dung.
      days.push({ day: "Ngày 1", title: "", items: [] });
    }
    days[days.length - 1].items.push(item);
  }

  return days;
}

export function serializeItineraryText(days: ItineraryDay[]): string {
  return days
    .map((d) => {
      const heading = d.title ? `${d.day}: ${d.title}` : d.day;
      const items = d.items.map((i) => `- ${i}`).join("\n");
      return `## ${heading}\n${items}`;
    })
    .join("\n\n");
}
