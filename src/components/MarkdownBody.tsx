/**
 * MD 본문을 안전한 형태로 렌더링하는 컴포넌트.
 * 외부 라이브러리 없이 다음 서식만 처리:
 *   # / ## / ### 헤더
 *   * / - 리스트
 *   빈 줄 = 문단 구분
 *   나머지는 일반 텍스트 (whitespace-pre-wrap 유지)
 */

interface Block {
  type: "h1" | "h2" | "h3" | "list" | "p";
  content: string | string[];
}

function parseBlocks(text: string): Block[] {
  const blocks: Block[] = [];
  const paragraphs = text.split(/\n\s*\n/);

  for (const raw of paragraphs) {
    const p = raw.trim();
    if (!p) continue;

    const lines = p.split(/\n/);
    // 리스트 감지: 모든 줄이 * 또는 - 또는 숫자. 로 시작
    const isList = lines.every((l) => /^\s*([*\-]|\d+\.)\s+/.test(l.trim()));
    if (isList && lines.length > 0) {
      blocks.push({
        type: "list",
        content: lines.map((l) => l.replace(/^\s*([*\-]|\d+\.)\s+/, "").trim()),
      });
      continue;
    }

    // 헤더 감지
    if (lines.length === 1) {
      const h1 = p.match(/^#\s+(.*)$/);
      if (h1) {
        blocks.push({ type: "h1", content: h1[1] });
        continue;
      }
      const h2 = p.match(/^##\s+(.*)$/);
      if (h2) {
        blocks.push({ type: "h2", content: h2[1] });
        continue;
      }
      const h3 = p.match(/^###\s+(.*)$/);
      if (h3) {
        blocks.push({ type: "h3", content: h3[1] });
        continue;
      }
    }

    blocks.push({ type: "p", content: p });
  }
  return blocks;
}

export default function MarkdownBody({ text }: { text: string }) {
  if (!text) return null;
  const blocks = parseBlocks(text);
  return (
    <div className="prose-mimic space-y-4 text-gray-700">
      {blocks.map((b, i) => {
        if (b.type === "h1") {
          return (
            <h2 key={i} className="text-2xl font-bold text-primary-dark mt-6 mb-2">
              {b.content as string}
            </h2>
          );
        }
        if (b.type === "h2") {
          return (
            <h3 key={i} className="text-xl font-semibold text-primary-dark mt-5 mb-2">
              {b.content as string}
            </h3>
          );
        }
        if (b.type === "h3") {
          return (
            <h4 key={i} className="text-lg font-semibold text-primary mt-4 mb-1">
              {b.content as string}
            </h4>
          );
        }
        if (b.type === "list") {
          return (
            <ul key={i} className="list-disc list-inside space-y-1 pl-4">
              {(b.content as string[]).map((item, j) => (
                <li key={j}>{item}</li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i} className="leading-relaxed whitespace-pre-wrap">
            {b.content as string}
          </p>
        );
      })}
    </div>
  );
}
