"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/app/providers";
import { DEMO_ACCOUNTS } from "@/lib/auth/demo-accounts";
import { isMockDatabase } from "@/lib/supabase/db-mode";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isMock, setIsMock] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirect = searchParams?.get("redirectTo");
  const redirectTo = (rawRedirect && rawRedirect !== "/login") ? rawRedirect : "/dashboard";
  const { setMockUser } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    const mock = isMockDatabase();
    setIsMock(mock);
    if (!mock) {
      try {
        localStorage.removeItem("mock_user");
      } catch {}
    }
  }, []);

  const executeLogin = async (loginEmail, loginPassword) => {
    setError(null);
    setLoading(true);

    // 1. Only allow mock bypass if strictly in local mock database mode
    if (isMock) {
      if (loginEmail === DEMO_ACCOUNTS.member.email && loginPassword === DEMO_ACCOUNTS.member.password) {
        setMockUser(DEMO_ACCOUNTS.member);
        const target = redirectTo.startsWith("/admin") ? "/dashboard" : redirectTo;
        window.location.href = target;
        return;
      }

      if (loginEmail === DEMO_ACCOUNTS.admin.email && loginPassword === DEMO_ACCOUNTS.admin.password) {
        setMockUser(DEMO_ACCOUNTS.admin);
        window.location.href = "/admin";
        return;
      }
    }

    // 2. Real Production Supabase Authentication
    try {
      const { data, error: sbError } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (sbError) {
        setError(sbError.message);
        setLoading(false);
        return;
      }

      if (data?.user) {
        try {
          const { data: profile } = await supabase
            .from("users")
            .select("role")
            .eq("id", data.user.id)
            .single();

          let target = redirectTo;
          if (profile?.role === "ADMIN" && target === "/dashboard") {
            target = "/admin";
          }
          window.location.href = target;
        } catch {
          window.location.href = redirectTo;
        }
      } else {
        setLoading(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to connect to authentication service.");
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
      {/* Demo Test Accounts Banner - Only visible in local mock mode */}
      {isMock && (
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
          <div className="relative flex items-center justify-center pt-2">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-slate-50 px-3 text-xs text-slate-400 font-medium uppercase tracking-wider absolute">
              or enter manually
            </span>
          </div>
        </div>
      )}

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
            placeholder="name@example.com"
            className="rounded-xl border-slate-300 focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
              Password
            </label>
          </div>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            className="rounded-xl border-slate-300 focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 leading-relaxed font-medium">
            {error}
          </div>
        )}

        <Button
          type="submit"
          className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-xs py-5 text-sm font-semibold transition-all"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign In to Account"}
        </Button>

        <div className="text-center pt-2 space-y-2">
          <p className="text-xs text-slate-500">
            Don&apos;t have an account yet?{" "}
            <Link href="/signup" className="text-emerald-700 hover:underline font-bold">
              Sign Up Free
            </Link>
          </p>
          <p className="text-xs text-slate-400">
            Need a membership?{" "}
            <Link href="/subscribe" className="text-slate-600 hover:underline font-medium">
              View Plans &amp; Pricing
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
