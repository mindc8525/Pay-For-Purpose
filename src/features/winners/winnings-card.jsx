"use client";

import { useState } from "react";
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

  if (!winnings || winnings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <h2 className="text-xl font-bold">Your Winnings</h2>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            No winnings yet. Keep your 5 scores updated and participate in the monthly draws!
          </div>
        </CardContent>
      </Card>
    );
  }

  const statusColors = {
    pending: "bg-amber-100 text-amber-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
  };

  const payoutColors = {
    pending: "bg-amber-100 text-amber-700",
    paid: "bg-green-100 text-green-700",
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

      setUploadSuccess("Proof submitted successfully! Admin will verify shortly.");
      setWinnings(
        winnings.map((w) =>
          w.id === winnerId
            ? { ...w, proof_url: data.winner.proof_url, verification_status: "pending" }
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Your Winnings & Prizes</h2>
          <span className="text-sm font-semibold text-teal-700 bg-teal-50 px-3 py-1 rounded-full">
            {winnings.length} {winnings.length === 1 ? "Win" : "Wins"}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {winnings.map((winning) => (
          <div
            key={winning.id}
            className="p-4 bg-gray-50 border border-gray-100 rounded-xl space-y-3"
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="font-bold text-2xl text-gray-900">
                  ${Number(winning.calculated_prize).toFixed(2)}
                </span>
                <span className="ml-2 inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                  {winning.match_type}
                </span>
              </div>
              <div className="flex gap-2">
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                    statusColors[winning.verification_status] || "bg-gray-100 text-gray-600"
                  }`}
                >
                  Verification: {winning.verification_status}
                </span>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                    payoutColors[winning.payout_status] || "bg-gray-100 text-gray-600"
                  }`}
                >
                  Payout: {winning.payout_status}
                </span>
              </div>
            </div>

            <div className="text-sm text-gray-500">
              Draw Period: <span className="font-medium text-gray-700">{winning.draws?.draw_period || "Current"}</span>
            </div>

            {/* Proof Upload Area */}
            {uploadingWinnerId === winning.id ? (
              <div className="p-4 bg-white border border-blue-200 rounded-lg space-y-3 mt-2">
                <h4 className="text-sm font-semibold text-gray-900">
                  Upload Official Golf Platform Scorecard / Screenshot
                </h4>
                <p className="text-xs text-gray-500">
                  Please provide screenshot proof of the Stableford scores submitted for this round (JPEG, PNG, WebP or PDF, max 5MB).
                </p>

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />

                {previewUrl && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-1">Preview:</p>
                    <img
                      src={previewUrl}
                      alt="Proof preview"
                      className="h-32 object-contain rounded border border-gray-200"
                    />
                  </div>
                )}

                {uploadError && (
                  <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                    {uploadError}
                  </div>
                )}

                {uploadSuccess && (
                  <div className="text-xs text-green-700 bg-green-50 p-2 rounded font-medium">
                    {uploadSuccess}
                  </div>
                )}

                <div className="flex gap-2 justify-end">
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
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleUploadProof(winning.id)}
                    disabled={isSubmitting || !selectedFile}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isSubmitting ? "Uploading..." : "Submit Proof"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between pt-2 border-t border-gray-200/60">
                {winning.proof_url ? (
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-green-700 bg-green-50 px-2.5 py-1 rounded font-medium flex items-center gap-1">
                      ✓ Proof Uploaded
                    </span>
                    <button
                      onClick={() => setUploadingWinnerId(winning.id)}
                      className="text-xs text-blue-600 hover:underline font-medium"
                    >
                      Replace Proof
                    </button>
                  </div>
                ) : (
                  <div className="text-xs text-amber-700 bg-amber-50 px-2.5 py-1 rounded font-medium">
                    ⚠️ Score verification required before payout
                  </div>
                )}

                {!winning.proof_url && winning.verification_status !== "approved" && (
                  <Button
                    size="sm"
                    onClick={() => setUploadingWinnerId(winning.id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
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
