"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Checkbox, CheckboxGroup, RadioGroup, Select, TextArea, TextField } from "./fields";
import { MediaField } from "./MediaField";
import type { ProgramFormState } from "@/app/quan-tri/chuong-trinh/actions";
import { serializeItineraryText } from "@/lib/itinerary";
import { serializeImageRef } from "@/lib/media";
import {
  LOAI_HINH,
  MUC_META,
  MUC_TIEU,
  NGANH,
  PROGRAM_TRANG_THAI,
  type Program,
} from "@/lib/types";

const MUC_OPTIONS = ([1, 2, 3] as const).map((m) => ({
  value: String(m),
  label: `${MUC_META[m].stars} ${MUC_META[m].label}`,
}));
const NGANH_OPTIONS = NGANH.map((v) => ({ value: v, label: v }));
const LOAI_HINH_OPTIONS = LOAI_HINH.map((v) => ({ value: v, label: v }));
const MUC_TIEU_OPTIONS = MUC_TIEU.map((v) => ({ value: v, label: v }));
const TRANG_THAI_OPTIONS = PROGRAM_TRANG_THAI.map((v) => ({ value: v, label: v }));

/** Mỗi dòng "Loại | Giá" — ví dụ "Phòng đôi | 6900000". */
function serializeGiaTheoLoai(list?: Program["giaTheoLoai"]) {
  return (list ?? []).map((g) => `${g.loai} | ${g.gia}`).join("\n");
}

