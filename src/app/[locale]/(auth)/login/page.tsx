"use client";

import { useState } from "react";
import { Link, useRouter } from "@/i18n/routing";
import { useLocale } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const locale = useLocale();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.refresh();
    window.location.href = `/${locale}/dashboard`;
  };

  return (
    <div className="min-h-screen bg-[#f7f9fb] flex items-center justify-center px-4">
      <div className="absolute inset-0 dot-pattern opacity-20" />

      <div className="panel relative z-10 w-full max-w-sm p-8 space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex h-10 w-10 items-center justify-center rounded bg-black">
            <span className="text-white text-xl">database</span>
          </Link>
          <h1 className="headline-md text-black font-bold mt-4">Welcome back</h1>
          <p className="body-md text-[#45464d]">Sign in to SOPH.IA</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="body-md text-black">Email</Label>
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

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="body-md text-black">Password</Label>
              <Link href="/forgot-password" className="label-sm text-[#4648d4] hover:underline">
                Forgot?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input-workspace w-full"
            />
          </div>

          {error && (
            <div className="p-3 rounded bg-red-50 border border-red-100">
              <p className="label-sm text-red-700">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-black text-white hover:bg-black/90"
          >
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <p className="text-center body-md text-[#45464d]">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-semibold text-[#4648d4] hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
