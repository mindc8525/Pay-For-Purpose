"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/providers";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

export function AdminDashboardClient({ initialReports }) {
  const { user, loading } = useAuth();
  const [reports, setReports] = useState(initialReports);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = "/login";
      return;
    }

    const fetchSummary = async () => {
      setIsFetching(true);
      try {
        const res = await fetch("/api/admin/reports/summary");
        if (res.ok) {
          const data = await res.json();
          setReports(data);
        }
      } catch (e) {
        console.error("Failed to load admin summary:", e);
      } finally {
        setIsFetching(false);
      }
    };

    if (user) {
      fetchSummary();
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const adminCards = [
    {
      title: "User Management",
      description: "View and manage members, subscriptions, and handicaps",
      href: "/admin/users",
      icon: (
        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      iconBg: "bg-blue-50 border-blue-100",
    },
    {
      title: "Draw Management",
      description: "Create, simulate, and publish monthly draws",
      href: "/admin/draws",
      icon: (
        <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
      iconBg: "bg-purple-50 border-purple-100",
    },
    {
      title: "Charity Management",
      description: "Onboard vetted charities and review fundraising impact",
      href: "/admin/charities",
      icon: (
        <svg className="w-5 h-5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      iconBg: "bg-rose-50 border-rose-100",
    },
    {
      title: "Winner Verification",
      description: "Verify handicap proof and release prize payouts",
      href: "/admin/winners",
      badge: reports.pendingPayouts > 0 ? `${reports.pendingPayouts} pending` : null,
      icon: (
        <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      iconBg: "bg-emerald-50 border-emerald-100",
    },
    {
      title: "Reports & Analytics",
      description: "Financial statements, prize allocations, and audit logs",
      href: "/admin/reports",
      icon: (
        <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      iconBg: "bg-amber-50 border-amber-100",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Admin Control Center
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-purple-50 text-purple-700 border border-purple-200/80 uppercase tracking-wider">
              Administrator
            </span>
          </div>
          <p className="text-sm text-slate-500">
            Platform governance, user verification, draw oversight, and charity metrics.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-slate-200/80 shadow-xs">
          <CardContent className="pt-6">
            <div className="text-3xl font-extrabold text-slate-900">{reports.totalUsers}</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Total Users</div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-slate-200/80 shadow-xs">
          <CardContent className="pt-6">
            <div className="text-3xl font-extrabold text-emerald-600">{reports.activeSubscribers}</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Active Subscribers</div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-slate-200/80 shadow-xs">
          <CardContent className="pt-6">
            <div className="text-3xl font-extrabold text-slate-900">${Number(reports.totalPrizePool || 0).toFixed(2)}</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Total Prize Pool</div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-slate-200/80 shadow-xs">
          <CardContent className="pt-6">
            <div className="text-3xl font-extrabold text-emerald-700">${Number(reports.totalCharityContributions || 0).toFixed(2)}</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Charity Contributions</div>
          </CardContent>
        </Card>
      </div>

      {/* 5 Management Cards with identical sizing and balanced layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {adminCards.map((card) => (
          <Link key={card.href} href={card.href} className="block h-full group">
            <div className="h-[185px] w-full flex flex-col justify-between p-5 rounded-2xl border border-slate-200/80 hover:border-slate-300 hover:shadow-md transition-all bg-white">
              <div>
                <div className="flex items-center justify-between mb-3 min-h-[32px]">
                  <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${card.iconBg}`}>
                    {card.icon}
                  </div>
                  {card.badge && (
                    <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 font-semibold text-[11px] rounded-full">
                      {card.badge}
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
                  {card.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {card.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-emerald-700">
                <span>Manage</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
