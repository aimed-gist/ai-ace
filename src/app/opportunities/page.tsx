import opportunities from "@/data/opportunities.json";
import opportunitiesMd from "@/data/opportunities-md.json";

type Opportunity = {
  id: string;
  title: string;
  type?: string;
  deadline?: string;
  description?: string;
  contact?: string;
  active: boolean;
  requirements?: string[];
  pinned?: boolean;
};

/**
 * pinned 우선 → 마감일 임박순 → 제목
 */
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

function isUrl(s: string) {
  return /^https?:\/\//i.test(s);
}

function isEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

const typeLabels: Record<string, string> = {
  fellowship: "Fellowship",
  position: "Position",
  intern: "Intern",
  other: "Other",
};

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

      <div className="space-y-8">
        {items.map((opp) => (
          <OpportunityCard key={opp.id} opp={opp} />
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

function OpportunityCard({ opp }: { opp: Opportunity }) {
  const typeLabel = opp.type ? typeLabels[opp.type] || opp.type : "";
  const hasDeadline = !!opp.deadline;
  const contact = (opp.contact || "").trim();

  return (
    <div className={`p-8 rounded-2xl border transition-all duration-300 ${opp.pinned ? "border-rose-300 bg-rose-50/30 hover:shadow-lg" : "border-gray-100 hover:border-accent/30 hover:shadow-lg"}`}>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            {opp.pinned && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-rose-500 text-white rounded">
                📌 Pinned
              </span>
            )}
            {typeLabel && (
              <span className="text-xs font-medium px-3 py-1 rounded-full bg-accent/10 text-accent uppercase">
                {typeLabel}
              </span>
            )}
          </div>
          <h2 className="text-2xl font-bold text-primary-dark mt-3">
            {opp.title}
          </h2>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-400">
            {hasDeadline ? "Deadline" : "Status"}
          </p>
          <p className="font-semibold text-gray-700">
            {hasDeadline ? opp.deadline : "Open (rolling)"}
          </p>
        </div>
      </div>

      {opp.description && (
        <p className="text-gray-600 mb-6 leading-relaxed whitespace-pre-wrap">
          {opp.description}
        </p>
      )}

      {opp.requirements && opp.requirements.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold text-gray-800 mb-2">Requirements</h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-500">
            {opp.requirements.map((req, i) => (
              <li key={i}>{req}</li>
            ))}
          </ul>
        </div>
      )}

      {contact && <ApplyButton contact={contact} />}
    </div>
  );
}

function ApplyButton({ contact }: { contact: string }) {
  let href = contact;
  let label = "Apply Now";

  if (isUrl(contact)) {
    href = contact;
    label = "Apply Now";
  } else if (isEmail(contact)) {
    href = `mailto:${contact}`;
    label = `Apply via Email`;
  } else {
    // 그 외 텍스트는 그대로 표시만
    return (
      <p className="text-sm text-gray-500">
        지원방법: <span className="font-medium text-gray-700">{contact}</span>
      </p>
    );
  }

  const external = isUrl(contact);

  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 transition-colors"
    >
      {label}
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M14 5l7 7m0 0l-7 7m7-7H3"
        />
      </svg>
    </a>
  );
}
