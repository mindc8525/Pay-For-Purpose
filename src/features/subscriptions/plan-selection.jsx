"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function PlanSelection({ plans = [], charities = [], isAuthenticated }) {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedCharity, setSelectedCharity] = useState("");
  const [contribution, setContribution] = useState(10);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubscribe = async () => {
    if (!selectedPlan) return;

    setLoading(true);

    if (!isAuthenticated) {
      router.push(`/signup?plan=${selectedPlan.id}`);
      return;
    }

    if (selectedCharity) {
      try {
        await fetch("/api/me/charity", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            charity_id: selectedCharity,
            contribution_percentage: contribution,
          }),
        });
      } catch (error) {
        console.error("Error setting charity preference:", error);
      }
    }

    try {
      const response = await fetch("/api/subscription/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          price_id: selectedPlan.stripe_price_id,
          plan_id: selectedPlan.id,
        }),
      });

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      setLoading(false);
    }
  };

  const monthlyPlan = plans.find((p) => p.billing_interval === "monthly");
  const yearlyPlan = plans.find((p) => p.billing_interval === "yearly");

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
        <Card className="animate-in fade-in slide-in-from-bottom-4 duration-300 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <CardContent className="pt-6">
            <h4 className="text-lg font-bold text-slate-900 mb-4">Select a Charity (Optional)</h4>
            <div className="space-y-4">
              <select
                value={selectedCharity}
                onChange={(e) => setSelectedCharity(e.target.value)}
                className="w-full px-4 py-3 bg-white text-slate-900 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 shadow-2xs"
              >
                <option value="">Select a partner charity...</option>
                {charities.map((charity) => (
                  <option key={charity.id} value={charity.id}>
                    {charity.name}
                  </option>
                ))}
              </select>

              {selectedCharity && (
                <div className="pt-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Contribution Percentage (min 10%)
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={contribution}
                      onChange={(e) => setContribution(Number(e.target.value))}
                      className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                    />
                    <span className="w-16 text-center font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200/60 text-sm">
                      {contribution}%
                    </span>
                  </div>
                </div>
              )}
            </div>

            <Button
              onClick={handleSubscribe}
              disabled={loading}
              className="w-full mt-6 bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-xs py-6 text-base font-semibold transition-all"
            >
              {loading
                ? "Processing..."
                : isAuthenticated
                ? "Continue to Payment"
                : "Create Account"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
