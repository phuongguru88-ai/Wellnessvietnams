import type { ContentBlock } from "./types";

/**
 * Nội dung bài viết được soạn trong form quản trị bằng một textarea theo
 * định dạng đơn giản, cùng tinh thần với lib/itinerary.ts:
 *
 *   ## Tiêu đề phụ
 *   Đoạn văn thường, có thể dài nhiều câu.
 *
 *   - Gạch đầu dòng
 *   - Một ý khác
 *
 * Dòng bắt đầu bằng "##" là tiêu đề phụ; các dòng liên tiếp bắt đầu bằng
 * "-" hoặc "*" gộp thành một danh sách; các dòng còn lại (cách nhau bởi
 * dòng trống) gộp thành một đoạn văn.
 */
export function parseContentText(text: string): ContentBlock[] {
  const blocks: ContentBlock[] = [];
  const lines = text.split("\n");
  let paragraphBuf: string[] = [];

  const flushParagraph = () => {
    const value = paragraphBuf.join(" ").trim();
    if (value) blocks.push({ type: "paragraph", text: value });
    paragraphBuf = [];
  };

  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();

    if (!line) {
      flushParagraph();
      i++;
      continue;
    }

    if (line.startsWith("##")) {
      flushParagraph();
      blocks.push({ type: "heading", text: line.replace(/^##\s*/, "") });
      i++;
      continue;
    }

    if (/^[-*]\s*/.test(line)) {
      flushParagraph();
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s*/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*]\s*/, ""));
        i++;
      }
      blocks.push({ type: "list", items });
      continue;
    }

    paragraphBuf.push(line);
    i++;
  }
  flushParagraph();

  return blocks;
}

export function serializeContentText(blocks: ContentBlock[]): string {
  return blocks
    .map((b) => {
      if (b.type === "heading") return `## ${b.text}`;
      if (b.type === "list") return b.items.map((item) => `- ${item}`).join("\n");
      return b.text;
    })
    .join("\n\n");
}

/** ~180 từ/phút cho tiếng Việt — làm tròn lên, tối thiểu 1 phút. */
export function estimateReadingMinutes(blocks: ContentBlock[]): number {
  const wordCount = blocks
    .flatMap((b) => (b.type === "list" ? b.items : [b.text]))
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(wordCount / 180));
}
