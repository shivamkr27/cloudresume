"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import SectionTag from "./SectionTag";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const ENTRIES = [
  {
    role: "Web Development Intern",
    company: "Sunrays Logistics, Mumbai",
    logo: "/logos/sunrays.png",
    dates: "Jun 2025 – Jul 2025",
    bullets: [
      "Integrated a WhatsApp click-to-chat button via the wa.me API for instant client conversations.",
      "Converted images to WebP and added lazy loading — Lighthouse score ~65 → 92+.",
      "Structured shipment and client data into an Excel tracker adopted for daily team coordination.",
    ],
  },
  {
    role: "Frontend Developer Intern",
    company: "Xebia",
    logo: "/logos/xebia.png",
    dates: "Jun 2026 – Jul 2026",
    bullets: [
      "Built the Configuration module of a University Management System dashboard in React and Tailwind CSS.",
      "Developed reusable UI components — card navigation, feature-flag toggles, validated forms.",
      "Integrated the module end-to-end with backend REST APIs, including validation and error states.",
    ],
  },
];

// One full sine cycle per this many pixels of scroll — long wavelength
// keeps the motion slow and gentle rather than jittery.
const WAVE_LENGTH = 900;
const AMPLITUDE_PX = 8; // vertical bob — kept subtle on purpose
const TILT_DEG = 1.8; // rotateX tilt — kept subtle on purpose

export default function Experience() {
  const sectionRef = useRef<HTMLElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);

  // timeline line draw-in — unchanged from before, untouched by the wave logic
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add({ all: "all", reduced: "(prefers-reduced-motion: reduce)" }, (context) => {
        const { reduced } = context.conditions as { reduced: boolean };
        if (!lineRef.current) return;

        if (reduced) {
          gsap.set(lineRef.current, { scaleY: 1 });
          return;
        }

        gsap.fromTo(
          lineRef.current,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 70%",
              end: "bottom 60%",
              scrub: true,
            },
          }
        );
      });

      return () => mm.revert();
    },
    { scope: sectionRef }
  );

  // continuous scroll-linked wave through the content boxes — a single sine
  // field in document space, sampled at each card's top/mid/bottom edge, so
  // the motion is unbroken across box boundaries rather than two separate
  // per-card animations.
  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reducedMotion) return;

    const isMobile = window.innerWidth < 768;
    const amplitude = isMobile ? AMPLITUDE_PX * 0.5 : AMPLITUDE_PX;
    const tilt = isMobile ? TILT_DEG * 0.5 : TILT_DEG;

    let raf = 0;
    let ticking = false;

    const waveAt = (docY: number, scrollY: number) =>
      Math.sin(((docY - scrollY) / WAVE_LENGTH) * Math.PI * 2);

    function update() {
      ticking = false;
      const scrollY = window.scrollY;

      cardRefs.current.forEach((card) => {
        if (!card) return;
        const rect = card.getBoundingClientRect();
        const topY = rect.top + scrollY;
        const bottomY = rect.bottom + scrollY;
        const midY = (topY + bottomY) / 2;

        const wTop = waveAt(topY, scrollY);
        const wBottom = waveAt(bottomY, scrollY);
        const wMid = waveAt(midY, scrollY);

        const translateY = wMid * amplitude;
        const rotateX = (wTop - wBottom) * tilt;

        card.style.transform = `translateY(${translateY.toFixed(2)}px) rotateX(${rotateX.toFixed(2)}deg)`;
      });
    }

    function onScrollOrResize() {
      if (ticking) return;
      ticking = true;
      raf = requestAnimationFrame(update);
    }

    update();
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="experience"
      className="mx-auto max-w-content px-6 py-24 md:px-12 md:py-36"
    >
      <SectionTag index="03" label="Experience" />

      <div className="relative pl-8 md:pl-10">
        <div className="absolute left-[5px] top-2 bottom-2 w-px bg-white/10 md:left-[7px]" />
        <div
          ref={lineRef}
          className="absolute left-[5px] top-2 bottom-2 w-px origin-top bg-amber md:left-[7px]"
        />

        <div
          className="flex flex-col gap-6 [perspective:1200px] md:gap-8"
        >
          {ENTRIES.map((entry, i) => (
            <div key={entry.company} className="relative">
              <span className="absolute -left-8 top-6 h-[11px] w-[11px] rounded-full border-2 border-amber bg-ink md:-left-10 md:top-8 md:h-[15px] md:w-[15px]" />
              <ExperienceCard
                entry={entry}
                cardRef={(el) => {
                  cardRefs.current[i] = el;
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ExperienceCard({
  entry,
  cardRef,
}: {
  entry: (typeof ENTRIES)[number];
  cardRef: (el: HTMLDivElement | null) => void;
}) {
  const [logoError, setLogoError] = useState(false);

  return (
    <div
      ref={cardRef}
      className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-ink-raised p-6 will-change-transform sm:flex-row sm:gap-5 md:p-8"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-ink">
        {logoError ? (
          <span className="font-display text-base font-semibold text-amber">
            {entry.company.charAt(0)}
          </span>
        ) : (
          <div className="relative h-8 w-8">
            <Image
              src={entry.logo}
              alt={`${entry.company} logo`}
              fill
              className="object-contain"
              onError={() => setLogoError(true)}
            />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <p className="font-mono text-xs uppercase tracking-widest text-amber">
          {entry.dates}
        </p>
        <h3 className="font-display text-lg font-semibold text-paper md:text-xl">
          {entry.role}
        </h3>
        <p className="text-sm text-paper-dim">{entry.company}</p>
        <ul className="mt-1 flex flex-col gap-1">
          {entry.bullets.map((bullet, i) => (
            <li key={i} className="text-sm leading-relaxed text-paper-dim">
              {bullet}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
