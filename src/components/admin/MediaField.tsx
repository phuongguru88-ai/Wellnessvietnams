"use client";

import { ImagePlus, Loader2, Trash2, Upload } from "lucide-react";
import { useId, useRef, useState } from "react";

import { FieldError } from "./fields";

type MediaItem = {
  /** Chỉ dùng làm key ổn định trong danh sách — không gửi lên server. */
  key: string;
  alt: string;
  url: string;
};

/** "Chú thích | URL" mỗi dòng -> danh sách item cho UI. Khớp lib/media.ts#buildImageRef. */
function parseLines(text?: string): MediaItem[] {
  const lines = (text ?? "").split("\n").map((l) => l.trim()).filter(Boolean);
  return lines.map((line, i) => {
    const [alt, url] = line.split("|").map((s) => s.trim());
    return { key: `${i}-${alt ?? ""}`, alt: alt ?? "", url: url ?? "" };
  });
}

/** Chiều ngược lại — vẫn đúng định dạng "Chú thích | URL" mà lib/data.ts đang parse. */
function serialize(items: MediaItem[]): string {
  return items
    .map((it) => (it.url ? `${it.alt} | ${it.url}` : it.alt))
    .filter((line) => line.trim())
    .join("\n");
}

function looksLikeImageUrl(url: string) {
  return /^https?:\/\//.test(url) && !/youtu\.?be|vimeo\.com/.test(url);
}

/**
 * Thay cho ô textarea gõ tay "Chú thích | URL" — vẫn gửi lên server đúng
 * định dạng đó (qua input ẩn cùng `name`) nên không cần đổi gì ở
 * lib/data.ts / lib/media.ts. Mỗi dòng có thể dán URL sẵn có, hoặc bấm tải
 * file ảnh/video từ máy lên (qua /api/upload) để tự điền URL.
 */
export function MediaField({
  label,
  name,
  defaultValue,
  hint,
  error,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  hint?: string;
  error?: string;
}) {
  const [items, setItems] = useState<MediaItem[]>(() => parseLines(defaultValue));
  const uid = useId();

  function update(key: string, patch: Partial<MediaItem>) {
    setItems((list) => list.map((it) => (it.key === key ? { ...it, ...patch } : it)));
  }

  function remove(key: string) {
    setItems((list) => list.filter((it) => it.key !== key));
  }

  function add() {
    setItems((list) => [...list, { key: `${Date.now()}-${list.length}`, alt: "", url: "" }]);
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-ink">{label}</label>
      {hint && <p className="text-xs text-ink-soft">{hint}</p>}

      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <MediaRow key={item.key} item={item} onChange={(patch) => update(item.key, patch)} onRemove={() => remove(item.key)} />
        ))}
      </div>

      <button
        type="button"
        onClick={add}
        className="inline-flex w-fit items-center gap-1.5 rounded-full border border-dashed border-line px-3.5 py-2 text-xs font-semibold text-ink-soft hover:border-ink-soft hover:text-ink"
      >
        <ImagePlus aria-hidden size={14} strokeWidth={2} />
        Thêm ảnh/video
      </button>

      {error && <FieldError>{error}</FieldError>}

      {/* Input ẩn giữ đúng định dạng "Chú thích | URL" mỗi dòng — cái Server Action thực sự đọc khi submit. */}
      <input type="hidden" id={`${uid}-${name}`} name={name} value={serialize(items)} readOnly />
    </div>
  );
}

function MediaRow({
  item,
  onChange,
  onRemove,
}: {
  item: MediaItem;
  onChange: (patch: Partial<MediaItem>) => void;
  onRemove: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setUploadError(null);
    try {
      const fd = new FormData();
      fd.set("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setUploadError(data.error ?? "Tải lên thất bại.");
        return;
      }
      onChange({ url: data.url, alt: item.alt || file.name.replace(/\.[^.]+$/, "") });
    } catch {
      setUploadError("Mất kết nối khi tải lên.");
    } finally {
      setUploading(false);
    }
  }

  const showPreview = item.url && looksLikeImageUrl(item.url);

  return (
    <div className="flex gap-3 rounded-xl border border-line bg-bg p-3">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-card">
        {showPreview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.url} alt="" className="h-full w-full object-cover" />
        ) : (
          <ImagePlus aria-hidden size={20} strokeWidth={1.5} className="text-ink-soft" />
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="grid gap-2 sm:grid-cols-2">
          <input
            value={item.alt}
            onChange={(e) => onChange({ alt: e.target.value })}
            placeholder="Chú thích ảnh"
            className="rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink placeholder:text-ink-soft/70"
          />
          <input
            value={item.url}
            onChange={(e) => onChange({ url: e.target.value })}
            placeholder="URL ảnh, hoặc link YouTube/Vimeo"
            className="rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink placeholder:text-ink-soft/70"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (file) void handleFile(file);
            }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-medium text-ink-soft hover:border-ink-soft hover:text-ink disabled:opacity-60"
          >
            {uploading ? (
              <Loader2 aria-hidden size={12} strokeWidth={2} className="animate-spin" />
            ) : (
              <Upload aria-hidden size={12} strokeWidth={2} />
            )}
            {uploading ? "Đang tải lên…" : "Tải file từ máy"}
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-turmeric hover:bg-card"
          >
            <Trash2 aria-hidden size={12} strokeWidth={2} />
            Xoá
          </button>
          {uploadError && <span className="text-xs font-medium text-turmeric">{uploadError}</span>}
        </div>
      </div>
    </div>
  );
}
