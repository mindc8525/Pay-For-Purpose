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
      <div className="py-12 text-center text-gray-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-3"></div>
        Loading draw history...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Active Entry Card */}
      <Card className="border-l-4 border-l-blue-600 shadow-sm">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Next Scheduled Event
              </span>
              <h3 className="text-xl font-bold text-gray-900 mt-1">
                {upcomingDraw ? `Monthly Draw: ${upcomingDraw.draw_period}` : "Upcoming Monthly Draw"}
              </h3>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
              Entry Active
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            All active subscribers with logged Stableford scores are entered into the draw automatically.
          </p>

          <div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
              Your 5 Live Draw Numbers
            </span>
            {scores.length === 0 ? (
              <div className="p-4 bg-gray-50 rounded-xl text-xs text-gray-500 flex items-center justify-between">
                <span>No scores logged yet. Add your rounds to create your 5 draw numbers.</span>
                <Link href="/dashboard/scores">
                  <Button size="sm" variant="outline" className="text-xs">
                    Log Scores
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {scores.map((s, idx) => (
                  <div
                    key={s.id || idx}
                    className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-teal-500 text-white font-extrabold flex items-center justify-center text-base shadow-md"
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
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm text-center">
          <div className="text-2xl font-black text-blue-600">40%</div>
          <div className="font-bold text-sm text-gray-900 mt-1">5-Match Jackpot</div>
          <p className="text-xs text-gray-500 mt-1">Rolls over if unclaimed</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm text-center">
          <div className="text-2xl font-black text-teal-600">35%</div>
          <div className="font-bold text-sm text-gray-900 mt-1">4-Match Major</div>
          <p className="text-xs text-gray-500 mt-1">Split equally among winners</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm text-center">
          <div className="text-2xl font-black text-purple-600">25%</div>
          <div className="font-bold text-sm text-gray-900 mt-1">3-Match Bonus</div>
          <p className="text-xs text-gray-500 mt-1">Split equally among winners</p>
        </div>
      </div>

      {/* Historical Participations */}
      <Card className="shadow-sm">
        <CardHeader>
          <h3 className="text-lg font-bold text-gray-900">Your Past Draw Participations</h3>
          <p className="text-xs text-gray-500">
            Immutable snapshot of scores and drawn numbers for every historical round.
          </p>
        </CardHeader>
        <CardContent>
          {participations.length === 0 ? (
            <div className="text-center py-10 text-gray-500 text-sm">
              No historical draw records found. Your entries will appear here after your first monthly draw runs.
            </div>
          ) : (
            <div className="space-y-4">
              {participations.map((part) => (
                <div
                  key={part.id}
                  className="p-4 rounded-xl border border-gray-100 bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                >
                  <div>
                    <div className="font-bold text-gray-900">
                      Period: {part.draws?.draw_period || "Monthly Draw"}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Numbers Played:{" "}
                      <span className="font-mono font-semibold text-gray-700">
                        {part.draw_numbers ? part.draw_numbers.join(", ") : "N/A"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {part.is_winner ? (
                      <span className="px-3 py-1 bg-green-100 text-green-800 font-semibold text-xs rounded-full">
                        ★ {part.match_count} Matches (Winner!)
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded-full font-medium">
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
