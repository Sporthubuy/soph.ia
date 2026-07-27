"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface KUItem {
  id: string;
  title: string;
  status: string;
  trust_score: number;
  version: number;
  updated_at: string;
  domain_id: string;
  domains: { name: string }[] | null;
  profiles: { full_name: string | null; email: string }[] | null;
}

interface DomainItem {
  id: string;
  name: string;
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  draft: { label: "Borrador", variant: "secondary" },
  proposed: { label: "Propuesto", variant: "outline" },
  approved: { label: "Aprobado", variant: "default" },
  archived: { label: "Archivado", variant: "destructive" },
};

export const KUList = ({
  knowledgeUnits,
  domains,
}: {
  knowledgeUnits: KUItem[];
  domains: DomainItem[];
}) => {
  const [search, setSearch] = useState("");
  const [domainFilter, setDomainFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    return knowledgeUnits.filter((ku) => {
      if (search && !ku.title.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      if (domainFilter !== "all" && ku.domain_id !== domainFilter) {
        return false;
      }
      if (statusFilter !== "all" && ku.status !== statusFilter) {
        return false;
      }
      return true;
    });
  }, [knowledgeUnits, search, domainFilter, statusFilter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <Input
            placeholder="Buscar por titulo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
          <Select value={domainFilter} onValueChange={(v) => setDomainFilter(v ?? "all")}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Dominio" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los dominios</SelectItem>
              {domains.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "all")}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="draft">Borrador</SelectItem>
              <SelectItem value="proposed">Propuesto</SelectItem>
              <SelectItem value="approved">Aprobado</SelectItem>
              <SelectItem value="archived">Archivado</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button render={<Link href="/editor/new" />}>
          Nueva Knowledge Unit
        </Button>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
          <p className="text-muted-foreground">
            {knowledgeUnits.length === 0
              ? "Aun no hay Knowledge Units. Crea la primera."
              : "No se encontraron resultados."}
          </p>
          {knowledgeUnits.length === 0 && (
            <Button
              render={<Link href="/editor/new" />}
              variant="outline"
              className="mt-4"
            >
              Crear Knowledge Unit
            </Button>
          )}
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titulo</TableHead>
                <TableHead>Dominio</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-center">Trust</TableHead>
                <TableHead className="text-center">V.</TableHead>
                <TableHead>Responsable</TableHead>
                <TableHead className="text-right">Actualizado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((ku) => {
                const cfg = statusConfig[ku.status] ?? statusConfig.draft;
                return (
                  <TableRow key={ku.id}>
                    <TableCell>
                      <Link
                        href={`/editor/${ku.id}`}
                        className="font-medium hover:underline"
                      >
                        {ku.title}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {ku.domains?.[0]?.name ?? "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={cfg.variant}>{cfg.label}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <TrustIndicator score={ku.trust_score} />
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground">
                      {ku.version}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {ku.profiles?.[0]?.full_name ?? ku.profiles?.[0]?.email ?? "—"}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {new Date(ku.updated_at).toLocaleDateString("es")}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

const TrustIndicator = ({ score }: { score: number }) => {
  const color =
    score >= 70
      ? "text-green-600 dark:text-green-400"
      : score >= 40
        ? "text-yellow-600 dark:text-yellow-400"
        : "text-red-600 dark:text-red-400";

  return <span className={`text-sm font-medium ${color}`}>{score}</span>;
};
