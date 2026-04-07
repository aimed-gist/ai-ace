"use client";

import { useState } from "react";
import NewsCard from "@/components/NewsCard";
import newsData from "@/data/news.json";

const categories = [
  { key: "all", label: "All" },
  { key: "news", label: "News" },
  { key: "notices", label: "Notices" },
  { key: "newsletter", label: "Newsletter" },
  { key: "workshop", label: "Workshop" },
];

export default function NewsPage() {
  const [activeCategory, setActiveCategory] = useState("all");

  const filtered =
    activeCategory === "all"
      ? newsData
      : newsData.filter((n) => n.category === activeCategory);

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold text-primary-dark mb-2">
        News & Updates
      </h1>
      <p className="text-text-muted mb-8">
        Latest news, notices, newsletters, and workshop announcements.
      </p>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-10">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeCategory === cat.key
                ? "bg-accent text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map((item) => (
          <NewsCard key={item.id} item={item} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-gray-400 py-16">
          No items in this category yet.
        </p>
      )}
    </div>
  );
}
