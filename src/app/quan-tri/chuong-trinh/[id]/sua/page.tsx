import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProgramForm } from "@/components/admin/ProgramForm";
import { getProgramById, getProperties } from "@/lib/data";
import { getActor, ownsProperty, scopeProperties } from "@/lib/scope";
import { updateProgramAction } from "../../actions";

export const metadata: Metadata = {
  title: "Sửa chương trình",
  robots: { index: false, follow: false },
};

export default async function EditProgramPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string; saved?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const [program, allProperties, actor] = await Promise.all([
    getProgramById(id),
    getProperties(),
    getActor(),
  ]);
  if (!program || !actor || !ownsProperty(actor, program.propertyRef)) notFound();
  const properties = scopeProperties(actor, allProperties);

  return (
    <div>
      <p className="eyebrow">Quản trị đối tác</p>
      <h1 className="mt-2 text-3xl">Sửa: {program.name}</h1>

      {(sp.created || sp.saved) && (
        <p className="mt-4 rounded-xl border border-moss bg-card px-4 py-3 text-sm font-medium text-moss">
          {sp.created ? "Đã tạo chương trình. Bạn có thể chỉnh sửa thêm bên dưới." : "Đã lưu thay đổi."}
        </p>
      )}

      <div className="mt-8 max-w-3xl">
        <ProgramForm
          action={updateProgramAction.bind(null, id)}
          initial={program}
          submitLabel="Lưu thay đổi"
          properties={properties}
        />
      </div>
    </div>
  );
}
