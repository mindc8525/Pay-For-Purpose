"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function CharityActionButton({
  charityId,
  charityName,
  isAuthenticated = false,
  hasActiveSubscription = false,
  isCurrentCause = false,
  currentPercentage = 10,
  variant = "primary", // "primary" | "banner" | "card"
  className = "",
  onSelected,
}) {
  const router = useRouter();
  const [selected, setSelected] = useState(isCurrentCause);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleClick = async (e) => {
    e.preventDefault();

    // 1. Unauthenticated users -> Go to signup with cause preselected
    if (!isAuthenticated) {
      router.push(`/signup?charity=${encodeURIComponent(charityId)}`);
      return;
    }

    // 2. Authenticated but inactive subscription -> Go to subscription activation
    if (!hasActiveSubscription) {
      router.push(`/subscribe?charity=${encodeURIComponent(charityId)}`);
      return;
    }

    // 3. Authenticated active member: Already supporting this cause -> Go to dashboard charity management
    if (selected) {
      router.push("/dashboard/charity");
      return;
    }

    // 4. Authenticated active member: Switch/Select this cause directly!
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/me/charity", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          charity_id: charityId,
          contribution_percentage: Number(currentPercentage) || 10,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to update charity preference");
      }

      setSelected(true);
      setMessage("Saved!");
      onSelected?.(charityId);
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error("Error setting charity:", err);
      // Fallback: navigate to dashboard charity page with query param
      router.push(`/dashboard/charity?charity=${encodeURIComponent(charityId)}`);
    } finally {
      setLoading(false);
    }
  };

  // Rendering for Card variant (used on /charities directory)
  if (variant === "card") {
    if (selected) {
      return (
        <Link href="/dashboard/charity">
          <Button
            size="sm"
            variant="outline"
            className="text-xs font-semibold text-emerald-700 bg-emerald-50 border-emerald-300 hover:bg-emerald-100 transition-colors shadow-2xs"
          >
            ✓ Supporting
          </Button>
        </Link>
      );
    }

    return (
      <Button
        size="sm"
        onClick={handleClick}
        disabled={loading}
        className={`text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white shadow-2xs transition-colors ${className}`}
      >
        {loading ? "Selecting..." : message ? "✓ Saved" : "Support"}
      </Button>
    );
  }

  // Rendering for Banner variant (used in the green impact card on /charities/[id])
  if (variant === "banner") {
    if (selected) {
      return (
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-xs">
            <svg className="w-4 h-4 text-emerald-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            Your Active Cause
          </span>
          <Link href="/dashboard/charity">
            <Button variant="outline" className="bg-white border-emerald-300 text-emerald-900 hover:bg-emerald-100/70 text-xs font-semibold rounded-xl">
              Adjust Percentage →
            </Button>
          </Link>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-end gap-2">
        <Button
          onClick={handleClick}
          disabled={loading}
          className={`bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-xs font-semibold text-sm px-6 py-2.5 ${className}`}
        >
          {loading ? "Selecting Cause..." : message ? "✓ Cause Selected!" : isAuthenticated && hasActiveSubscription ? "Select as My Cause" : "Choose as My Cause"}
        </Button>
        {message && (
          <span className="text-xs font-semibold text-emerald-800 animate-in fade-in">
            Now supporting {charityName}!
          </span>
        )}
      </div>
    );
  }

  // Default / Primary variant (used in the top bar on /charities/[id])
  if (selected) {
    return (
      <Link href="/dashboard/charity">
        <Button
          variant="outline"
          className="border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded-xl text-sm font-semibold shadow-2xs"
        >
          ✓ Active Cause (Manage)
        </Button>
      </Link>
    );
  }

  return (
    <Button
      onClick={handleClick}
      disabled={loading}
      className={`bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-xs font-medium text-sm ${className}`}
    >
      {loading ? "Updating..." : message ? "✓ Selected" : isAuthenticated && hasActiveSubscription ? "Select as My Cause" : "Support This Cause"}
    </Button>
  );
}
