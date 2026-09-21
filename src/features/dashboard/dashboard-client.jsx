"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/providers";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScoreManagement } from "@/features/scores/score-management";
import { SubscriptionCard } from "@/features/subscriptions/subscription-card";
import { CharityCard } from "@/features/charities/charity-card";
import { WinningsCard } from "@/features/winners/winnings-card";

export function DashboardClient({
  subscription: initialSubscription,
  initialScores = [],
  charityPreference: initialCharityPreference,
  participations: initialParticipations = [],
  winnings: initialWinnings = [],
  upcomingDraw: initialUpcomingDraw,
}) {
  const { user: authUser, loading: authLoading } = useAuth();
  const router = useRouter();

  const [scores, setScores] = useState(initialScores);
  const [subscription, setSubscription] = useState(initialSubscription);
  const [charityPreference, setCharityPreference] = useState(initialCharityPreference);
  const [charities, setCharities] = useState([]);
  const [participations, setParticipations] = useState(initialParticipations);
  const [winnings, setWinnings] = useState(initialWinnings);
  const [upcomingDraw, setUpcomingDraw] = useState(initialUpcomingDraw);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Fetch all user modules
  const refreshDashboardData = useCallback(async () => {
    if (!authUser) return;
    setIsLoadingData(true);

    try {
      const [scoresRes, subRes, charityPrefRes, charitiesRes, partRes, winRes, upDrawRes] =
        await Promise.all([
          fetch("/api/scores").then((r) => (r.ok ? r.json() : [])).catch(() => []),
          fetch("/api/subscription/status").then((r) => (r.ok ? r.json() : null)).catch(() => null),
          fetch("/api/me/charity").then((r) => (r.ok ? r.json() : null)).catch(() => null),
          fetch("/api/charities").then((r) => (r.ok ? r.json() : [])).catch(() => []),
          fetch("/api/draws/mine").then((r) => (r.ok ? r.json() : [])).catch(() => []),
          fetch("/api/winnings").then((r) => (r.ok ? r.json() : [])).catch(() => []),
          fetch("/api/draws/upcoming").then((r) => (r.ok ? r.json() : null)).catch(() => null),
        ]);

      setScores(scoresRes);
      setSubscription(subRes);
      setCharityPreference(charityPrefRes);
      setCharities(charitiesRes);
      setParticipations(partRes);
      setWinnings(winRes);
      setUpcomingDraw(upDrawRes);
    } catch (err) {
      console.error("Error refreshing dashboard data:", err);
    } finally {
      setIsLoadingData(false);
    }
  }, [authUser]);

  useEffect(() => {
    if (!authLoading && !authUser) {
      router.push("/login");
      return;
    }

    if (authUser) {
      refreshDashboardData();
    }
  }, [authUser, authLoading, router, refreshDashboardData]);

  if (authLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!authUser) {
    return null;
  }

  const totalWonAmount = winnings.reduce(
    (sum, w) => sum + Number(w.calculated_prize || 0),
    0
  );

  const selectedCharityName =
    charities.find((c) => c.id === charityPreference?.charity_id)?.name ||
    (charityPreference?.charity_id ? "Selected Charity" : "None Selected");

  return (
    <div className="space-y-8">
      {/* Top Welcome & Role Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Welcome back{authUser.user_metadata?.full_name ? `, ${authUser.user_metadata.full_name}` : ""}!
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-teal-50 text-teal-700 border border-teal-200 uppercase">
              {subscription?.status === "active" ? "Active Subscriber" : "Free Member"}
            </span>
          </div>
          <p className="text-sm text-gray-600">
            Keep your latest 5 Stableford scores up to date to participate in the upcoming monthly draw.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {authUser.user_metadata?.role === "ADMIN" && (
            <Link href="/admin">
              <Button variant="outline" className="text-purple-700 border-purple-200 hover:bg-purple-50">
                ★ Admin Panel
              </Button>
            </Link>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshDashboardData}
            disabled={isLoadingData}
            className="text-xs text-gray-500"
          >
            {isLoadingData ? "Refreshing..." : "↻ Refresh"}
          </Button>
        </div>
      </div>

      {/* Quick Navigation Tabs / Links to Sub-routes */}
      <div className="flex overflow-x-auto gap-2 border-b border-gray-200 pb-2">
        <Link
          href="/dashboard"
          className="px-4 py-2 text-sm font-semibold text-blue-600 border-b-2 border-blue-600 shrink-0"
        >
          Overview
        </Link>
        <Link
          href="/dashboard/scores"
          className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 shrink-0"
        >
          Scores ({scores.length}/5)
        </Link>
        <Link
          href="/dashboard/charity"
          className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 shrink-0"
        >
          Charity Preference
        </Link>
        <Link
          href="/dashboard/draws"
          className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 shrink-0"
        >
          Monthly Draws ({participations.length})
        </Link>
        <Link
          href="/dashboard/winnings"
          className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 shrink-0"
        >
          Winnings & Proof ({winnings.length})
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white shadow-sm border-gray-100">
          <CardContent className="p-5">
            <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Active Scores</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-blue-600 mt-1">
              {scores.length}<span className="text-base font-normal text-gray-400">/5</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">Rolling retention</div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border-gray-100">
          <CardContent className="p-5">
            <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Subscription</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-teal-600 mt-1 capitalize">
              {subscription?.status || "None"}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {subscription?.plans?.name || "Monthly Hero"}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border-gray-100">
          <CardContent className="p-5">
            <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Charity Impact</div>
            <div className="text-xl sm:text-2xl font-extrabold text-gray-900 mt-1 truncate">
              {charityPreference?.contribution_percentage ? `${charityPreference.contribution_percentage}%` : "10%"}
            </div>
            <div className="text-xs text-teal-600 mt-1 truncate font-medium">
              {selectedCharityName}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border-gray-100">
          <CardContent className="p-5">
            <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Total Winnings</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-purple-600 mt-1">
              ${totalWonAmount.toFixed(2)}
            </div>
            <div className="text-xs text-gray-500 mt-1">{winnings.length} prizes won</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Left side Scores & Draws, Right side Subscription, Charity & Winnings */}
      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left Column (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          <ScoreManagement initialScores={scores} onScoreUpdate={refreshDashboardData} />

          {/* Upcoming Draw & Participation Card */}
          <Card className="shadow-sm">
            <CardHeader>
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Upcoming Monthly Draw</h2>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-800">
                  {upcomingDraw?.draw_period || "Monthly Draw"}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-teal-50 border border-blue-100 rounded-xl">
                <p className="text-sm text-gray-700 leading-relaxed">
                  The draw generates 5 winning numbers based on active player Stableford rounds. Match 3, 4, or 5 numbers to win from the prize pool!
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-gray-600">
                  <span className="bg-white px-3 py-1 rounded-full shadow-sm">5 Matches: 40% Jackpot</span>
                  <span className="bg-white px-3 py-1 rounded-full shadow-sm">4 Matches: 35% Major</span>
                  <span className="bg-white px-3 py-1 rounded-full shadow-sm">3 Matches: 25% Bonus</span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-800 mb-2">Your Draw Numbers</h3>
                {scores.length === 0 ? (
                  <p className="text-xs text-gray-500 italic">
                    Add at least 1 Stableford score to generate your draw numbers.
                  </p>
                ) : (
                  <div className="flex gap-2">
                    {scores.map((s, idx) => (
                      <div
                        key={s.id || idx}
                        className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-sm"
                      >
                        {s.stableford_score}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (5 cols) */}
        <div className="lg:col-span-5 space-y-8">
          <SubscriptionCard subscription={subscription} />

          <CharityCard
            preference={charityPreference}
            charities={charities}
          />

          <WinningsCard winnings={winnings} onUpdate={refreshDashboardData} />
        </div>
      </div>
    </div>
  );
}
