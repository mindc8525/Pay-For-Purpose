import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import Link from "next/link";
import { ScoresPageClient } from "./scores-page-client";

export default function DashboardScoresPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 px-3.5 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs transition-all mb-4 group"
            >
              <svg
                className="w-3.5 h-3.5 text-slate-400 group-hover:-translate-x-0.5 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to Dashboard Overview</span>
            </Link>
            <h1 className="text-3xl font-extrabold text-slate-900">Manage Golf Scores</h1>
            <p className="text-sm text-slate-500 mt-1">
              Your latest 5 Stableford scores determine your draw numbers for every monthly prize draw.
            </p>
          </div>


          <ScoresPageClient />
        </div>
      </main>
      <Footer />
    </div>
  );
}
