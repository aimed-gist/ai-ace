"use client";

import { Suspense, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
  image?: string;
};

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const tabs = [
  { key: "publications", label: "Publications", types: ["publication", "preprint"] },
  { key: "patents", label: "Patents", types: ["patent"] },
];

const TAB_KEYS = tabs.map((t) => t.key);
const DEFAULT_TAB = "publications";

function doiLink(doi: string) {
  if (!doi) return null;
  if (doi.startsWith("http")) return doi;
  if (!/^10\.\d{4,9}\//.test(doi)) return null;
  return `https://doi.org/${doi}`;
}

function ResearchPageInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get("tab");
  const initialTab =
    tabFromUrl && TAB_KEYS.includes(tabFromUrl) ? tabFromUrl : DEFAULT_TAB;
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    if (tabFromUrl && TAB_KEYS.includes(tabFromUrl)) {
      if (tabFromUrl !== activeTab) setActiveTab(tabFromUrl);
    } else if (!tabFromUrl && activeTab !== DEFAULT_TAB) {
      setActiveTab(DEFAULT_TAB);
    }
  }, [tabFromUrl, activeTab]);

  const handleTabClick = (tabKey: string) => {
    setActiveTab(tabKey);
    router.replace(`${pathname}?tab=${tabKey}`, { scroll: false });
  };

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
            onClick={() => handleTabClick(tab.key)}
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

export default function ResearchPage() {
  return (
    <Suspense fallback={null}>
      <ResearchPageInner />
    </Suspense>
  );
}

function PaperCard({ paper }: { paper: Paper }) {
  const link = doiLink(paper.doi);
  // 이미지 로드 실패 시 placeholder로 폴백 (basePath 누락, 파일 없음, 손상된 파일 등 모두 커버)
  const [imageFailed, setImageFailed] = useState(false);

  // Patent는 이미지 영역 자체를 표시하지 않음 (텍스트만 전폭)
  const isPatent = paper.type === "patent";
  const showImage = !isPatent && !!paper.image && !imageFailed;
  const imageSrc = paper.image ? `${basePath}${paper.image}` : "";

  return (
    <div
      className={`rounded-xl border overflow-hidden transition-all duration-300 ${
        paper.featured
          ? "border-accent/40 bg-accent/[0.02] hover:shadow-lg"
          : "border-gray-100 hover:border-accent/30 hover:shadow-md"
      }`}
    >
      <div className="flex flex-col sm:flex-row">
        {/* 왼쪽 이미지 영역 (Patent는 생략) */}
        {!isPatent && (
          <div className="sm:w-1/3 sm:max-w-[260px] flex-shrink-0 relative bg-gray-50">
            <div className="aspect-[4/3] relative w-full">
              {showImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageSrc}
                  alt={paper.title}
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                  onError={() => setImageFailed(true)}
                />
              ) : (
                <PaperPlaceholder paper={paper} />
              )}
            </div>
          </div>
        )}

        {/* 오른쪽 텍스트 영역 */}
        <div className="p-5 sm:p-6 flex-1 min-w-0">
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
            <p className="text-xs text-gray-400 mt-2 break-all">
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
                <>
                  {paper.type === "patent" ? "No.: " : "DOI: "}
                  {paper.doi}
                </>
              )}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * 대표 이미지가 없을 때 자동 생성되는 placeholder.
 * 그라데이션 배경 + 논문 아이콘 + 저널명 (있으면) 표시.
 */
function PaperPlaceholder({ paper }: { paper: Paper }) {
  const label = paper.journal || (paper.type === "patent" ? "Patent" : "Publication");
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-gradient-to-br from-primary-dark via-primary to-primary-light text-white">
      <svg
        className="w-10 h-10 text-white/40 mb-2"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
        />
      </svg>
      <p className="text-[10px] sm:text-xs text-center text-white/80 line-clamp-2 font-medium">
        {label}
      </p>
    </div>
  );
}
