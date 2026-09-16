"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Checkbox, RadioGroup, Select, TextArea, TextField } from "./fields";
import { MediaField } from "./MediaField";
import type { ExperienceFormState } from "@/app/quan-tri/trai-nghiem/actions";
import { serializeImageRef } from "@/lib/media";
import { LOAI_HINH, MUC_META, NGANH, type Experience } from "@/lib/types";

const MUC_OPTIONS = ([1, 2, 3] as const).map((m) => ({
  value: String(m),
  label: `${MUC_META[m].stars} ${MUC_META[m].label}`,
}));
const NGANH_OPTIONS = NGANH.map((v) => ({ value: v, label: v }));
const LOAI_HINH_OPTIONS = LOAI_HINH.map((v) => ({ value: v, label: v }));

export function ExperienceForm({
  action,
  initial,
  submitLabel,
  properties,
}: {
  action: (prevState: ExperienceFormState, formData: FormData) => Promise<ExperienceFormState>;
  initial?: Experience;
  submitLabel: string;
  properties: { id: string; name: string; region: string }[];
}) {
  const [state, formAction, pending] = useActionState<ExperienceFormState, FormData>(
    action,
    null,
  );
  const propertyOptions = properties.map((p) => ({
    value: p.id,
    label: `${p.name} — ${p.region}`,
  }));

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Tên vé/buổi"
          name="name"
          defaultValue={initial?.name}
          required
          error={state?.errors?.name}
        />
        <TextField
          label="Đường dẫn (slug)"
          name="slug"
          defaultValue={initial?.slug}
          placeholder="để trống sẽ tự tạo từ Tên"
          hint="Đổi giá trị này sẽ đổi luôn URL công khai của trang."
          error={state?.errors?.slug}
        />
        <Select
          label="Ngành"
          name="nganh"
          defaultValue={initial?.nganh ?? NGANH_OPTIONS[0].value}
          options={NGANH_OPTIONS}
          required
          error={state?.errors?.nganh}
        />
        <Select
          label="Hình thức dịch vụ"
          name="loaiHinh"
          defaultValue={initial?.loaiHinh ?? LOAI_HINH_OPTIONS[0].value}
          options={LOAI_HINH_OPTIONS}
          required
          error={state?.errors?.loaiHinh}
        />
        <Select
          label="Tổ chức tại"
          name="propertyRef"
          defaultValue={initial?.propertyRef ?? properties[0]?.id}
          options={propertyOptions}
          required
          error={state?.errors?.propertyRef}
        />
        <TextField
          label="Thời lượng (phút)"
          name="durationMinutes"
          type="number"
          defaultValue={initial?.durationMinutes}
          required
          error={state?.errors?.durationMinutes}
        />
        <TextField
          label="Giá (đ)"
          name="price"
          type="number"
          defaultValue={initial?.price}
          required
          error={state?.errors?.price}
        />
      </div>

      <TextArea
        label="Mô tả"
        name="description"
        defaultValue={initial?.description}
        rows={5}
        required
        error={state?.errors?.description}
      />

      <TextArea
        label="Lợi ích"
        name="benefits"
        defaultValue={initial?.benefits.join("\n")}
        rows={4}
        required
        hint="Mỗi dòng một ý."
        error={state?.errors?.benefits}
      />

      <MediaField
        label="Ảnh"
        name="images"
        defaultValue={initial?.images.map(serializeImageRef).join("\n")}
        hint='Dán URL ảnh có sẵn, hoặc bấm "Tải file từ máy". Để trống sẽ dùng "Tên" làm ảnh mặc định.'
        error={state?.errors?.images}
      />

      <Checkbox
        label="Có yếu tố văn hoá vùng miền"
        name="coYeuToVanHoaVungMien"
        defaultChecked={initial?.coYeuToVanHoaVungMien}
        hint="Chỉ tick khi buổi này được thiết kế có mục đích chữa lành từ văn hoá bản địa (nghi lễ, tri thức dưỡng sinh truyền thống) — không dùng cho tham quan/mua sắm thông thường."
      />

      <RadioGroup
        label="Mức dịch vụ"
        name="muc"
        defaultValue={initial ? String(initial.muc) : "1"}
        options={MUC_OPTIONS}
        error={state?.errors?.muc}
      />

      <div className="flex items-center gap-3 border-t border-line pt-6">
        <button type="submit" disabled={pending} className="btn btn-primary disabled:opacity-60">
          {pending ? "Đang lưu…" : submitLabel}
        </button>
        <Link href="/quan-tri/trai-nghiem" className="btn btn-ghost">
          Huỷ
        </Link>
      </div>
    </form>
  );
}
