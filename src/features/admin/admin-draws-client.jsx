"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function AdminDrawsClient({ initialDraws }) {
  const [draws, setDraws] = useState(initialDraws || []);
  const [showForm, setShowForm] = useState(false);
  const [newDraw, setNewDraw] = useState({
    draw_period: "",
    strategy_type: "random",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!initialDraws) {
      fetchDraws();
    }
  }, [initialDraws]);

  const fetchDraws = async () => {
    try {
      const response = await fetch("/api/admin/draws");
      if (response.ok) {
        const data = await response.json();
        setDraws(data);
      }
    } catch (error) {
      console.error("Error fetching draws:", error);
    }
  };

  const statusColors = {
    configured: "bg-blue-100 text-blue-700",
    simulated: "bg-amber-100 text-amber-700",
    published: "bg-green-100 text-green-700",
    completed: "bg-gray-100 text-gray-700",
  };

  const handleCreateDraw = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/draws", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDraw),
      });

      if (response.ok) {
        const draw = await response.json();
        setDraws([draw, ...draws]);
        setShowForm(false);
        setNewDraw({ draw_period: "", strategy_type: "random" });
      }
    } catch (error) {
      console.error("Error creating draw:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulate = async (drawId) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/draws/${drawId}/simulate`, {
        method: "POST",
      });

      if (response.ok) {
        const { draw } = await response.json();
        setDraws(draws.map((d) => (d.id === drawId ? draw : d)));
      }
    } catch (error) {
      console.error("Error simulating draw:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (drawId) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/draws/${drawId}/publish`, {
        method: "POST",
      });

      if (response.ok) {
        const draw = await response.json();
        setDraws(draws.map((d) => (d.id === drawId ? draw : d)));
      }
    } catch (error) {
      console.error("Error publishing draw:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin" className="text-sm text-blue-600 hover:underline mb-2 block">
            ← Back to Admin
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Draw Management</h1>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Create Draw"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Create New Draw</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="month"
              placeholder="Draw Period (YYYY-MM)"
              value={newDraw.draw_period}
              onChange={(e) => setNewDraw({ ...newDraw, draw_period: e.target.value })}
            />
            <select
              value={newDraw.strategy_type}
              onChange={(e) =>
                setNewDraw({
                  ...newDraw,
                  strategy_type: e.target.value,
                })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
            >
              <option value="random">Random</option>
              <option value="algorithmic">Algorithmic (Weighted by Score Frequency)</option>
            </select>
            <Button onClick={handleCreateDraw} disabled={loading}>
              {loading ? "Creating..." : "Create Draw"}
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {draws.map((draw) => (
          <Card key={draw.id}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">{draw.draw_period}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[draw.status]}`}>
                      {draw.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>Strategy: {draw.strategy_type}</span>
                    {draw.winning_numbers && (
                      <span>
                        Winning Numbers: {draw.winning_numbers.join(", ")}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {draw.status === "configured" && (
                    <Button onClick={() => handleSimulate(draw.id)} disabled={loading}>
                      Simulate
                    </Button>
                  )}
                  {draw.status === "simulated" && (
                    <Button onClick={() => handlePublish(draw.id)} disabled={loading}>
                      Publish
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {draws.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No draws yet. Create your first draw to get started.
          </div>
        )}
      </div>
    </div>
  );
}
