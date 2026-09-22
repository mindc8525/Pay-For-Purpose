"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CharityCard } from "@/features/charities/charity-card";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CharityPageClient() {
  const searchParams = useSearchParams();
  const charityFromQuery = searchParams?.get("charity") || searchParams?.get("select");
  const [preference, setPreference] = useState(null);
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCharityData = async () => {
    try {
      const [pref, list] = await Promise.all([
        fetch("/api/me/charity").then((r) => (r.ok ? r.json() : null)).catch(() => null),
        fetch("/api/charities").then((r) => (r.ok ? r.json() : [])).catch(() => []),
      ]);
      setPreference(pref);
      setCharities(list);
    } catch (err) {
      console.error("Failed to load charity data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCharityData();
  }, []);

  if (loading) {
    return (
      <div className="py-12 text-center text-slate-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-3"></div>
        Loading charity preferences...
      </div>
    );
  }

  const selectedCharity = charities.find((c) => c.id === preference?.charity_id);

  return (
    <div className="space-y-6">
      <CharityCard
        preference={preference}
        charities={charities}
        onUpdate={fetchCharityData}
        initialSelectedCharity={charityFromQuery}
      />

      {selectedCharity && (
        <Card className="border border-emerald-200/80 bg-emerald-50/40 rounded-2xl shadow-xs">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-full">
                  Currently Supporting
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-2">{selectedCharity.name}</h3>
              </div>
              <Link href={`/charities/${selectedCharity.id}`}>
                <Button variant="outline" size="sm" className="text-xs bg-white border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl">
                  View Charity Profile & Events →
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 leading-relaxed">
              {selectedCharity.description}
            </p>
            <div className="mt-4 pt-4 border-t border-emerald-200/50 flex flex-wrap gap-4 text-xs font-semibold text-slate-700">
              <div>
                Contribution Share:{" "}
                <span className="font-bold text-emerald-800">
                  {preference?.contribution_percentage || 10}%
                </span>
              </div>
              <div>
                Status: <span className="font-bold text-emerald-700">Active Direct Impact</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Directory CTA */}
      <div className="p-6 bg-white border border-slate-200/80 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div>
          <h4 className="font-bold text-slate-900">Looking for a different cause?</h4>
          <p className="text-sm text-slate-500">
            Browse our full directory of certified partner charities and community golf days.
          </p>
        </div>
        <Link href="/charities">
          <Button variant="outline" className="rounded-xl border-slate-300 font-semibold text-xs h-10 hover:bg-slate-50">
            Browse Charity Directory →
          </Button>
        </Link>
      </div>
    </div>
  );
}

