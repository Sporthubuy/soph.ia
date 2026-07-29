"use client";

import { useState, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
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

export const KUList = ({
  knowledgeUnits,
  domains,
}: {
  knowledgeUnits: KUItem[];
  domains: DomainItem[];
}) => {
  const t = useTranslations("editor");
  const ts = useTranslations("status");
  const tc = useTranslations("common");
  const locale = useLocale();
  const [search, setSearch] = useState("");
  const [domainFilter, setDomainFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline" }> = {
    draft: { variant: "secondary" },
    proposed: { variant: "outline" },
    approved: { variant: "default" },
    archived: { variant: "destructive" },
  };

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
            placeholder={t("searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
          <Select value={domainFilter} onValueChange={(v) => setDomainFilter(v ?? "all")}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder={t("domain")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("allDomains")}</SelectItem>
              {domains.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "all")}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder={tc("status")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("allStatuses")}</SelectItem>
              <SelectItem value="draft">{ts("draft")}</SelectItem>
              <SelectItem value="proposed">{ts("proposed")}</SelectItem>
              <SelectItem value="approved">{ts("approved")}</SelectItem>
              <SelectItem value="archived">{ts("archived")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button render={<Link href="/knowledge/new" />}>
          {t("newKU")}
        </Button>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
          <p className="text-muted-foreground">
            {knowledgeUnits.length === 0
              ? t("noKUsYet")
              : t("noResults")}
          </p>
          {knowledgeUnits.length === 0 && (
            <Button
              render={<Link href="/knowledge/new" />}
              variant="outline"
              className="mt-4"
            >
              {t("createKU")}
            </Button>
          )}
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("tableTitle")}</TableHead>
                <TableHead>{t("tableDomain")}</TableHead>
                <TableHead>{t("tableStatus")}</TableHead>
                <TableHead className="text-center">{t("tableTrust")}</TableHead>
                <TableHead className="text-center">{t("tableVersion")}</TableHead>
                <TableHead>{t("tableOwner")}</TableHead>
                <TableHead className="text-right">{t("tableUpdated")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((ku) => {
                const cfg = statusConfig[ku.status] ?? statusConfig.draft;
                return (
                  <TableRow key={ku.id}>
                    <TableCell>
                      <Link
                        href={`/knowledge/${ku.id}`}
                        className="font-medium hover:underline"
                      >
                        {ku.title}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {ku.domains?.[0]?.name ?? "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={cfg.variant}>{ts(ku.status as "draft" | "proposed" | "approved" | "archived")}</Badge>
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
                      {new Date(ku.updated_at).toLocaleDateString(locale)}
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
