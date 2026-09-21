import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 py-14 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-slate-900 border border-slate-800 text-white rounded-xl flex items-center justify-center font-bold text-sm shadow-sm">
                <span className="text-emerald-400 mr-0.5">P</span>P
              </div>
              <span className="font-bold text-lg text-white">Par For Purpose</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Where every round transforms lives. We connect passionate golfers with vetted charities through transparent monthly prize draws.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Minimum 10% guaranteed charitable allocation
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white text-sm tracking-wider uppercase mb-4">Platform</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
              <li><Link href="/charities" className="hover:text-white transition-colors">Partner Charities</Link></li>
              <li><Link href="/subscribe" className="hover:text-white transition-colors">Pricing & Plans</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white text-sm tracking-wider uppercase mb-4">Account</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/login" className="hover:text-white transition-colors">Member Sign In</Link></li>
              <li><Link href="/subscribe" className="hover:text-white transition-colors">Start Membership</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Member Dashboard</Link></li>
              <li><Link href="/dashboard/scores" className="hover:text-white transition-colors">Score Log</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white text-sm tracking-wider uppercase mb-4">Integrity & Legal</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><span className="text-slate-500 text-xs">Rollover jackpot rules adhere to verified prize pool algorithms</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-900 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>&copy; {new Date().getFullYear()} Par For Purpose. All rights reserved.</p>
          <p className="text-slate-500">
            Engineered with integrity for community impact.
          </p>
        </div>
      </div>
    </footer>
  );
}
