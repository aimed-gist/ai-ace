import HeroSection from "@/components/HeroSection";
import SectionWrapper from "@/components/SectionWrapper";
import NewsCard from "@/components/NewsCard";
import PartnerCarousel from "@/components/PartnerCarousel";
import news from "@/data/news.json";

export default function Home() {
  const latestNews = news.slice(0, 3);

  return (
    <>
      {/* Hero */}
      <HeroSection />

      {/* Platform Overview */}
      <SectionWrapper id="platform">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-primary-dark mb-4">
            Our Platform
          </h2>
          <p className="text-text-muted max-w-2xl mx-auto">
            An LLM-powered platform that interprets natural language instructions
            to coordinate material discovery, process optimization, and anomaly detection.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: (
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                </svg>
              ),
              title: "AI-Driven Research",
              desc: "Leveraging large language models for intelligent research automation and knowledge discovery in manufacturing.",
            },
            {
              icon: (
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
              ),
              title: "Mentorship Ecosystem",
              desc: "Supporting InnoCORE Fellows and postdoctoral researchers with expert mentorship and collaborative projects.",
            },
            {
              icon: (
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                </svg>
              ),
              title: "Industrial Adoption",
              desc: "Bridging research and practice through field testbeds, expert networks, and real-world deployment validation.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="text-center p-8 rounded-2xl border border-gray-100 hover:border-accent/30 hover:shadow-lg transition-all duration-300 group"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-accent/10 text-accent mb-5 group-hover:bg-accent group-hover:text-white transition-colors duration-300">
                {item.icon}
              </div>
              <h3 className="text-xl font-bold text-primary-dark mb-3">
                {item.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* Global Network */}
      <SectionWrapper id="network" dark>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Global Research Network
            </h2>
            <p className="text-text-light/70 leading-relaxed mb-6">
              Our network brings together top researchers, industry experts, and
              InnoCORE Fellows from around the world to tackle the most pressing
              challenges in AI-driven manufacturing.
            </p>
            <div className="grid grid-cols-2 gap-6">
              {[
                { num: "10+", label: "Research Partners" },
                { num: "20+", label: "Publications" },
                { num: "15+", label: "Industry Collaborations" },
                { num: "30+", label: "Team Members" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-3xl font-bold text-accent-light">
                    {stat.num}
                  </p>
                  <p className="text-sm text-text-muted">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square rounded-2xl bg-gradient-to-br from-accent/20 to-primary-light/20 flex items-center justify-center">
              <div className="text-center">
                <svg className="w-24 h-24 text-accent-light/50 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                </svg>
                <p className="text-text-muted text-sm">Global Network Visualization</p>
              </div>
            </div>
          </div>
        </div>
      </SectionWrapper>

      {/* Partners */}
      <SectionWrapper id="partners">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-primary-dark mb-4">
            Our Partners
          </h2>
          <p className="text-text-muted max-w-2xl mx-auto">
            Collaborating with leading universities and industry partners worldwide.
          </p>
        </div>
        <PartnerCarousel />
      </SectionWrapper>

      {/* News & Updates */}
      <SectionWrapper id="news" dark>
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            News & Updates
          </h2>
          <p className="text-text-light/70 max-w-2xl mx-auto">
            Stay updated with the latest news, research highlights, and events.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {latestNews.map((item) => (
            <NewsCard key={item.id} item={item} />
          ))}
        </div>
      </SectionWrapper>
    </>
  );
}
