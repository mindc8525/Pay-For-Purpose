"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function PlanSelection({ plans = [], charities = [], isAuthenticated }) {
  const monthlyPlan = plans.find((p) => p.billing_interval === "monthly");
  const yearlyPlan = plans.find((p) => p.billing_interval === "yearly");
  const [selectedPlan, setSelectedPlan] = useState(monthlyPlan || plans[0] || null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubscribe = async () => {
    const activePlan = selectedPlan || monthlyPlan || plans[0];
    if (!activePlan) return;

    setLoading(true);

    if (!isAuthenticated) {
      router.push(`/signup?plan=${activePlan.id}`);
      return;
    }

    try {
      const res = await fetch("/api/subscription/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          billingInterval: activePlan.billing_interval || "monthly",
        }),
      });

      if (res.ok) {
        router.push("/dashboard");
        return;
      }

      const response = await fetch("/api/subscription/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          price_id: activePlan.stripe_price_id,
          plan_id: activePlan.id,
        }),
      });

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Error activating subscription:", error);
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-2 gap-6">
        {monthlyPlan && (
          <Card
            className={`cursor-pointer transition-all rounded-2xl bg-white border ${
              selectedPlan?.id === monthlyPlan.id
                ? "ring-2 ring-emerald-600 border-emerald-500/50 shadow-md"
                : "border-slate-200/80 hover:shadow-md"
            }`}
            onClick={() => setSelectedPlan(monthlyPlan)}
          >
            <CardHeader>
              <h3 className="text-xl font-bold text-slate-900">{monthlyPlan.name}</h3>
              <div className="text-3xl font-extrabold text-slate-900">
                ${monthlyPlan.price}
                <span className="text-base font-normal text-slate-500">/month</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2.5 text-sm text-slate-600">
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Participate in monthly draws
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Track up to 5 scores
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Support your chosen charity
                </li>
              </ul>
            </CardContent>
          </Card>
        )}

        {yearlyPlan && (
          <Card
            className={`cursor-pointer transition-all rounded-2xl bg-white border relative ${
              selectedPlan?.id === yearlyPlan.id
                ? "ring-2 ring-emerald-600 border-emerald-500/50 shadow-md"
                : "border-slate-200/80 hover:shadow-md"
            }`}
            onClick={() => setSelectedPlan(yearlyPlan)}
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-emerald-700 text-white text-xs font-semibold rounded-full shadow-xs">
              Save 17% (2 Months Free)
            </div>
            <CardHeader>
              <h3 className="text-xl font-bold text-slate-900">{yearlyPlan.name}</h3>
              <div className="text-3xl font-extrabold text-slate-900">
                ${yearlyPlan.price}
                <span className="text-base font-normal text-slate-500">/year</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2.5 text-sm text-slate-600">
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Everything in Monthly
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  2 months free
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Priority support
                </li>
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {selectedPlan && (
        <div className="pt-2 flex flex-col items-center animate-in fade-in slide-in-from-bottom-3 duration-300">
          <Button
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full max-w-md bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-md py-6 text-base font-semibold transition-all hover:scale-[1.01]"
          >
            {loading
              ? "Processing..."
              : isAuthenticated
              ? "Activate Membership"
              : "Create Account"}
          </Button>
          <p className="text-xs text-slate-500 mt-2.5 text-center">
            Selected: <span className="font-semibold text-slate-800">{selectedPlan.name}</span> (${selectedPlan.price}/{selectedPlan.billing_interval === "yearly" ? "year" : "month"})
          </p>
        </div>
      )}
    </div>
  );
}
