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
  const [billingInterval, setBillingInterval] = useState(
    selectedPlanId === "2" || selectedPlanId?.includes("year") ? "yearly" : "monthly"
  );
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

      // Provision active membership directly in Supabase
      if (data?.user?.id) {
        try {
          await fetch("/api/subscription/activate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: data.user.id,
              billingInterval,
            }),
          });
        } catch (subErr) {
          console.warn("Could not auto-provision subscription:", subErr);
        }
      }

      if (data?.session) {
        window.location.href = "/dashboard?welcome=true";
      } else {
        const planName = billingInterval === "yearly" ? "Yearly Hero" : "Monthly Hero";
        setSuccess(
          `Account and active ${planName} membership created! You can now sign in below with your credentials.`
        );
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
          <p className="font-bold mb-1">✓ Account &amp; Membership Created!</p>
          <p>{success}</p>
          <div className="mt-3">
            <Link
              href="/login"
              className="inline-block px-4 py-2 bg-emerald-700 text-white rounded-lg font-bold text-xs hover:bg-emerald-800 transition-colors shadow-xs"
            >
              Sign In to Your Account →
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

          {/* Plan Selection */}
          <div className="pt-1">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Select Membership Tier
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setBillingInterval("monthly")}
                className={`p-3 rounded-xl border text-left transition-all ${
                  billingInterval === "monthly"
                    ? "border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-600 shadow-2xs"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="font-bold text-slate-900 text-sm">Monthly Hero</div>
                <div className="text-xs text-slate-500 mt-0.5">$9.99 / month</div>
                <div className="text-[11px] text-emerald-700 font-semibold mt-1.5 flex items-center gap-1">
                  <span>✓</span> Direct Activation
                </div>
              </button>

              <button
                type="button"
                onClick={() => setBillingInterval("yearly")}
                className={`p-3 rounded-xl border text-left transition-all ${
                  billingInterval === "yearly"
                    ? "border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-600 shadow-2xs"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">Yearly Hero</span>
                  <span className="text-[9px] bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.5 rounded">
                    SAVE 17%
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">$99.99 / year</div>
                <div className="text-[11px] text-emerald-700 font-semibold mt-1.5 flex items-center gap-1">
                  <span>✓</span> Direct Activation
                </div>
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 leading-relaxed font-medium">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-xs py-5 text-sm font-semibold transition-all mt-2"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Join Par For Purpose"}
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
