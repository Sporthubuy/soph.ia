"use client";

import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  draft: "secondary",
  proposed: "outline",
  approved: "default",
  archived: "destructive",
};

export const KUStatusBadge = ({ status }: { status: string }) => {
  const t = useTranslations("status");
  const variant = statusVariant[status] ?? "secondary";
  const label = t(status as "draft" | "proposed" | "approved" | "archived");
  return <Badge variant={variant}>{label}</Badge>;
};
