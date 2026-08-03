"use client";

import { useState, useTransition } from "react";
import { useRouter } from "@/i18n/routing";
import { Icon } from "@/components/shared/icon";
import { toast } from "@/components/ui/toast";
import { setKuVisibility } from "@/lib/knowledge/actions";

export const KuVisibilityLock = ({
  kuId,
  visibility,
  canManage,
}: {
  kuId: string;
  visibility: "private" | "public";
  canManage: boolean;
}) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);

  const isPrivate = visibility === "private";
  const icon = isPrivate ? "lock" : "globe";
  const title = isPrivate
    ? "Privado — click para hacer público"
    : "Público — click para hacer privado";

  const toggle = () => {
    if (busy) return;
    setBusy(true);
    startTransition(async () => {
      const result = await setKuVisibility(
        kuId,
        isPrivate ? "public" : "private"
      );
      setBusy(false);
      if (result?.error) {
        toast.add({ type: "error", title: result.error });
        return;
      }
      toast.add({
        type: "success",
        title: isPrivate
          ? "Knowledge Unit ahora es pública"
          : "Knowledge Unit ahora es privada",
      });
      router.refresh();
    });
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={!canManage || isPending}
      title={canManage ? title : "No tenes permisos para cambiar la visibilidad"}
      aria-label={title}
      className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#1e293b] bg-[var(--sky-2)] text-[#94a3b8] hover:bg-[#07090e] hover:text-[var(--star-1)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Icon name={icon} size={15} />
    </button>
  );
};
