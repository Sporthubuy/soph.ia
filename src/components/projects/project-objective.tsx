"use client";

import { useState, useTransition } from "react";
import { useRouter } from "@/i18n/routing";
import { Icon } from "@/components/shared/icon";
import { updateProject } from "@/lib/projects/actions";

export const ProjectObjective = ({
  projectId,
  description,
  canManage,
}: {
  projectId: string;
  description: string;
  canManage: boolean;
}) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(description);
  const [error, setError] = useState<string | null>(null);

  const save = () => {
    setError(null);
    startTransition(async () => {
      const result = await updateProject(projectId, { description: value.trim() });
      if (result?.error) {
        setError(result.error);
        return;
      }
      setEditing(false);
      router.refresh();
    });
  };

  return (
    <div className="panel flex min-h-[280px] flex-1 flex-col p-5">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h2 className="section-heading">OBJETIVO</h2>
        {canManage && !editing && (
          <button
            type="button"
            onClick={() => {
              setValue(description);
              setEditing(true);
            }}
            className="label-sm px-2 py-1 rounded-md border border-[var(--edge)] text-[var(--star-2)] hover:bg-[var(--sky-1)] transition-colors inline-flex items-center gap-1.5"
          >
            <Icon name="edit" size={13} />
            Editar
          </button>
        )}
      </div>

      {editing ? (
        <div className="flex flex-1 flex-col space-y-3">
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            rows={9}
            placeholder="Que objetivo persigue este proyecto?"
            className="w-full flex-1 body-md border border-[var(--edge)] rounded-lg px-3 py-2.5 bg-[var(--sky-2)] text-[var(--star-1)] placeholder-[var(--star-3)] focus:outline-none focus:ring-2 focus:ring-[var(--azure)] resize-none"
          />
          {error && (
            <p role="alert" className="body-sm text-[var(--danger)]">
              {error}
            </p>
          )}
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isPending || !value.trim()}
              onClick={save}
              className="body-sm px-3 py-2 rounded-lg bg-[var(--azure)] text-[var(--azure-ink)] font-medium hover:bg-[#2563eb] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isPending ? "Guardando..." : "Guardar objetivo"}
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => {
                setValue(description);
                setEditing(false);
                setError(null);
              }}
              className="body-sm px-3 py-2 rounded-lg border border-[var(--edge)] text-[var(--star-2)] hover:bg-[var(--sky-1)] transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : description ? (
        <p className="flex-1 body-lg text-[var(--star-2)] whitespace-pre-wrap overflow-y-auto">{description}</p>
      ) : (
        <p className="body-sm text-[var(--star-3)] flex-1">
          {canManage ? "Este proyecto todavia no tiene objetivo definido. Apreta Editar para escribirlo." : "Este proyecto no tiene objetivo definido."}
        </p>
      )}
    </div>
  );
};
