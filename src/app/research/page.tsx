"use client";

import { useState } from "react";
import papers from "@/data/papers.json";

const tabs = [
  { key: "publications", label: "Publications", type: "publication" },
  { key: "patents", label: "Patents", type: "patent" },
];

export default function ResearchPage() {
  const [activeTab, setActiveTab] = useState("publications");
  const activeType = tabs.find((t) => t.key === activeTab)?.type || "publication";
  const filtered = papers.filter((p) => p.type === activeType);

  const years = [...new Set(filtered.map((p) => p.year))].sort((a, b) => b - a);

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold text-primary-dark mb-2">Research</h1>
      <p className="text-text-muted mb-8">
        Our publications, patents, and research contributions.
      </p>

      {/* Tabs */}
      <div className="flex gap-1 mb-10 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.key
                ? "border-accent text-accent"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Papers by year */}
      {years.map((year) => (
        <div key={year} className="mb-10">
          <h2 className="text-2xl font-bold text-primary-dark mb-4">{year}</h2>
          <div className="space-y-4">
            {filtered
              .filter((p) => p.year === year)
              .map((paper) => (
                <div
                  key={paper.id}
                  className="p-6 rounded-xl border border-gray-100 hover:border-accent/30 hover:shadow-md transition-all duration-300"
                >
                  <h3 className="font-bold text-gray-900 mb-2">{paper.title}</h3>
                  <p className="text-sm text-gray-500 mb-1">
                    {paper.authors.join(", ")}
                  </p>
                  <p className="text-sm text-accent font-medium">
                    {paper.journal}
                  </p>
                  {paper.abstract && (
                    <p className="text-sm text-gray-400 mt-2 line-clamp-2">
                      {paper.abstract}
                    </p>
                  )}
                  {paper.doi && (
                    <p className="text-xs text-gray-400 mt-2">
                      DOI: {paper.doi}
                    </p>
                  )}
                </div>
              ))}
          </div>
        </div>
      ))}

      {filtered.length === 0 && (
        <p className="text-center text-gray-400 py-16">
          No items in this category yet.
        </p>
      )}
    </div>
  );
}
