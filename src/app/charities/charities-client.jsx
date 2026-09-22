"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CharityActionButton } from "@/features/charities/charity-action-button";

const CHARITY_METRICS = {
  "First Tee": {
    category: "Youth Mentorship & Life Skills",
    stat: "3.4M+ Juniors Empowered",
    tagColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  "Folds of Honor": {
    category: "Military & First Responder Families",
    stat: "52,000+ Scholarships Awarded",
    tagColor: "bg-blue-50 text-blue-700 border-blue-200",
  },
  "St. Jude Children’s Research Hospital": {
    category: "Pediatric Cancer & Clinical Care",
    stat: "80%+ Childhood Survival Rate",
    tagColor: "bg-purple-50 text-purple-700 border-purple-200",
  },
  "Make-A-Wish Foundation": {
    category: "Critical Illness Wish Granting",
    stat: "350,000+ Wishes Granted",
    tagColor: "bg-teal-50 text-teal-700 border-teal-200",
  },
};

export function CharitiesClient({
  initialCharities = [],
  isAuthenticated = false,
  hasActiveSubscription = false,
  initialUserPreference = null,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedCharityId, setSelectedCharityId] = useState(
    initialUserPreference?.charity_id || null
  );

  const filteredCharities = initialCharities.filter((charity) => {
    const matchesSearch =
      charity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      charity.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = activeFilter === "all" || (activeFilter === "featured" && charity.is_featured);

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-8">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-slate-200/80">
        <div className="relative w-full sm:w-96">
          <Input
            type="text"
            placeholder="Search charities by cause or mission..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-4 pr-10 py-2 border-slate-200 rounded-xl text-sm"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-sm"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant={activeFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter("all")}
            className={activeFilter === "all" ? "bg-slate-900 text-white rounded-xl" : "rounded-xl border-slate-200 text-slate-600"}
          >
            All Causes ({initialCharities.length})
          </Button>
          <Button
            variant={activeFilter === "featured" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter("featured")}
            className={activeFilter === "featured" ? "bg-emerald-700 text-white rounded-xl" : "rounded-xl border-slate-200 text-slate-600"}
          >
            ★ Featured Partners
          </Button>
        </div>
      </div>

      {/* Grid of Charities */}
      {filteredCharities.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200/80 p-8 shadow-xs">
          <div className="text-3xl mb-2">🔍</div>
          <h3 className="text-lg font-bold text-slate-900">No partner causes found</h3>
          <p className="text-sm text-slate-500 mt-1">Try clearing your filters or search keywords.</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchTerm("");
              setActiveFilter("all");
            }}
            className="mt-4 rounded-xl"
          >
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
          {filteredCharities.map((charity) => {
            const meta = CHARITY_METRICS[charity.name] || {
              category: "Verified Non-Profit Partner",
              stat: "Direct Community Impact",
              tagColor: "bg-slate-50 text-slate-700 border-slate-200",
            };

            return (
              <Card
                key={charity.id}
                className="group overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col bg-white rounded-3xl"
              >
                <div className="relative h-56 w-full bg-slate-900 overflow-hidden">
                  {charity.image_url ? (
                    <img
                      src={charity.image_url}
                      alt={charity.name}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent flex flex-col justify-between p-5" />

                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-slate-900 text-[11px] font-bold uppercase tracking-wider rounded-lg shadow-xs">
                      {meta.category}
                    </span>
                    {charity.is_featured && (
                      <span className="bg-emerald-600 text-white text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg shadow-xs">
                        ★ Featured
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-4 left-5 right-5">
                    <h3 className="text-white text-2xl font-extrabold tracking-tight drop-shadow-sm">
                      {charity.name}
                    </h3>
                  </div>
                </div>

                <CardContent className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-5">
                  <div className="space-y-3">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border bg-emerald-50 text-emerald-800 border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>Impact: <strong>{meta.stat}</strong></span>
                    </div>

                    <p className="text-sm text-slate-600 leading-relaxed">
                      {charity.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                    <Link href={`/charities/${charity.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full text-xs font-semibold border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl h-10">
                        View Profile & Events →
                      </Button>
                    </Link>
                    <CharityActionButton
                      charityId={charity.id}
                      charityName={charity.name}
                      isAuthenticated={isAuthenticated}
                      hasActiveSubscription={hasActiveSubscription}
                      isCurrentCause={selectedCharityId === charity.id}
                      currentPercentage={initialUserPreference?.contribution_percentage || 10}
                      variant="card"
                      onSelected={(newId) => setSelectedCharityId(newId)}
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
