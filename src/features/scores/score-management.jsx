"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ScoreManagement({ initialScores = [], onScoreUpdate }) {
  const [scores, setScores] = useState(initialScores || []);
  const [scoreDate, setScoreDate] = useState("");
  const [stablefordScore, setStablefordScore] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setScores(initialScores || []);
  }, [initialScores]);


  // Edit State
  const [editingScoreId, setEditingScoreId] = useState(null);
  const [editDate, setEditDate] = useState("");
  const [editScore, setEditScore] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  const handleAddScore = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const scoreNum = parseInt(stablefordScore, 10);
    if (isNaN(scoreNum) || scoreNum < 1 || scoreNum > 45) {
      setError("Stableford score must be an integer between 1 and 45.");
      return;
    }

    if (!scoreDate) {
      setError("Please select a score date.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          score_date: scoreDate,
          stableford_score: scoreNum,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to add score");
      }

      // Fetch fresh scores list to ensure rolling 5 consistency
      const freshRes = await fetch("/api/scores");
      if (freshRes.ok) {
        const freshScores = await freshRes.json();
        setScores(freshScores);
      } else {
        setScores([data, ...scores].slice(0, 5));
      }

      setScoreDate("");
      setStablefordScore("");
      setSuccess("Score added successfully!");
      setTimeout(() => setSuccess(null), 3000);
      onScoreUpdate?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (score) => {
    setEditingScoreId(score.id);
    setEditDate(score.score_date.split("T")[0]);
    setEditScore(score.stableford_score.toString());
    setError(null);
  };

  const handleCancelEdit = () => {
    setEditingScoreId(null);
    setEditDate("");
    setEditScore("");
  };

  const handleSaveEdit = async (scoreId) => {
    const scoreNum = parseInt(editScore, 10);
    if (isNaN(scoreNum) || scoreNum < 1 || scoreNum > 45) {
      setError("Score must be between 1 and 45.");
      return;
    }

    setEditLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/scores/${scoreId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          score_date: editDate,
          stableford_score: scoreNum,
        }),
      });

      const updated = await response.json();

      if (!response.ok) {
        throw new Error(updated.error || "Failed to update score");
      }

      setScores(scores.map((s) => (s.id === scoreId ? updated : s)));
      setEditingScoreId(null);
      setSuccess("Score updated successfully!");
      setTimeout(() => setSuccess(null), 3000);
      onScoreUpdate?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update score");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteScore = async (id) => {
    if (!confirm("Are you sure you want to remove this score?")) return;

    try {
      const response = await fetch(`/api/scores/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete score");
      }

      setScores(scores.filter((s) => s.id !== id));
      onScoreUpdate?.();
    } catch (err) {
      console.error("Error deleting score:", err);
      setError("Failed to delete score");
    }
  };

  return (
    <Card className="rounded-2xl border-slate-200/80 shadow-xs">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Golf Score Tracker</h2>
            <p className="text-sm text-slate-500">
              Maintain your latest 5 Stableford scores (1–45 points). Your newest scores are used for the monthly draw numbers!
            </p>
          </div>
          <div className="shrink-0 self-start sm:self-auto">
            <span className="inline-flex items-center text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-3 py-1 rounded-full whitespace-nowrap">
              {scores.length}/5 Scores Active
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Add Score Form */}
        <form onSubmit={handleAddScore} className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-3">
          <h3 className="text-sm font-bold text-slate-800">Add New Round Score</h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label htmlFor="scoreDate" className="block text-xs font-medium text-slate-600 mb-1">
                Round Date
              </label>
              <Input
                id="scoreDate"
                type="date"
                value={scoreDate}
                onChange={(e) => setScoreDate(e.target.value)}
                required
                className="bg-white border-slate-300 rounded-xl"
              />
            </div>
            <div className="w-full sm:w-36">
              <label htmlFor="stablefordScore" className="block text-xs font-medium text-slate-600 mb-1">
                Stableford (1-45)
              </label>
              <Input
                id="stablefordScore"
                type="number"
                placeholder="e.g. 36"
                value={stablefordScore}
                onChange={(e) => setStablefordScore(e.target.value)}
                min="1"
                max="45"
                required
                className="bg-white border-slate-300 rounded-xl"
              />
            </div>
            <div className="flex items-end">
              <Button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs px-5 py-2.5 h-10 shadow-xs"
              >
                {loading ? "Adding..." : "Add Score"}
              </Button>
            </div>
          </div>


          {scores.length >= 5 && (
            <p className="text-xs text-amber-600 font-medium">
              ℹ️ You have 5 scores stored. Adding this new score will automatically drop your oldest recorded round.
            </p>
          )}
        </form>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 font-medium">
            {success}
          </div>
        )}

        {/* Scores List */}
        {scores.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-gray-200 rounded-xl">
            <div className="w-12 h-12 mx-auto mb-3 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg">
              ⛳
            </div>
            <h4 className="text-base font-semibold text-gray-900">No scores logged yet</h4>
            <p className="text-sm text-gray-500 max-w-sm mx-auto mt-1">
              Add your recent Stableford scores from your official golf rounds to enter the monthly prize draw.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs font-semibold uppercase text-gray-500 tracking-wider px-2">
              <span>Recent Rounds (Newest First)</span>
              <span>Stableford Points</span>
            </div>

            {scores.map((score, index) => (
              <div
                key={score.id}
                className="p-3.5 bg-white border border-slate-200/80 shadow-2xs rounded-xl flex items-center justify-between hover:border-slate-300 transition-colors"
              >
                {editingScoreId === score.id ? (
                  <div className="flex-1 flex flex-col sm:flex-row gap-2 items-center">
                    <Input
                      type="date"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      className="text-sm w-full sm:w-44 border-slate-300 rounded-xl"
                    />
                    <Input
                      type="number"
                      value={editScore}
                      onChange={(e) => setEditScore(e.target.value)}
                      min="1"
                      max="45"
                      className="text-sm w-full sm:w-24 border-slate-300 rounded-xl"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleSaveEdit(score.id)}
                        disabled={editLoading}
                        className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs rounded-xl"
                      >
                        {editLoading ? "..." : "Save"}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleCancelEdit}
                        className="text-xs text-slate-600 hover:text-slate-900 rounded-xl"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center border border-slate-200">
                        #{index + 1}
                      </span>
                      <div>
                        <div className="font-semibold text-slate-900">
                          {new Date(score.score_date).toLocaleDateString("en-US", {
                            weekday: "short",
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                        <div className="text-xs text-slate-500">Official Stableford Round</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-xl font-black text-emerald-800 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200/60">
                        {score.stableford_score} <span className="text-xs text-emerald-600 font-semibold">pts</span>
                      </span>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStartEdit(score)}
                          className="text-slate-600 hover:text-slate-900 text-xs px-2 rounded-lg"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteScore(score.id)}
                          className="text-slate-400 hover:text-rose-600 text-xs px-2 rounded-lg"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>

            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
