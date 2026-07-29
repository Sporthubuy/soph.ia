"use client";

import { useState } from "react";
import { Link, useRouter } from "@/i18n/routing";
import { useLocale } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
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
    <div className="min-h-screen bg-[#f7f9fb] flex items-center justify-center px-4">
      <div className="absolute inset-0 dot-pattern opacity-20" />

      <div className="panel relative z-10 w-full max-w-sm p-8 space-y-6">
        <div className="text-center space-y-2">
          <Link
            href="/"
            className="inline-flex h-10 w-10 items-center justify-center rounded bg-black"
          >
            <span className="text-white text-xl" aria-hidden>
              database
            </span>
          </Link>
          <h1 className="headline-md text-black font-bold mt-4">Set new password</h1>
          <p className="body-md text-[#45464d]">Choose a new password for your account</p>
        </div>

        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password" className="body-md text-black">
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
            <Label htmlFor="confirm" className="body-md text-black">
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
            <div className="p-3 rounded bg-red-50 border border-red-100" role="alert">
              <p className="label-sm text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-3 rounded bg-green-50 border border-green-100" role="status">
              <p className="label-sm text-green-700">Password updated. Redirecting…</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading || success}
            className="w-full rounded bg-black text-white hover:bg-black/90"
          >
            {loading ? "Updating..." : "Update password"}
          </Button>
        </form>

        <p className="text-center body-md text-[#45464d]">
          <Link href="/login" className="font-semibold text-[#4648d4] hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
