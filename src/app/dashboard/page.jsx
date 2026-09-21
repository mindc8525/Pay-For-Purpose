import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { DashboardClient } from "@/features/dashboard/dashboard-client";

export default function DashboardPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <DashboardClient />
        </div>
      </main>
      <Footer />
    </div>
  );
}
