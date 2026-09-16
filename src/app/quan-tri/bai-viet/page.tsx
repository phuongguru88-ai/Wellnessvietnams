import type { Metadata } from "next";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { sortedBaiVietList } from "@/lib/data";
import { formatArticleDate } from "@/lib/format";
import { getActor } from "@/lib/scope";
import { deleteBaiVietAction } from "./actions";

export const metadata: Metadata = {
  title: "Quản lý bài viết",
  robots: { index: false, follow: false },
};

export default async function AdminBaiVietPage({
  searchParams,
}: {
  searchParams: Promise<{ deleted?: string }>;
}) {
  // Bài viết kiến thức không gắn với một Property cụ thể — chỉ đội nội
  // dung trung tâm (role admin) được quản lý.
  const actor = await getActor();
  if (actor?.role !== "admin") redirect("/quan-tri");

  const sp = await searchParams;
  const list = await sortedBaiVietList();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow">Quản trị đối tác</p>
          <h1 className="mt-2 text-3xl">Kiến thức</h1>
        </div>
        <Link href="/quan-tri/bai-viet/moi" className="btn btn-primary">
          <Plus aria-hidden size={16} strokeWidth={2} />
          Thêm bài viết
        </Link>
      </div>

      {sp.deleted && (
        <p className="mt-4 rounded-xl border border-moss bg-card px-4 py-3 text-sm font-medium text-moss">
          Đã xoá.
        </p>
      )}

      <div className="mt-6 overflow-x-auto rounded-card border border-line">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-line bg-card text-left text-xs uppercase tracking-wide text-ink-soft">
              <th className="px-4 py-3 font-semibold">Tiêu đề</th>
              <th className="px-4 py-3 font-semibold">Chuyên mục</th>
              <th className="px-4 py-3 font-semibold">Ngày đăng</th>
              <th className="px-4 py-3 font-semibold"></th>
            </tr>
          </thead>
          <tbody>
            {list.map((b) => (
              <tr key={b.id} className="border-b border-line last:border-b-0">
                <td className="px-4 py-3 font-medium">{b.title}</td>
                <td className="px-4 py-3 text-ink-soft">{b.chuyenMuc}</td>
                <td className="px-4 py-3 text-ink-soft">{formatArticleDate(b.publishedAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-4">
                    <Link
                      href={`/kien-thuc/${b.slug}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 text-ink-soft hover:text-ink"
                    >
                      <Eye aria-hidden size={14} strokeWidth={1.75} />
                      Xem
                    </Link>
                    <Link
                      href={`/quan-tri/bai-viet/${b.id}/sua`}
                      className="inline-flex items-center gap-1 font-semibold text-turmeric"
                    >
                      <Pencil aria-hidden size={14} strokeWidth={1.75} />
                      Sửa
                    </Link>
                    <ConfirmSubmitButton
                      action={deleteBaiVietAction.bind(null, b.id)}
                      confirmText={`Xoá "${b.title}"? Không thể hoàn tác.`}
                    >
                      <Trash2 aria-hidden size={14} strokeWidth={1.75} />
                      Xoá
                    </ConfirmSubmitButton>
                  </div>
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-ink-soft">
                  Chưa có bài viết nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
