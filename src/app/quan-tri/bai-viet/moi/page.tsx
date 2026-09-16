import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { BaiVietForm } from "@/components/admin/BaiVietForm";
import { getActor } from "@/lib/scope";
import { createBaiVietAction } from "../actions";

export const metadata: Metadata = {
  title: "Thêm bài viết",
  robots: { index: false, follow: false },
};

export default async function NewBaiVietPage() {
  const actor = await getActor();
  if (actor?.role !== "admin") redirect("/quan-tri");

  return (
    <div>
      <p className="eyebrow">Quản trị đối tác</p>
      <h1 className="mt-2 text-3xl">Thêm bài viết</h1>
      <div className="mt-8 max-w-3xl">
        <BaiVietForm action={createBaiVietAction} submitLabel="Tạo bài viết" />
      </div>
    </div>
  );
}
