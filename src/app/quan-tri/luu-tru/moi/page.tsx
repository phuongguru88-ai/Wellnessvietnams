import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PropertyForm } from "@/components/admin/PropertyForm";
import { getActor } from "@/lib/scope";
import { createPropertyAction } from "../actions";

export const metadata: Metadata = {
  title: "Thêm nơi lưu trú",
  robots: { index: false, follow: false },
};

export default async function NewPropertyPage() {
  // Tạo nơi lưu trú mới là việc của đội vận hành trung tâm — đối tác chỉ
  // quản lý (sửa) những nơi đã được gán cho họ, xem lib/scope.ts.
  const actor = await getActor();
  if (actor?.role !== "admin") redirect("/quan-tri/luu-tru");

  return (
    <div>
      <p className="eyebrow">Quản trị đối tác</p>
      <h1 className="mt-2 text-3xl">Thêm nơi lưu trú</h1>
      <div className="mt-8 max-w-3xl">
        <PropertyForm action={createPropertyAction} submitLabel="Tạo nơi lưu trú" />
      </div>
    </div>
  );
}
