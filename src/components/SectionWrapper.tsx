"use client";

import { useEffect, useRef, useState, ReactNode } from "react";

interface SectionWrapperProps {
  children: ReactNode;
  className?: string;
  id?: string;
  dark?: boolean;
}

export default function SectionWrapper({
  children,
  className = "",
  id,
  dark = false,
}: SectionWrapperProps) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.05, rootMargin: "50px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const animClass = !mounted
    ? "opacity-100 translate-y-0"
    : visible
    ? "opacity-100 translate-y-0"
    : "opacity-0 translate-y-8";

  return (
    <section
      ref={ref}
      id={id}
      className={`py-20 px-4 sm:px-6 lg:px-8 transition-all duration-700 ${animClass} ${
        dark ? "bg-surface-dark text-white" : "bg-white text-gray-900"
      } ${className}`}
    >
      <div className="max-w-7xl mx-auto">{children}</div>
    </section>
  );
}
