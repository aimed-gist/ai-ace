"use client";

import Link from "next/link";
import { useState } from "react";

const navItems = [
  {
    label: "Members",
    href: "/members",
    sub: [
      { label: "Mentors", href: "/members?tab=mentors" },
      { label: "Global Mentors", href: "/members?tab=global_mentors" },
      { label: "InnoCORE Fellows", href: "/members?tab=fellows" },
      { label: "Alumni", href: "/members?tab=alumni" },
    ],
  },
  {
    label: "Research",
    href: "/research",
    sub: [
      { label: "Publications", href: "/research?tab=publications" },
      { label: "Patents", href: "/research?tab=patents" },
    ],
  },
  { label: "AI Demos", href: "/demos" },
  {
    label: "News",
    href: "/news",
    sub: [
      { label: "News", href: "/news?tab=news" },
      { label: "Notices", href: "/news?tab=notices" },
      { label: "Newsletter", href: "/news?tab=newsletter" },
      { label: "Workshop", href: "/news?tab=workshop" },
    ],
  },
  { label: "Opportunities", href: "/opportunities" },
  { label: "Industry Advisory", href: "/partners?tab=advisory" },
  { label: "Partners", href: "/partners" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-primary-dark/90 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-white">AI-ACE</span>
            <span className="text-sm text-accent-light">@GIST</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <div
                key={item.label}
                className="relative group"
                onMouseEnter={() => setOpenDropdown(item.label)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <Link
                  href={item.href}
                  className="px-3 py-2 text-sm text-text-light hover:text-accent-light transition-colors"
                >
                  {item.label}
                </Link>
                {item.sub && openDropdown === item.label && (
                  <div className="absolute top-full left-0 bg-primary-dark/95 backdrop-blur-md rounded-md shadow-lg py-2 min-w-[160px] border border-white/10">
                    {item.sub.map((sub) => (
                      <Link
                        key={sub.label}
                        href={sub.href}
                        className="block px-4 py-2 text-sm text-text-light hover:text-accent-light hover:bg-white/5 transition-colors"
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Mobile toggle */}
          <button
            className="lg:hidden text-white p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-primary-dark/95 backdrop-blur-md border-t border-white/10">
          <div className="px-4 py-3 space-y-1">
            {navItems.map((item) => (
              <div key={item.label}>
                <Link
                  href={item.href}
                  className="block px-3 py-2 text-text-light hover:text-accent-light"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
                {item.sub && (
                  <div className="pl-6">
                    {item.sub.map((sub) => (
                      <Link
                        key={sub.label}
                        href={sub.href}
                        className="block px-3 py-1.5 text-sm text-text-muted hover:text-accent-light"
                        onClick={() => setMobileOpen(false)}
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
