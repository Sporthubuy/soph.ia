"use client";

import { useState, useTransition } from "react";
import { useRouter } from "@/i18n/routing";
import { Icon, type IconName } from "@/components/shared/icon";
import { toast } from "@/components/ui/toast";
import { setProjectVisibility } from "@/lib/projects/actions";

const META: Record<"private" | "public" | "unlisted", { icon: IconName; title: string }> = {
  private: { icon: "lock", title: "Privado — click para hacer publico" },
  public: { icon: "unlock", title: "Publico — click para hacer privado" },
  unlisted: { icon: "link", title: "Oculto — click para hacer privado" },
};

export const ProjectVisibilityLock = ({
  projectId,
  visibility,
  canManage,
}: {
  projectId: string;
  visibility: "private" | "public" | "unlisted";
  canManage: boolean;
}) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);

  const meta = META[visibility];

  const toggle = () => {
    if (busy) return;
    setBusy(true);
    startTransition(async () => {
      const result = await setProjectVisibility(
        projectId,
        visibility === "private" ? "public" : "private"
      );
      setBusy(false);
      if (result?.error) {
        toast.add({ type: "error", title: result.error });
        return;
      }
      toast.add({
        type: "success",
        title:
          visibility === "private"
            ? "Proyecto ahora es publico"
            : "Proyecto ahora es privado",
      });
      router.refresh();
    });
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={!canManage || isPending}
      title={canManage ? meta.title : "No tenes permisos para cambiar la visibilidad"}
      aria-label={meta.title}
      className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#1e293b] bg-[var(--sky-2)] text-[#94a3b8] hover:bg-[#07090e] hover:text-[var(--star-1)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Icon name={meta.icon} size={15} />
    </button>
  );
};
