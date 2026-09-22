"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function DrawsPageClient() {
  const [participations, setParticipations] = useState([]);
  const [upcomingDraw, setUpcomingDraw] = useState(null);
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/draws/mine").then((r) => (r.ok ? r.json() : [])).catch(() => []),
      fetch("/api/draws/upcoming").then((r) => (r.ok ? r.json() : null)).catch(() => null),
      fetch("/api/scores").then((r) => (r.ok ? r.json() : [])).catch(() => []),
    ]).then(([parts, upDraw, scs]) => {
      setParticipations(parts);
      setUpcomingDraw(upDraw);
      setScores(scs);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="py-14 text-center text-slate-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-3"></div>
        Loading draw history...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Active Entry Card */}
      <Card className="rounded-2xl border-slate-200/80 shadow-xs bg-white">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-full">
                Next Scheduled Event
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-2">
                {upcomingDraw ? `Monthly Draw: ${upcomingDraw.draw_period}` : "Upcoming Monthly Draw"}
              </h3>
            </div>
            <span className="shrink-0 self-start sm:self-auto px-3 py-1 rounded-full text-xs font-bold bg-emerald-100/80 text-emerald-800 border border-emerald-200">
              Entry Active
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-500">
            All active subscribers with logged Stableford scores are entered into the draw automatically.
          </p>

          <div>
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2.5">
              Your 5 Live Draw Numbers
            </span>
            {scores.length === 0 ? (
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-500 flex items-center justify-between">
                <span>No scores logged yet. Add your rounds to generate your 5 draw numbers.</span>
                <Link href="/dashboard/scores">
                  <Button size="sm" variant="outline" className="text-xs rounded-xl">
                    Log Scores
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2.5">
                {scores.map((s, idx) => (
                  <div
                    key={s.id || idx}
                    className="w-12 h-12 rounded-2xl bg-slate-900 text-white font-black flex items-center justify-center text-base shadow-xs"
                  >
                    {s.stableford_score}
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Prize Pool Rules Recap */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs text-center">
          <div className="text-3xl font-black text-slate-900">40%</div>
          <div className="font-bold text-sm text-slate-900 mt-1">5-Match Jackpot</div>
          <p className="text-xs text-slate-400 mt-1">Rolls over if unclaimed</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs text-center">
          <div className="text-3xl font-black text-emerald-700">35%</div>
          <div className="font-bold text-sm text-slate-900 mt-1">4-Match Major</div>
          <p className="text-xs text-slate-400 mt-1">Split equally among winners</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs text-center">
          <div className="text-3xl font-black text-slate-700">25%</div>
          <div className="font-bold text-sm text-slate-900 mt-1">3-Match Bonus</div>
          <p className="text-xs text-slate-400 mt-1">Split equally among winners</p>
        </div>
      </div>

      {/* Historical Participations */}
      <Card className="rounded-2xl border-slate-200/80 shadow-xs bg-white">
        <CardHeader>
          <h3 className="text-lg font-bold text-slate-900">Your Past Draw Participations</h3>
          <p className="text-xs text-slate-500">
            Immutable snapshot of scores and drawn numbers for every historical round.
          </p>
        </CardHeader>
        <CardContent>
          {participations.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-sm">
              No historical draw records found. Your entries will appear here after your first monthly draw runs.
            </div>
          ) : (
            <div className="space-y-3">
              {participations.map((part) => (
                <div
                  key={part.id}
                  className="p-4 rounded-xl border border-slate-200/80 bg-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                >
                  <div>
                    <div className="font-bold text-slate-900 text-sm">
                      Draw Period: {part.draws?.draw_period || "Monthly Draw"}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Numbers Played:{" "}
                      <span className="font-mono font-bold text-slate-800">
                        {part.draw_numbers ? part.draw_numbers.join(", ") : "N/A"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {part.is_winner ? (
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-full border border-emerald-200">
                        ★ {part.match_count} Matches (Winner!)
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-slate-200 text-slate-700 text-xs rounded-full font-medium">
                        Completed
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

