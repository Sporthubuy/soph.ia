"use client";

import { useState, useTransition } from "react";
import { useRouter } from "@/i18n/routing";
import { Icon } from "@/components/shared/icon";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  inviteToKnowledgeUnit,
  updateKuMemberRole,
  removeKuMember,
  cancelKuInvitation,
} from "@/lib/knowledge/actions";

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
  { value: "editor", label: "Editor", hint: "Puede editar contenido" },
  { value: "viewer", label: "Lector", hint: "Solo lectura" },
];

const roleLabel = (role: string) =>
  ROLES.find((r) => r.value === role)?.label ?? role;

const initials = (name: string | null, email: string) => {
  const source = name?.trim() || email;
  return source.slice(0, 2).toUpperCase();
};

export const KuPeoplePopover = ({
  kuId,
  ownerId,
  members,
  invitations,
  canManage,
}: {
  kuId: string;
  ownerId: string;
  members: Member[];
  invitations: Invitation[];
  canManage: boolean;
}) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const [email, setEmail] = useState("");
  const [role, setRole] = useState("editor");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const run = (fn: () => Promise<{ error?: string; success?: true }>, ok?: string) => {
    setError(null);
    setNotice(null);
    startTransition(async () => {
      const result = await fn();
      if (result?.error) setError(result.error);
      else {
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
      const result = await inviteToKnowledgeUnit(kuId, value, role);
      if (result?.error) setError(result.error);
      else {
        setEmail("");
        setNotice(`Invitacion enviada a ${value}.`);
        router.refresh();
      }
    });
  };

  const totalMembers = members.length + 1; // +1 para el owner

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        title={`Colaboradores (${totalMembers})`}
        aria-label="Ver colaboradores de la Knowledge Unit"
        className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--edge)] bg-[var(--sky-2)] text-[var(--star-3)] hover:bg-[var(--sky-1)] hover:text-[var(--star-1)] transition-colors outline-none data-[popup-open]:bg-[var(--sky-1)] data-[popup-open]:text-[var(--star-1)]"
      >
        <Icon name="people" size={15} />
        {totalMembers > 0 && (
          <span className="label-xs absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full border border-[var(--sky-1)] bg-[var(--azure)] px-1 text-[var(--azure-ink)]">
            {totalMembers}
          </span>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[340px] p-0">
        <div className="max-h-[min(420px,var(--available-height))] overflow-y-auto p-1.5">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="section-heading px-2 py-2">
              COLABORADORES ({totalMembers}
              {invitations.length > 0 &&
                ` + ${invitations.length} pendiente${invitations.length === 1 ? "" : "s"}`}
              )
            </DropdownMenuLabel>

            <div className="space-y-1">
              {/* Owner */}
              <div className="flex items-center gap-2.5 rounded-lg px-2 py-2 hover:bg-[var(--sky-2)]">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1e40af] text-[#93c5fd] label-sm font-semibold">
                  👑
                </div>
                <div className="min-w-0 flex-1">
                  <p className="body-sm text-[var(--star-1)] font-medium">
                    Responsable
                  </p>
                  <p className="body-sm text-[var(--star-4)] text-xs">Propietario</p>
                </div>
                <span className="label-sm shrink-0 px-2 py-0.5 rounded border border-[var(--edge)] text-[var(--star-3)]">
                  Propietario
                </span>
              </div>

              {/* Members */}
              {members.map((m) => {
                const name = m.profiles?.full_name ?? m.profiles?.email ?? "Sin nombre";
                const mail = m.profiles?.email ?? "";
                return (
                  <div key={m.id} className="flex items-center gap-2.5 rounded-lg px-2 py-2 hover:bg-[var(--sky-2)]">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--azure-deep)] text-[#3b82f6] label-sm font-semibold">
                      {initials(m.profiles?.full_name ?? null, mail)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="body-sm text-[var(--star-1)] font-medium truncate">
                        {name}
                      </p>
                      {mail && name !== mail && (
                        <p className="body-sm text-[var(--star-4)] truncate">{mail}</p>
                      )}
                    </div>
                    {canManage ? (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <select
                          value={m.role}
                          disabled={isPending}
                          onChange={(e) =>
                            run(() =>
                              updateKuMemberRole(kuId, m.id, e.target.value)
                            )
                          }
                          aria-label={`Rol de ${name}`}
                          className="body-sm border border-[var(--edge)] rounded-md px-1.5 py-1 bg-[var(--sky-2)] text-[var(--star-3)] focus:outline-none focus:ring-1 focus:ring-[#3b82f6]"
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
                          onClick={() => run(() => removeKuMember(kuId, m.id))}
                          aria-label={`Quitar a ${name}`}
                          className="text-[var(--star-4)] hover:text-[var(--danger)]"
                        >
                          <Icon name="close" size={14} />
                        </button>
                      </div>
                    ) : (
                      <span className="label-sm shrink-0 px-2 py-0.5 rounded border border-[var(--edge)] text-[var(--star-3)]">
                        {roleLabel(m.role)}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </DropdownMenuGroup>

          {invitations.length > 0 && (
            <DropdownMenuGroup>
              <DropdownMenuSeparator className="my-1.5" />
              <p className="label-xs px-2 py-1 text-[var(--star-4)]">
                PENDIENTES DE REGISTRARSE
              </p>
              <div className="space-y-1">
                {invitations.map((inv) => (
                  <div key={inv.id} className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-[var(--sky-2)]">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--sky-1)] text-[var(--star-4)] label-sm font-semibold">
                      <Icon name="clock" size={14} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="body-sm text-[var(--star-3)] truncate">{inv.email}</p>
                      <p className="label-xs text-[var(--star-4)]">
                        Se sumara como {roleLabel(inv.role)}
                      </p>
                    </div>
                    {canManage && (
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() =>
                          run(() => cancelKuInvitation(kuId, inv.id))
                        }
                        aria-label={`Cancelar invitacion a ${inv.email}`}
                        className="text-[var(--star-4)] hover:text-[var(--danger)] shrink-0"
                      >
                        <Icon name="close" size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </DropdownMenuGroup>
          )}

          {canManage && (
            <DropdownMenuGroup>
              <DropdownMenuSeparator className="my-1.5" />
              <form onSubmit={handleInvite} className="space-y-2 px-2 pb-1 pt-1">
                <label htmlFor="ku-people-invite-email" className="label-xs text-[var(--star-4)]">
                  INVITAR POR EMAIL
                </label>
                <div className="flex gap-1.5">
                  <input
                    id="ku-people-invite-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="persona@empresa.com"
                    className="min-w-0 flex-1 body-sm border border-[var(--edge)] rounded-lg px-2.5 py-1.5 bg-[var(--sky-2)] text-[var(--star-1)] placeholder-[#64748b] focus:outline-none focus:ring-1 focus:ring-[#3b82f6]"
                  />
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    aria-label="Permiso del invitado"
                    className="body-sm border border-[var(--edge)] rounded-lg px-1.5 py-1.5 bg-[var(--sky-2)] text-[var(--star-3)] focus:outline-none focus:ring-1 focus:ring-[#3b82f6]"
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
                    className="shrink-0 rounded-lg bg-[#3b82f6] px-2.5 py-1.5 text-[var(--azure-ink)] body-sm font-medium hover:bg-[#2563eb] disabled:opacity-50 transition-colors"
                  >
                    {isPending ? "..." : "Invitar"}
                  </button>
                </div>
              </form>
            </DropdownMenuGroup>
          )}

          {error && (
            <p role="alert" className="body-sm text-[var(--danger)] px-2 pb-1 pt-2">
              {error}
            </p>
          )}
          {notice && <p className="body-sm text-[var(--verified)] px-2 pb-1 pt-2">{notice}</p>}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
