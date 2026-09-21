"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function AdminReportsClient({ initialData }) {
  const [data, setData] = useState(
    initialData || {
      totalUsers: 0,
      activeSubscribers: 0,
      totalPrizePool: 0,
      totalCharityContributions: 0,
      totalWinners: 0,
      pendingPayouts: 0,
    }
  );
  const [loading, setLoading] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/reports/summary");
      if (response.ok) {
        const summary = await response.json();
        setData(summary);
      }
    } catch (err) {
      console.error("Failed to fetch reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialData) {
      fetchReports();
    }
  }, [initialData]);

  // Derived metrics
  const jackpotPool = data.totalPrizePool * 0.4;
  const majorPool = data.totalPrizePool * 0.35;
  const bonusPool = data.totalPrizePool * 0.25;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link href="/admin" className="text-sm text-blue-600 hover:underline mb-2 block">
            ← Back to Admin
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Platform Analytics & Executive Reports
          </h1>
          <p className="text-sm text-gray-500">
            Authoritative platform summary for subscribers, prize pools, charity impact, and draw outcomes.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={fetchReports} disabled={loading}>
          {loading ? "Refreshing..." : "↻ Refresh Metrics"}
        </Button>
      </div>

      {/* 4 Core Mandatory PRD Metrics */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="border-l-4 border-l-blue-600 shadow-sm bg-white">
          <CardContent className="pt-6">
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
              Total Users
            </div>
            <div className="text-3xl font-extrabold text-blue-600">{data.totalUsers}</div>
            <div className="text-xs text-gray-500 mt-2">
              <span className="font-semibold text-green-600">{data.activeSubscribers}</span> active subscribers
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-600 shadow-sm bg-white">
          <CardContent className="pt-6">
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
              Total Prize Pool Allocated
            </div>
            <div className="text-3xl font-extrabold text-purple-600">
              ${data.totalPrizePool.toFixed(2)}
            </div>
            <div className="text-xs text-gray-500 mt-2">
              Across all monthly draws
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-teal-600 shadow-sm bg-white">
          <CardContent className="pt-6">
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
              Charity Contributions
            </div>
            <div className="text-3xl font-extrabold text-teal-600">
              ${data.totalCharityContributions.toFixed(2)}
            </div>
            <div className="text-xs text-gray-500 mt-2">
              Cumulative subscriber impact
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500 shadow-sm bg-white">
          <CardContent className="pt-6">
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
              Winners & Payouts
            </div>
            <div className="text-3xl font-extrabold text-amber-600">{data.totalWinners}</div>
            <div className="text-xs text-gray-500 mt-2">
              <span className="font-semibold text-amber-700">{data.pendingPayouts}</span> awaiting payout
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Prize Pool Tier Structure Card */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader>
            <h2 className="text-lg font-bold text-gray-900">Prize Pool Distribution (PRD 40/35/25)</h2>
            <p className="text-xs text-gray-500">
              Mandatory shares derived from active subscriber prize pool allocation.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 flex justify-between items-center">
              <div>
                <div className="font-bold text-blue-900">5-Match Jackpot (40%)</div>
                <div className="text-xs text-blue-700">Rolls over if unclaimed in monthly draw</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-blue-900">${jackpotPool.toFixed(2)}</div>
                <div className="text-xs text-blue-600">40% Share</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-teal-50/60 border border-teal-100 flex justify-between items-center">
              <div>
                <div className="font-bold text-teal-900">4-Match Major Prize (35%)</div>
                <div className="text-xs text-teal-700">Split equally among 4-number match winners</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-teal-900">${majorPool.toFixed(2)}</div>
                <div className="text-xs text-teal-600">35% Share</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-100 flex justify-between items-center">
              <div>
                <div className="font-bold text-purple-900">3-Match Bonus Prize (25%)</div>
                <div className="text-xs text-purple-700">Split equally among 3-number match winners</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-purple-900">${bonusPool.toFixed(2)}</div>
                <div className="text-xs text-purple-600">25% Share</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Operational Health & Ratios */}
        <Card className="shadow-sm">
          <CardHeader>
            <h2 className="text-lg font-bold text-gray-900">Platform Health & Invariants</h2>
            <p className="text-xs text-gray-500">
              System verification status and business rule compliance.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Subscriber Conversion Rate</span>
              <span className="text-sm font-bold text-gray-900">
                {data.totalUsers > 0
                  ? `${((data.activeSubscribers / data.totalUsers) * 100).toFixed(1)}%`
                  : "0%"}
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Minimum Charity Contribution</span>
              <span className="text-sm font-bold text-teal-600">10% Enforced</span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Prize Pool Funding Rate</span>
              <span className="text-sm font-bold text-purple-600">20% of Subscriptions</span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Max Stored Scores Per User</span>
              <span className="text-sm font-bold text-gray-900">5 (Rolling Retention)</span>
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600">Score Range</span>
              <span className="text-sm font-bold text-gray-900">1 - 45 Stableford</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