export function ProgramForm({
  action,
  initial,
  submitLabel,
  properties,
}: {
  action: (prevState: ProgramFormState, formData: FormData) => Promise<ProgramFormState>;
  initial?: Program;
  submitLabel: string;
  properties: { id: string; name: string; region: string }[];
}) {
  const [state, formAction, pending] = useActionState<ProgramFormState, FormData>(
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
          label="Tên chương trình"
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
        <TextField
          label="Thời lượng"
          name="durationLabel"
          defaultValue={initial?.durationLabel}
          placeholder="3 ngày 2 đêm"
          required
          error={state?.errors?.durationLabel}
        />
        <Select
          label="Diễn ra tại"
          name="propertyRef"
          defaultValue={initial?.propertyRef ?? properties[0]?.id}
          options={propertyOptions}
          required
          error={state?.errors?.propertyRef}
        />
        <TextField
          label="Giá (đ)"
          name="price"
          type="number"
          defaultValue={initial?.price}
          required
          error={state?.errors?.price}
        />
        <TextField
          label="Đơn vị giá"
          name="priceUnit"
          defaultValue={initial?.priceUnit ?? "khách"}
          error={state?.errors?.priceUnit}
        />
      </div>

      <TextArea
        label="Tóm tắt ngắn"
        name="summary"
        defaultValue={initial?.summary}
        rows={3}
        required
        hint="Dùng ở thẻ danh sách và mô tả tìm kiếm — nên ngắn gọn."
        error={state?.errors?.summary}
      />

      <TextArea
        label="Mô tả đầy đủ"
        name="description"
        defaultValue={initial?.description}
        rows={5}
        required
        hint='Hiện ở phần "Tổng quan" trên trang chi tiết — có thể dài hơn Tóm tắt ngắn.'
        error={state?.errors?.description}
      />

      <TextArea
        label="Lịch trình"
        name="itinerary"
        defaultValue={initial ? serializeItineraryText(initial.itinerary) : ""}
        rows={12}
        required
        hint={'Mỗi ngày bắt đầu bằng dòng "## Ngày 1: Tiêu đề", các dòng "- " tiếp theo là mốc trong ngày đó.'}
        error={state?.errors?.itinerary}
      />

      <MediaField
        label="Ảnh"
        name="images"
        defaultValue={initial?.images.map(serializeImageRef).join("\n")}
        hint='Dán URL ảnh có sẵn, hoặc bấm "Tải file từ máy". Để trống sẽ dùng "Tên" làm ảnh mặc định.'
        error={state?.errors?.images}
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
        hint="Chỉ tick khi chương trình được thiết kế có mục đích chữa lành từ văn hoá bản địa (nghi lễ, tri thức dưỡng sinh truyền thống) — không dùng cho tham quan/mua sắm thông thường."
      />

      <RadioGroup
        label="Mức dịch vụ"
        name="muc"
        defaultValue={initial ? String(initial.muc) : "1"}
        options={MUC_OPTIONS}
        error={state?.errors?.muc}
      />

      <CheckboxGroup
        label="Mục tiêu chương trình"
        name="mucTieu"
        defaultValues={initial?.mucTieu}
        options={MUC_TIEU_OPTIONS}
        error={state?.errors?.mucTieu}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <TextArea
          label="Đối tượng phù hợp"
          name="doiTuongPhuHop"
          defaultValue={initial?.doiTuongPhuHop.join("\n")}
          rows={4}
          required
          hint="Mỗi dòng một ý."
          error={state?.errors?.doiTuongPhuHop}
        />
        <TextArea
          label="Đối tượng không phù hợp"
          name="doiTuongKhongPhuHop"
          defaultValue={initial?.doiTuongKhongPhuHop.join("\n")}
          rows={4}
          hint="Chống chỉ định — mỗi dòng một ý. Có thể để trống."
          error={state?.errors?.doiTuongKhongPhuHop}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <TextArea
          label="Đã bao gồm"
          name="baoGom"
          defaultValue={initial?.baoGom.join("\n")}
          rows={4}
          required
          hint="Mỗi dòng một ý."
          error={state?.errors?.baoGom}
        />
        <TextArea
          label="Không bao gồm"
          name="khongBaoGom"
          defaultValue={initial?.khongBaoGom.join("\n")}
          rows={4}
          hint="Mỗi dòng một ý. Có thể để trống."
          error={state?.errors?.khongBaoGom}
        />
      </div>

      <TextArea
        label="Yêu cầu chuẩn bị trước"
        name="yeuCauTruocKhi"
        defaultValue={initial?.yeuCauTruocKhi.join("\n")}
        rows={3}
        hint='Mỗi dòng một ý — vd "Khai báo tiền sử bệnh lý". Có thể để trống.'
        error={state?.errors?.yeuCauTruocKhi}
      />

      <TextArea
        label="Chuyên môn đội ngũ phụ trách"
        name="chuyenMonDoiNgu"
        defaultValue={initial?.chuyenMonDoiNgu}
        rows={2}
        required
        error={state?.errors?.chuyenMonDoiNgu}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Quy mô nhóm — tối thiểu"
          name="quyMoNhomMin"
          type="number"
          defaultValue={initial?.quyMoNhom?.min}
          hint="Để trống cả hai ô nếu chương trình chỉ phục vụ riêng từng khách."
          error={state?.errors?.quyMoNhomMin}
        />
        <TextField
          label="Quy mô nhóm — tối đa"
          name="quyMoNhomMax"
          type="number"
          defaultValue={initial?.quyMoNhom?.max}
          error={state?.errors?.quyMoNhomMax}
        />
      </div>

      <TextArea
        label="Giới hạn / cam kết vận hành"
        name="gioiHanCamKet"
        defaultValue={initial?.gioiHanCamKet}
        rows={2}
        required
        hint='Vd "Chỉ nhận khách đăng ký trọn gói, không tách lẻ từng ngày".'
        error={state?.errors?.gioiHanCamKet}
      />

      <TextArea
        label="Giá theo hạng"
        name="giaTheoLoai"
        defaultValue={serializeGiaTheoLoai(initial?.giaTheoLoai)}
        rows={3}
        hint='Mỗi dòng "Loại | Giá", ví dụ "Phòng đôi | 6900000". Để trống nếu chỉ có một mức giá.'
        error={state?.errors?.giaTheoLoai}
      />

      <TextArea
        label="Chính sách huỷ"
        name="chinhSachHuy"
        defaultValue={initial?.chinhSachHuy}
        rows={2}
        required
        error={state?.errors?.chinhSachHuy}
      />

      <RadioGroup
        label="Trạng thái"
        name="trangThai"
        defaultValue={initial?.trangThai ?? "Đang mở bán"}
        options={TRANG_THAI_OPTIONS}
        error={state?.errors?.trangThai}
      />

      <div className="flex items-center gap-3 border-t border-line pt-6">
        <button type="submit" disabled={pending} className="btn btn-primary disabled:opacity-60">
          {pending ? "Đang lưu…" : submitLabel}
        </button>
        <Link href="/quan-tri/chuong-trinh" className="btn btn-ghost">
          Huỷ
        </Link>
      </div>
    </form>
  );
}
