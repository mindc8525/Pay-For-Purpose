import { AdminCharitiesClient } from "@/features/admin/admin-charities-client";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function AdminCharitiesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AdminCharitiesClient />
        </div>
      </main>
      <Footer />
    </div>
  );
}
