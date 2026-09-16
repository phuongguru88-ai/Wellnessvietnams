import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PartnerForm } from "@/components/admin/PartnerForm";
import { getProperties } from "@/lib/data";
import { getActor } from "@/lib/scope";
import { createPartnerAction } from "../actions";

export const metadata: Metadata = {
  title: "Thêm tài khoản đối tác",
  robots: { index: false, follow: false },
};

export default async function NewPartnerPage() {
  const actor = await getActor();
  if (actor?.role !== "admin") redirect("/quan-tri");

  const properties = await getProperties();

  return (
    <div>
      <p className="eyebrow">Quản trị đối tác</p>
      <h1 className="mt-2 text-3xl">Thêm tài khoản đối tác</h1>
      <div className="mt-8 max-w-2xl">
        <PartnerForm action={createPartnerAction} submitLabel="Tạo tài khoản" properties={properties} />
      </div>
    </div>
  );
}
