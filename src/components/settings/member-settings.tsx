"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateMemberRole, removeMember } from "@/lib/knowledge/actions";
import { toast } from "@/components/ui/toast";

interface MemberItem {
  id: string;
  role: string;
  user_id: string;
  created_at: string;
  profiles: { full_name: string | null; email: string }[] | null;
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
    <Card>
      <CardHeader>
        <CardTitle>{t("membersTitle")}</CardTitle>
        <CardDescription>{t("membersDesc")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="space-y-2">
          {members.map((member) => {
            const name =
              member.profiles?.[0]?.full_name ??
              member.profiles?.[0]?.email ??
              "—";
            const email = member.profiles?.[0]?.email ?? "";
            const isSelf = member.user_id === currentUserId;

            return (
              <div
                key={member.id}
                className="flex items-center justify-between rounded-md border px-3 py-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{name}</p>
                  {name !== email && (
                    <p className="text-xs text-muted-foreground">{email}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {isOwnerOrAdmin && !isSelf ? (
                    <>
                      <Select
                        value={member.role}
                        onValueChange={(v) => {
                          if (v) handleRoleChange(member.id, v);
                        }}
                      >
                        <SelectTrigger className="h-7 w-[100px] text-xs">
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
                        className="h-7 text-xs text-muted-foreground hover:text-destructive"
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
      </CardContent>
    </Card>
  );
};
