"use client";

import { useEffect, useState } from "react";
import { WinningsCard } from "@/features/winners/winnings-card";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function WinningsPageClient() {
  const [winnings, setWinnings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWinnings = async () => {
    try {
      const res = await fetch("/api/winnings");
      if (res.ok) {
        const data = await res.json();
        setWinnings(data);
      }
    } catch (err) {
      console.error("Failed to load winnings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWinnings();
  }, []);

  if (loading) {
    return (
      <div className="py-12 text-center text-gray-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-3"></div>
        Loading your winnings...
      </div>
    );
  }

  const totalPrize = winnings.reduce(
    (sum, w) => sum + Number(w.calculated_prize || 0),
    0
  );
  const pendingVerification = winnings.filter(
    (w) => w.verification_status === "pending"
  ).length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="bg-white shadow-sm border-gray-100">
          <CardContent className="p-5">
            <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Total Won</div>
            <div className="text-3xl font-black text-purple-600 mt-1">
              ${totalPrize.toFixed(2)}
            </div>
            <div className="text-xs text-gray-500 mt-1">Across all monthly draws</div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border-gray-100">
          <CardContent className="p-5">
            <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Winning Rounds</div>
            <div className="text-3xl font-black text-teal-600 mt-1">
              {winnings.length}
            </div>
            <div className="text-xs text-gray-500 mt-1">Qualified prize matches</div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border-gray-100">
          <CardContent className="p-5">
            <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Action Needed</div>
            <div className="text-3xl font-black text-amber-600 mt-1">
              {pendingVerification}
            </div>
            <div className="text-xs text-amber-700 mt-1 font-medium">
              {pendingVerification > 0 ? "Upload proof required" : "All verified"}
            </div>
          </CardContent>
        </Card>
      </div>

      <WinningsCard winnings={winnings} onUpdate={fetchWinnings} />

      {/* Verification Instructions Card */}
      <Card className="bg-blue-50/50 border-blue-100">
        <CardHeader>
          <h3 className="text-base font-bold text-blue-950">Prize Verification & Payout Process</h3>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-blue-900/80">
          <ol className="list-decimal pl-5 space-y-1">
            <li><strong>Match Evaluation:</strong> When a monthly draw concludes, our engine automatically checks your 5 Stableford scores against the drawn numbers.</li>
            <li><strong>Proof Submission:</strong> If you match 3, 4, or 5 numbers, submit a screenshot or export from your official golf handicapping platform verifying your round.</li>
            <li><strong>Admin Review:</strong> An administrator verifies that the submitted date and Stableford score match the official scorecard.</li>
            <li><strong>Payout Release:</strong> Once approved, the payout status transitions to &quot;Paid&quot; via your registered account payout method.</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
