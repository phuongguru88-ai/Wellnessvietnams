import type { ImageRef } from "./types";

/**
 * Nhận link video từ nguồn ngoài và chuẩn hoá thành URL nhúng (embed) được.
 * Chỉ nhận diện các nguồn cụ thể (YouTube, Vimeo) — không nhúng iframe từ
 * domain bất kỳ để tránh rủi ro clickjacking/nội dung lạ nếu ai đó dán nhầm
 * link độc hại vào form quản trị.
 */
function parseVideoUrl(url: string): { embedUrl: string; thumbnailUrl?: string } | null {
  const yt = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/,
  );
  if (yt) {
    const id = yt[1];
    return {
      embedUrl: `https://www.youtube.com/embed/${id}`,
      thumbnailUrl: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
    };
  }

  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) {
    return { embedUrl: `https://player.vimeo.com/video/${vimeo[1]}` };
  }

  return null;
}

/** Chỉ chấp nhận http/https — chặn "javascript:" và các scheme khác lỡ dán vào form. */
function isSafeHttpUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Soạn một dòng trong ô "Ảnh" của form quản trị, định dạng:
 *   "Chú thích ảnh"                          -> ảnh minh hoạ SVG (như cũ)
 *   "Chú thích ảnh | https://.../anh.jpg"    -> ảnh thật
 *   "Chú thích ảnh | https://youtu.be/xxxxx" -> video nhúng từ YouTube/Vimeo
 */
export function buildImageRef(line: string, seed: string, fallbackAlt: string): ImageRef {
  const [altRaw, urlRaw] = line.split("|").map((s) => s.trim());
  const alt = altRaw || fallbackAlt;
  const url = urlRaw || "";

  if (!url) return { seed, alt };

  const video = parseVideoUrl(url);
  if (video) {
    return { seed, alt, kind: "video", src: video.embedUrl, thumbnailSrc: video.thumbnailUrl };
  }

  if (isSafeHttpUrl(url)) {
    return { seed, alt, kind: "image", src: url };
  }

  return { seed, alt };
}

/** Chiều ngược lại của buildImageRef — dùng để hiện lại giá trị trong form sửa. */
export function serializeImageRef(image: ImageRef): string {
  return image.src ? `${image.alt} | ${image.src}` : image.alt;
}
