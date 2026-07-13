import Link from "next/link";
import { notFound } from "next/navigation";
import noticesMd from "@/data/notices-md.json";
import MarkdownBody from "@/components/MarkdownBody";

type NoticeMd = {
  id: string;
  slug: string;
  category: string;
  title: string;
  date: string;
  summary: string;
  body: string;
  link: string;
  externalLink?: string;
  image: string;
  pinned?: boolean;
  source?: string;
};

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export async function generateStaticParams() {
  return (noticesMd as NoticeMd[]).map((n) => ({ slug: n.slug }));
}

export const dynamicParams = false;

type Params = { slug: string };

export default async function NoticeDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const item = (noticesMd as NoticeMd[]).find((n) => n.slug === slug);
  if (!item) notFound();

  const hasImage = !!item.image;
  const imageSrc = item.image
    ? item.image.startsWith("http")
      ? item.image
      : `${basePath}${item.image}`
    : "";

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/news?tab=notice" className="hover:text-accent">
          ← Notice 목록으로
        </Link>
      </nav>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-100 text-amber-700">
            Notice
          </span>
          {item.pinned && (
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-rose-500 text-white rounded">
              📌 Pinned
            </span>
          )}
          {item.date && (
            <span className="text-sm text-gray-400">{item.date}</span>
          )}
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-primary-dark leading-tight">
          {item.title}
        </h1>
      </div>

      {/* 대표 이미지 */}
      {hasImage && (
        <div className="mb-8 rounded-2xl overflow-hidden bg-gray-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageSrc}
            alt={item.title}
            className="w-full h-auto object-cover"
          />
        </div>
      )}

      {/* 본문 */}
      <div className="mt-6">
        <MarkdownBody text={item.body || item.summary} />
      </div>

      {/* 외부 링크 */}
      {item.externalLink && (
        <div className="mt-10 pt-6 border-t border-gray-100">
          <p className="text-sm text-gray-500 mb-2">첨부 자료 / 외부 링크</p>
          <a
            href={item.externalLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-colors"
          >
            자료 열기
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
        </div>
      )}

      {/* Footer navigation */}
      <div className="mt-16 pt-6 border-t border-gray-100">
        <Link
          href="/news?tab=notice"
          className="text-sm text-accent hover:underline"
        >
          ← Notice 전체 보기
        </Link>
      </div>
    </div>
  );
}
