"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function CharitiesClient({ initialCharities = [] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const filteredCharities = initialCharities.filter((charity) => {
    const matchesSearch =
      charity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      charity.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = activeFilter === "all" || (activeFilter === "featured" && charity.is_featured);

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-8">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="relative w-full sm:w-96">
          <Input
            type="text"
            placeholder="Search charities by name or cause..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-4 pr-10 py-2 border-gray-200"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant={activeFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter("all")}
            className={activeFilter === "all" ? "bg-blue-600 text-white" : ""}
          >
            All Charities ({initialCharities.length})
          </Button>
          <Button
            variant={activeFilter === "featured" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter("featured")}
            className={activeFilter === "featured" ? "bg-teal-600 text-white" : ""}
          >
            ★ Featured
          </Button>
        </div>
      </div>

      {/* Grid of Charities */}
      {filteredCharities.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 p-8">
          <div className="text-3xl mb-2">🔍</div>
          <h3 className="text-lg font-bold text-gray-800">No charities match your search</h3>
          <p className="text-sm text-gray-500 mt-1">Try clearing your filters or search term.</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchTerm("");
              setActiveFilter("all");
            }}
            className="mt-4"
          >
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCharities.map((charity) => (
            <Card
              key={charity.id}
              className="group overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col bg-white rounded-2xl"
            >
              <div className="relative h-48 w-full bg-gradient-to-br from-blue-600 to-teal-500 overflow-hidden">
                {charity.image_url ? (
                  <img
                    src={charity.image_url}
                    alt={charity.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                {charity.is_featured && (
                  <span className="absolute top-3 left-3 bg-teal-500 text-white text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow">
                    ★ Featured
                  </span>
                )}
                <h3 className="absolute bottom-3 left-4 right-4 text-white text-xl font-bold truncate drop-shadow">
                  {charity.name}
                </h3>
              </div>

              <CardContent className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                  {charity.description}
                </p>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
                  <Link href={`/charities/${charity.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full text-xs font-semibold">
                      Learn More & Events
                    </Button>
                  </Link>
                  <Link href={`/subscribe?charity=${charity.id}`}>
                    <Button
                      size="sm"
                      className="text-xs font-semibold bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white"
                    >
                      Support
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
