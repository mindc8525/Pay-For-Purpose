"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function CharityCard({ preference, charities = [] }) {
  const [selectedCharity, setSelectedCharity] = useState(preference?.charity_id || "");
  const [contribution, setContribution] = useState(preference?.contribution_percentage || 10);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/me/charity", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          charity_id: selectedCharity,
          contribution_percentage: contribution,
        }),
      });

      if (response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (error) {
      console.error("Error saving charity preference:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-bold">Charity Selection</h2>
        <p className="text-sm text-gray-600">
          Choose a charity and set your contribution percentage
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <select
          value={selectedCharity}
          onChange={(e) => setSelectedCharity(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select a charity...</option>
          {charities.map((charity) => (
            <option key={charity.id} value={charity.id}>
              {charity.name}
            </option>
          ))}
        </select>

        {selectedCharity && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contribution Percentage (min 10%)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={contribution}
                  onChange={(e) => setContribution(Number(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="w-16 text-center font-medium">{contribution}%</span>
              </div>
            </div>

            <Button onClick={handleSave} disabled={loading} className="w-full">
              {loading ? "Saving..." : saved ? "Saved!" : "Save Preferences"}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
