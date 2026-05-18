"use client";

import { useState } from "react";
import papers from "@/data/papers.json";

type Paper = {
  id: string;
  title: string;
  authors: string[];
  journal: string;
  year: number | null;
  doi: string;
  type: string;
  pi?: string;
  division?: string;
  featured?: boolean;
  note?: string;
  abstract?: string;
};

const tabs = [
  { key: "publications", label: "Publications", types: ["publication", "preprint"] },
  { key: "patents", label: "Patents", types: ["patent"] },
];

function doiLink(doi: string) {
  if (!doi) return null;
  if (doi.startsWith("http")) return doi;
  // patent numbers like "KR-10-..." 는 doi.org 형식이 아니므로 링크 생성 안 함
  if (!/^10\.\d{4,9}\//.test(doi)) return null;
  return `https://doi.org/${doi}`;
}

export default function ResearchPage() {
  const [activeTab, setActiveTab] = useState("publications");
  const activeTypes = tabs.find((t) => t.key === activeTab)?.types ?? ["publication"];
  const filtered = (papers as Paper[]).filter((p) => activeTypes.includes(p.type));

  const years = [...new Set(filtered.map((p) => p.year ?? 0))]
    .filter((y) => y > 0)
    .sort((a, b) => b - a);
  const undated = filtered.filter((p) => !p.year);

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
                <PaperCard key={paper.id} paper={paper} />
              ))}
          </div>
        </div>
      ))}

      {undated.length > 0 && (
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-primary-dark mb-4">Undated</h2>
          <div className="space-y-4">
            {undated.map((paper) => (
              <PaperCard key={paper.id} paper={paper} />
            ))}
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <p className="text-center text-gray-400 py-16">
          No items in this category yet.
        </p>
      )}
    </div>
  );
}

function PaperCard({ paper }: { paper: Paper }) {
  const link = doiLink(paper.doi);

  return (
    <div
      className={`p-6 rounded-xl border transition-all duration-300 ${
        paper.featured
          ? "border-accent/40 bg-accent/[0.02] hover:shadow-lg"
          : "border-gray-100 hover:border-accent/30 hover:shadow-md"
      }`}
    >
      <div className="flex items-start gap-2 mb-2 flex-wrap">
        {paper.featured && (
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-accent text-white rounded">
            Featured
          </span>
        )}
        {paper.type === "preprint" && (
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-gray-200 text-gray-700 rounded">
            Preprint
          </span>
        )}
        {paper.division && (
          <span className="text-[10px] font-medium px-2 py-0.5 bg-primary/5 text-primary rounded">
            {paper.division}
          </span>
        )}
      </div>

      <h3 className="font-bold text-gray-900 mb-2 leading-snug">
        {link ? (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-accent transition-colors"
          >
            {paper.title}
          </a>
        ) : (
          paper.title
        )}
      </h3>

      {paper.authors.length > 0 && (
        <p className="text-sm text-gray-500 mb-1">{paper.authors.join(", ")}</p>
      )}

      {paper.journal && (
        <p className="text-sm text-accent font-medium">{paper.journal}</p>
      )}

      {paper.abstract && (
        <p className="text-sm text-gray-400 mt-2 line-clamp-2">{paper.abstract}</p>
      )}

      {paper.doi && (
        <p className="text-xs text-gray-400 mt-2">
          {link ? (
            <>
              DOI:{" "}
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-accent"
              >
                {paper.doi}
              </a>
            </>
          ) : (
            <>{paper.type === "patent" ? "No.: " : "DOI: "}{paper.doi}</>
          )}
        </p>
      )}
    </div>
  );
}
