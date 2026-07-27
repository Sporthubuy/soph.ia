import { notFound } from "next/navigation";
import { getKnowledgeUnit, getKUVersions } from "@/lib/knowledge/actions";
import { KUEditor } from "@/components/editor/ku-editor";

export default async function KUDetailPage({
  params,
}: {
  params: Promise<{ kuId: string }>;
}) {
  const { kuId } = await params;

  const [ku, versions] = await Promise.all([
    getKnowledgeUnit(kuId),
    getKUVersions(kuId),
  ]);

  if (!ku) {
    notFound();
  }

  return (
    <div className="flex flex-1 flex-col p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">{ku.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Editando Knowledge Unit · v{ku.version}
        </p>
      </div>
      <KUEditor ku={ku} versions={versions} />
    </div>
  );
}
