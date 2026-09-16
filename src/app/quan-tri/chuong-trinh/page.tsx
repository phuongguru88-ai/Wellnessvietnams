import type { Metadata } from "next";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";

import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { getPrograms, getPropertyById } from "@/lib/data";
import { formatPrice } from "@/lib/format";
import { getActor, scopeByPropertyRef } from "@/lib/scope";
import { deleteProgramAction } from "./actions";

export const metadata: Metadata = {
  title: "Quản lý chương trình",
  robots: { index: false, follow: false },
};

export default async function AdminProgramsPage({
  searchParams,
}: {
  searchParams: Promise<{ deleted?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const actor = await getActor();
  if (!actor) return null;
  const programs = scopeByPropertyRef(actor, await getPrograms());
  const properties = await Promise.all(programs.map((p) => getPropertyById(p.propertyRef)));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow">Quản trị đối tác</p>
          <h1 className="mt-2 text-3xl">Chương trình</h1>
        </div>
        <Link href="/quan-tri/chuong-trinh/moi" className="btn btn-primary">
          <Plus aria-hidden size={16} strokeWidth={2} />
          Thêm chương trình
        </Link>
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
              <th className="px-4 py-3 font-semibold">Thời lượng</th>
              <th className="px-4 py-3 font-semibold">Diễn ra tại</th>
              <th className="px-4 py-3 font-semibold">Mức</th>
              <th className="px-4 py-3 font-semibold">Giá</th>
              <th className="px-4 py-3 font-semibold">Trạng thái</th>
              <th className="px-4 py-3 font-semibold"></th>
            </tr>
          </thead>
          <tbody>
            {programs.map((p, i) => (
              <tr key={p.id} className="border-b border-line last:border-b-0">
                <td className="px-4 py-3 font-medium">{p.name}</td>
                <td className="px-4 py-3 text-ink-soft">{p.durationLabel}</td>
                <td className="px-4 py-3 text-ink-soft">{properties[i]?.name ?? "—"}</td>
                <td className="px-4 py-3 text-ink-soft">Mức {p.muc}</td>
                <td className="px-4 py-3 text-ink-soft">{formatPrice(p.price, p.priceUnit)}</td>
                <td className="px-4 py-3 text-ink-soft">{p.trangThai}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-4">
                    <Link
                      href={`/chuong-trinh/${p.slug}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 text-ink-soft hover:text-ink"
                    >
                      <Eye aria-hidden size={14} strokeWidth={1.75} />
                      Xem
                    </Link>
                    <Link
                      href={`/quan-tri/chuong-trinh/${p.id}/sua`}
                      className="inline-flex items-center gap-1 font-semibold text-turmeric"
                    >
                      <Pencil aria-hidden size={14} strokeWidth={1.75} />
                      Sửa
                    </Link>
                    <ConfirmSubmitButton
                      action={deleteProgramAction.bind(null, p.id)}
                      confirmText={`Xoá "${p.name}"? Không thể hoàn tác.`}
                    >
                      <Trash2 aria-hidden size={14} strokeWidth={1.75} />
                      Xoá
                    </ConfirmSubmitButton>
                  </div>
                </td>
              </tr>
            ))}
            {programs.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-ink-soft">
                  Chưa có chương trình nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
