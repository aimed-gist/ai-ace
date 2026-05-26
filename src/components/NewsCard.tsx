"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

interface NewsItem {
  id: string;
  title: string;
  date: string;
  summary: string;
  image: string;
  link: string;
  category: string;
}

const categoryLabels: Record<string, string> = {
  notice: "Notice",
  media: "Media Coverage",
  "co-lab": "Co-Lab",
  opportunity: "채용공고",
  // 구 카테고리 호환 (혹시 남아있을 경우)
  news: "News",
  notices: "Notice",
  newsletter: "Media",
  workshop: "Co-Lab",
};

const categoryColors: Record<string, string> = {
  notice: "bg-amber-100 text-amber-700",
  media: "bg-blue-100 text-blue-700",
  "co-lab": "bg-purple-100 text-purple-700",
  opportunity: "bg-rose-100 text-rose-700",
  news: "bg-blue-100 text-blue-700",
  notices: "bg-amber-100 text-amber-700",
  newsletter: "bg-blue-100 text-blue-700",
  workshop: "bg-purple-100 text-purple-700",
};

function isExternalLink(href: string) {
  return /^https?:\/\//i.test(href);
}

export default function NewsCard({ item }: { item: NewsItem }) {
  const [imageFailed, setImageFailed] = useState(false);
  const hasImage = !!item.image && !imageFailed;
  const imageSrc = item.image ? `${basePath}${item.image}` : "";

  const label = categoryLabels[item.category] || item.category;
  const color = categoryColors[item.category] || "bg-gray-100 text-gray-600";

  const cardInner = (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 h-full flex flex-col">
      <div className="aspect-video relative overflow-hidden">
        {hasImage ? (
          <Image
            src={imageSrc}
            alt={item.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <NewsPlaceholder category={item.category} />
        )}
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${color}`}>
            {label}
          </span>
          {item.date && (
            <span className="text-xs text-gray-400">{item.date}</span>
          )}
        </div>
        <h3 className="font-bold text-gray-900 group-hover:text-accent transition-colors line-clamp-2 leading-snug">
          {item.title}
        </h3>
        {item.summary && (
          <p className="text-sm text-gray-500 mt-2 line-clamp-3 flex-1">{item.summary}</p>
        )}
      </div>
    </div>
  );

  // 링크가 없으면 클릭 불가 (Co-Lab 사진 카드 등)
  if (!item.link) {
    return <div className="group block h-full">{cardInner}</div>;
  }

  // 외부 링크
  if (isExternalLink(item.link)) {
    return (
      <a
        href={item.link}
        target="_blank"
        rel="noopener noreferrer"
        className="group block h-full"
      >
        {cardInner}
      </a>
    );
  }

  // 내부 라우트 (/opportunities 등)
  return (
    <Link href={item.link} className="group block h-full">
      {cardInner}
    </Link>
  );
}

function NewsPlaceholder({ category }: { category: string }) {
  // 카테고리별 그라데이션 + 아이콘
  const gradients: Record<string, string> = {
    notice: "from-amber-400/30 to-orange-500/30",
    media: "from-blue-400/30 to-indigo-500/30",
    "co-lab": "from-purple-400/30 to-pink-500/30",
    opportunity: "from-rose-400/30 to-red-500/30",
  };
  const gradient = gradients[category] || "from-gray-300/30 to-gray-400/30";

  return (
    <div
      className={`absolute inset-0 bg-gradient-to-br ${gradient} flex items-center justify-center`}
    >
      <CategoryIcon category={category} />
    </div>
  );
}

function CategoryIcon({ category }: { category: string }) {
  const common = "w-12 h-12 text-white/70";
  if (category === "media" || category === "newsletter") {
    // 신문 아이콘
    return (
      <svg className={common} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
      </svg>
    );
  }
  if (category === "co-lab" || category === "workshop") {
    // 사람들/그룹 아이콘
    return (
      <svg className={common} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    );
  }
  if (category === "opportunity") {
    // 가방/직업 아이콘
    return (
      <svg className={common} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.16 2.16 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
      </svg>
    );
  }
  // Notice 또는 기본 — 메가폰
  return (
    <svg className={common} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" />
    </svg>
  );
}
