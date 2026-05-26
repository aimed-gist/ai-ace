"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import NewsCard from "@/components/NewsCard";
import newsData from "@/data/news.json";
import opportunities from "@/data/opportunities.json";

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
  category: string;
  title: string;
  date: string;
  summary: string;
  link: string;
  image: string;
};

type Opportunity = {
  id: string;
  title: string;
  type?: string;
  deadline?: string;
  description?: string;
  contact?: string;
  active: boolean;
};

/**
 * 활성 Opportunity → NewsItem 어댑터.
 * Notice 카테고리에 자동으로 함께 노출됨.
 * 카드 클릭 시 /opportunities 페이지로 이동.
 */
function opportunityToNewsItem(opp: Opportunity): NewsItem {
  const dateLabel = opp.deadline ? `마감 ${opp.deadline}` : "상시 모집";
  return {
    id: `${opp.id}-as-notice`,
    category: "opportunity",
    title: opp.title,
    date: dateLabel,
    summary: opp.description || "",
    link: "/opportunities",
    image: "",
  };
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

  // 활성 채용공고를 Notice 카테고리에 자동 추가
  const opportunityNoticeItems: NewsItem[] = useMemo(() => {
    return (opportunities as Opportunity[])
      .filter((o) => o.active)
      .map(opportunityToNewsItem);
  }, []);

  const filtered: NewsItem[] = useMemo(() => {
    const news = newsData as NewsItem[];
    if (activeCategory === "all") {
      // All: 모든 뉴스 + 활성 채용공고
      return [...news, ...opportunityNoticeItems].sort(sortByDateDesc);
    }
    if (activeCategory === "notice") {
      // Notice: notice 카테고리 + 활성 채용공고
      const notices = news.filter((n) => n.category === "notice");
      return [...notices, ...opportunityNoticeItems].sort(sortByDateDesc);
    }
    return news.filter((n) => n.category === activeCategory).sort(sortByDateDesc);
  }, [activeCategory, opportunityNoticeItems]);

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold text-primary-dark mb-2">
        News & Updates
      </h1>
      <p className="text-text-muted mb-8">
        Notices, media coverage, and Co-Lab events.
      </p>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-10">
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

function sortByDateDesc(a: NewsItem, b: NewsItem) {
  // 날짜 문자열 비교 (YYYY-MM-DD 형식이면 사전식 정렬 = 시간순)
  // "마감 ..." 같은 포맷은 그대로 두고 끝으로 밀림
  const da = a.date || "";
  const db = b.date || "";
  if (db !== da) return db.localeCompare(da);
  return a.title.localeCompare(b.title);
}

export default function NewsPage() {
  return (
    <Suspense fallback={null}>
      <NewsPageInner />
    </Suspense>
  );
}
