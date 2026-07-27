import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getKnowledgeUnits, getDomains } from "@/lib/knowledge/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function GraphPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: membership } = await supabase
    .from("memberships")
    .select("organization_id, organizations(name)")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!membership) return null;

  const orgs = membership.organizations as unknown as { name: string }[];
  const org = orgs[0];

  const [kus, domains] = await Promise.all([
    getKnowledgeUnits(membership.organization_id),
    getDomains(membership.organization_id),
  ]);

  const stats = {
    total: kus.length,
    draft: kus.filter((k) => k.status === "draft").length,
    proposed: kus.filter((k) => k.status === "proposed").length,
    approved: kus.filter((k) => k.status === "approved").length,
    domains: domains.length,
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">{org.name}</h1>
        <p className="mt-1 text-muted-foreground">
          Dashboard del Knowledge Graph
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Knowledge Units" value={stats.total} />
        <StatCard title="Borradores" value={stats.draft} />
        <StatCard title="Pendientes de revision" value={stats.proposed} />
        <StatCard title="Dominios" value={stats.domains} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Actividad reciente</CardTitle>
            <CardDescription>
              Ultimas Knowledge Units actualizadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {kus.length === 0 ? (
              <div className="flex flex-col items-center py-6">
                <p className="text-sm text-muted-foreground">
                  Aun no hay Knowledge Units.
                </p>
                <Button
                  render={<Link href="/editor/new" />}
                  variant="outline"
                  size="sm"
                  className="mt-3"
                >
                  Crear la primera
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {kus.slice(0, 5).map((ku) => (
                  <Link
                    key={ku.id}
                    href={`/editor/${ku.id}`}
                    className="flex items-center justify-between rounded-md border px-3 py-2 hover:bg-accent"
                  >
                    <div>
                      <p className="text-sm font-medium">{ku.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {(ku.domains as unknown as { name: string }[])?.[0]?.name} ·{" "}
                        {new Date(ku.updated_at).toLocaleDateString("es")}
                      </p>
                    </div>
                    <Badge
                      variant={
                        ku.status === "approved"
                          ? "default"
                          : ku.status === "proposed"
                            ? "outline"
                            : "secondary"
                      }
                    >
                      {ku.status}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dominios</CardTitle>
            <CardDescription>
              Areas de conocimiento de la organizacion
            </CardDescription>
          </CardHeader>
          <CardContent>
            {domains.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No hay dominios configurados.
              </p>
            ) : (
              <div className="space-y-2">
                {domains.map((d) => {
                  const count = kus.filter(
                    (k) => k.domain_id === d.id
                  ).length;
                  return (
                    <div
                      key={d.id}
                      className="flex items-center justify-between rounded-md border px-3 py-2"
                    >
                      <span className="text-sm font-medium">{d.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {count} KU{count !== 1 ? "s" : ""}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

const StatCard = ({ title, value }: { title: string; value: number }) => (
  <Card>
    <CardContent className="pt-6">
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="text-3xl font-semibold">{value}</p>
    </CardContent>
  </Card>
);
