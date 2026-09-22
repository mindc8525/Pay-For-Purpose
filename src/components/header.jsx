"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/app/providers";

export function Header() {
  const { user, signOut, loading } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-slate-900 text-white rounded-xl flex items-center justify-center font-bold text-base tracking-tight group-hover:bg-emerald-700 transition-colors shadow-sm">
              <span className="text-emerald-400 mr-0.5">P</span>P
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg text-slate-900 leading-tight group-hover:text-emerald-700 transition-colors">
                Par For Purpose
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-500 hidden sm:inline">
                Play · Give · Win
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-7">
            <Link href="/charities" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Partner Charities
            </Link>
            <Link href="/how-it-works" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              How It Works
            </Link>
            <Link href="/subscribe" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Pricing & Plans
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            {loading ? (
              <div className="w-24 h-9 bg-slate-100 animate-pulse rounded-lg" />
            ) : user ? (
              <>
                {user.role === "ADMIN" && (
                  <Link href="/admin">
                    <Button className="bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm h-9 px-3 sm:px-4 font-semibold shadow-xs">
                      Admin Portal
                    </Button>
                  </Link>
                )}
                <Link href="/dashboard">
                  <Button variant="outline" className="rounded-xl border-slate-300 text-slate-700 hover:bg-slate-100 text-sm h-9">
                    Dashboard
                  </Button>
                </Link>
                <Button onClick={signOut} variant="ghost" className="rounded-xl text-slate-600 hover:text-slate-900 text-sm h-9">
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="rounded-xl text-slate-700 hover:text-slate-900 text-sm h-9">
                    Log In
                  </Button>
                </Link>
                <Link href="/subscribe">
                  <Button className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-sm text-sm h-9 px-4 font-medium transition-colors">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
