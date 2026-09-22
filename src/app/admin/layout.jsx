import { getAuthUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AdminLayout({ children }) {
  const user = await getAuthUser();

  if (!user) {
    redirect("/login?redirectTo=/admin");
  }

  let isAdmin =
    user.role === "ADMIN" ||
    user.user_metadata?.role === "ADMIN" ||
    user.app_metadata?.role === "ADMIN";

  if (!isAdmin) {
    try {
      const { createAdminClient } = await import("@/lib/supabase/admin");
      const adminClient = createAdminClient();
      if (adminClient) {
        const { data: profile } = await adminClient
          .from("users")
          .select("role")
          .eq("id", user.id)
          .single();
        if (profile?.role === "ADMIN") {
          isAdmin = true;
        }
      }
    } catch {}
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-red-100 p-8 text-center space-y-4">
          <div className="w-14 h-14 mx-auto bg-red-100 text-red-600 rounded-full flex items-center justify-center text-2xl font-bold">
            🚫
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Access Denied</h1>
          <p className="text-sm text-slate-600">
            You do not have administrative privileges to access this area of Par For Purpose.
          </p>
          <div className="pt-2">
            <Link href="/dashboard">
              <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl">
                Return to Member Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
