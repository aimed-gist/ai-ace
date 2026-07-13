import Link from "next/link";
import opportunities from "@/data/opportunities.json";
import opportunitiesMd from "@/data/opportunities-md.json";

type Opportunity = {
  id: string;
  slug?: string;
  title: string;
  type?: string;
  deadline?: string;
  summary?: string;
  description?: string;
  contact?: string;
  active: boolean;
  requirements?: string[];
  pinned?: boolean;
  source?: string;
};

const typeLabels: Record<string, string> = {
  fellowship: "Fellowship",
  position: "Position",
  intern: "Intern",
  other: "Other",
};

function sortOpportunities(arr: Opportunity[]) {
  return arr.sort((a, b) => {
    const pa = a.pinned ? 1 : 0;
    const pb = b.pinned ? 1 : 0;
    if (pa !== pb) return pb - pa;
    const da = a.deadline || "9999-12-31";
    const db = b.deadline || "9999-12-31";
    if (da !== db) return da.localeCompare(db);
    return a.title.localeCompare(b.title);
  });
}

export default function OpportunitiesPage() {
  const combined = [
    ...(opportunities as Opportunity[]),
    ...(opportunitiesMd as Opportunity[]),
  ];
  const items = sortOpportunities(combined.filter((o) => o.active));

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold text-primary-dark mb-2">
        Opportunities
      </h1>
      <p className="text-text-muted mb-10">
        Join our team. Explore fellowship and career opportunities.
      </p>

      <div className="space-y-4">
        {items.map((opp) => (
          <OpportunityListCard key={opp.id} opp={opp} />
        ))}
      </div>

      {items.length === 0 && (
        <p className="text-center text-gray-400 py-16">
          No open positions at this time. Check back later.
        </p>
      )}
    </div>
  );
}

function OpportunityListCard({ opp }: { opp: Opportunity }) {
  const typeLabel = opp.type ? typeLabels[opp.type] || opp.type : "";
  const hasDeadline = !!opp.deadline;
  const isMd = opp.source === "md" && !!opp.slug;
  // 요약 텍스트: summary 우선, 없으면 description 첫 부분
  const summary =
    (opp.summary && opp.summary.trim()) ||
    (opp.description || "").split(/\n\n/)[0] ||
    "";

  const cardInner = (
    <div
      className={`p-6 rounded-2xl border transition-all duration-300 group ${
        opp.pinned
          ? "border-rose-300 bg-rose-50/30 hover:shadow-lg"
          : "border-gray-100 hover:border-accent/30 hover:shadow-md"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            {opp.pinned && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-rose-500 text-white rounded">
                📌 Pinned
              </span>
            )}
            {typeLabel && (
              <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-accent/10 text-accent uppercase">
                {typeLabel}
              </span>
            )}
          </div>
          <h2
            className={`text-xl font-bold leading-snug ${
              isMd
                ? "text-primary-dark group-hover:text-accent transition-colors"
                : "text-primary-dark"
            }`}
          >
            {opp.title}
          </h2>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs text-gray-400">
            {hasDeadline ? "Deadline" : "Status"}
          </p>
          <p className="text-sm font-semibold text-gray-700">
            {hasDeadline ? opp.deadline : "Open (rolling)"}
          </p>
        </div>
      </div>

      {summary && (
        <p className="text-sm text-gray-500 line-clamp-2">{summary}</p>
      )}

      {isMd && (
        <p className="mt-3 text-xs text-accent font-medium">
          자세히 보기 →
        </p>
      )}
    </div>
  );

  if (isMd) {
    return (
      <Link href={`/opportunities/${opp.slug}`} className="block">
        {cardInner}
      </Link>
    );
  }
  return cardInner;
}
