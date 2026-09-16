import type { Metadata } from "next";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";

import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { getProperties } from "@/lib/data";
import { formatPrice } from "@/lib/format";
import { getActor, scopeProperties } from "@/lib/scope";
import { PROPERTY_TYPE_LABEL } from "@/lib/types";
import { deletePropertyAction } from "./actions";

export const metadata: Metadata = {
  title: "Quản lý lưu trú",
  robots: { index: false, follow: false },
};

export default async function AdminPropertiesPage({
  searchParams,
}: {
  searchParams: Promise<{ deleted?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const actor = await getActor();
  if (!actor) return null;
  const properties = scopeProperties(actor, await getProperties());

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow">Quản trị đối tác</p>
          <h1 className="mt-2 text-3xl">Lưu trú</h1>
        </div>
        {actor.role === "admin" && (
          <Link href="/quan-tri/luu-tru/moi" className="btn btn-primary">
            <Plus aria-hidden size={16} strokeWidth={2} />
            Thêm nơi lưu trú
          </Link>
        )}
      </div>

      {sp.deleted && (
        <p className="mt-4 rounded-xl border border-moss bg-card px-4 py-3 text-sm font-medium text-moss">
          Đã xoá.
        </p>
      )}
      {sp.error && (
        <p role="alert" className="mt-4 rounded-xl border border-turmeric bg-card px-4 py-3 text-sm font-medium text-turmeric">
          {sp.error}
        </p>
      )}

      <div className="mt-6 overflow-x-auto rounded-card border border-line">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-line bg-card text-left text-xs uppercase tracking-wide text-ink-soft">
              <th className="px-4 py-3 font-semibold">Tên</th>
              <th className="px-4 py-3 font-semibold">Loại / vùng miền</th>
              <th className="px-4 py-3 font-semibold">Mức</th>
              <th className="px-4 py-3 font-semibold">Giá</th>
              <th className="px-4 py-3 font-semibold">Trạng thái</th>
              <th className="px-4 py-3 font-semibold"></th>
            </tr>
          </thead>
          <tbody>
            {properties.map((p) => (
              <tr key={p.id} className="border-b border-line last:border-b-0">
                <td className="px-4 py-3 font-medium">{p.name}</td>
                <td className="px-4 py-3 text-ink-soft">
                  {PROPERTY_TYPE_LABEL[p.type]} · {p.region}
                </td>
                <td className="px-4 py-3 text-ink-soft">Mức {p.mucCaoNhat}</td>
                <td className="px-4 py-3 text-ink-soft">{formatPrice(p.giaThamKhao, p.giaUnit)}</td>
                <td className="px-4 py-3 text-ink-soft">{p.trangThai}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-4">
                    <Link
                      href={`/luu-tru/${p.slug}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 text-ink-soft hover:text-ink"
                    >
                      <Eye aria-hidden size={14} strokeWidth={1.75} />
                      Xem
                    </Link>
                    <Link
                      href={`/quan-tri/luu-tru/${p.id}/sua`}
                      className="inline-flex items-center gap-1 font-semibold text-turmeric"
                    >
                      <Pencil aria-hidden size={14} strokeWidth={1.75} />
                      Sửa
                    </Link>
                    <ConfirmSubmitButton
                      action={deletePropertyAction.bind(null, p.id)}
                      confirmText={`Xoá "${p.name}"? Không thể hoàn tác.`}
                    >
                      <Trash2 aria-hidden size={14} strokeWidth={1.75} />
                      Xoá
                    </ConfirmSubmitButton>
                  </div>
                </td>
              </tr>
            ))}
            {properties.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-ink-soft">
                  Chưa có nơi lưu trú nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
