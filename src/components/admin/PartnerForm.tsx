"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Checkbox, CheckboxGroup, RadioGroup, TextField } from "./fields";
import type { PartnerFormState } from "@/app/quan-tri/doi-tac/actions";
import type { PartnerAccount } from "@/lib/types";

const ROLE_OPTIONS = [
  { value: "partner", label: "Đối tác — chỉ quản lý nơi lưu trú được gán" },
  { value: "admin", label: "Quản trị viên — toàn quyền" },
];

export function PartnerForm({
  action,
  initial,
  submitLabel,
  properties,
}: {
  action: (prevState: PartnerFormState, formData: FormData) => Promise<PartnerFormState>;
  initial?: PartnerAccount;
  submitLabel: string;
  properties: { id: string; name: string; region: string }[];
}) {
  const [state, formAction, pending] = useActionState<PartnerFormState, FormData>(action, null);
  const propertyOptions = properties.map((p) => ({ value: p.id, label: `${p.name} — ${p.region}` }));

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Tên hiển thị"
          name="name"
          defaultValue={initial?.name}
          placeholder="Villa Chàm Hà Giang"
          required
          error={state?.errors?.name}
        />
        <TextField
          label="Tên đăng nhập"
          name="username"
          defaultValue={initial?.username}
          placeholder="villa-cham"
          hint="Chỉ chữ thường, số, gạch nối — dùng để đăng nhập /quan-tri."
          required
          error={state?.errors?.username}
        />
        <TextField
          label="Mật khẩu"
          name="password"
          type="password"
          placeholder={initial ? "Để trống nếu không đổi mật khẩu" : undefined}
          hint="Ít nhất 8 ký tự."
          required={!initial}
          error={state?.errors?.password}
        />
      </div>

      <RadioGroup
        label="Vai trò"
        name="role"
        defaultValue={initial?.role ?? "partner"}
        options={ROLE_OPTIONS}
        error={state?.errors?.role}
      />

      <CheckboxGroup
        label="Quản lý những nơi lưu trú nào"
        name="propertyIds"
        defaultValues={initial?.propertyIds}
        options={propertyOptions}
        error={state?.errors?.propertyIds}
      />
      <p className="-mt-4 text-xs text-ink-soft">
        Chỉ áp dụng cho vai trò Đối tác — Quản trị viên mặc định toàn quyền, bỏ qua mục này.
      </p>

      <Checkbox
        label="Đang hoạt động"
        name="active"
        defaultChecked={initial?.active ?? true}
        hint="Bỏ tick để tạm khoá đăng nhập mà không cần xoá tài khoản."
      />

      <div className="flex items-center gap-3 border-t border-line pt-6">
        <button type="submit" disabled={pending} className="btn btn-primary disabled:opacity-60">
          {pending ? "Đang lưu…" : submitLabel}
        </button>
        <Link href="/quan-tri/doi-tac" className="btn btn-ghost">
          Huỷ
        </Link>
      </div>
    </form>
  );
}
