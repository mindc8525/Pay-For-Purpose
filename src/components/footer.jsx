import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 py-6 border-t border-slate-900 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-slate-900 border border-slate-800 text-white rounded-lg flex items-center justify-center font-bold text-xs shadow-xs">
              <span className="text-emerald-400 mr-0.5">P</span>P
            </div>
            <span className="font-bold text-sm text-white">Par For Purpose</span>
            <span className="text-slate-700 hidden sm:inline">•</span>
            <span className="text-slate-400 hidden sm:inline text-xs">
              Where every round transforms lives
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-400">
            <Link href="/how-it-works" className="hover:text-white transition-colors">How It Works</Link>
            <Link href="/charities" className="hover:text-white transition-colors">Partner Charities</Link>
            <Link href="/subscribe" className="hover:text-white transition-colors">Pricing & Plans</Link>
            <Link href="/dashboard" className="hover:text-white transition-colors">Member Dashboard</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
          </div>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>&copy; {new Date().getFullYear()} Par For Purpose. Minimum 10% guaranteed charitable allocation.</span>
          </div>
          <p className="text-slate-500">
            Rollover jackpot rules adhere to verified prize pool algorithms.
          </p>
        </div>
      </div>
    </footer>
  );
}

