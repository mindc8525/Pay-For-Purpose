"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function AdminUsersClient({ initialUsers }) {
  const [users, setUsers] = useState(initialUsers || []);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    if (!initialUsers) {
      fetchUsers();
    }
  }, [initialUsers]);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.email?.toLowerCase().includes(search.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(search.toLowerCase())
  );

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
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <Input
            placeholder="Search by email or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md"
          />
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Email</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Role</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Created</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-slate-100 hover:bg-gray-50/80 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-900">{user.email}</td>
                    <td className="py-3 px-4 text-slate-600">{user.full_name || "—"}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide ${
                          user.role === "ADMIN"
                            ? "bg-purple-100 text-purple-700 border border-purple-200"
                            : "bg-slate-100 text-slate-700 border border-slate-200"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}
                    </td>
                    <td className="py-3 px-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedUser(user)}
                        className="text-xs font-semibold text-slate-700 hover:text-slate-900 border-slate-200 hover:bg-slate-100"
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredUsers.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No users found matching &ldquo;{search}&rdquo;
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center font-bold text-emerald-800 text-lg">
                  {selectedUser.full_name?.charAt(0) || selectedUser.email?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {selectedUser.full_name || "Platform Member"}
                  </h3>
                  <p className="text-xs text-slate-500">{selectedUser.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-slate-400 hover:text-slate-600 w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-lg font-bold transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Profile Meta */}
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">User Role</span>
                <span className="font-bold text-slate-800 uppercase">{selectedUser.role}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Joined Date</span>
                <span className="font-semibold text-slate-700">
                  {selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleDateString() : "—"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">User ID</span>
                <span className="font-mono text-[11px] text-slate-600 truncate block">{selectedUser.id}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Account Status</span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Verified Member
                </span>
              </div>
            </div>

            {/* Subscriptions section */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Subscription Information
              </h4>
              {selectedUser.subscriptions && selectedUser.subscriptions.length > 0 ? (
                <div className="space-y-2">
                  {selectedUser.subscriptions.map((sub, idx) => (
                    <div
                      key={sub.id || idx}
                      className="p-3 bg-emerald-50/60 border border-emerald-200/80 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-emerald-900">
                          {sub.plan_id === "2" ? "Annual Supporter Plan" : "Active Member Subscription"}
                        </div>
                        <div className="text-emerald-700 text-[11px]">
                          Renews: {sub.current_period_end ? new Date(sub.current_period_end).toLocaleDateString() : "Active"}
                        </div>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 uppercase">
                        {sub.status || "Active"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-500">
                  No active subscription plan attached.
                </div>
              )}
            </div>

            {/* Recent Rounds / Scores section */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Submitted Scores ({selectedUser.scores?.length || 0} Rounds)
              </h4>
              {selectedUser.scores && selectedUser.scores.length > 0 ? (
                <div className="border border-slate-200/80 rounded-xl overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-600">
                        <th className="text-left py-2 px-3 font-semibold">Date</th>
                        <th className="text-right py-2 px-3 font-semibold">Stableford Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedUser.scores.map((score, idx) => (
                        <tr key={score.id || idx} className="border-b border-slate-100 last:border-0">
                          <td className="py-2 px-3 text-slate-700 font-mono">{score.score_date || "—"}</td>
                          <td className="py-2 px-3 text-right font-bold text-slate-900">
                            {score.stableford_score} pts
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-500">
                  No competition rounds submitted yet.
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedUser(null)}
                className="text-xs font-medium"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
