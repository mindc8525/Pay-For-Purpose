import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import Link from "next/link";
import { WinningsPageClient } from "./winnings-page-client";

export default function DashboardWinningsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div>
            <Link href="/dashboard" className="text-sm text-blue-600 hover:underline mb-2 block">
              ← Back to Dashboard Overview
            </Link>
            <h1 className="text-3xl font-extrabold text-gray-900">Your Winnings & Prizes</h1>
            <p className="text-sm text-gray-600 mt-1">
              Review your prize history, check verification status, upload scorecard proof, and track payout releases.
            </p>
          </div>

          <WinningsPageClient />
        </div>
      </main>
      <Footer />
    </div>
  );
}
