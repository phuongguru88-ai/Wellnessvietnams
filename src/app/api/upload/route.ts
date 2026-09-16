import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

import { getActor } from "@/lib/scope";

/**
 * Nhận một file ảnh/video từ form quản trị, lưu vào public/uploads và trả
 * về URL công khai để điền thẳng vào ô "Ảnh/Video" (xem MediaField.tsx).
 *
 * Lưu trên đĩa cục bộ — CÙNG giới hạn với data/*.json (xem lib/store.ts):
 * trên hosting serverless (Vercel...) filesystem không bền, ảnh tải lên sẽ
 * mất khi container khởi động lại. Chỉ dùng đúng cách khi chạy trên máy chủ
 * có ổ đĩa bền (VPS, container có volume) hoặc chạy local.
 */

const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8MB
const MAX_VIDEO_BYTES = 100 * 1024 * 1024; // 100MB

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
};

export async function POST(request: Request) {
  const actor = await getActor();
  if (!actor) {
    return NextResponse.json({ error: "Chưa đăng nhập." }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Không tìm thấy file." }, { status: 400 });
  }

  const isImage = file.type.startsWith("image/");
  const isVideo = file.type.startsWith("video/");
  if (!isImage && !isVideo) {
    return NextResponse.json({ error: "Chỉ nhận file ảnh hoặc video." }, { status: 400 });
  }

  const maxBytes = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
  if (file.size > maxBytes) {
    return NextResponse.json(
      { error: `File quá lớn — tối đa ${Math.round(maxBytes / (1024 * 1024))}MB.` },
      { status: 400 },
    );
  }

  const ext = EXT_BY_MIME[file.type];
  if (!ext) {
    return NextResponse.json({ error: `Định dạng ${file.type || "không rõ"} chưa được hỗ trợ.` }, { status: 400 });
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });

  const filename = `${Date.now()}-${crypto.randomUUID()}.${ext}`;
  const bytes = new Uint8Array(await file.arrayBuffer());
  await writeFile(path.join(uploadDir, filename), bytes);

  return NextResponse.json({ url: `/uploads/${filename}` });
}
