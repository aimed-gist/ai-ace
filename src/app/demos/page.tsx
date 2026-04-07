export default function DemosPage() {
  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold text-primary-dark mb-2">AI Demos</h1>
      <p className="text-text-muted mb-10">
        Interactive demonstrations of our AI-powered manufacturing solutions.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[
          {
            title: "LLM-Powered Process Optimizer",
            description:
              "Natural language interface for manufacturing process optimization. Describe your requirements and let AI suggest optimal parameters.",
            status: "Coming Soon",
          },
          {
            title: "Anomaly Detection Dashboard",
            description:
              "Real-time anomaly detection system for smart factory environments. Visualize and analyze production quality metrics.",
            status: "Coming Soon",
          },
          {
            title: "Material Discovery Assistant",
            description:
              "AI assistant for material discovery and recommendation. Input your requirements and explore potential materials.",
            status: "Coming Soon",
          },
          {
            title: "Quality Inspection Vision",
            description:
              "Computer vision-based quality inspection demo. Upload product images for AI-powered defect detection.",
            status: "Coming Soon",
          },
        ].map((demo) => (
          <div
            key={demo.title}
            className="p-8 rounded-2xl border border-gray-100 hover:border-accent/30 hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-primary-dark">
                {demo.title}
              </h2>
              <span className="text-xs px-3 py-1 rounded-full bg-amber-100 text-amber-700 font-medium">
                {demo.status}
              </span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              {demo.description}
            </p>
            <div className="mt-6 aspect-video rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100">
              <div className="text-center">
                <svg
                  className="w-12 h-12 text-gray-300 mx-auto mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z"
                  />
                </svg>
                <p className="text-sm text-gray-400">Demo Preview</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
