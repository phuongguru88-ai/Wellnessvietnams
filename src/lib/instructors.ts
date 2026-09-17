import { buildImageRef } from "./media";
import type { Instructor } from "./types";

/**
 * Giảng viên/người hướng dẫn được soạn trong form quản trị bằng một textarea
 * theo định dạng đơn giản, để không cần UI thêm/bớt từng người phức tạp:
 *
 *   ## Lương y Trần Văn A | Lương y y học cổ truyền
 *   Ảnh: https://...
 *   Hơn 20 năm kinh nghiệm bắt mạch, kê đơn thảo dược tại...
 *
 *   ## Chị Nguyễn Thị B | Huấn luyện viên yoga
 *   Chứng chỉ RYT 500, chuyên yoga trị liệu cột sống.
 *
 * Dòng bắt đầu bằng "##" mở một người mới ("Tên" trước dấu "|", "Vai trò"
 * sau dấu "|"); dòng "Ảnh: <url>" ngay sau đó (nếu có) là ảnh đại diện;
 * các dòng còn lại tới "##" tiếp theo là tiểu sử.
 */
export function parseInstructorsText(text: string, seedBase: string): Instructor[] {
  const list: Instructor[] = [];

  for (const rawLine of text.split("\n")) {
    const line = rawLine.trim();
    if (!line) continue;

    if (line.startsWith("##")) {
      const heading = line.replace(/^##\s*/, "");
      const sep = heading.indexOf("|");
      const name = (sep === -1 ? heading : heading.slice(0, sep)).trim();
      const vaiTro = sep === -1 ? "" : heading.slice(sep + 1).trim();
      list.push({ name: name || `Giảng viên ${list.length + 1}`, vaiTro, moTa: "", images: [] });
      continue;
    }

    if (list.length === 0) continue; // Bỏ qua nội dung trước dòng "##" đầu tiên.

    const current = list[list.length - 1];
    const anhMatch = line.match(/^Ảnh:\s*(.+)$/i);
    if (anhMatch && current.images.length === 0) {
      const url = anhMatch[1].trim();
      current.images = [buildImageRef(`${current.name} | ${url}`, `${seedBase}-gv-${list.length}`, current.name)];
      continue;
    }

    current.moTa = current.moTa ? `${current.moTa}\n${line}` : line;
  }

  return list.map((gv, i) => ({
    ...gv,
    images: gv.images.length > 0 ? gv.images : [buildImageRef("", `${seedBase}-gv-${i + 1}`, gv.name)],
  }));
}

export function serializeInstructorsText(list?: Instructor[]): string {
  return (list ?? [])
    .map((gv) => {
      const heading = gv.vaiTro ? `${gv.name} | ${gv.vaiTro}` : gv.name;
      const anh = gv.images[0]?.src ? `Ảnh: ${gv.images[0].src}\n` : "";
      return `## ${heading}\n${anh}${gv.moTa}`;
    })
    .join("\n\n");
}
