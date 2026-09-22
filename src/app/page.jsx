import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section: Emotion-driven, Human Impact First */}
        <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28 bg-gradient-to-b from-white via-slate-50 to-slate-100/70 border-b border-slate-200/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="max-w-3xl mx-auto text-center">
              
              {/* Trust Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold tracking-wide mb-8 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                <span>Vetted Non-Profits · 10% Min Guaranteed Giving · Monthly Cash Draws</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-6">
                Play the Game You Love. <br />
                <span className="text-emerald-700">Power the Causes That Matter.</span>
              </h1>

              {/* Emotional Subtitle */}
              <p className="text-lg md:text-xl text-slate-600 leading-relaxed mb-10 max-w-2xl mx-auto font-normal">
                Par For Purpose turns your regular golf scores into direct monthly funding for vetted charitable causes — while giving you transparent chances to win from verified prize pools.
              </p>

              {/* Primary Call to Actions */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/subscribe" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white px-8 py-6 text-base font-semibold rounded-xl shadow-md hover:shadow-lg transition-all">
                    Start Your Membership
                  </Button>
                </Link>
                <Link href="/charities" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-slate-300 text-slate-700 hover:bg-white px-8 py-6 text-base font-medium rounded-xl">
                    Explore Partner Causes →
                  </Button>
                </Link>
              </div>

              {/* Reassurance Subtext */}
              <p className="text-xs text-slate-400 mt-4">
                No contract · Cancel anytime · Choose where your contribution goes
              </p>
            </div>

            {/* Impact Metric Bar */}
            <div className="mt-16 pt-10 border-t border-slate-200/70 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="p-4 rounded-xl bg-white/70 border border-slate-200/50 shadow-2xs">
                <div className="text-2xl md:text-3xl font-extrabold text-slate-900">10% Min</div>
                <div className="text-xs md:text-sm font-medium text-slate-500 mt-1">Guaranteed Charity Giving</div>
              </div>
              <div className="p-4 rounded-xl bg-white/70 border border-slate-200/50 shadow-2xs">
                <div className="text-2xl md:text-3xl font-extrabold text-emerald-700">Rolling 5</div>
                <div className="text-xs md:text-sm font-medium text-slate-500 mt-1">Scores Become Draw Tickets</div>
              </div>
              <div className="p-4 rounded-xl bg-white/70 border border-slate-200/50 shadow-2xs">
                <div className="text-2xl md:text-3xl font-extrabold text-slate-900">40 / 35 / 25</div>
                <div className="text-xs md:text-sm font-medium text-slate-500 mt-1">Prize Pool Tier Split</div>
              </div>
              <div className="p-4 rounded-xl bg-white/70 border border-slate-200/50 shadow-2xs">
                <div className="text-2xl md:text-3xl font-extrabold text-slate-900">100% Vetted</div>
                <div className="text-xs md:text-sm font-medium text-slate-500 mt-1">Audited Scorecard Proof</div>
              </div>
            </div>
          </div>
        </section>

        {/* Emotion-Led Charity Spotlight: Feel, Not Fairway */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
              <div className="max-w-2xl">
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-3 py-1 rounded-full">
                  Real-World Purpose
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-3 tracking-tight">
                  Where Your Membership Creates Change
                </h2>
                <p className="text-slate-600 mt-2 text-base leading-relaxed">
                  Every month, a guaranteed portion of your subscription empowers vetted nonprofit initiatives. You decide which cause receives your support.
                </p>
              </div>
              <Link href="/charities" className="mt-4 md:mt-0">
                <Button variant="outline" className="rounded-xl border-slate-300 text-slate-700 hover:bg-slate-50">
                  View All Partner Causes →
                </Button>
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Charity 1: Youth & Education */}
              <div className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-200/80 hover:shadow-md transition-all flex flex-col group">
                <div className="h-52 relative overflow-hidden bg-slate-100">
                  <img
                    src="https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=800&auto=format&fit=crop&q=80"
                    alt="Youth Mentorship & Character Education"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <span className="absolute bottom-3 left-3 bg-emerald-700 text-white text-xs font-semibold px-2.5 py-1 rounded-lg shadow-xs">
                    Youth Mentorship
                  </span>
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">First Tee</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Empowering young people with life skills, character education, and mentorship programs that build confidence on and off the course.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-medium">10% Guaranteed Minimum</span>
                    <Link href="/charities" className="text-xs font-bold text-emerald-700 hover:underline">
                      View Charity Partner →
                    </Link>
                  </div>
                </div>
              </div>

              {/* Charity 2: Education & Fallen Heroes */}
              <div className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-200/80 hover:shadow-md transition-all flex flex-col group">
                <div className="h-52 relative overflow-hidden bg-slate-100">
                  <img
                    src="https://images.unsplash.com/photo-1592919505780-303950717480?w=800&auto=format&fit=crop&q=80"
                    alt="Scholarships for Fallen Hero Families"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <span className="absolute bottom-3 left-3 bg-emerald-700 text-white text-xs font-semibold px-2.5 py-1 rounded-lg shadow-xs">
                    Military &amp; First Responders
                  </span>
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Folds of Honor</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Providing life-changing educational scholarships to spouses and children of America&apos;s fallen or disabled military and first responders.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-medium">Patriot Golf Days</span>
                    <Link href="/charities" className="text-xs font-bold text-emerald-700 hover:underline">
                      View Charity Partner →
                    </Link>
                  </div>
                </div>
              </div>

              {/* Charity 3: Healthcare & Pediatric Research */}
              <div className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-200/80 hover:shadow-md transition-all flex flex-col group">
                <div className="h-52 relative overflow-hidden bg-slate-100">
                  <img
                    src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80"
                    alt="Pediatric Cancer Treatment & Research"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <span className="absolute bottom-3 left-3 bg-emerald-700 text-white text-xs font-semibold px-2.5 py-1 rounded-lg shadow-xs">
                    Pediatric Health
                  </span>
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">St. Jude Children&apos;s Research Hospital</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Leading the way the world understands, treats, and defeats childhood cancer and other life-threatening pediatric diseases.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-medium">No Family Ever Pays</span>
                    <Link href="/charities" className="text-xs font-bold text-emerald-700 hover:underline">
                      View Charity Partner →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works: 3 Sleek, Simple Steps */}
        <section className="py-20 bg-slate-50 border-t border-slate-200/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-3 py-1 rounded-full">
                Simple & Transparent
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-3 tracking-tight">
                How Par For Purpose Works
              </h2>
              <p className="text-slate-600 mt-2 text-base">
                Three effortless steps connect your regular rounds with direct charitable impact and monthly draws.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-xs relative">
                <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center font-bold text-lg mb-6 shadow-xs">
                  01
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Log Your Rounds</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Enter your official Stableford scores (1–45 points) after each game. The platform automatically maintains your 5 most recent rounds in a rolling history.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-xs relative">
                <div className="w-12 h-12 bg-emerald-700 text-white rounded-xl flex items-center justify-center font-bold text-lg mb-6 shadow-xs">
                  02
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Empower Your Cause</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Choose a charity partner you care about. At least 10% (and up to 100%) of your membership subscription goes directly to fund their critical work every month.
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-xs relative">
                <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center font-bold text-lg mb-6 shadow-xs">
                  03
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Win Monthly Prizes</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Your 5 rolling scores become your entry numbers for the monthly draw. Match 3, 4, or 5 numbers to win verified cash rewards, with jackpots rolling over if unclaimed.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Prize Pool Breakdown: Sleek, Mathematical, Transparent */}
        <section className="py-20 bg-white border-t border-slate-200/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                Mathematical Fairness
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-3 tracking-tight">
                Transparent Prize Pool Allocation
              </h2>
              <p className="text-slate-600 mt-2 text-base">
                Prize pools are funded directly by subscriptions, with clear rules and verified independent payouts.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {/* Jackpot */}
              <div className="bg-slate-50 rounded-2xl p-8 border-2 border-emerald-600/60 relative shadow-xs flex flex-col justify-between">
                <div>
                  <div className="inline-block px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-md text-xs font-bold tracking-wide uppercase mb-4">
                    Top Tier
                  </div>
                  <div className="text-4xl font-extrabold text-slate-900 mb-1">40%</div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">5 Matches — Jackpot</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Match all 5 numbers from the monthly draw. If unclaimed, 100% of this share rolls over to amplify next month&apos;s jackpot!
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-200 text-xs font-semibold text-emerald-700">
                  Rollover Protection Included
                </div>
              </div>

              {/* Major */}
              <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200/80 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="inline-block px-2.5 py-1 bg-slate-200 text-slate-700 rounded-md text-xs font-bold tracking-wide uppercase mb-4">
                    Major Tier
                  </div>
                  <div className="text-4xl font-extrabold text-slate-900 mb-1">35%</div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">4 Matches</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Match 4 out of the 5 numbers. Shared equally among all 4-match winners for consistent, rewarding payouts.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-200 text-xs font-medium text-slate-500">
                  Shared Across Qualifiers
                </div>
              </div>

              {/* Bonus */}
              <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200/80 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="inline-block px-2.5 py-1 bg-slate-200 text-slate-700 rounded-md text-xs font-bold tracking-wide uppercase mb-4">
                    Community Tier
                  </div>
                  <div className="text-4xl font-extrabold text-slate-900 mb-1">25%</div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">3 Matches — Bonus</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Match 3 of the 5 numbers. Broadly distributed across members to celebrate active participation.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-200 text-xs font-medium text-slate-500">
                  Accessible Community Win
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action: Sleek & Purpose-Driven */}
        <section className="py-20 bg-slate-950 text-white relative overflow-hidden">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-3 py-1 rounded-full">
              Join the Purpose
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mt-4 mb-6 tracking-tight">
              Ready to Give Every Swing Real Purpose?
            </h2>
            <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
              Become part of a community that turns every round into life-changing support for frontline charities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/subscribe">
                <Button size="lg" className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-9 py-6 text-base rounded-xl shadow-lg transition-all">
                  Subscribe & Start Giving
                </Button>
              </Link>
              <Link href="/how-it-works">
                <Button
                  size="lg"
                  variant="secondary"
                  className="bg-white hover:bg-slate-100 text-slate-900 font-bold px-8 py-6 text-base rounded-xl shadow-md transition-all border border-white"
                >
                  Read Full Rules
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
