import { setRequestLocale } from "next-intl/server";
import { notFound, redirect } from "next/navigation";
import { Link } from "@/i18n/routing";
import {
  getKnowledgeUnitForEdit,
  getKUVersions,
  getKUDependencies,
  getKUDependencyCandidates,
  getCurrentUserRole,
} from "@/lib/knowledge/actions";
import { EDITOR_ROLES } from "@/lib/knowledge/constants";
import { KUEditor } from "@/components/editor/ku-editor";

export default async function EditKnowledgeUnitPage({
  params,
}: {
  params: Promise<{ locale: string; kuId: string }>;
}) {
  const { locale, kuId } = await params;
  setRequestLocale(locale);

  const role = await getCurrentUserRole();
  if (!EDITOR_ROLES.includes(role)) {
    redirect(`/${locale}/knowledge/${kuId}`);
  }

  const ku = await getKnowledgeUnitForEdit(kuId);
  if (!ku) notFound();

  const [versions, dependencies, candidates] = await Promise.all([
    getKUVersions(kuId),
    getKUDependencies(kuId),
    getKUDependencyCandidates(kuId),
  ]);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <nav aria-label="Migas de pan" className="body-sm text-[#7c839b]">
        <Link href="/knowledge" className="hover:text-black transition-colors">
          Knowledge Units
        </Link>
        <span className="mx-2">/</span>
        <Link
          href={`/knowledge/${kuId}`}
          className="hover:text-black transition-colors"
        >
          {ku.title}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-[#45464d]">Editar</span>
      </nav>

      <h1 className="headline-xl text-black font-bold">
        Editando · v{ku.version}
      </h1>

      <KUEditor
        ku={ku}
        versions={versions}
        dependencies={dependencies}
        candidates={candidates}
      />
    </div>
  );
}
