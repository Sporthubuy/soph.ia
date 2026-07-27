"use client";

import { useState } from "react";
import { createOrganization } from "@/lib/knowledge/actions";
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

export const OnboardingForm = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setError(null);
    setLoading(true);
    const result = await createOrganization(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Crea tu organizacion</CardTitle>
          <CardDescription>
            Tu organizacion es el espacio donde tu equipo construye y gobierna
            conocimiento.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre de la organizacion</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="ej. Mi Empresa"
                required
                autoFocus
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creando..." : "Crear organizacion"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
