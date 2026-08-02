"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast";

type ShareDialogProps = {
  path: string;
  title: string;
  description?: string;
  triggerLabel?: string;
  triggerClassName?: string;
};

export const ShareDialog = ({
  path,
  title,
  description = "Anyone in your organization with this link can open it (if they have access).",
  triggerLabel = "Share",
  triggerClassName,
}: ShareDialogProps) => {
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const clean = path.startsWith("/") ? path : `/${path}`;
    const withLocale = clean.startsWith(`/${locale}`)
      ? clean
      : `/${locale}${clean}`;
    setUrl(`${window.location.origin}${withLocale}`);
  }, [path, locale]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.add({ type: "success", title: "Link copied" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.add({ type: "error", title: "Could not copy link" });
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          triggerClassName ??
          "label-sm px-3 py-1.5 rounded-lg border border-[#1e293b] text-[#94a3b8] hover:bg-[#07090e] transition-colors inline-flex items-center gap-1.5"
        }
      >
        <span className="text-base" aria-hidden>
          share
        </span>
        {triggerLabel}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share “{title}”</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-1">
            <div className="space-y-1.5">
              <Label htmlFor="share-url">Link</Label>
              <div className="flex gap-2">
                <Input
                  id="share-url"
                  value={url}
                  readOnly
                  className="input-workspace font-mono text-xs"
                  onFocus={(e) => e.target.select()}
                />
                <Button
                  type="button"
                  onClick={copy}
                  className="shrink-0 rounded-lg bg-[#3b82f6] text-[var(--azure-ink)] hover:bg-[#2563eb]"
                >
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
            </div>
            <p className="text-xs text-[#64748b]">
              Tip: invite teammates from Settings or Project members for full
              collaboration.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
