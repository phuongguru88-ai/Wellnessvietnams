"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Select, TextArea, TextField } from "./fields";
import { MediaField } from "./MediaField";
import type { BaiVietFormState } from "@/app/quan-tri/bai-viet/actions";
import { serializeContentText } from "@/lib/content";
import { serializeImageRef } from "@/lib/media";
import { BAI_VIET_CHUYEN_MUC, type BaiViet } from "@/lib/types";

const CHUYEN_MUC_OPTIONS = BAI_VIET_CHUYEN_MUC.map((v) => ({ value: v, label: v }));

export function BaiVietForm({
  action,
  initial,
  submitLabel,
}: {
  action: (prevState: BaiVietFormState, formData: FormData) => Promise<BaiVietFormState>;
  initial?: BaiViet;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState<BaiVietFormState, FormData>(
    action,
    null,
  );

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Tiêu đề"
          name="title"
          defaultValue={initial?.title}
          required
          error={state?.errors?.title}
        />
        <TextField
          label="Đường dẫn (slug)"
          name="slug"
          defaultValue={initial?.slug}
          placeholder="để trống sẽ tự tạo từ Tiêu đề"
          hint="Đổi giá trị này sẽ đổi luôn URL công khai của trang."
          error={state?.errors?.slug}
        />
        <Select
          label="Chuyên mục"
          name="chuyenMuc"
          defaultValue={initial?.chuyenMuc ?? BAI_VIET_CHUYEN_MUC[0]}
          options={CHUYEN_MUC_OPTIONS}
          required
          error={state?.errors?.chuyenMuc}
        />
        <TextField
          label="Tác giả"
          name="author"
          defaultValue={initial?.author ?? "Đội ngũ Wellnessvietnams"}
          error={state?.errors?.author}
        />
        <TextField
          label="Ngày đăng"
          name="publishedAt"
          type="date"
          defaultValue={initial?.publishedAt ?? new Date().toISOString().slice(0, 10)}
          error={state?.errors?.publishedAt}
        />
      </div>

      <TextArea
        label="Mô tả ngắn (excerpt)"
        name="excerpt"
        defaultValue={initial?.excerpt}
        rows={3}
        required
        hint="Hiện ở thẻ danh sách và thẻ meta description trên công cụ tìm kiếm."
        error={state?.errors?.excerpt}
      />

      <TextArea
        label="Nội dung"
        name="content"
        defaultValue={initial ? serializeContentText(initial.content) : ""}
        rows={16}
        required
        hint='Dòng bắt đầu "## " là tiêu đề phụ, dòng bắt đầu "- " là gạch đầu dòng, dòng thường là đoạn văn — mỗi đoạn cách nhau bằng một dòng trống.'
        error={state?.errors?.content}
      />

      <MediaField
        label="Ảnh"
        name="images"
        defaultValue={initial?.images.map(serializeImageRef).join("\n")}
        hint='Ảnh đầu tiên dùng làm ảnh bìa. Dán URL ảnh có sẵn, hoặc bấm "Tải file từ máy". Để trống sẽ dùng "Tiêu đề" làm ảnh mặc định.'
        error={state?.errors?.images}
      />

      <div className="flex items-center gap-3 border-t border-line pt-6">
        <button type="submit" disabled={pending} className="btn btn-primary disabled:opacity-60">
          {pending ? "Đang lưu…" : submitLabel}
        </button>
        <Link href="/quan-tri/bai-viet" className="btn btn-ghost">
          Huỷ
        </Link>
      </div>
    </form>
  );
}
