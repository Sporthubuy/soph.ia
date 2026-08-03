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
            className="label-sm px-2 py-1 rounded-md border border-[#1e293b] text-[#94a3b8] hover:bg-[#07090e] transition-colors inline-flex items-center gap-1.5"
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
            className="w-full flex-1 body-md border border-[#1e293b] rounded-lg px-3 py-2.5 bg-[var(--sky-2)] text-[var(--star-1)] placeholder-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#3b82f6] resize-none"
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
              className="body-sm px-3 py-2 rounded-lg bg-[#3b82f6] text-[var(--azure-ink)] font-medium hover:bg-[#2563eb] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
              className="body-sm px-3 py-2 rounded-lg border border-[#1e293b] text-[#94a3b8] hover:bg-[#07090e] transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : description ? (
        <p className="flex-1 body-lg text-[#94a3b8] whitespace-pre-wrap overflow-y-auto">{description}</p>
      ) : (
        <p className="body-sm text-[#64748b] flex-1">
          {canManage ? "Este proyecto todavia no tiene objetivo definido. Apreta Editar para escribirlo." : "Este proyecto no tiene objetivo definido."}
        </p>
      )}
    </div>
  );
};
