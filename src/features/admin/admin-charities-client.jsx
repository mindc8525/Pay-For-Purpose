"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function AdminCharitiesClient({ initialCharities }) {
  const [charities, setCharities] = useState(initialCharities || []);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [newCharity, setNewCharity] = useState({
    name: "",
    description: "",
    website_url: "",
  });

  useEffect(() => {
    if (!initialCharities) {
      fetchCharities();
    }
  }, [initialCharities]);

  const fetchCharities = async () => {
    try {
      const response = await fetch("/api/admin/charities");
      if (response.ok) {
        const data = await response.json();
        setCharities(data);
      }
    } catch (error) {
      console.error("Error fetching charities:", error);
    }
  };

  const filteredCharities = charities.filter(
    (charity) =>
      charity.name?.toLowerCase().includes(search.toLowerCase()) ||
      charity.description?.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async () => {
    try {
      const response = await fetch("/api/admin/charities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCharity),
      });
      
      if (response.ok) {
        const created = await response.json();
        setCharities([created, ...charities]);
        setShowForm(false);
        setNewCharity({ name: "", description: "", website_url: "" });
      }
    } catch (error) {
      console.error("Error creating charity:", error);
    }
  };

  const handleToggleActive = async (id, isActive) => {
    try {
      const response = await fetch(`/api/admin/charities/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !isActive }),
      });
      
      if (response.ok) {
        setCharities(
          charities.map((c) =>
            c.id === id ? { ...c, is_active: !isActive } : c
          )
        );
      }
    } catch (error) {
      console.error("Error toggling charity:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin" className="text-sm text-blue-600 hover:underline mb-2 block">
            ← Back to Admin
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Charity Management</h1>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Add Charity"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">New Charity</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Charity Name"
              value={newCharity.name}
              onChange={(e) => setNewCharity({ ...newCharity, name: e.target.value })}
            />
            <textarea
              placeholder="Description"
              value={newCharity.description}
              onChange={(e) => setNewCharity({ ...newCharity, description: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
            <Input
              placeholder="Website URL (optional)"
              value={newCharity.website_url}
              onChange={(e) => setNewCharity({ ...newCharity, website_url: e.target.value })}
            />
            <Button onClick={handleCreate}>Create Charity</Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <Input
            placeholder="Search charities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md"
          />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredCharities.map((charity) => (
              <div
                key={charity.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{charity.name}</h3>
                    {charity.is_featured && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                        Featured
                      </span>
                    )}
                    {!charity.is_active && (
                      <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs rounded-full">
                        Inactive
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{charity.description}</p>
                </div>
                <Button
                  variant={charity.is_active ? "ghost" : "default"}
                  size="sm"
                  onClick={() => handleToggleActive(charity.id, charity.is_active)}
                >
                  {charity.is_active ? "Deactivate" : "Activate"}
                </Button>
              </div>
            ))}

            {filteredCharities.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No charities found
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
