"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message || "Invalid credentials");
        setLoading(false);
        return;
      }

      // Wait a moment for the session to be established
      await new Promise(resolve => setTimeout(resolve, 500));
      router.push("/admin");
    } catch (err) {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--sky-1)] flex items-center justify-center">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-xl bg-gradient-to-br from-[#3b82f6] to-[#2563eb] shadow-lg shadow-blue-500/20">
            <span className="text-4xl font-bold text-white">S</span>
          </div>
          <h1 className="text-4xl font-bold text-[var(--star-1)]">
            SOPH.IA
          </h1>
          <p className="text-sm text-[var(--star-4)]">Admin Panel</p>
          <p className="text-xs text-[#475569] pt-1">The Knowledge Operating System for AI</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border border-[var(--edge)] bg-[var(--sky-2)] p-6">
          {error && (
            <div className="rounded-lg bg-red-500/20 border border-red-500/50 p-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[var(--star-3)]">
              Email address
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full px-4 py-2 rounded-lg border border-[var(--edge)] bg-[var(--sky-1)] text-[var(--star-3)] placeholder-[#64748b] focus:border-[#3b82f6] focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[var(--star-3)]">
              Password
            </label>
            <input
              id="password"
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 w-full px-4 py-2 rounded-lg border border-[var(--edge)] bg-[var(--sky-1)] text-[var(--star-3)] placeholder-[#64748b] focus:border-[#3b82f6] focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#3b82f6] py-2 font-medium text-white hover:bg-[#2563eb] transition-colors disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        {/* Info */}
        <p className="text-center text-xs text-[var(--star-4)]">
          Admin access only. Unauthorized access is prohibited.
        </p>
      </div>
    </div>
  );
}
