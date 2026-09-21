import { AdminDashboardClient } from "@/features/admin/admin-dashboard-client";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function AdminPage() {
  const reports = {
    totalUsers: 0,
    activeSubscribers: 0,
    totalPrizePool: 0,
    totalCharityContributions: 0,
    totalWinners: 0,
    pendingPayouts: 0,
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AdminDashboardClient initialReports={reports} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
