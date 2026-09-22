"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function SignupForm({ selectedPlanId }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const { data, error: sbError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (sbError) {
        setError(sbError.message);
        setLoading(false);
        return;
      }

      if (data?.session) {
        const target = selectedPlanId ? `/subscribe?plan=${selectedPlanId}` : "/dashboard";
        window.location.href = target;
      } else {
        setSuccess("Account created successfully! If email confirmation is enabled in your Supabase project, check your inbox to confirm, then sign in below.");
        setLoading(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error creating account");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 leading-relaxed font-medium">
          <p className="font-bold mb-1">✓ Account Registered!</p>
          <p>{success}</p>
          <div className="mt-3">
            <Link
              href="/login"
              className="inline-block px-4 py-2 bg-emerald-700 text-white rounded-lg font-bold text-xs hover:bg-emerald-800 transition-colors"
            >
              Go to Sign In →
            </Link>
          </div>
        </div>
      )}

      {!success && (
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 mb-1">
              Full Name
            </label>
            <Input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              placeholder="Alex Morgan"
              className="rounded-xl border-slate-300 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

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
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
              Password (min. 6 characters)
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              minLength={6}
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
            {loading ? "Creating account..." : "Create Account"}
          </Button>

          <p className="text-center text-xs text-slate-500 pt-2">
            Already have an account?{" "}
            <Link href="/login" className="text-emerald-700 hover:underline font-bold">
              Sign In
            </Link>
          </p>
        </form>
      )}
    </div>
  );
}
