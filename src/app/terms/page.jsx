import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto bg-white p-8 sm:p-12 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-3 py-1 rounded-full">
              Legal
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 mt-3">Terms of Service</h1>
            <p className="text-sm text-slate-500 mt-1">Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          <section className="space-y-3 text-sm text-slate-600 leading-relaxed">
            <h2 className="text-base font-bold text-slate-900">1. Acceptance of Terms</h2>
            <p>
              By accessing and using Par For Purpose, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
            </p>

            <h2 className="text-base font-bold text-slate-900 pt-3">2. Membership & Eligibility</h2>
            <p>
              Memberships provide access to score tracking, charity allocations, and monthly prize draws. Members must submit valid, verifiable golf scorecards from recognized courses to be eligible for monthly draws.
            </p>

            <h2 className="text-base font-bold text-slate-900 pt-3">3. Charitable Allocations</h2>
            <p>
              A minimum guaranteed percentage of all membership proceeds is directed to vetted partner charities as selected by participating members.
            </p>

            <h2 className="text-base font-bold text-slate-900 pt-3">4. Monthly Draws & Prizes</h2>
            <p>
              Prize pool amounts, rollover jackpots, and winning allocations adhere strictly to verified draw algorithms. Winners must verify scorecard details before payout distribution.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
