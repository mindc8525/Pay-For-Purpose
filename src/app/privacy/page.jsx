import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto bg-white p-8 sm:p-12 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-3 py-1 rounded-full">
              Privacy
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 mt-3">Privacy Policy</h1>
            <p className="text-sm text-slate-500 mt-1">Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          <section className="space-y-3 text-sm text-slate-600 leading-relaxed">
            <h2 className="text-base font-bold text-slate-900">1. Information We Collect</h2>
            <p>
              We collect information you provide directly to us when creating an account, recording golf scores, submitting scorecards for verification, or selecting charity preferences.
            </p>

            <h2 className="text-base font-bold text-slate-900 pt-3">2. How We Use Your Information</h2>
            <p>
              Your data is used to manage your account, calculate monthly prize draw eligibility, process charity distributions, and communicate essential service updates.
            </p>

            <h2 className="text-base font-bold text-slate-900 pt-3">3. Data Security & Storage</h2>
            <p>
              We use industry-standard encryption and secure cloud infrastructure to protect your personal details, credentials, and payment history.
            </p>

            <h2 className="text-base font-bold text-slate-900 pt-3">4. Contact Us</h2>
            <p>
              If you have questions about your personal data or privacy preferences, contact us through the Par For Purpose portal support channels.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
