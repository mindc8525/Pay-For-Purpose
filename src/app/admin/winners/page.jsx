import { AdminWinnersClient } from "@/features/admin/admin-winners-client";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function AdminWinnersPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AdminWinnersClient />
        </div>
      </main>
      <Footer />
    </div>
  );
}
