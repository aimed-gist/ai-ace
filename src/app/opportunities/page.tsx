import opportunities from "@/data/opportunities.json";

export default function OpportunitiesPage() {
  const active = opportunities.filter((o) => o.active);

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold text-primary-dark mb-2">
        Opportunities
      </h1>
      <p className="text-text-muted mb-10">
        Join our team. Explore fellowship and career opportunities.
      </p>

      <div className="space-y-8">
        {active.map((opp) => (
          <div
            key={opp.id}
            className="p-8 rounded-2xl border border-gray-100 hover:border-accent/30 hover:shadow-lg transition-all duration-300"
          >
            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
              <div>
                <span className="text-xs font-medium px-3 py-1 rounded-full bg-accent/10 text-accent uppercase">
                  {opp.type}
                </span>
                <h2 className="text-2xl font-bold text-primary-dark mt-3">
                  {opp.title}
                </h2>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">Deadline</p>
                <p className="font-semibold text-gray-700">{opp.deadline}</p>
              </div>
            </div>

            <p className="text-gray-600 mb-6 leading-relaxed">
              {opp.description}
            </p>

            <div className="mb-6">
              <h3 className="font-semibold text-gray-800 mb-2">Requirements</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-500">
                {opp.requirements.map((req, i) => (
                  <li key={i}>{req}</li>
                ))}
              </ul>
            </div>

            <a
              href={`mailto:${opp.contact}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 transition-colors"
            >
              Apply Now
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </div>
        ))}
      </div>

      {active.length === 0 && (
        <p className="text-center text-gray-400 py-16">
          No open positions at this time. Check back later.
        </p>
      )}
    </div>
  );
}
