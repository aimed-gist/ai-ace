"use client";

import { useEffect, useState } from "react";

const slides = [
  {
    title: "AI-ACE@GIST",
    subtitle: "AI-driven Advanced Computing and Engineering",
    description:
      "Bridging cutting-edge AI research with real-world manufacturing innovation through LLM-powered solutions.",
  },
  {
    title: "InnoCORE Fellowship",
    subtitle: "Global Talent, Local Impact",
    description:
      "Supporting postdoctoral researchers and industry experts to drive manufacturing innovation with AI.",
  },
  {
    title: "Industry Partnership",
    subtitle: "From Lab to Factory",
    description:
      "Validating AI solutions through industrial testbeds and expert networks for real-world deployment.",
  },
];

export default function HeroSection() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-dark via-primary to-primary-light" />

      {/* Animated background shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 bg-accent/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 bg-accent-light/10 rounded-full blur-3xl animate-pulse delay-1000" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        {slides.map((slide, idx) => (
          <div
            key={idx}
            className={`transition-all duration-700 absolute inset-0 flex flex-col items-center justify-center ${
              idx === current
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4 pointer-events-none"
            }`}
          >
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white mb-4 tracking-tight">
              {slide.title}
            </h1>
            <p className="text-xl sm:text-2xl text-accent-light font-medium mb-6">
              {slide.subtitle}
            </p>
            <p className="text-lg text-text-light/80 max-w-2xl leading-relaxed">
              {slide.description}
            </p>
          </div>
        ))}

        {/* Spacer for layout */}
        <div className="invisible">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-4">
            {slides[0].title}
          </h1>
          <p className="text-xl sm:text-2xl mb-6">{slides[0].subtitle}</p>
          <p className="text-lg max-w-2xl">{slides[0].description}</p>
        </div>

        {/* Slide indicators */}
        <div className="flex justify-center gap-2 mt-10">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                idx === current
                  ? "bg-accent-light w-8"
                  : "bg-white/30 hover:bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg
          className="w-6 h-6 text-white/50"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </div>
    </section>
  );
}
