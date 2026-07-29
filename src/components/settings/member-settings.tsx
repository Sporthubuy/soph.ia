"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateMemberRole, removeMember } from "@/lib/organization/actions";
import { toast } from "@/components/ui/toast";

interface MemberItem {
  id: string;
  role: string;
  user_id: string;
  created_at: string;
  profiles: { full_name: string | null; email: string } | null;
}

const roleLabels: Record<string, string> = {
  owner: "Owner",
  admin: "Admin",
  editor: "Editor",
  viewer: "Viewer",
};

export const MemberSettings = ({
  members,
  currentUserId,
  userRole,
}: {
  members: MemberItem[];
  currentUserId: string;
  userRole: string;
}) => {
  const t = useTranslations("settings");
  const isOwnerOrAdmin = ["owner", "admin"].includes(userRole);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleRoleChange = (membershipId: string, newRole: string) => {
    setError(null);
    startTransition(async () => {
      const result = await updateMemberRole(membershipId, newRole);
      if (result?.error) {
        setError(result.error);
        toast.add({ type: "error", title: "Error", description: result.error });
      } else {
        toast.add({ type: "success", title: t("roleUpdated") });
      }
    });
  };

  const handleRemove = (membershipId: string) => {
    setError(null);
    startTransition(async () => {
      const result = await removeMember(membershipId);
      if (result?.error) {
        setError(result.error);
        toast.add({ type: "error", title: "Error", description: result.error });
      } else {
        toast.add({ type: "success", title: t("memberRemoved") });
      }
    });
  };

  return (
    <section className="panel p-6 space-y-4">
      <div>
        <h2 className="body-md font-semibold text-black">{t("membersTitle")}</h2>
        <p className="body-sm text-[#7c839b] mt-0.5">{t("membersDesc")}</p>
      </div>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <div className="space-y-2">
        {members.map((member) => {
          const name =
            member.profiles?.full_name ?? member.profiles?.email ?? "—";
          const email = member.profiles?.email ?? "";
          const isSelf = member.user_id === currentUserId;

          return (
            <div
              key={member.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-[#e2e8f0] px-3 py-3"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-black">
                  {name}
                  {isSelf && (
                    <span className="ml-2 text-xs text-[#7c839b]">(you)</span>
                  )}
                </p>
                {name !== email && email && (
                  <p className="text-xs text-[#7c839b]">{email}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {isOwnerOrAdmin && !isSelf && member.role !== "owner" ? (
                  <>
                    <Select
                      value={member.role}
                      onValueChange={(v) => {
                        if (v) handleRoleChange(member.id, v);
                      }}
                    >
                      <SelectTrigger className="h-8 w-[110px] text-xs">
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
                      className="h-8 text-xs text-[#7c839b] hover:text-red-600"
                      onClick={() => handleRemove(member.id)}
                      disabled={isPending}
                    >
                      {t("remove")}
                    </Button>
                  </>
                ) : (
                  <Badge variant="secondary" className="text-xs">
                    {roleLabels[member.role] ?? member.role}
                  </Badge>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
