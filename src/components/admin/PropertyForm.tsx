"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Rows } from "lucide-react";

import { Checkbox, CheckboxGroup, RadioGroup, Select, TextArea, TextField } from "./fields";
import { MediaField } from "./MediaField";
import type { PropertyFormState } from "@/app/quan-tri/luu-tru/actions";
import { serializeImageRef } from "@/lib/media";
import {
  LOAI_HINH,
  MUC_META,
  NGANH,
  PROPERTY_TYPE_LABEL,
  type Property,
} from "@/lib/types";

const TYPE_OPTIONS = (Object.keys(PROPERTY_TYPE_LABEL) as (keyof typeof PROPERTY_TYPE_LABEL)[]).map(
  (v) => ({ value: v, label: PROPERTY_TYPE_LABEL[v] }),
);
const TRANG_THAI_OPTIONS = ["Đang nhận khách", "Sắp mở", "Tạm dừng"].map((v) => ({
  value: v,
  label: v,
}));
const MUC_OPTIONS = ([1, 2, 3] as const).map((m) => ({
  value: String(m),
  label: `${MUC_META[m].stars} ${MUC_META[m].label}`,
}));
const NGANH_OPTIONS = NGANH.map((v) => ({ value: v, label: v }));
const LOAI_HINH_OPTIONS = LOAI_HINH.map((v) => ({ value: v, label: v }));

export function PropertyForm({
  action,
  initial,
  submitLabel,
}: {
  action: (prevState: PropertyFormState, formData: FormData) => Promise<PropertyFormState>;
  initial?: Property;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState<PropertyFormState, FormData>(
    action,
    null,
  );

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Tên"
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
          label="Loại chỗ ở"
          name="type"
          defaultValue={initial?.type ?? "Villa"}
          options={TYPE_OPTIONS}
          error={state?.errors?.type}
        />
        <TextField
          label="Vùng miền"
          name="region"
          defaultValue={initial?.region}
          required
          placeholder="Hà Giang"
          error={state?.errors?.region}
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
          defaultValue={initial?.giaUnit ?? "đêm"}
          error={state?.errors?.giaUnit}
        />
        <Select
          label="Trạng thái"
          name="trangThai"
          defaultValue={initial?.trangThai ?? "Đang nhận khách"}
          options={TRANG_THAI_OPTIONS}
          error={state?.errors?.trangThai}
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
        label="Điểm nổi bật"
        name="highlights"
        defaultValue={initial?.highlights.join("\n")}
        rows={4}
        required
        hint="Mỗi dòng một ý."
        error={state?.errors?.highlights}
      />

      <MediaField
        label="Ảnh / Video"
        name="images"
        defaultValue={initial?.images.map(serializeImageRef).join("\n")}
        hint='Dán URL ảnh/video có sẵn (kể cả link YouTube/Vimeo), hoặc bấm "Tải file từ máy". Để trống sẽ dùng "Tên" làm ảnh mặc định.'
        error={state?.errors?.images}
      />

      {/* Hạng phòng giờ có trang quản trị riêng — mỗi hạng phòng một form + ảnh riêng thay vì gộp chung một ô văn bản khó soạn. Chỉ vào được sau khi nơi lưu trú đã tồn tại (cần initial.id để biết thêm vào property nào). */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-ink">Hạng phòng</label>
        {initial ? (
          <Link
            href={`/quan-tri/luu-tru/${initial.id}/phong`}
            className="flex items-center gap-2 rounded-xl border border-line bg-bg px-3.5 py-2.5 text-sm font-medium text-ink hover:border-ink-soft"
          >
            <Rows aria-hidden size={15} strokeWidth={2} className="text-turmeric" />
            {initial.roomTypes.length > 0
              ? `Quản lý ${initial.roomTypes.length} hạng phòng →`
              : "Thêm hạng phòng →"}
          </Link>
        ) : (
          <p className="text-xs text-ink-soft">
            Lưu nơi lưu trú trước, sau đó quay lại đây để thêm hạng phòng.
          </p>
        )}
      </div>

      <TextArea
        label="Tiện ích chung"
        name="tienIch"
        defaultValue={initial?.tienIch.join("\n")}
        rows={4}
        hint="Tiện ích của cả nơi ở, không thuộc riêng phòng nào. Mỗi dòng một ý, ví dụ: Wifi miễn phí toàn khu."
        error={state?.errors?.tienIch}
      />

      <TextArea
        label="Điểm đến lân cận"
        name="diemDenLanCan"
        defaultValue={initial?.diemDenLanCan.map((d) => `${d.ten} | ${d.khoangCach}`).join("\n")}
        rows={4}
        hint='Mỗi dòng theo định dạng "Tên | Khoảng cách", ví dụ: "Chợ phiên Đồng Văn | 15 phút đi bộ".'
        error={state?.errors?.diemDenLanCan}
      />

      <CheckboxGroup
        label="Ngành"
        name="nganh"
        defaultValues={initial?.nganh}
        options={NGANH_OPTIONS}
        error={state?.errors?.nganh}
      />

      <CheckboxGroup
        label="Hình thức dịch vụ"
        name="loaiHinh"
        defaultValues={initial?.loaiHinh}
        options={LOAI_HINH_OPTIONS}
        error={state?.errors?.loaiHinh}
      />

      <Checkbox
        label="Có yếu tố văn hoá vùng miền"
        name="coYeuToVanHoaVungMien"
        defaultChecked={initial?.coYeuToVanHoaVungMien}
        hint="Chỉ tick khi trải nghiệm ở đây được thiết kế có mục đích chữa lành từ văn hoá bản địa (nghi lễ, tri thức dưỡng sinh truyền thống) — không dùng cho tham quan/mua sắm thông thường."
      />

      <RadioGroup
        label="Mức dịch vụ cao nhất tại đây"
        name="mucCaoNhat"
        defaultValue={initial ? String(initial.mucCaoNhat) : "1"}
        options={MUC_OPTIONS}
        error={state?.errors?.mucCaoNhat}
      />

      <div className="flex items-center gap-3 border-t border-line pt-6">
        <button type="submit" disabled={pending} className="btn btn-primary disabled:opacity-60">
          {pending ? "Đang lưu…" : submitLabel}
        </button>
        <Link href="/quan-tri/luu-tru" className="btn btn-ghost">
          Huỷ
        </Link>
      </div>
    </form>
  );
}
