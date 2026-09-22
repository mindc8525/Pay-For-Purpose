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
    strategy_type: "algorithmic",
  });
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

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
    configured: "bg-blue-50 text-blue-700 border border-blue-200",
    simulated: "bg-amber-50 text-amber-700 border border-amber-200",
    published: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    completed: "bg-slate-100 text-slate-700 border border-slate-200",
  };

  const handleCreateDraw = async () => {
    if (!newDraw.draw_period) {
      setErrorMessage("Please select a draw period month.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);
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
        setNewDraw({ draw_period: "", strategy_type: "algorithmic" });
        setActionMessage(`Draw for ${draw.draw_period} successfully created!`);
        setTimeout(() => setActionMessage(null), 4000);
      } else {
        const data = await response.json();
        setErrorMessage(data.error || "Failed to create draw");
      }
    } catch (error) {
      console.error("Error creating draw:", error);
      setErrorMessage("Network error creating draw");
    } finally {
      setLoading(false);
    }
  };

  const handleSimulate = async (drawId) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const response = await fetch(`/api/admin/draws/${drawId}/simulate`, {
        method: "POST",
      });

      if (response.ok) {
        const { draw } = await response.json();
        setDraws(draws.map((d) => (d.id === drawId ? draw : d)));
        setActionMessage(`Draw simulation completed with winning numbers: ${draw.winning_numbers?.join(", ")}`);
        setTimeout(() => setActionMessage(null), 5000);
      } else {
        const data = await response.json();
        setErrorMessage(data.error || "Failed to simulate draw");
      }
    } catch (error) {
      console.error("Error simulating draw:", error);
      setErrorMessage("Error simulating draw");
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (drawId) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const response = await fetch(`/api/admin/draws/${drawId}/publish`, {
        method: "POST",
      });

      if (response.ok) {
        const draw = await response.json();
        setDraws(draws.map((d) => (d.id === drawId ? draw : d)));
        setActionMessage("Draw has been officially published! Winners evaluated and notified.");
        setTimeout(() => setActionMessage(null), 5000);
      } else {
        const data = await response.json();
        setErrorMessage(data.error || "Failed to publish draw");
      }
    } catch (error) {
      console.error("Error publishing draw:", error);
      setErrorMessage("Error publishing draw");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 px-3.5 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs transition-all mb-4 group"
          >
            <svg
              className="w-3.5 h-3.5 text-slate-400 group-hover:-translate-x-0.5 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Admin</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Draw Management</h1>
        </div>
        <Button
          onClick={() => {
            setShowForm(!showForm);
            setErrorMessage(null);
          }}
          className={showForm ? "bg-slate-800 hover:bg-slate-900 text-white" : "bg-emerald-600 hover:bg-emerald-700 text-white"}
        >
          {showForm ? "Cancel" : "+ Create Draw"}
        </Button>
      </div>

      {actionMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <span>✓</span>
          <span>{actionMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <span>⚠</span>
          <span>{errorMessage}</span>
        </div>
      )}

      {showForm && (
        <Card className="rounded-2xl border-slate-200/80 shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">Create New Monthly Draw</h2>
            <p className="text-xs text-slate-500">Configure target draw period and number selection algorithm.</p>
          </CardHeader>
          <CardContent className="space-y-4 pt-5">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Draw Period (Month &amp; Year)
              </label>
              <Input
                type="month"
                placeholder="Draw Period (YYYY-MM)"
                value={newDraw.draw_period}
                onChange={(e) => setNewDraw({ ...newDraw, draw_period: e.target.value })}
                className="max-w-md"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Draw Strategy
              </label>
              <select
                value={newDraw.strategy_type}
                onChange={(e) =>
                  setNewDraw({
                    ...newDraw,
                    strategy_type: e.target.value,
                  })
                }
                className="max-w-md w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="algorithmic">Algorithmic (Weighted by Score Frequency)</option>
                <option value="random">Random Selection</option>
              </select>
            </div>
            <div className="pt-2">
              <Button
                onClick={handleCreateDraw}
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-xs"
              >
                {loading ? "Creating..." : "Create Draw"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {draws.map((draw) => (
          <Card key={draw.id} className="rounded-2xl border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-lg text-slate-900 font-mono">{draw.draw_period}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${statusColors[draw.status] || "bg-slate-100 text-slate-700"}`}>
                      {draw.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                    <span><strong className="text-slate-800">Strategy:</strong> {draw.strategy_type}</span>
                    <span><strong className="text-slate-800">Prize Pool:</strong> ${Number(draw.total_pool || 25000).toLocaleString()}</span>
                    {draw.winning_numbers && (
                      <span className="flex items-center gap-1.5">
                        <strong className="text-slate-800">Winning Numbers:</strong>
                        <span className="inline-flex gap-1">
                          {draw.winning_numbers.map((n) => (
                            <span key={n} className="w-5 h-5 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 flex items-center justify-center font-bold text-[10px]">
                              {n}
                            </span>
                          ))}
                        </span>
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {draw.status === "configured" && (
                    <Button
                      size="sm"
                      onClick={() => handleSimulate(draw.id)}
                      disabled={loading}
                      className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl shadow-xs"
                    >
                      {loading ? "Simulating..." : "Simulate Draw"}
                    </Button>
                  )}
                  {draw.status === "simulated" && (
                    <Button
                      size="sm"
                      onClick={() => handlePublish(draw.id)}
                      disabled={loading}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs"
                    >
                      {loading ? "Publishing..." : "Publish Draw"}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {draws.length === 0 && (
          <div className="text-center py-12 text-slate-400 bg-white rounded-2xl border border-slate-200/80">
            No draws yet. Create your first draw to get started.
          </div>
        )}
      </div>
    </div>
  );
}
