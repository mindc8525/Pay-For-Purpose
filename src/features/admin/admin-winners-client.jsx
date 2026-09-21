"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function AdminWinnersClient({ initialWinners }) {
  const [winners, setWinners] = useState(initialWinners || []);
  const [activeProofModal, setActiveProofModal] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);

  useEffect(() => {
    if (!initialWinners) {
      fetchWinners();
    }
  }, [initialWinners]);

  const fetchWinners = async () => {
    try {
      const response = await fetch("/api/admin/winners");
      if (response.ok) {
        const data = await response.json();
        setWinners(data);
      }
    } catch (error) {
      console.error("Error fetching winners:", error);
    }
  };

  const verificationColors = {
    pending: "bg-amber-100 text-amber-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
  };

  const payoutColors = {
    pending: "bg-amber-100 text-amber-700",
    paid: "bg-green-100 text-green-700",
  };

  const handleVerify = async (winnerId, status) => {
    try {
      const response = await fetch(`/api/admin/winners/${winnerId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        const winner = await response.json();
        setWinners(winners.map((w) => (w.id === winnerId ? { ...w, ...winner } : w)));
        setActionMessage(`Winner successfully marked as ${status}.`);
        setTimeout(() => setActionMessage(null), 3000);
        if (activeProofModal?.id === winnerId) {
          setActiveProofModal(null);
        }
      }
    } catch (error) {
      console.error("Error verifying winner:", error);
    }
  };

  const handleMarkPaid = async (winnerId) => {
    try {
      const response = await fetch(`/api/admin/winners/${winnerId}/payout`, {
        method: "POST",
      });

      if (response.ok) {
        const winner = await response.json();
        setWinners(winners.map((w) => (w.id === winnerId ? { ...w, ...winner } : w)));
        setActionMessage("Payout successfully recorded as Paid.");
        setTimeout(() => setActionMessage(null), 3000);
      } else {
        const data = await response.json();
        alert(data.error || "Failed to mark payout as paid");
      }
    } catch (error) {
      console.error("Error marking payout:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Link href="/admin" className="text-sm text-blue-600 hover:underline mb-2 block">
            ← Back to Admin
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Winner Verification & Payout Tracking</h1>
        </div>
        <Button variant="outline" size="sm" onClick={fetchWinners}>
          Refresh List
        </Button>
      </div>

      {actionMessage && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm font-medium">
          {actionMessage}
        </div>
      )}

      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">User</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Draw</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Match</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Prize</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Proof Screenshot</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Verification</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Payout</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {winners.map((winner) => (
                  <tr key={winner.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-gray-900">{winner.users?.full_name || "User"}</div>
                        <div className="text-xs text-gray-500">{winner.users?.email}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-sm">{winner.draws?.draw_period || "—"}</td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                        {winner.match_type}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-gray-900">
                      ${Number(winner.calculated_prize).toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      {winner.proof_url ? (
                        <button
                          onClick={() => setActiveProofModal(winner)}
                          className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                        >
                          📄 View Proof
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400 italic">No proof uploaded</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                          verificationColors[winner.verification_status] || "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {winner.verification_status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                          payoutColors[winner.payout_status] || "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {winner.payout_status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {winner.verification_status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleVerify(winner.id, "approved")}
                              className="text-green-600 border-green-200 hover:bg-green-50 text-xs"
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleVerify(winner.id, "rejected")}
                              className="text-red-600 border-red-200 hover:bg-red-50 text-xs"
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {winner.verification_status === "approved" &&
                          winner.payout_status === "pending" && (
                            <Button
                              size="sm"
                              onClick={() => handleMarkPaid(winner.id)}
                              className="bg-green-600 hover:bg-green-700 text-white text-xs"
                            >
                              Mark Paid
                            </Button>
                          )}
                        {winner.payout_status === "paid" && (
                          <span className="text-xs text-green-600 font-medium">✓ Settled</span>
                        )}
                        {winner.verification_status === "rejected" && (
                          <span className="text-xs text-red-600 font-medium">Rejected</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {winners.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No winners generated yet. Publish a draw to see winners and track payouts.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Proof Modal */}
      {activeProofModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Proof Verification: {activeProofModal.users?.full_name || activeProofModal.users?.email}
                </h3>
                <p className="text-xs text-gray-500">
                  {activeProofModal.match_type} • Prize: ${Number(activeProofModal.calculated_prize).toFixed(2)}
                </p>
              </div>
              <button
                onClick={() => setActiveProofModal(null)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <div className="border border-gray-200 rounded-lg p-2 bg-gray-50 flex items-center justify-center min-h-[250px]">
              {activeProofModal.proof_url?.startsWith("data:application/pdf") ? (
                <div className="text-center p-6 space-y-2">
                  <p className="text-sm font-medium text-gray-700">Uploaded PDF Document</p>
                  <a
                    href={activeProofModal.proof_url}
                    download="winner-score-proof.pdf"
                    className="inline-block px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg"
                  >
                    Download PDF Proof
                  </a>
                </div>
              ) : activeProofModal.proof_url ? (
                <img
                  src={activeProofModal.proof_url}
                  alt="Winner score proof"
                  className="max-h-[500px] w-auto object-contain rounded"
                />
              ) : (
                <p className="text-sm text-gray-400">No preview available</p>
              )}
            </div>

            <div className="flex justify-between items-center pt-2">
              <div className="text-xs text-gray-500">
                Current Status: <span className="font-semibold uppercase">{activeProofModal.verification_status}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleVerify(activeProofModal.id, "rejected")}
                  className="text-red-600 border-red-200 hover:bg-red-50 text-xs"
                >
                  Reject Proof
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleVerify(activeProofModal.id, "approved")}
                  className="bg-green-600 hover:bg-green-700 text-white text-xs"
                >
                  Approve Proof
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
