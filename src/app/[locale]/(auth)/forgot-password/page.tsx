"use client";

import { useState } from "react";
import { Link } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/shared/logo";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    const supabase = createClient();
    const locale = window.location.pathname.split("/")[1] || "es";
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/${locale}/reset-password`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setEmail("");
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center px-4">
      <div className="absolute inset-0 dot-pattern opacity-20" />

      <div className="panel relative z-10 w-full max-w-sm p-8 space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex h-10 w-10 items-center justify-center">
            <LogoMark size={44} />
          </Link>
          <h1 className="headline-md text-[var(--star-1)] font-bold mt-4">Reset password</h1>
          <p className="body-md text-[#b8c1d4]">Enter your email to receive reset link</p>
        </div>

        <form onSubmit={handleReset} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="body-md text-[var(--star-1)]">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input-workspace w-full"
            />
          </div>

          {error && (
            <div className="p-3 rounded bg-[rgb(251_106_104_/_0.12)] border border-[rgb(251_106_104_/_0.28)]">
              <p className="label-sm text-[var(--danger)]">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-3 rounded bg-[rgb(52_211_153_/_0.12)] border border-[rgb(52_211_153_/_0.28)]">
              <p className="label-sm text-[var(--verified)]">Check your email for reset link</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-[var(--azure)] text-[var(--azure-ink)] hover:bg-[var(--azure-bright)]"
          >
            {loading ? "Sending..." : "Send reset link"}
          </Button>
        </form>

        <p className="text-center body-md text-[#b8c1d4]">
          Remember your password?{" "}
          <Link href="/login" className="font-semibold text-[#5b9bff] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
