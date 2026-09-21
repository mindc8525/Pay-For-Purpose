import { AdminReportsClient } from "@/features/admin/admin-reports-client";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AdminService } from "@/server/services/admin-service";

export const dynamic = 'force-dynamic';

export default async function AdminReportsPage() {
  let reports = {
    totalUsers: 0,
    activeSubscribers: 0,
    totalPrizePool: 0,
    totalCharityContributions: 0,
    totalWinners: 0,
    pendingPayouts: 0,
  };

  try {
    reports = await AdminService.getReportsSummary();
  } catch (error) {
    console.error("Error loading initial reports:", error);
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AdminReportsClient initialData={reports} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
