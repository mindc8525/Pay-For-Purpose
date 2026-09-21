"use client";

import { useEffect, useState } from "react";
import { CharityCard } from "@/features/charities/charity-card";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CharityPageClient() {
  const [preference, setPreference] = useState(null);
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/me/charity").then((r) => (r.ok ? r.json() : null)).catch(() => null),
      fetch("/api/charities").then((r) => (r.ok ? r.json() : [])).catch(() => []),
    ]).then(([pref, list]) => {
      setPreference(pref);
      setCharities(list);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="py-12 text-center text-gray-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-3"></div>
        Loading charity preferences...
      </div>
    );
  }

  const selectedCharity = charities.find((c) => c.id === preference?.charity_id);

  return (
    <div className="space-y-6">
      <CharityCard preference={preference} charities={charities} />

      {selectedCharity && (
        <Card className="border border-teal-100 bg-teal-50/40">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-teal-700">Currently Supporting</span>
                <h3 className="text-xl font-bold text-gray-900 mt-1">{selectedCharity.name}</h3>
              </div>
              <Link href={`/charities/${selectedCharity.id}`}>
                <Button variant="outline" size="sm" className="text-xs bg-white">
                  View Charity Profile & Events →
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 leading-relaxed">
              {selectedCharity.description}
            </p>
            <div className="mt-4 pt-4 border-t border-teal-200/50 flex flex-wrap gap-4 text-xs font-medium text-teal-900">
              <div>
                Contribution Share: <span className="font-bold text-teal-700">{preference?.contribution_percentage || 10}%</span>
              </div>
              <div>
                Status: <span className="font-bold text-green-700">Active Direct Impact</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Directory CTA */}
      <div className="p-6 bg-white border border-gray-100 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div>
          <h4 className="font-bold text-gray-900">Looking for a different cause?</h4>
          <p className="text-sm text-gray-500">
            Browse our full directory of certified partner charities and community golf days.
          </p>
        </div>
        <Link href="/charities">
          <Button variant="outline" className="rounded-xl">
            Browse Charity Directory →
          </Button>
        </Link>
      </div>
    </div>
  );
}
