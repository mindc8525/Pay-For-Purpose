"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export function SignupForm({ selectedPlanId, initialCharities = [] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planQuery = selectedPlanId || searchParams?.get("plan");
  const charityQuery = searchParams?.get("charity");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [billingInterval, setBillingInterval] = useState(
    planQuery === "2" || planQuery?.includes("year") ? "yearly" : "monthly"
  );
  const [charities, setCharities] = useState(initialCharities);
  const [selectedCharity, setSelectedCharity] = useState(charityQuery || initialCharities[0]?.id || "");
  const [contribution, setContribution] = useState(10);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const plan = selectedPlanId || searchParams?.get("plan");
    if (plan === "2" || plan?.includes("year")) {
      setBillingInterval("yearly");
    } else if (plan === "1" || plan?.includes("month")) {
      setBillingInterval("monthly");
    }
  }, [selectedPlanId, searchParams]);

  useEffect(() => {
    const charityParam = searchParams?.get("charity");
    if (charityParam) {
      setSelectedCharity(charityParam);
    }
  }, [searchParams]);

  useEffect(() => {
    const charityParam = searchParams?.get("charity");
    if (charities.length === 0) {
      fetch("/api/charities")
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setCharities(data);
            setSelectedCharity((prev) => charityParam || prev || data[0].id);
          }
        })
        .catch(() => {});
    } else if (!selectedCharity && charities.length > 0) {
      setSelectedCharity(charityParam || charities[0].id);
    }
  }, [charities, selectedCharity, searchParams]);

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

      // Provision active membership & charity preference directly in Supabase
      if (data?.user?.id) {
        try {
          await fetch("/api/subscription/activate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: data.user.id,
              email: email.trim().toLowerCase(),
              fullName: fullName.trim(),
              billingInterval,
              charityId: selectedCharity,
              contributionPercentage: Number(contribution),
            }),
          });
        } catch (subErr) {
          console.warn("Could not auto-provision subscription/charity:", subErr);
        }
      }

      if (data?.session) {
        window.location.href = "/dashboard?welcome=true";
      } else {
        const planName = billingInterval === "yearly" ? "Yearly Hero" : "Monthly Hero";
        setSuccess(
          `Account, active ${planName} membership, and charity preference registered! You can now sign in below with your credentials.`
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
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
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

          {/* Charity Selection */}
          <div className="pt-1 space-y-3 bg-slate-50/80 p-4 rounded-xl border border-slate-200/80">
            <div>
              <label htmlFor="charitySelect" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Supported Partner Charity
              </label>
              <select
                id="charitySelect"
                value={selectedCharity}
                onChange={(e) => setSelectedCharity(e.target.value)}
                required
                className="w-full px-3 py-2.5 bg-white text-slate-900 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm font-medium"
              >
                {charities.length === 0 && (
                  <option value="">Loading charities...</option>
                )}
                {charities.map((charity) => (
                  <option key={charity.id} value={charity.id}>
                    {charity.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-600">
                  Charity Allocation Share (min 10%)
                </label>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                  {contribution}%
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={contribution}
                onChange={(e) => setContribution(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                At least 10% of your membership fee directly empowers your chosen cause.
              </p>
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
            {loading ? "Creating account & membership..." : "Join Par For Purpose"}
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
