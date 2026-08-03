"use client";

import { useState, useTransition } from "react";
import { useRouter } from "@/i18n/routing";
import {
  inviteToProject,
  updateProjectMemberRole,
  removeProjectMember,
  cancelProjectInvitation,
} from "@/lib/projects/actions";

interface Member {
  id: string;
  role: string;
  user_id: string;
  profiles: { full_name: string | null; email: string } | null;
}

interface Invitation {
  id: string;
  email: string;
  role: string;
}

const ROLES = [
  { value: "admin", label: "Admin", hint: "Gestiona el proyecto y su gente" },
  { value: "editor", label: "Editor", hint: "Agrega y edita contenido" },
  { value: "viewer", label: "Lector", hint: "Solo lectura" },
];

const roleLabel = (role: string) =>
  ROLES.find((r) => r.value === role)?.label ?? role;

const initials = (name: string | null, email: string) => {
  const source = name?.trim() || email;
  return source.slice(0, 2).toUpperCase();
};

export const ProjectMembers = ({
  projectId,
  ownerId,
  members,
  invitations,
  canManage,
}: {
  projectId: string;
  ownerId: string;
  members: Member[];
  invitations: Invitation[];
  canManage: boolean;
}) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [email, setEmail] = useState("");
  const [role, setRole] = useState("editor");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const run = (fn: () => Promise<{ error?: string; success?: true }>, ok?: string) => {
    setError(null);
    setNotice(null);
    startTransition(async () => {
      const result = await fn();
      if (result?.error) {
        setError(result.error);
      } else {
        if (ok) setNotice(ok);
        router.refresh();
      }
    });
  };

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim();
    if (!value) return;

    setError(null);
    setNotice(null);
    startTransition(async () => {
      const result = await inviteToProject(projectId, value, role);
      if (result?.error) {
        setError(result.error);
      } else {
        setEmail("");
        setNotice(`Invitacion enviada a ${value}.`);
        router.refresh();
      }
    });
  };

  return (
    <section className="panel p-6 space-y-5">
      <div>
        <h2 className="section-heading">
          PARTICIPANTES ({members.length}
          {invitations.length > 0 && ` + ${invitations.length} pendiente${invitations.length === 1 ? "" : "s"}`})
        </h2>
      </div>

      {/* Participantes confirmados */}
      <ul className="space-y-2">
        {members.map((m) => {
          const isOwner = m.user_id === ownerId;
          const name = m.profiles?.full_name ?? m.profiles?.email ?? "Sin nombre";
          const mail = m.profiles?.email ?? "";

          return (
            <li
              key={m.id}
              className="flex items-center gap-3 p-3 rounded-lg border border-[var(--edge)] flex-wrap"
            >
              <div className="w-9 h-9 rounded-full bg-[#172554] text-[var(--azure)] flex items-center justify-center label-sm font-semibold flex-shrink-0">
                {initials(m.profiles?.full_name ?? null, mail)}
              </div>

              <div className="flex-1 min-w-0">
                <p className="body-md text-[var(--star-1)] font-medium truncate">
                  {name}
                  {isOwner && (
                    <span className="ml-2 label-sm text-[var(--star-3)] font-normal">
                      Responsable
                    </span>
                  )}
                </p>
                {mail && name !== mail && (
                  <p className="body-sm text-[var(--star-3)] truncate">{mail}</p>
                )}
              </div>

              {canManage && !isOwner ? (
                <div className="flex items-center gap-2">
                  <select
                    value={m.role}
                    disabled={isPending}
                    onChange={(e) =>
                      run(() =>
                        updateProjectMemberRole(projectId, m.id, e.target.value)
                      )
                    }
                    aria-label={`Rol de ${name}`}
                    className="body-sm border border-[var(--edge)] rounded-lg px-2 py-1.5 bg-[var(--sky-2)] text-[var(--star-2)] focus:outline-none focus:ring-2 focus:ring-[var(--azure)]"
                  >
                    {ROLES.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() =>
                      run(() => removeProjectMember(projectId, m.id))
                    }
                    aria-label={`Quitar a ${name}`}
                    className="label-sm px-2 py-1.5 rounded-lg border border-[var(--edge)] text-[var(--star-2)] hover:bg-[var(--sky-1)] transition-colors disabled:opacity-50"
                  >
                    Quitar
                  </button>
                </div>
              ) : (
                <span className="label-sm px-2 py-1 rounded border border-[var(--edge)] text-[var(--star-2)]">
                  {roleLabel(m.role)}
                </span>
              )}
            </li>
          );
        })}
      </ul>

      {/* Invitaciones pendientes */}
      {invitations.length > 0 && (
        <div className="space-y-2">
          <p className="label-sm text-[var(--star-3)]">PENDIENTES DE REGISTRARSE</p>
          <ul className="space-y-2">
            {invitations.map((inv) => (
              <li
                key={inv.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-dashed border-[var(--edge)] flex-wrap"
              >
                <div className="w-9 h-9 rounded-full bg-[var(--sky-1)] text-[var(--star-3)] flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">
                    schedule
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="body-md text-[var(--star-2)] truncate">{inv.email}</p>
                  <p className="body-sm text-[var(--star-3)]">
                    Se sumara como {roleLabel(inv.role)} al registrarse
                  </p>
                </div>
                {canManage && (
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() =>
                      run(() => cancelProjectInvitation(projectId, inv.id))
                    }
                    className="label-sm px-2 py-1.5 rounded-lg border border-[var(--edge)] text-[var(--star-2)] hover:bg-[var(--sky-1)] transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Invitar */}
      {canManage && (
        <form onSubmit={handleInvite} className="space-y-2 pt-1">
          <label htmlFor="invite-email" className="label-sm text-[var(--star-3)]">
            INVITAR POR EMAIL
          </label>
          <div className="flex gap-2 flex-wrap">
            <input
              id="invite-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="persona@empresa.com"
              className="flex-1 min-w-[14rem] px-4 py-2.5 border border-[var(--edge)] rounded-lg bg-[var(--sky-2)] text-[var(--star-1)] placeholder-[var(--star-3)] focus:outline-none focus:ring-2 focus:ring-[var(--azure)] focus:border-transparent body-sm"
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              aria-label="Permiso del invitado"
              className="body-sm border border-[var(--edge)] rounded-lg px-3 py-2.5 bg-[var(--sky-2)] text-[var(--star-2)] focus:outline-none focus:ring-2 focus:ring-[var(--azure)]"
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={isPending || !email.trim()}
              className="bg-[var(--azure)] text-[var(--azure-ink)] font-medium py-2.5 px-4 rounded-lg hover:bg-[#2563eb] transition-colors disabled:opacity-50 body-sm"
            >
              {isPending ? "Invitando..." : "Invitar"}
            </button>
          </div>
          <p className="body-sm text-[var(--star-3)]">
            {ROLES.find((r) => r.value === role)?.hint}. Si esa persona todavia
            no tiene cuenta, queda pendiente y entra sola al registrarse. Invitar
            tambien le da acceso de lectura a la organizacion.
          </p>
        </form>
      )}

      {error && (
        <p role="alert" className="body-sm text-[var(--danger)]">
          {error}
        </p>
      )}
      {notice && <p className="body-sm text-[var(--verified)]">{notice}</p>}
    </section>
  );
};
