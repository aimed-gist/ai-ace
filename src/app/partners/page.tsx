"use client";

import { useState } from "react";
import Image from "next/image";
import partners from "@/data/partners.json";

const tabs = [
  { key: "all", label: "All" },
  { key: "university", label: "University" },
  { key: "industry", label: "Industry" },
];

export default function PartnersPage() {
  const [activeTab, setActiveTab] = useState("all");
  const filtered =
    activeTab === "all"
      ? partners
      : partners.filter((p) => p.type === activeTab);

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold text-primary-dark mb-2">Partners</h1>
      <p className="text-text-muted mb-8">
        Our academic and industry collaboration network.
      </p>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-10">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-accent text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {filtered.map((partner) => (
          <a
            key={partner.id}
            href={partner.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group p-6 rounded-xl border border-gray-100 hover:border-accent/30 hover:shadow-lg transition-all duration-300 flex flex-col items-center gap-4"
          >
            <div className="w-full aspect-[5/2] relative">
              <Image
                src={partner.logo}
                alt={partner.name}
                fill
                className="object-contain grayscale group-hover:grayscale-0 transition-all duration-300"
              />
            </div>
            <div className="text-center">
              <p className="font-medium text-gray-800 text-sm">
                {partner.name}
              </p>
              <p className="text-xs text-gray-400 capitalize">{partner.type}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
