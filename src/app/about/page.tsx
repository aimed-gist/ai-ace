import Image from "next/image";
import Link from "next/link";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export default function AboutPage() {
  return (
    <div className="pt-24 pb-16">
      {/* 페이지 헤더 */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold text-primary-dark mb-3">
          About AI-ACE@GIST
        </h1>
        <p className="text-text-muted text-lg">
          AI-Nano Convergence Institute for Early Detection of Neurodegenerative
          Diseases
        </p>
      </div>

      {/* 연구단 소개 */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-primary-dark mb-2">
            연구단 소개
          </h2>
          <div className="w-16 h-1 bg-accent rounded-full" />
        </div>

        {/* 미션 카드 */}
        <div className="relative rounded-3xl bg-gradient-to-br from-primary-dark via-primary to-primary-light text-white p-8 sm:p-12 mb-10 overflow-hidden">
          <div className="absolute -top-8 -right-8 w-64 h-64 bg-accent/20 rounded-full blur-3xl" />
          <div className="relative">
            <p className="text-sm uppercase tracking-widest text-accent-light mb-3">
              Our Mission
            </p>
            <p className="text-2xl sm:text-3xl font-bold leading-snug mb-6">
              &ldquo;Promoting human health through early diagnosis of
              degenerative brain disorders.&rdquo;
            </p>
            <p className="text-text-light/80 leading-relaxed max-w-3xl">
              AI-ACE@GIST 연구단은 AI와 나노기술의 융합을 통해 신경성 뇌질환의
              조기진단과 예측 기술을 혁신하고, 이를 바탕으로 인류의 건강한 삶에
              기여합니다. 다학제 융합 연구(AI, 나노광학, 단백질 구조생물학)를
              통해 바이오 시장을 선도하는 것을 목표로 합니다.
            </p>
          </div>
        </div>

        {/* 핵심 기술 3가지 */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-primary-dark mb-2">
            Core Technologies
          </h3>
          <p className="text-sm text-text-muted mb-6">
            연구단이 집중하고 있는 세 가지 핵심 기술 분야입니다.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: (
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.847.813a4.5 4.5 0 00-3.09 3.09z"
                  />
                </svg>
              ),
              title: "Nanomaterials",
              subtitle: "단백질 구조 변이 감지 나노소재",
              desc: "신경성 뇌질환의 원인이 되는 단백질 구조 변화를 감지할 수 있는 새로운 나노소재를 설계·합성합니다.",
            },
            {
              icon: (
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              ),
              title: "Nano-optical Devices",
              subtitle: "단백질 신호 감지 나노광학 디바이스",
              desc: "나노스케일 광학 원리를 활용한 고감도 센서로 미세한 단백질 신호를 실시간 검출합니다.",
            },
            {
              icon: (
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"
                  />
                </svg>
              ),
              title: "AI Algorithms",
              subtitle: "단백질 구조·동역학 분석 AI",
              desc: "대규모 데이터와 최신 AI 기법으로 단백질 구조·동역학을 분석하고 병리 진행을 예측합니다.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="p-7 rounded-2xl border border-gray-100 hover:border-accent/30 hover:shadow-md transition-all duration-300"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-accent/10 text-accent mb-4">
                {item.icon}
              </div>
              <h4 className="text-lg font-bold text-primary-dark mb-1">
                {item.title}
              </h4>
              <p className="text-sm text-accent font-medium mb-3">
                {item.subtitle}
              </p>
              <p className="text-sm text-gray-500 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 단장 소개 */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-primary-dark mb-2">
            단장 소개
          </h2>
          <div className="w-16 h-1 bg-accent rounded-full" />
        </div>

        <div className="rounded-3xl border border-gray-100 overflow-hidden bg-white shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
            {/* 사진 */}
            <div className="relative aspect-[3/4] md:aspect-auto bg-primary/5">
              <Image
                src={`${basePath}/images/members/eunji_lee.jpg`}
                alt="Prof. Eunji Lee"
                fill
                className="object-cover"
              />
            </div>

            {/* 정보 */}
            <div className="md:col-span-2 p-8 sm:p-10">
              <p className="text-xs uppercase tracking-widest text-accent font-semibold mb-2">
                Director / Principal Investigator
              </p>
              <h3 className="text-3xl font-bold text-primary-dark leading-tight mb-1">
                이은지 <span className="text-gray-400 font-normal">(Eunji Lee)</span>
              </h3>
              <p className="text-lg text-gray-600 mb-6">
                Professor, Gwangju Institute of Science and Technology (GIST)
              </p>

              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  이은지 교수는 소재·나노 융합 연구 분야에서 세계적인 연구 성과를
                  쌓아온 전문가로, AI-ACE@GIST 연구단의 단장으로서 연구단의
                  비전과 방향성을 이끌고 있습니다.
                </p>
                <p>
                  신경성 뇌질환의 원인이 되는 단백질 구조 변이를 조기에 검출·예측
                  하기 위한 AI-나노 융합 플랫폼 연구를 총괄하며, 국내외 최고
                  수준의 연구기관·산업체와의 협력 네트워크를 구축하고 있습니다.
                </p>
              </div>

              {/* 연락처 / 링크 */}
              <div className="mt-8 pt-6 border-t border-gray-100 flex flex-wrap gap-6 text-sm">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Email</p>
                  <a
                    href="mailto:eunjilee@gist.ac.kr"
                    className="text-accent font-medium hover:underline"
                  >
                    eunjilee@gist.ac.kr
                  </a>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Lab Website</p>
                  <a
                    href="https://so-mat.wixsite.com/gist"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent font-medium hover:underline inline-flex items-center gap-1"
                  >
                    Soft Materials Lab
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Affiliation</p>
                  <p className="text-gray-700 font-medium">GIST</p>
                </div>
              </div>

              {/* 연구단 멤버 페이지 CTA */}
              <div className="mt-8">
                <Link
                  href="/members"
                  className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline"
                >
                  전체 멤버 보기
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
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
