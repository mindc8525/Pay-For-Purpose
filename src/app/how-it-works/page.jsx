import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      <main className="flex-1 py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-3.5 py-1 rounded-full">
              Platform Rules & Architecture
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 mt-4 mb-4 tracking-tight">
              How Par For Purpose Works
            </h1>
            <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              We connect the love of golf with measurable charitable impact and exciting monthly prize draws.
            </p>
          </div>

          <div className="space-y-8">
            {/* Step 1 */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-xs">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-8 rounded-lg bg-slate-900 text-white font-bold text-sm flex items-center justify-center">1</span>
                <h2 className="text-xl font-bold text-slate-900">Choose a Membership Plan</h2>
              </div>
              <p className="text-slate-600 mb-4 leading-relaxed">
                Start with a flexible monthly ($9.99/mo) or discounted annual ($99.99/yr) plan. Your membership unlocks:
              </p>
              <ul className="space-y-2 text-sm text-slate-600 pl-4 border-l-2 border-emerald-500">
                <li>Automatic entry into verified monthly cash prize draws</li>
                <li>Rolling 5-score tracking and golf history archive</li>
                <li>Direct monthly donation to your chosen vetted non-profit (10% to 100%)</li>
              </ul>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-xs">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-8 rounded-lg bg-slate-900 text-white font-bold text-sm flex items-center justify-center">2</span>
                <h2 className="text-xl font-bold text-slate-900">Log Your Regular Rounds</h2>
              </div>
              <p className="text-slate-600 mb-4 leading-relaxed">
                After each game, enter your authentic Stableford score (between 1 and 45 points inclusive).
              </p>
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200/60 mb-3 space-y-2 text-sm text-slate-700">
                <h4 className="font-semibold text-slate-900">The Rolling 5-Score Invariant:</h4>
                <p>
                  Par For Purpose always retains your latest 5 rounds in reverse chronological order. When you submit your 6th score, the oldest automatically rolls off. These 5 scores form your 5 active draw numbers.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-xs">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-8 rounded-lg bg-slate-900 text-white font-bold text-sm flex items-center justify-center">3</span>
                <h2 className="text-xl font-bold text-slate-900">Transparent Monthly Draw Engine</h2>
              </div>
              <p className="text-slate-600 mb-6 leading-relaxed">
                At the conclusion of each month, 5 winning numbers are generated using a cryptographically audited draw algorithm.
              </p>
              
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div className="p-5 bg-emerald-50/50 rounded-xl border border-emerald-200/80 text-center">
                  <div className="text-2xl font-extrabold text-slate-900">5 Matches</div>
                  <div className="text-xs font-semibold text-emerald-800 uppercase tracking-wider mt-1">Jackpot (40%)</div>
                  <div className="text-xs text-slate-600 mt-2">Rolls over if unclaimed</div>
                </div>
                <div className="p-5 bg-slate-50 rounded-xl border border-slate-200/80 text-center">
                  <div className="text-2xl font-extrabold text-slate-900">4 Matches</div>
                  <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider mt-1">Major Tier (35%)</div>
                  <div className="text-xs text-slate-500 mt-2">Shared equally across winners</div>
                </div>
                <div className="p-5 bg-slate-50 rounded-xl border border-slate-200/80 text-center">
                  <div className="text-2xl font-extrabold text-slate-900">3 Matches</div>
                  <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider mt-1">Bonus Tier (25%)</div>
                  <div className="text-xs text-slate-500 mt-2">Broad community distribution</div>
                </div>
              </div>

              <p className="text-xs text-slate-500">
                Rollover Guarantee: If no participant matches all 5 numbers in a monthly draw, 100% of the 40% jackpot pool rolls into the next month&apos;s jackpot!
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-xs">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-8 rounded-lg bg-emerald-700 text-white font-bold text-sm flex items-center justify-center">4</span>
                <h2 className="text-xl font-bold text-slate-900">Guaranteed Charitable Remittance</h2>
              </div>
              <p className="text-slate-600 leading-relaxed">
                A minimum of 10% of every subscription fee is segregated for your selected charity. You can increase your contribution percentage at any time in your dashboard up to 100%. Funds are reconciled and remitted to vetted non-profit partners every billing cycle.
              </p>
            </div>

            {/* Step 5 */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-xs">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-8 rounded-lg bg-slate-900 text-white font-bold text-sm flex items-center justify-center">5</span>
                <h2 className="text-xl font-bold text-slate-900">Scorecard Verification & Payout</h2>
              </div>
              <p className="text-slate-600 leading-relaxed">
                To safeguard the integrity of the platform, winning participants submit a scorecard photo or verified golf handicap app screenshot confirming the round dates and scores before prize distribution. Once approved by our team, payouts are transferred securely.
              </p>
            </div>
          </div>

          <div className="mt-14 text-center">
            <Link href="/subscribe">
              <Button size="lg" className="bg-slate-900 hover:bg-slate-800 text-white px-9 py-6 text-base rounded-xl font-semibold shadow-md">
                Start Your Membership
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
