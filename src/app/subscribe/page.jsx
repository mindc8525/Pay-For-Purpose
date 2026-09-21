import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { PlanSelection } from "@/features/subscriptions/plan-selection";

export default function SubscribePage() {
  const plans = [
    { id: '1', name: 'Monthly Membership', billing_interval: 'monthly', price: 9.99, currency: 'USD', stripe_price_id: 'price_monthly' },
    { id: '2', name: 'Annual Membership', billing_interval: 'yearly', price: 99.99, currency: 'USD', stripe_price_id: 'price_yearly' },
  ];
  const charities = [];
  const isAuthenticated = false;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      <main className="flex-1 py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-3.5 py-1 rounded-full">
              Membership Plans
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 mt-4 mb-3 tracking-tight">
              Choose Your Membership
            </h1>
            <p className="text-base text-slate-600 max-w-lg mx-auto">
              Join Par For Purpose to enter monthly cash draws, track your rounds, and empower vetted charities.
            </p>
          </div>
          <PlanSelection plans={plans} charities={charities} isAuthenticated={isAuthenticated} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
