"use client";

import Link from "next/link";
import { useActionState } from "react";

import { TextArea, TextField } from "./fields";
import { MediaField } from "./MediaField";
import type { RoomTypeFormState } from "@/app/quan-tri/luu-tru/[id]/phong/actions";
import { serializeImageRef } from "@/lib/media";
import type { RoomType } from "@/lib/types";

export function RoomTypeForm({
  action,
  initial,
  submitLabel,
  cancelHref,
  defaultGiaUnit,
}: {
  action: (prevState: RoomTypeFormState, formData: FormData) => Promise<RoomTypeFormState>;
  initial?: RoomType;
  submitLabel: string;
  cancelHref: string;
  /** Đơn vị giá mặc định lấy theo Property khi tạo hạng phòng mới. */
  defaultGiaUnit: string;
}) {
  const [state, formAction, pending] = useActionState<RoomTypeFormState, FormData>(
    action,
    null,
  );

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Tên hạng phòng"
          name="name"
          defaultValue={initial?.name}
          required
          error={state?.errors?.name}
        />
        <TextField
          label="Sức chứa (khách)"
          name="sucChua"
          type="number"
          defaultValue={initial?.sucChua}
          required
          error={state?.errors?.sucChua}
        />
        <TextField
          label="Diện tích"
          name="dienTich"
          defaultValue={initial?.dienTich}
          placeholder="28 m²"
          error={state?.errors?.dienTich}
        />
        <TextField
          label="Số lượng phòng"
          name="soLuong"
          type="number"
          defaultValue={initial?.soLuong}
          hint="Để trống nếu không muốn hiện số phòng còn lại."
          error={state?.errors?.soLuong}
        />
        <TextField
          label="Giá tham khảo (đ)"
          name="giaThamKhao"
          type="number"
          defaultValue={initial?.giaThamKhao}
          required
          error={state?.errors?.giaThamKhao}
        />
        <TextField
          label="Đơn vị giá"
          name="giaUnit"
          defaultValue={initial?.giaUnit ?? defaultGiaUnit}
          error={state?.errors?.giaUnit}
        />
      </div>

      <TextArea
        label="Mô tả riêng của hạng phòng"
        name="description"
        defaultValue={initial?.description}
        rows={4}
        hint="View, cách bài trí, điểm khác với các hạng phòng khác."
        error={state?.errors?.description}
      />

      <TextArea
        label="Tiêu chuẩn / tiện nghi"
        name="tieuChuan"
        defaultValue={initial?.tieuChuan.join("\n")}
        rows={4}
        hint="Mỗi dòng một ý, ví dụ: Giường đôi, view vườn thuốc nam."
        error={state?.errors?.tieuChuan}
      />

      <MediaField
        label="Ảnh / Video hạng phòng"
        name="images"
        defaultValue={initial?.images.map(serializeImageRef).join("\n")}
        hint='Dán URL ảnh/video có sẵn (kể cả link YouTube/Vimeo), hoặc bấm "Tải file từ máy". Để trống sẽ dùng "Tên hạng phòng" làm ảnh mặc định.'
        error={state?.errors?.images}
      />

      <div className="flex items-center gap-3 border-t border-line pt-6">
        <button type="submit" disabled={pending} className="btn btn-primary disabled:opacity-60">
          {pending ? "Đang lưu…" : submitLabel}
        </button>
        <Link href={cancelHref} className="btn btn-ghost">
          Huỷ
        </Link>
      </div>
    </form>
  );
}
