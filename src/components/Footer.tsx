import Link from "next/link";

const footerLinks = [
  { label: "Members", href: "/members" },
  { label: "Publications", href: "/research" },
  { label: "News", href: "/news" },
  { label: "Opportunities", href: "/opportunities" },
  { label: "Partners", href: "/partners" },
];

export default function Footer() {
  return (
    <footer className="bg-primary-dark text-text-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo & Description */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl font-bold text-white">AI-ACE</span>
              <span className="text-sm text-accent-light">@GIST</span>
            </div>
            <p className="text-sm text-text-muted leading-relaxed">
              AI-driven Advanced Computing and Engineering at GIST.
              Bridging AI research and real-world manufacturing innovation.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {footerLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-text-muted hover:text-accent-light transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Contact
            </h3>
            <div className="space-y-2 text-sm text-text-muted">
              <p>Gwangju Institute of Science and Technology (GIST)</p>
              <p>123 Cheomdangwagi-ro, Buk-gu, Gwangju, Korea</p>
              <p>
                Email:{" "}
                <a href="mailto:contact@ai-ace.gist.ac.kr" className="text-accent-light hover:underline">
                  contact@ai-ace.gist.ac.kr
                </a>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-text-muted">
            &copy; {new Date().getFullYear()} AI-ACE@GIST. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="#" className="text-xs text-text-muted hover:text-accent-light">
              Privacy Policy
            </Link>
            <Link href="#" className="text-xs text-text-muted hover:text-accent-light">
              Terms of Use
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
