"use client";

import { useState, useTransition } from "react";
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

export const OrgSettings = ({
  organization,
  userRole,
}: {
  organization: { id: string; name: string; slug: string };
  userRole: string;
}) => {
  const isOwner = userRole === "owner";
  const [name, setName] = useState(organization.name);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const hasChanges = name !== organization.name;

  const handleSubmit = async (formData: FormData) => {
    setError(null);
    setSuccess(false);
    formData.set("organizationId", organization.id);
    formData.set("name", name);
    startTransition(async () => {
      const result = await updateOrganization(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setSuccess(true);
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Organizacion</CardTitle>
        <CardDescription>Configuracion general</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="orgName">Nombre</Label>
            <Input
              id="orgName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!isOwner}
            />
          </div>
          <div className="space-y-2">
            <Label>Slug</Label>
            <Input value={organization.slug} disabled />
            <p className="text-xs text-muted-foreground">
              El slug no se puede cambiar.
            </p>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          {success && (
            <p className="text-sm text-green-600 dark:text-green-400">
              Guardado correctamente.
            </p>
          )}
          {isOwner && (
            <Button type="submit" disabled={!hasChanges || isPending}>
              {isPending ? "Guardando..." : "Guardar"}
            </Button>
          )}
        </form>
      </CardContent>
    </Card>
  );
};
