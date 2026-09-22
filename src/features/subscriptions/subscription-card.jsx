"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import Link from "next/link";

export function SubscriptionCard({ subscription }) {
  if (!subscription) {
    return (
      <Card className="rounded-2xl border-slate-200 shadow-xs bg-white">
        <CardHeader>
          <h2 className="text-xl font-bold text-slate-900">Subscription</h2>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 space-y-3">
            <p className="text-sm text-slate-600">You don&apos;t have an active subscription</p>
            <div>
              <Link href="/subscribe">
                <Button className="bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold py-2.5 px-4 shadow-xs">
                  Choose Membership Plan →
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const statusColors = {
    active: "bg-green-100 text-green-700",
    past_due: "bg-red-100 text-red-700",
    canceled: "bg-gray-100 text-gray-700",
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Subscription</h2>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[subscription.status] || statusColors.canceled}`}>
            {subscription.status}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Plan</span>
          <span className="font-medium">{subscription.plans?.name || "N/A"}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Renewal Date</span>
          <span className="font-medium">
            {format(new Date(subscription.current_period_end), "MMM d, yyyy")}
          </span>
        </div>
        {subscription.cancel_at_period_end && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
            Your subscription will end on{" "}
            {format(new Date(subscription.current_period_end), "MMM d, yyyy")}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
