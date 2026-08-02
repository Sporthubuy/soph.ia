"use client";

import { useState, useTransition } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { Icon } from "@/components/shared/icon";
import { toast } from "@/components/ui/toast";
import {
  createInvitation,
  revokeInvitation,
  type Invitation,
} from "@/lib/organization/actions";

const ROLE_LABEL: Record<string, string> = {
  admin: "Admin",
  editor: "Editor",
  viewer: "Viewer",
};

const inviteUrl = (locale: string, token: string) =>
  typeof window === "undefined"
    ? ""
    : `${window.location.origin}/${locale}/register?invite=${token}`;

export const InvitePeople = ({
  invitations,
}: {
  invitations: Invitation[];
}) => {
  const router = useRouter();
  const locale = useLocale();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("viewer");
  const [isPending, startTransition] = useTransition();
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (token: string) => {
    try {
      await navigator.clipboard.writeText(inviteUrl(locale, token));
      setCopied(token);
      toast.add({ type: "success", title: "Link copiado" });
      setTimeout(() => setCopied((c) => (c === token ? null : c)), 2000);
    } catch {
      toast.add({ type: "error", title: "No se pudo copiar" });
    }
  };

  const invite = () => {
    startTransition(async () => {
      const res = await createInvitation(email, role);
      if (res?.error) {
        toast.add({ type: "error", title: "Error", description: res.error });
        return;
      }
      toast.add({
        type: "success",
        title: "Invitación creada",
        description: "Copiá el link y compartilo.",
      });
      setEmail("");
      if (res.token) await copy(res.token);
      router.refresh();
    });
  };

  const revoke = (id: string) => {
    startTransition(async () => {
      const res = await revokeInvitation(id);
      if (res?.error) {
        toast.add({ type: "error", title: "Error", description: res.error });
      } else {
        toast.add({ type: "success", title: "Invitación revocada" });
        router.refresh();
      }
    });
  };

  return (
    <section className="panel p-5 space-y-4">
      <div>
        <h2 className="body-md font-semibold text-[var(--star-1)]">
          Invitar a tu equipo
        </h2>
        <p className="body-sm text-[var(--star-3)] mt-0.5">
          Generá un link de invitación. Al registrarse con ese email, la persona
          se une directamente a tu organización.
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && email.trim() && !isPending) invite();
          }}
          placeholder="email@empresa.com"
          className="flex-1 rounded-[10px] border border-[var(--edge)] bg-[var(--sky-3)] px-3 py-2.5 text-sm text-[var(--star-1)] placeholder-[var(--star-4)] focus:border-[var(--azure)] focus:outline-none focus:ring-2 focus:ring-[rgb(59_130_246_/_0.16)]"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="h-[42px] rounded-[10px] border border-[var(--edge)] bg-[var(--sky-3)] px-3 text-sm text-[var(--star-2)]"
        >
          <option value="viewer">Viewer</option>
          <option value="editor">Editor</option>
          <option value="admin">Admin</option>
        </select>
        <button
          type="button"
          onClick={invite}
          disabled={isPending || !email.trim()}
          className="inline-flex items-center justify-center gap-1.5 rounded-[10px] bg-[var(--azure)] px-4 py-2.5 text-sm font-medium text-[var(--azure-ink)] transition-colors hover:bg-[var(--azure-bright)] disabled:opacity-50"
        >
          <Icon name="plus" size={16} strokeWidth={2.2} />
          Invitar
        </button>
      </div>

      {invitations.length > 0 && (
        <div className="space-y-2 border-t border-[var(--edge)] pt-4">
          <p className="section-heading">Invitaciones pendientes</p>
          {invitations.map((inv) => (
            <div
              key={inv.id}
              className="flex flex-col gap-2 rounded-[10px] border border-[var(--edge)] px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="truncate text-sm text-[var(--star-1)]">{inv.email}</p>
                <p className="label-xs text-[var(--star-3)]">
                  {ROLE_LABEL[inv.role] ?? inv.role} · vence{" "}
                  {new Date(inv.expires_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => copy(inv.token)}
                  className="inline-flex items-center gap-1.5 rounded-[8px] border border-[var(--edge)] px-2.5 py-1.5 text-xs text-[var(--star-2)] hover:border-[var(--edge-strong)] hover:text-[var(--star-1)]"
                >
                  <Icon name={copied === inv.token ? "check" : "link"} size={14} />
                  {copied === inv.token ? "Copiado" : "Copiar link"}
                </button>
                <button
                  type="button"
                  onClick={() => revoke(inv.id)}
                  disabled={isPending}
                  className="rounded-[8px] px-2.5 py-1.5 text-xs text-[var(--star-3)] hover:text-[var(--danger)] disabled:opacity-50"
                >
                  Revocar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
