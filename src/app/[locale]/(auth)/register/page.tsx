"use client";

import { useState, useEffect } from "react";
import { Link, useRouter } from "@/i18n/routing";
import { useLocale } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/shared/logo";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  const router = useRouter();
  const locale = useLocale();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [invite, setInvite] = useState<{
    organizationName: string;
    role: string;
  } | null>(null);

  // If arriving from an invite link, prefill + lock the email so the signup
  // trigger routes the new user into the inviting organization.
  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("invite");
    if (!token) return;
    fetch(`/api/invitations/lookup?token=${encodeURIComponent(token)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data?.email) return;
        setEmail(data.email);
        setInvite({ organizationName: data.organizationName, role: data.role });
      })
      .catch(() => {});
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } }
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.refresh();
    window.location.href = `/${locale}/dashboard`;
  };

  return (
    <div className="min-h-screen bg-[var(--sky-1)] flex items-center justify-center px-4">
      <div className="absolute inset-0 dot-pattern opacity-20" />

      <div className="panel relative z-10 w-full max-w-sm p-8 space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex h-10 w-10 items-center justify-center">
            <LogoMark size={44} />
          </Link>
          <h1 className="headline-md text-[var(--star-1)] font-bold mt-4">Create account</h1>
          <p className="body-md text-[var(--star-3)]">Start building knowledge</p>
        </div>

        {invite && (
          <div className="rounded-[10px] border border-[rgb(59_130_246_/_0.28)] bg-[rgb(59_130_246_/_0.1)] p-3 text-center">
            <p className="label-sm text-[var(--azure)]">
              Te unís a <span className="font-semibold">{invite.organizationName}</span>{" "}
              como {invite.role}
            </p>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="body-md text-[var(--star-1)]">Full Name</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Your name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="input-workspace w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="body-md text-[var(--star-1)]">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              readOnly={!!invite}
              className={`input-workspace w-full ${invite ? "opacity-70" : ""}`}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="body-md text-[var(--star-1)]">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Min. 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
              className="input-workspace w-full"
            />
          </div>

          {error && (
            <div className="p-3 rounded bg-[rgb(239_68_68_/_0.12)] border border-[rgb(239_68_68_/_0.28)]">
              <p className="label-sm text-[var(--danger)]">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-[var(--azure)] text-[var(--azure-ink)] hover:bg-[var(--azure-bright)]"
          >
            {loading ? "Creating account..." : "Create account"}
          </Button>
        </form>

        <p className="text-center body-md text-[var(--star-3)]">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-[#3b82f6] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
