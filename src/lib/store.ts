import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Lưu trữ nội dung bằng file JSON trên đĩa — đủ dùng cho giai đoạn 1 (một
 * quản trị viên, ít ghi đồng thời). Đây KHÔNG phải database thật:
 *
 * - Trên hosting serverless (Vercel, ...) filesystem chỉ đọc/ghi được ở
 *   /tmp và không bền giữa các lần chạy — chỉnh sửa qua trang quản trị sẽ
 *   mất khi container khởi động lại. Chỉ dùng đúng cách khi deploy trên máy
 *   chủ có ổ đĩa bền (VPS, container có volume) hoặc chạy local.
 * - Không có khoá ghi (file lock) — hai người sửa cùng lúc có thể ghi đè
 *   nhau. Chấp nhận được với một quản trị viên; nếu nhiều người dùng cùng
 *   lúc, cần chuyển sang database thật (Postgres/SQLite...).
 */

const DATA_DIR = path.join(process.cwd(), "data");

export async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    const raw = await readFile(path.join(DATA_DIR, file), "utf8");
    return JSON.parse(raw) as T;
  } catch (error) {
    if ((error as NodeJS.ErrnoException)?.code === "ENOENT") return fallback;
    throw error;
  }
}

export async function writeJson<T>(file: string, data: T): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(path.join(DATA_DIR, file), JSON.stringify(data, null, 2), "utf8");
}
