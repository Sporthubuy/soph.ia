"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createDomain, deleteDomain } from "@/lib/organization/actions";
import { toast } from "@/components/ui/toast";

interface DomainItem {
  id: string;
  name: string;
  parent_id: string | null;
  owner_id: string;
}

export const DomainSettings = ({
  domains,
  organizationId,
  userRole,
}: {
  domains: DomainItem[];
  organizationId: string;
  userRole: string;
}) => {
  const t = useTranslations("settings");
  const tc = useTranslations("common");
  const canManage = ["owner", "admin", "editor"].includes(userRole);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.set("organizationId", organizationId);
    startTransition(async () => {
      const result = await createDomain(formData);
      if (result?.error) {
        setError(result.error);
        toast.add({ type: "error", title: "Error", description: result.error });
      } else {
        setShowForm(false);
        toast.add({ type: "success", title: t("domainCreated") });
      }
    });
  };

  const handleDelete = (domainId: string) => {
    startTransition(async () => {
      const result = await deleteDomain(domainId);
      if (result?.error) {
        setError(result.error);
        toast.add({ type: "error", title: "Error", description: result.error });
      } else {
        toast.add({ type: "success", title: t("domainDeleted") });
      }
    });
  };

  return (
    <section className="panel p-6 space-y-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="body-md font-semibold text-[var(--star-1)]">{t("domainsTitle")}</h2>
          <p className="body-sm text-[#8b95ab] mt-0.5">{t("domainsDesc")}</p>
        </div>
        {canManage && !showForm && (
          <Button
            variant="outline"
            size="sm"
            className="rounded-lg"
            onClick={() => setShowForm(true)}
          >
            {t("newDomain")}
          </Button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="flex flex-col sm:flex-row sm:items-end gap-2">
          <div className="flex-1 space-y-1">
            <Label htmlFor="domainName">{t("domainNameLabel")}</Label>
            <Input
              id="domainName"
              name="name"
              placeholder={t("domainNamePlaceholder")}
              required
              autoFocus
              className="input-workspace"
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="submit"
              size="sm"
              disabled={isPending}
              className="rounded-lg bg-[#5b9bff] text-[var(--azure-ink)] hover:bg-[#3f7fe0]"
            >
              {isPending ? t("creating") : tc("create")}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-lg"
              onClick={() => {
                setShowForm(false);
                setError(null);
              }}
            >
              {tc("cancel")}
            </Button>
          </div>
        </form>
      )}

      {error && (
        <p className="text-sm text-[var(--danger)]" role="alert">
          {error}
        </p>
      )}

      {domains.length === 0 ? (
        <p className="text-sm text-[#8b95ab]">{t("noDomains")}</p>
      ) : (
        <div className="space-y-2">
          {domains.map((domain) => (
            <div
              key={domain.id}
              className="flex items-center justify-between rounded-lg border border-[#212a3e] px-3 py-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className="text-[#5b9bff] text-lg"
                  aria-hidden
                >
                  account_tree
                </span>
                <span className="text-sm font-medium text-[var(--star-1)] truncate">
                  {domain.name}
                </span>
              </div>
              {canManage && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs text-[#8b95ab] hover:text-[var(--danger)]"
                  onClick={() => handleDelete(domain.id)}
                  disabled={isPending}
                >
                  {tc("delete")}
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
