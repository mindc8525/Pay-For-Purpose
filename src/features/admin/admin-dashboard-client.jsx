"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/providers";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export function AdminDashboardClient({ initialReports }) {
  const { user, loading } = useAuth();
  const [reports] = useState(initialReports);

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = "/login";
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Manage users, draws, charities, and more</p>
          </div>

          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-blue-600">{reports.totalUsers}</div>
                <div className="text-sm text-gray-600">Total Users</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-green-600">{reports.activeSubscribers}</div>
                <div className="text-sm text-gray-600">Active Subscribers</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-purple-600">${reports.totalPrizePool.toFixed(2)}</div>
                <div className="text-sm text-gray-600">Total Prize Pool</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-teal-600">${reports.totalCharityContributions.toFixed(2)}</div>
                <div className="text-sm text-gray-600">Charity Contributions</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link href="/admin/users">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <h3 className="text-lg font-semibold">User Management</h3>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    View and manage all users and their subscriptions
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/draws">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <h3 className="text-lg font-semibold">Draw Management</h3>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Create, simulate, and publish monthly draws
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/charities">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <h3 className="text-lg font-semibold">Charity Management</h3>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Add and manage charity partners
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/winners">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Winner Verification</h3>
                    {reports.pendingPayouts > 0 && (
                      <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full">
                        {reports.pendingPayouts} pending
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Verify winners and manage payouts
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/reports">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <h3 className="text-lg font-semibold">Reports & Analytics</h3>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    View detailed statistics and export data
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Card className="bg-gray-100">
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-400">More Coming Soon</h3>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-400">
                  Additional admin features in development
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
