"use client";

import { useState } from "react";
import MemberCard from "@/components/MemberCard";
import members from "@/data/members.json";

const tabs = [
  { key: "mentors", label: "Mentors", role: "mentor" },
  { key: "postdoc", label: "Post Doc", role: "postdoc" },
  { key: "alumni", label: "Alumni", role: "alumni" },
];

export default function MembersPage() {
  const [activeTab, setActiveTab] = useState("mentors");
  const activeRole = tabs.find((t) => t.key === activeTab)?.role || "mentor";
  const filtered = members.filter((m) => m.role === activeRole);

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold text-primary-dark mb-2">Members</h1>
      <p className="text-text-muted mb-8">
        Meet our team of researchers, mentors, and alumni.
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

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filtered.map((member) => (
          <MemberCard key={member.id} member={member} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-gray-400 py-16">
          No members in this category yet.
        </p>
      )}
    </div>
  );
}
