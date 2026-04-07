"use client";

import Image from "next/image";
import partners from "@/data/partners.json";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export default function PartnerCarousel() {
  // Duplicate for seamless infinite scroll
  const items = [...partners, ...partners];

  return (
    <div className="overflow-hidden">
      <div className="flex animate-scroll gap-12 items-center">
        {items.map((partner, i) => (
          <a
            key={`${partner.id}-${i}`}
            href={partner.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-300"
          >
            <Image
              src={`${basePath}${partner.logo}`}
              alt={partner.name}
              width={140}
              height={56}
              className="h-14 w-auto object-contain"
            />
          </a>
        ))}
      </div>
    </div>
  );
}
