"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createKnowledgeUnit } from "@/lib/knowledge/actions";

interface DomainItem {
  id: string;
  name: string;
}

export const KUCreateForm = ({
  organizationId,
  domains,
}: {
  organizationId: string;
  domains: DomainItem[];
}) => {
  const t = useTranslations("editor");
  const tc = useTranslations("common");
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [domainId, setDomainId] = useState(domains[0]?.id ?? "");

  const handleSubmit = async (formData: FormData) => {
    setError(null);
    setLoading(true);
    formData.set("organizationId", organizationId);
    formData.set("domainId", domainId);
    const result = await createKnowledgeUnit(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">{t("title")}</Label>
        <Input
          id="title"
          name="title"
          placeholder={t("titlePlaceholder")}
          required
          autoFocus
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="domain">{t("domain")}</Label>
        <Select value={domainId} onValueChange={(v) => setDomainId(v ?? "")}>
          <SelectTrigger>
            <SelectValue placeholder={t("allDomains")} />
          </SelectTrigger>
          <SelectContent>
            {domains.map((d) => (
              <SelectItem key={d.id} value={d.id}>
                {d.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">{t("contentLabel")}</Label>
        <Textarea
          id="content"
          name="content"
          placeholder={t("contentPlaceholder")}
          rows={16}
          className="font-mono text-sm"
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? t("creating") : t("createDraft")}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          {tc("cancel")}
        </Button>
      </div>
    </form>
  );
};
