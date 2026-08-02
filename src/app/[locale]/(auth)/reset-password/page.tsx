"use client";

import { useState } from "react";
import { Link, useRouter } from "@/i18n/routing";
import { useLocale } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/shared/logo";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ResetPasswordPage() {
  const router = useRouter();
  const locale = useLocale();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
    setTimeout(() => {
      router.refresh();
      window.location.href = `/${locale}/dashboard`;
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#07090e] flex items-center justify-center px-4">
      <div className="absolute inset-0 dot-pattern opacity-20" />

      <div className="panel relative z-10 w-full max-w-sm p-8 space-y-6">
        <div className="text-center space-y-2">
          <Link
            href="/"
            className="inline-flex h-10 w-10 items-center justify-center"
          >
            <LogoMark size={44} />
          </Link>
          <h1 className="headline-md text-[var(--star-1)] font-bold mt-4">Set new password</h1>
          <p className="body-md text-[#94a3b8]">Choose a new password for your account</p>
        </div>

        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password" className="body-md text-[var(--star-1)]">
              New password
            </Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="input-workspace w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm" className="body-md text-[var(--star-1)]">
              Confirm password
            </Label>
            <Input
              id="confirm"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={6}
              className="input-workspace w-full"
            />
          </div>

          {error && (
            <div className="p-3 rounded bg-[rgb(239_68_68_/_0.12)] border border-[rgb(239_68_68_/_0.28)]" role="alert">
              <p className="label-sm text-[var(--danger)]">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-3 rounded bg-[rgb(16_185_129_/_0.12)] border border-[rgb(16_185_129_/_0.28)]" role="status">
              <p className="label-sm text-[var(--verified)]">Password updated. Redirecting…</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading || success}
            className="w-full rounded bg-[var(--azure)] text-[var(--azure-ink)] hover:bg-[var(--azure-bright)]"
          >
            {loading ? "Updating..." : "Update password"}
          </Button>
        </form>

        <p className="text-center body-md text-[#94a3b8]">
          <Link href="/login" className="font-semibold text-[#3b82f6] hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
