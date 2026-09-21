"use client";

import { useEffect, useState } from "react";
import { ScoreManagement } from "@/features/scores/score-management";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function ScoresPageClient() {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchScores = async () => {
    try {
      const res = await fetch("/api/scores");
      if (res.ok) {
        const data = await res.json();
        setScores(data);
      }
    } catch (err) {
      console.error("Failed to load scores:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScores();
  }, []);

  if (loading) {
    return (
      <div className="py-12 text-center text-gray-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
        Loading your score records...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ScoreManagement initialScores={scores} onScoreUpdate={fetchScores} />

      {/* Rules Invariant Explainer Card */}
      <Card className="bg-emerald-50/50 border-emerald-100/80 rounded-2xl">
        <CardHeader>
          <h3 className="text-base font-bold text-emerald-950">How Stableford Scores Work in Par For Purpose</h3>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-emerald-900/80">
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Stableford Range:</strong> Valid scores range from 1 through 45 points inclusive.</li>
            <li><strong>One Score Per Date:</strong> Each round date must be unique. You can edit or delete an existing date&apos;s score.</li>
            <li><strong>Rolling 5 Retention:</strong> The system automatically maintains your latest 5 rounds in reverse chronological order. When a 6th round is submitted, the oldest score rolls off.</li>
            <li><strong>Draw Numbers:</strong> These 5 scores represent your 5 active entry numbers for the monthly prize pool draw!</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
