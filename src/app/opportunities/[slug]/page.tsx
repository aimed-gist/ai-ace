import Link from "next/link";
import { notFound } from "next/navigation";
import opportunitiesMd from "@/data/opportunities-md.json";
import MarkdownBody from "@/components/MarkdownBody";

type OpportunityMd = {
  id: string;
  slug: string;
  title: string;
  type: string;
  deadline: string;
  summary: string;
  description: string;
  body: string;
  contact: string;
  active: boolean;
  pinned?: boolean;
  source?: string;
};

const typeLabels: Record<string, string> = {
  fellowship: "Fellowship",
  position: "Position",
  intern: "Intern",
  other: "Other",
};

function isUrl(s: string) {
  return /^https?:\/\//i.test(s);
}
function isEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export async function generateStaticParams() {
  return (opportunitiesMd as OpportunityMd[]).map((o) => ({ slug: o.slug }));
}

export const dynamicParams = false;

type Params = { slug: string };

export default async function OpportunityDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const item = (opportunitiesMd as OpportunityMd[]).find((o) => o.slug === slug);
  if (!item) notFound();

  const typeLabel = typeLabels[item.type] || item.type;
  const hasDeadline = !!item.deadline;
  const contact = (item.contact || "").trim();

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/opportunities" className="hover:text-accent">
          ← Opportunities 목록으로
        </Link>
      </nav>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 flex-wrap mb-3">
          {item.pinned && (
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-rose-500 text-white rounded">
              📌 Pinned
            </span>
          )}
          {typeLabel && (
            <span className="text-xs font-medium px-3 py-1 rounded-full bg-accent/10 text-accent uppercase">
              {typeLabel}
            </span>
          )}
          {!item.active && (
            <span className="text-xs font-medium px-2 py-0.5 bg-gray-200 text-gray-600 rounded">
              마감됨
            </span>
          )}
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-primary-dark leading-tight">
          {item.title}
        </h1>

        <div className="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-sm text-gray-600">
          <div>
            <span className="text-gray-400">
              {hasDeadline ? "Deadline: " : "Status: "}
            </span>
            <span className="font-semibold">
              {hasDeadline ? item.deadline : "Open (rolling)"}
            </span>
          </div>
          {contact && (
            <div>
              <span className="text-gray-400">Contact: </span>
              <span className="font-semibold">{contact}</span>
            </div>
          )}
        </div>
      </div>

      {/* 본문 */}
      <div className="mt-8">
        <MarkdownBody text={item.body || item.description} />
      </div>

      {/* Apply CTA */}
      {contact && (
        <div className="mt-10 pt-6 border-t border-gray-100">
          <ApplyButton contact={contact} />
        </div>
      )}

      {/* Footer navigation */}
      <div className="mt-16 pt-6 border-t border-gray-100">
        <Link
          href="/opportunities"
          className="text-sm text-accent hover:underline"
        >
          ← Opportunities 전체 보기
        </Link>
      </div>
    </div>
  );
}

function ApplyButton({ contact }: { contact: string }) {
  if (isUrl(contact)) {
    return (
      <a
        href={contact}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 transition-colors"
      >
        Apply Now
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
  if (isEmail(contact)) {
    return (
      <a
        href={`mailto:${contact}`}
        className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 transition-colors"
      >
        Apply via Email ({contact})
      </a>
    );
  }
  return (
    <p className="text-sm text-gray-500">
      지원방법: <span className="font-medium text-gray-700">{contact}</span>
    </p>
  );
}
