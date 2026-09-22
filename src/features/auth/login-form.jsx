"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/app/providers";
import { DEMO_ACCOUNTS } from "@/lib/auth/demo-accounts";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setMockUser } = useAuth();
  const supabase = createClient();

  const executeLogin = async (loginEmail, loginPassword) => {
    setError(null);
    setLoading(true);

    // 1. Check Demo Accounts First
    if (loginEmail === DEMO_ACCOUNTS.member.email && loginPassword === DEMO_ACCOUNTS.member.password) {
      setMockUser(DEMO_ACCOUNTS.member);
      router.push("/dashboard");
      return;
    }

    if (loginEmail === DEMO_ACCOUNTS.admin.email && loginPassword === DEMO_ACCOUNTS.admin.password) {
      setMockUser(DEMO_ACCOUNTS.admin);
      router.push("/admin");
      return;
    }

    // 2. Try Live Supabase with timeout
    try {
      const authPromise = supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Network connection timed out")), 2000)
      );

      const { data, error: sbError } = await Promise.race([authPromise, timeoutPromise]);

      if (sbError) {
        // If placeholder URL or invalid credentials, provide helpful message
        if (sbError.message?.includes("fetch") || process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder")) {
          setError("Live Supabase database not connected. Please use the Demo Accounts below for testing.");
        } else {
          setError(sbError.message);
        }
        setLoading(false);
        return;
      }

      if (data?.user) {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      // In offline/mock mode
      setError("Unable to reach authentication server. Please use the Demo Accounts below to test.");
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    await executeLogin(email, password);
  };

  const handleQuickLogin = async (type) => {
    const account = DEMO_ACCOUNTS[type];
    setEmail(account.email);
    setPassword(account.password);
    await executeLogin(account.email, account.password);
  };

  return (
    <div className="space-y-6">
      {/* Demo Test Accounts Banner */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
            🧪 Demo Accounts For Testing
          </span>
          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium border border-emerald-200/60">
            One-Click Login
          </span>
        </div>
        <p className="text-slate-500 leading-relaxed">
          Click either account below to sign in instantly with test credentials:
        </p>
        <div className="grid grid-cols-2 gap-2 pt-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleQuickLogin("member")}
            disabled={loading}
            className="w-full text-xs h-9 border-slate-300 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 font-medium"
          >
            👤 Member Login
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleQuickLogin("admin")}
            disabled={loading}
            className="w-full text-xs h-9 border-slate-300 hover:bg-slate-900 hover:text-white font-medium"
          >
            🛡️ Admin Login
          </Button>
        </div>
      </div>

      <div className="relative flex items-center justify-center">
        <div className="border-t border-slate-200 w-full" />
        <span className="bg-white px-3 text-xs text-slate-400 font-medium uppercase tracking-wider absolute">
          or enter manually
        </span>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
            Email Address
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            className="rounded-xl border-slate-300"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
            Password
          </label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            className="rounded-xl border-slate-300"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 leading-relaxed">
            {error}
          </div>
        )}

        <Button
          type="submit"
          className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-xs py-5 text-sm font-semibold"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign In to Account"}
        </Button>

        <p className="text-center text-xs text-slate-500 pt-2">
          New to Par For Purpose?{" "}
          <Link href="/subscribe" className="text-emerald-700 hover:underline font-semibold">
            Choose a Membership
          </Link>
        </p>
      </form>
    </div>
  );
}
