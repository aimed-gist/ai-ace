"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import NewsCard from "@/components/NewsCard";
import newsData from "@/data/news.json";
import noticesMdData from "@/data/notices-md.json";
import opportunities from "@/data/opportunities.json";
import opportunitiesMd from "@/data/opportunities-md.json";

const categories = [
  { key: "all", label: "All" },
  { key: "notice", label: "Notice" },
  { key: "media", label: "Media Coverage" },
  { key: "co-lab", label: "Co-Lab" },
];

const TAB_KEYS = categories.map((c) => c.key);
const DEFAULT_TAB = "all";

type NewsItem = {
  id: string;
  slug?: string;
  category: string;
  title: string;
  date: string;
  summary: string;
  body?: string;
  link: string;
  externalLink?: string;
  image: string;
  pinned?: boolean;
  source?: string;
};

type Opportunity = {
  id: string;
  slug?: string;
  title: string;
  type?: string;
  deadline?: string;
  description?: string;
  summary?: string;
  contact?: string;
  active: boolean;
  pinned?: boolean;
  source?: string;
};

function opportunityToNewsItem(opp: Opportunity): NewsItem {
  const dateLabel = opp.deadline ? `마감 ${opp.deadline}` : "상시 모집";
  // MD 소스면 개별 상세 페이지로, sheet 소스면 목록 페이지로
  const link = opp.source === "md" && opp.slug
    ? `/opportunities/${opp.slug}`
    : "/opportunities";
  const summary =
    (opp.summary && opp.summary.trim()) ||
    (opp.description || "").split(/\n\n/)[0] ||
    "";
  return {
    id: `${opp.id}-as-notice`,
    category: "opportunity",
    title: opp.title,
    date: dateLabel,
    summary,
    link,
    image: "",
    pinned: opp.pinned === true,
  };
}

/**
 * MD 소스 Notice면 상세 페이지 링크로 변환.
 * sheet 소스는 원본 link(외부) 그대로 유지.
 */
function normalizeNoticeLink(n: NewsItem): NewsItem {
  if (n.source === "md" && n.slug) {
    return { ...n, link: `/notices/${n.slug}` };
  }
  return n;
}

/**
 * pinned 우선 → 날짜 내림차순 → 제목
 */
function sortPinnedThenDate(a: NewsItem, b: NewsItem) {
  const pa = a.pinned ? 1 : 0;
  const pb = b.pinned ? 1 : 0;
  if (pa !== pb) return pb - pa;
  const da = a.date || "";
  const db = b.date || "";
  if (db !== da) return db.localeCompare(da);
  return a.title.localeCompare(b.title);
}

function NewsPageInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get("tab");
  const initialTab =
    tabFromUrl && TAB_KEYS.includes(tabFromUrl) ? tabFromUrl : DEFAULT_TAB;
  const [activeCategory, setActiveCategory] = useState(initialTab);

  useEffect(() => {
    if (tabFromUrl && TAB_KEYS.includes(tabFromUrl)) {
      if (tabFromUrl !== activeCategory) setActiveCategory(tabFromUrl);
    } else if (!tabFromUrl && activeCategory !== DEFAULT_TAB) {
      setActiveCategory(DEFAULT_TAB);
    }
  }, [tabFromUrl, activeCategory]);

  const handleTabClick = (key: string) => {
    setActiveCategory(key);
    router.replace(`${pathname}?tab=${key}`, { scroll: false });
  };

  // 활성 채용공고를 Notice/All에 자동 추가 (sheet + md 병합)
  const opportunityNoticeItems: NewsItem[] = useMemo(() => {
    const combined = [
      ...(opportunities as Opportunity[]),
      ...(opportunitiesMd as Opportunity[]),
    ];
    return combined.filter((o) => o.active).map(opportunityToNewsItem);
  }, []);

  // Notice 카테고리는 sheet + md 병합. MD는 상세 페이지 링크로 변환.
  const allNoticeItems: NewsItem[] = useMemo(() => {
    const sheet = (newsData as NewsItem[]).filter((n) => n.category === "notice");
    const md = (noticesMdData as NewsItem[]).map(normalizeNoticeLink);
    return [...sheet, ...md];
  }, []);

  const filtered: NewsItem[] = useMemo(() => {
    const news = newsData as NewsItem[];
    if (activeCategory === "all") {
      const other = news.filter((n) => n.category !== "notice");
      return [
        ...allNoticeItems,
        ...other,
        ...opportunityNoticeItems,
      ].sort(sortPinnedThenDate);
    }
    if (activeCategory === "notice") {
      return [
        ...allNoticeItems,
        ...opportunityNoticeItems,
      ].sort(sortPinnedThenDate);
    }
    return news
      .filter((n) => n.category === activeCategory)
      .sort(sortPinnedThenDate);
  }, [activeCategory, opportunityNoticeItems, allNoticeItems]);

  const pinnedCount = filtered.filter((f) => f.pinned).length;

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold text-primary-dark mb-2">
        News & Updates
      </h1>
      <p className="text-text-muted mb-8">
        Notices, media coverage, and Co-Lab events.
      </p>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => handleTabClick(cat.key)}
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

      {pinnedCount > 0 && (
        <p className="text-xs text-gray-400 mb-4">
          📌 {pinnedCount}건의 주요 공지가 상단에 고정되어 있습니다
        </p>
      )}

      {/* Grid — 3열, 최대 3행(9개)까지 보이고 나머지는 스크롤 */}
      <div className="border border-gray-100 rounded-2xl p-2">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[calc(3*22rem+2*1.5rem+1rem)] overflow-y-auto px-2 py-2 scroll-smooth">
          {filtered.map((item) => (
            <div key={item.id} className="relative h-full">
              {item.pinned && (
                <div className="absolute top-2 right-2 z-10 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-rose-500 text-white rounded shadow">
                  📌 Pinned
                </div>
              )}
              <NewsCard item={item} />
            </div>
          ))}
        </div>
        {filtered.length > 9 && (
          <p className="text-center text-xs text-gray-400 py-3">
            {filtered.length - 9}건 더 있음 — 스크롤하여 확인하세요
          </p>
        )}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-gray-400 py-16">
          No items in this category yet.
        </p>
      )}
    </div>
  );
}

export default function NewsPage() {
  return (
    <Suspense fallback={null}>
      <NewsPageInner />
    </Suspense>
  );
}
