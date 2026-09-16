import type { Metadata } from "next";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";

import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { getExperiences, getPropertyById } from "@/lib/data";
import { formatDuration, formatPrice } from "@/lib/format";
import { getActor, scopeByPropertyRef } from "@/lib/scope";
import { deleteExperienceAction } from "./actions";

export const metadata: Metadata = {
  title: "Quản lý trải nghiệm",
  robots: { index: false, follow: false },
};

export default async function AdminExperiencesPage({
  searchParams,
}: {
  searchParams: Promise<{ deleted?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const actor = await getActor();
  if (!actor) return null;
  const experiences = scopeByPropertyRef(actor, await getExperiences());
  const properties = await Promise.all(experiences.map((e) => getPropertyById(e.propertyRef)));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow">Quản trị đối tác</p>
          <h1 className="mt-2 text-3xl">Trải nghiệm</h1>
        </div>
        <Link href="/quan-tri/trai-nghiem/moi" className="btn btn-primary">
          <Plus aria-hidden size={16} strokeWidth={2} />
          Thêm vé/buổi
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
              <th className="px-4 py-3 font-semibold">Tổ chức tại</th>
              <th className="px-4 py-3 font-semibold">Mức</th>
              <th className="px-4 py-3 font-semibold">Giá</th>
              <th className="px-4 py-3 font-semibold"></th>
            </tr>
          </thead>
          <tbody>
            {experiences.map((e, i) => (
              <tr key={e.id} className="border-b border-line last:border-b-0">
                <td className="px-4 py-3 font-medium">{e.name}</td>
                <td className="px-4 py-3 text-ink-soft">{formatDuration(e.durationMinutes)}</td>
                <td className="px-4 py-3 text-ink-soft">{properties[i]?.name ?? "—"}</td>
                <td className="px-4 py-3 text-ink-soft">Mức {e.muc}</td>
                <td className="px-4 py-3 text-ink-soft">{formatPrice(e.price)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-4">
                    <Link
                      href={`/trai-nghiem/${e.slug}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 text-ink-soft hover:text-ink"
                    >
                      <Eye aria-hidden size={14} strokeWidth={1.75} />
                      Xem
                    </Link>
                    <Link
                      href={`/quan-tri/trai-nghiem/${e.id}/sua`}
                      className="inline-flex items-center gap-1 font-semibold text-turmeric"
                    >
                      <Pencil aria-hidden size={14} strokeWidth={1.75} />
                      Sửa
                    </Link>
                    <ConfirmSubmitButton
                      action={deleteExperienceAction.bind(null, e.id)}
                      confirmText={`Xoá "${e.name}"? Không thể hoàn tác.`}
                    >
                      <Trash2 aria-hidden size={14} strokeWidth={1.75} />
                      Xoá
                    </ConfirmSubmitButton>
                  </div>
                </td>
              </tr>
            ))}
            {experiences.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-ink-soft">
                  Chưa có vé/buổi nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
