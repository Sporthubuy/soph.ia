"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateOrganization } from "@/lib/organization/actions";
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
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
    <section className="panel p-6 space-y-4">
      <div>
        <h2 className="body-md font-semibold text-[var(--star-1)]">{t("orgTitle")}</h2>
        <p className="body-sm text-[#64748b] mt-0.5">{t("orgDesc")}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="orgName">{t("orgNameLabel")}</Label>
          <Input
            id="orgName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={!isOwner}
            className="input-workspace max-w-md"
          />
        </div>
        <div className="space-y-2">
          <Label>{t("slugLabel")}</Label>
          <Input value={organization.slug} disabled className="input-workspace max-w-md" />
          <p className="text-xs text-[#64748b]">{t("slugHint")}</p>
        </div>
        {isOwner && (
          <Button
            type="submit"
            disabled={!hasChanges || isPending}
            className="rounded-lg bg-[#3b82f6] text-[var(--azure-ink)] hover:bg-[#2563eb]"
          >
            {isPending ? t("saving") : t("save")}
          </Button>
        )}
      </form>
    </section>
  );
};
