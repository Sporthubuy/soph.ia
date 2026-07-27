"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { updateOrganization } from "@/lib/knowledge/actions";
import { toast } from "@/components/ui/toast";

export const OrgSettings = ({
  organization,
  userRole,
}: {
  organization: { id: string; name: string; slug: string };
  userRole: string;
}) => {
  const t = useTranslations("settings");
  const isOwner = userRole === "owner";
  const [name, setName] = useState(organization.name);
  const [isPending, startTransition] = useTransition();

  const hasChanges = name !== organization.name;

  const handleSubmit = async (formData: FormData) => {
    formData.set("organizationId", organization.id);
    formData.set("name", name);
    startTransition(async () => {
      const result = await updateOrganization(formData);
      if (result?.error) {
        toast.add({ type: "error", title: "Error", description: result.error });
      } else {
        toast.add({ type: "success", title: t("orgUpdated") });
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("orgTitle")}</CardTitle>
        <CardDescription>{t("orgDesc")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="orgName">{t("orgNameLabel")}</Label>
            <Input
              id="orgName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!isOwner}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("slugLabel")}</Label>
            <Input value={organization.slug} disabled />
            <p className="text-xs text-muted-foreground">
              {t("slugHint")}
            </p>
          </div>
          {isOwner && (
            <Button type="submit" disabled={!hasChanges || isPending}>
              {isPending ? t("saving") : t("save")}
            </Button>
          )}
        </form>
      </CardContent>
    </Card>
  );
};
