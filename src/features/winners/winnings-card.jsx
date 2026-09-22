"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function WinningsCard({ winnings: initialWinnings = [], onUpdate }) {
  const [winnings, setWinnings] = useState(initialWinnings || []);
  const [uploadingWinnerId, setUploadingWinnerId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(null);

  useEffect(() => {
    setWinnings(initialWinnings || []);
  }, [initialWinnings]);

  if (!winnings || winnings.length === 0) {
    return (
      <Card className="rounded-2xl border-slate-200/80 shadow-xs bg-white">
        <CardHeader>
          <h2 className="text-xl font-bold text-slate-900">Your Winnings & Prizes</h2>
        </CardHeader>
        <CardContent>
          <div className="text-center py-10 text-slate-500">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-lg">
              🏆
            </div>
            <h4 className="font-semibold text-slate-800 text-sm">No winnings logged yet</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              Keep your 5 rounds updated to automatically enter into every monthly cash draw!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const statusColors = {
    pending: "bg-amber-50 text-amber-800 border-amber-200/80",
    approved: "bg-emerald-50 text-emerald-800 border-emerald-200/80",
    rejected: "bg-rose-50 text-rose-800 border-rose-200/80",
  };

  const payoutColors = {
    pending: "bg-slate-100 text-slate-700 border-slate-200",
    paid: "bg-emerald-50 text-emerald-800 border-emerald-200/80",
  };

  const handleFileChange = (e) => {
    setUploadError(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        setUploadError("File size must be less than 5MB");
        return;
      }
      setSelectedFile(file);
      if (file.type.startsWith("image/")) {
        setPreviewUrl(URL.createObjectURL(file));
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const handleUploadProof = async (winnerId) => {
    if (!selectedFile) {
      setUploadError("Please select a proof file or screenshot");
      return;
    }

    setIsSubmitting(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch(`/api/winners/${winnerId}/proof`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to upload proof");
      }

      setUploadSuccess("Proof submitted successfully! Admin will review and verify.");
      setWinnings(
        winnings.map((w) =>
          w.id === winnerId
            ? { ...w, proof_url: data.winner?.proof_url || "uploaded", verification_status: "pending" }
            : w
        )
      );

      setTimeout(() => {
        setUploadingWinnerId(null);
        setSelectedFile(null);
        setPreviewUrl(null);
        setUploadSuccess(null);
        onUpdate?.();
      }, 1500);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Error uploading proof");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="rounded-2xl border-slate-200/80 shadow-xs bg-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Your Winnings & Prizes</h2>
            <p className="text-sm text-slate-500">Official monthly draw prizes and payout records</p>
          </div>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-3 py-1 rounded-full">
            {winnings.length} {winnings.length === 1 ? "Win" : "Wins"}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {winnings.map((winning) => (
          <div
            key={winning.id}
            className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-3"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div className="flex items-center gap-2.5">
                <span className="font-black text-2xl text-slate-900">
                  ${Number(winning.calculated_prize).toFixed(2)}
                </span>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-900 text-white uppercase tracking-wider">
                  {winning.match_type}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize border ${
                    statusColors[winning.verification_status] || "bg-slate-100 text-slate-700 border-slate-200"
                  }`}
                >
                  Verification: {winning.verification_status}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize border ${
                    payoutColors[winning.payout_status] || "bg-slate-100 text-slate-700 border-slate-200"
                  }`}
                >
                  Payout: {winning.payout_status}
                </span>
              </div>
            </div>

            <div className="text-xs text-slate-500 font-medium">
              Draw Period: <span className="font-bold text-slate-700">{winning.draws?.draw_period || "Monthly Event"}</span>
            </div>

            {/* Proof Upload Area */}
            {uploadingWinnerId === winning.id ? (
              <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3 mt-2 shadow-2xs">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Upload Official Handicap Scorecard / Screenshot
                </h4>
                <p className="text-xs text-slate-500">
                  Please provide screenshot proof of the Stableford scores submitted for this round (JPEG, PNG, WebP or PDF, max 5MB).
                </p>

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  onChange={handleFileChange}
                  className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-800 hover:file:bg-slate-200 cursor-pointer"
                />

                {previewUrl && (
                  <div className="mt-2">
                    <p className="text-xs text-slate-500 mb-1">Preview:</p>
                    <img
                      src={previewUrl}
                      alt="Proof preview"
                      className="h-32 object-contain rounded-xl border border-slate-200"
                    />
                  </div>
                )}

                {uploadError && (
                  <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 p-2.5 rounded-xl">
                    {uploadError}
                  </div>
                )}

                {uploadSuccess && (
                  <div className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl font-medium">
                    {uploadSuccess}
                  </div>
                )}

                <div className="flex gap-2 justify-end pt-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setUploadingWinnerId(null);
                      setSelectedFile(null);
                      setPreviewUrl(null);
                      setUploadError(null);
                    }}
                    disabled={isSubmitting}
                    className="text-xs rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleUploadProof(winning.id)}
                    disabled={isSubmitting || !selectedFile}
                    className="bg-slate-900 hover:bg-slate-800 text-white text-xs rounded-xl"
                  >
                    {isSubmitting ? "Uploading..." : "Submit Proof"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between pt-2 border-t border-slate-200/80">
                {winning.proof_url ? (
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1">
                      {winning.verification_status === "approved"
                        ? "✓ Verification Approved"
                        : "✓ Scorecard Proof Submitted"}
                    </span>
                    {winning.verification_status !== "approved" && (
                      <button
                        onClick={() => setUploadingWinnerId(winning.id)}
                        className="text-xs text-slate-600 hover:text-slate-900 font-medium underline"
                      >
                        Update Proof
                      </button>
                    )}
                  </div>
                ) : (

                  <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200/60 px-2.5 py-1 rounded-lg font-medium">
                    ⚠️ Official scorecard upload required before payout
                  </div>
                )}

                {!winning.proof_url && winning.verification_status !== "approved" && (
                  <Button
                    size="sm"
                    onClick={() => setUploadingWinnerId(winning.id)}
                    className="bg-slate-900 hover:bg-slate-800 text-white text-xs rounded-xl font-semibold shadow-2xs"
                  >
                    Upload Scorecard Proof
                  </Button>
                )}
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

