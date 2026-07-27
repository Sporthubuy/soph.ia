"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  approveKnowledgeUnit,
  rejectKnowledgeUnit,
} from "@/lib/knowledge/actions";

interface ProposedKU {
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

export const ReviewList = ({
  proposals,
  userRole,
}: {
  proposals: ProposedKU[];
  userRole: string;
}) => {
  const canReview = ["owner", "admin"].includes(userRole);

  if (proposals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
        <CheckCircleIcon />
        <p className="mt-3 font-medium">Todo al dia</p>
        <p className="mt-1 text-sm text-muted-foreground">
          No hay cambios pendientes de revision.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {proposals.length} cambio{proposals.length !== 1 ? "s" : ""} pendiente
        {proposals.length !== 1 ? "s" : ""} de revision
      </p>
      {proposals.map((ku) => (
        <ReviewCard key={ku.id} ku={ku} canReview={canReview} />
      ))}
    </div>
  );
};

const ReviewCard = ({
  ku,
  canReview,
}: {
  ku: ProposedKU;
  canReview: boolean;
}) => {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleApprove = () => {
    startTransition(async () => {
      const res = await approveKnowledgeUnit(ku.id);
      if (res?.error) {
        setResult({ type: "error", message: res.error });
      } else {
        setResult({ type: "success", message: "Aprobado" });
      }
    });
  };

  const handleReject = () => {
    startTransition(async () => {
      const res = await rejectKnowledgeUnit(ku.id);
      if (res?.error) {
        setResult({ type: "error", message: res.error });
      } else {
        setResult({ type: "success", message: "Rechazado — devuelto a borrador" });
      }
    });
  };

  if (result?.type === "success") {
    return null;
  }

  const ownerName =
    ku.profiles?.[0]?.full_name ?? ku.profiles?.[0]?.email ?? "—";
  const domainName = ku.domains?.[0]?.name ?? "—";

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">
              <Link
                href={`/editor/${ku.id}`}
                className="hover:underline"
              >
                {ku.title}
              </Link>
            </CardTitle>
            <CardDescription className="mt-1">
              {ownerName} · {domainName} · v{ku.version} ·{" "}
              {new Date(ku.updated_at).toLocaleDateString("es")}
            </CardDescription>
          </div>
          <Badge variant="outline">Propuesto</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Trust Score: {ku.trust_score}</span>
          </div>
          {canReview ? (
            <div className="flex items-center gap-2">
              {result?.type === "error" && (
                <p className="text-sm text-destructive">{result.message}</p>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleReject}
                disabled={isPending}
              >
                Rechazar
              </Button>
              <Button size="sm" onClick={handleApprove} disabled={isPending}>
                {isPending ? "Procesando..." : "Aprobar"}
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Solo owners y admins pueden revisar
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const CheckCircleIcon = () => (
  <svg
    className="h-10 w-10 text-muted-foreground/50"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
    />
  </svg>
);
