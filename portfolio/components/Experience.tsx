"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import SectionTag from "./SectionTag";
import { useReveal } from "@/lib/useReveal";
import { withBasePath } from "@/lib/basePath";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const ENTRIES = [
  {
    id: "01",
    role: "Web Development Intern",
    company: "Sunrays Logistics",
    location: "Mumbai",
    logo: "/logos/sunrays.png",
    dates: "Jun 2025 – Jul 2025",
    tags: ["WhatsApp API", "Web Performance", "Lighthouse", "Process Automation"],
    bullets: [
      "Integrated a WhatsApp click-to-chat button via the wa.me API for instant client conversations.",
      "Converted images to WebP and added lazy loading — Lighthouse score ~65 → 92+.",
      "Structured shipment and client data into an Excel tracker adopted for daily team coordination.",
    ],
  },
  {
    id: "02",
    role: "Frontend Developer Intern",
    company: "Xebia",
    location: "Remote",
    logo: "/logos/xebia.png",
    dates: "Jun 2026 – Jul 2026",
    tags: ["React", "Tailwind CSS", "REST APIs", "Feature Flags"],
    bullets: [
      "Built the Configuration module of a University Management System dashboard in React and Tailwind CSS.",
      "Developed reusable UI components — card navigation, feature-flag toggles, validated forms.",
      "Integrated the module end-to-end with backend REST APIs, including validation and error states.",
    ],
  },
];

export default function Experience() {
  const sectionRef = useRef<HTMLElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useReveal(sectionRef, { selector: "[data-reveal-entry]" });

  // timeline line draw-in, scrubbed to scroll position
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

        <div className="flex flex-col gap-10 md:gap-14">
          {ENTRIES.map((entry) => (
            <div key={entry.company} className="relative" data-reveal-entry>
              <span className="absolute -left-8 top-8 h-[11px] w-[11px] rounded-full border-2 border-amber bg-ink md:-left-10" />
              <ExperienceCard entry={entry} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ExperienceCard({ entry }: { entry: (typeof ENTRIES)[number] }) {
  const [logoError, setLogoError] = useState(false);

  return (
    <div
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-ink-raised p-6 transition-all duration-300 hover:-translate-y-1 hover:border-amber/40 hover:shadow-[0_20px_50px_-20px_rgba(201,151,77,0.35)] md:p-8"
    >
      <span className="pointer-events-none absolute -right-4 -top-6 font-display text-[7rem] font-semibold leading-none text-white/[0.03] transition-colors duration-300 group-hover:text-amber/[0.06] md:text-[9rem]">
        {entry.id}
      </span>

      <div className="relative flex flex-col gap-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-ink transition-transform duration-300 group-hover:scale-105">
              {logoError ? (
                <span className="font-display text-lg font-semibold text-amber">
                  {entry.company.charAt(0)}
                </span>
              ) : (
                <div className="relative h-full w-full">
                  <Image
                    src={withBasePath(entry.logo)}
                    alt={`${entry.company} logo`}
                    fill
                    className="object-cover"
                    onError={() => setLogoError(true)}
                  />
                </div>
              )}
            </div>

            <div>
              <h3 className="font-display text-lg font-semibold text-paper md:text-xl">
                {entry.role}
              </h3>
              <p className="text-sm text-paper-dim">
                {entry.company} <span className="text-paper-dim/50">·</span> {entry.location}
              </p>
            </div>
          </div>

          <span className="rounded-full border border-white/10 px-3 py-1 font-mono text-[11px] uppercase tracking-widest text-amber">
            {entry.dates}
          </span>
        </div>

        <ul className="flex flex-col gap-2">
          {entry.bullets.map((bullet, i) => (
            <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-paper-dim md:text-base">
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-amber/60" />
              {bullet}
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap gap-2 border-t border-white/5 pt-4">
          {entry.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-white/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide text-paper-dim transition-colors duration-300 group-hover:border-amber/20 group-hover:text-paper"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
