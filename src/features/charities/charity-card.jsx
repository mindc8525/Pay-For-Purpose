"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export function CharityCard({ preference, charities = [], onUpdate }) {
  const [selectedCharity, setSelectedCharity] = useState(preference?.charity_id || "");
  const [contribution, setContribution] = useState(preference?.contribution_percentage || 10);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (preference?.charity_id) {
      setSelectedCharity(preference.charity_id);
    }
    if (preference?.contribution_percentage) {
      setContribution(preference.contribution_percentage);
    }
  }, [preference]);

  const handleSave = async () => {
    if (!selectedCharity) {
      setError("Please choose a partner charity from the list.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/me/charity", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          charity_id: selectedCharity,
          contribution_percentage: Number(contribution),
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to update charity preference");
      }

      setSaved(true);
      onUpdate?.();
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error("Error saving charity preference:", err);
      setError(err instanceof Error ? err.message : "Failed to save charity preference");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="rounded-2xl border-slate-200/80 shadow-xs bg-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Charity Selection</h2>
            <p className="text-sm text-slate-500">
              Choose a partner charity and allocate your contribution percentage (min 10%).
            </p>
          </div>
          {saved && (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-3 py-1 rounded-full animate-in fade-in">
              ✓ Saved Successfully
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label htmlFor="charitySelect" className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
            Supported Partner Organization
          </label>
          <select
            id="charitySelect"
            value={selectedCharity}
            onChange={(e) => {
              setSelectedCharity(e.target.value);
              setError(null);
            }}
            className="w-full px-4 py-3 bg-white text-slate-900 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 shadow-2xs font-medium text-sm"
          >
            <option value="">Select a partner charity...</option>
            {charities.map((charity) => (
              <option key={charity.id} value={charity.id}>
                {charity.name}
              </option>
            ))}
          </select>
        </div>

        {selectedCharity && (
          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-slate-700">
                  Prize Contribution Share (min 10%)
                </label>
                <span className="text-sm font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-lg">
                  {contribution}%
                </span>
              </div>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={contribution}
                  onChange={(e) => setContribution(Number(e.target.value))}
                  className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Guarantees at least 10% of any monthly draw prize won goes directly to your selected charity.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                {error}
              </div>
            )}

            <Button
              onClick={handleSave}
              disabled={loading}
              className={`w-full py-3 rounded-xl font-semibold shadow-xs text-sm transition-all ${
                saved
                  ? "bg-emerald-700 hover:bg-emerald-800 text-white"
                  : "bg-slate-900 hover:bg-slate-800 text-white"
              }`}
            >
              {loading ? "Saving..." : saved ? "✓ Preferences Saved!" : "Save Preferences"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

