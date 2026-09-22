import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { DashboardClient } from "@/features/dashboard/dashboard-client";
import { getAuthUser } from "@/lib/supabase/server";
import { SubscriptionService } from "@/server/services/subscription-service";
import { ScoreService } from "@/server/services/score-service";
import { CharityService } from "@/server/services/charity-service";
import { DrawService } from "@/server/services/draw-service";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  let user = null;
  try {
    user = await getAuthUser();
  } catch {
    user = null;
  }

  if (!user) {
    redirect("/login?redirectTo=/dashboard");
  }

  // Pre-fetch all user dashboard data concurrently in parallel on the server
  let subscription = null;
  let scores = [];
  let charityPreference = null;
  let charities = [];
  let participations = [];
  let winnings = [];
  let upcomingDraw = null;

  try {
    const [sub, sc, pref, chList, part, win, upDraw] = await Promise.all([
      SubscriptionService.getUserSubscription(user.id).catch(() => null),
      ScoreService.listByUser(user.id).catch(() => []),
      CharityService.getUserPreference(user.id).catch(() => null),
      CharityService.list().catch(() => []),
      DrawService.getUserParticipations(user.id).catch(() => []),
      DrawService.getUserWinnings(user.id).catch(() => []),
      DrawService.getUpcoming().catch(() => null),
    ]);

    subscription = sub;
    scores = sc || [];
    charityPreference = pref;
    charities = chList || [];
    participations = part || [];
    winnings = win || [];
    upcomingDraw = upDraw;
  } catch (err) {
    console.error("Dashboard prefetch error:", err);
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <DashboardClient
            subscription={subscription}
            initialScores={scores}
            charityPreference={charityPreference}
            initialCharities={charities}
            participations={participations}
            winnings={winnings}
            upcomingDraw={upcomingDraw}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
