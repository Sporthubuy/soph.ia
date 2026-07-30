"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "@/i18n/routing";
import { Icon } from "@/components/shared/icon";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { updateMemberRole, removeMember } from "@/lib/organization/actions";
import type { Person } from "@/lib/organization/actions";

const ROLE_LABEL: Record<string, string> = {
  owner: "Owner",
  admin: "Admin",
  editor: "Editor",
  viewer: "Viewer",
};

const ROLE_STYLE: Record<string, string> = {
  owner: "bg-[rgb(91_155_255_/_0.14)] text-[var(--azure)]",
  admin: "bg-[rgb(91_155_255_/_0.14)] text-[var(--azure)]",
  editor: "bg-[rgb(52_211_153_/_0.14)] text-[var(--verified)]",
  viewer: "bg-[var(--sky-3)] text-[var(--star-3)]",
};

const initials = (name: string, email: string) => {
  const base = name?.trim() || email?.trim() || "?";
  const parts = base.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return base.slice(0, 2).toUpperCase();
};

const trustColor = (score: number | null) => {
  if (score == null) return "text-[var(--star-4)]";
  if (score >= 90) return "text-[var(--verified)]";
  if (score >= 70) return "text-[var(--azure)]";
  return "text-[var(--pending)]";
};

export const PeopleDirectory = ({
  people,
  currentUserId,
  userRole,
}: {
  people: Person[];
  currentUserId: string;
  userRole: string;
}) => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const canManage = ["owner", "admin"].includes(userRole);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return people;
    return people.filter((p) => {
      const name = p.profiles?.full_name ?? "";
      const email = p.profiles?.email ?? "";
      return (
        name.toLowerCase().includes(q) || email.toLowerCase().includes(q)
      );
    });
  }, [people, search]);

  const changeRole = (person: Person, role: string) => {
    setPendingId(person.id);
    startTransition(async () => {
      const res = await updateMemberRole(person.id, role);
      if (res?.error) {
        toast.add({ type: "error", title: "Error", description: res.error });
      } else {
        toast.add({ type: "success", title: "Rol actualizado" });
        router.refresh();
      }
      setPendingId(null);
    });
  };

  const remove = (person: Person) => {
    setPendingId(person.id);
    startTransition(async () => {
      const res = await removeMember(person.id);
      if (res?.error) {
        toast.add({ type: "error", title: "Error", description: res.error });
      } else {
        toast.add({ type: "success", title: "Miembro removido" });
        router.refresh();
      }
      setPendingId(null);
    });
  };

  return (
    <div className="space-y-4">
      <div className="relative max-w-md">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--star-4)]">
          <Icon name="search" size={17} />
        </span>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre o email…"
          className="w-full rounded-[10px] border border-[var(--edge)] bg-[var(--sky-2)] py-2.5 pl-10 pr-3 text-sm text-[var(--star-1)] placeholder-[var(--star-4)] focus:border-[var(--azure)] focus:outline-none focus:ring-2 focus:ring-[rgb(91_155_255_/_0.16)]"
        />
      </div>

      <p className="section-heading">
        {visible.length} {visible.length === 1 ? "persona" : "personas"}
      </p>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {visible.map((person) => {
          const name = person.profiles?.full_name ?? person.profiles?.email ?? "—";
          const email = person.profiles?.email ?? "";
          const isSelf = person.user_id === currentUserId;
          const editable =
            canManage && !isSelf && person.role !== "owner";
          const busy = isPending && pendingId === person.id;

          return (
            <div
              key={person.id}
              className="panel p-4 flex flex-col gap-4"
            >
              <div className="flex items-start gap-3">
                {/* node-avatar */}
                <span
                  className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[12px] bg-[rgb(91_155_255_/_0.14)] font-mono text-sm font-semibold text-[var(--azure)]"
                  style={{ boxShadow: "0 0 0 3px rgb(91 155 255 / 0.06)" }}
                >
                  {initials(person.profiles?.full_name ?? "", email)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[var(--star-1)]">
                    {name}
                    {isSelf && (
                      <span className="ml-2 text-xs font-normal text-[var(--star-4)]">
                        (vos)
                      </span>
                    )}
                  </p>
                  {email && name !== email && (
                    <p className="truncate text-xs text-[var(--star-3)]">{email}</p>
                  )}
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 label-xs ${ROLE_STYLE[person.role] ?? ROLE_STYLE.viewer}`}
                >
                  {ROLE_LABEL[person.role] ?? person.role}
                </span>
              </div>

              {/* knowledge footprint */}
              <div className="grid grid-cols-3 gap-2 rounded-[10px] bg-[var(--sky-1)] p-3">
                <div>
                  <p className="font-mono text-lg font-semibold text-[var(--star-1)]">
                    {person.stats.kusOwned}
                  </p>
                  <p className="label-xs text-[var(--star-3)]">KUs</p>
                </div>
                <div>
                  <p className="font-mono text-lg font-semibold text-[var(--verified)]">
                    {person.stats.kusApproved}
                  </p>
                  <p className="label-xs text-[var(--star-3)]">Verified</p>
                </div>
                <div>
                  <p
                    className={`font-mono text-lg font-semibold ${trustColor(person.stats.avgTrust)}`}
                  >
                    {person.stats.avgTrust ?? "—"}
                  </p>
                  <p className="label-xs text-[var(--star-3)]">Avg trust</p>
                </div>
              </div>

              {editable && (
                <div className="flex items-center gap-2 border-t border-[var(--edge)] pt-3">
                  <Select
                    value={person.role}
                    onValueChange={(v) => {
                      if (v && v !== person.role) changeRole(person, v);
                    }}
                  >
                    <SelectTrigger className="h-8 w-[120px] text-xs" disabled={busy}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="editor">Editor</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs text-[var(--star-3)] hover:text-[var(--danger)]"
                    onClick={() => remove(person)}
                    disabled={busy}
                  >
                    Remover
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {visible.length === 0 && (
        <div className="panel p-10 text-center">
          <p className="body-sm text-[var(--star-3)]">
            No se encontraron personas.
          </p>
        </div>
      )}
    </div>
  );
};
