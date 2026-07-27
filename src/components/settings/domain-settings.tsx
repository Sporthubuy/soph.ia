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
import { createDomain, deleteDomain } from "@/lib/knowledge/actions";

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
  const canManage = ["owner", "admin", "editor"].includes(userRole);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleCreate = async (formData: FormData) => {
    setError(null);
    formData.set("organizationId", organizationId);
    startTransition(async () => {
      const result = await createDomain(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setShowForm(false);
      }
    });
  };

  const handleDelete = (domainId: string) => {
    startTransition(async () => {
      const result = await deleteDomain(domainId);
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Dominios</CardTitle>
            <CardDescription>
              Areas de conocimiento de la organizacion
            </CardDescription>
          </div>
          {canManage && !showForm && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowForm(true)}
            >
              Nuevo dominio
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showForm && (
          <form action={handleCreate} className="flex items-end gap-2">
            <div className="flex-1 space-y-1">
              <Label htmlFor="domainName">Nombre</Label>
              <Input
                id="domainName"
                name="name"
                placeholder="ej. Marketing"
                required
                autoFocus
              />
            </div>
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending ? "Creando..." : "Crear"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setShowForm(false);
                setError(null);
              }}
            >
              Cancelar
            </Button>
          </form>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}

        {domains.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No hay dominios configurados.
          </p>
        ) : (
          <div className="space-y-2">
            {domains.map((domain) => (
              <div
                key={domain.id}
                className="flex items-center justify-between rounded-md border px-3 py-2"
              >
                <span className="text-sm font-medium">{domain.name}</span>
                {canManage && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(domain.id)}
                    disabled={isPending}
                  >
                    Eliminar
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
