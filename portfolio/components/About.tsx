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

const PHOTO_CANDIDATES = [
  "/about/profile.jpg",
  "/about/profile.jpeg",
  "/about/profile.png",
  "/about/profile.webp",
];

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const photoRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const underlineRef = useRef<HTMLSpanElement>(null);
  const [candidateIndex, setCandidateIndex] = useState(0);

  useReveal(sectionRef, { selector: "[data-reveal-photo]" });

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add({ all: "all", reduced: "(prefers-reduced-motion: reduce)" }, (context) => {
        const { reduced } = context.conditions as { reduced: boolean };
        if (!photoRef.current) return;

        if (reduced) {
          gsap.set(photoRef.current, { filter: "grayscale(0%)" });
          return;
        }

        gsap.fromTo(
          photoRef.current,
          { filter: "grayscale(100%)" },
          {
            filter: "grayscale(0%)",
            ease: "none",
            scrollTrigger: {
              trigger: photoRef.current,
              start: "top 85%",
              end: "top 35%",
              scrub: true,
            },
          }
        );
      });

      return () => mm.revert();
    },
    { scope: sectionRef }
  );

  // line-by-line bio reveal + a single underline sweep beneath the closing phrase
  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(
        {
          all: "all",
          reduced: "(prefers-reduced-motion: reduce)",
          compact: "(max-width: 767px)",
        },
        (context) => {
          const { reduced, compact } = context.conditions as {
            reduced: boolean;
            compact: boolean;
          };

          const lines = textRef.current?.querySelectorAll("[data-line]");
          if (!lines?.length) return;

          if (reduced) {
            gsap.set(lines, { opacity: 1, y: 0 });
            if (underlineRef.current) gsap.set(underlineRef.current, { scaleX: 1 });
            return;
          }

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: textRef.current,
              start: "top 78%",
              once: true,
            },
          });

          tl.fromTo(
            lines,
            { y: compact ? 18 : 26, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.7, stagger: 0.12, ease: "power3.out" }
          );

          if (underlineRef.current) {
            tl.fromTo(
              underlineRef.current,
              { scaleX: 0 },
              { scaleX: 1, duration: 0.6, ease: "power2.out" },
              "-=0.15"
            );
          }

          return () => {
            tl.kill();
          };
        }
      );

      return () => mm.revert();
    },
    { scope: textRef }
  );

  return (
    <section
      ref={sectionRef}
      id="about"
      className="mx-auto max-w-content px-6 py-24 md:px-12 md:py-36"
    >
      <SectionTag index="02" label="About" />

      <div className="grid grid-cols-1 gap-12 md:grid-cols-[280px_1fr] md:gap-16 lg:grid-cols-[340px_1fr]">
        <div data-reveal-photo>
          <div
            ref={photoRef}
            className="relative flex aspect-[4/5] w-full max-w-[280px] items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-ink-raised lg:max-w-[340px]"
          >
            {candidateIndex >= PHOTO_CANDIDATES.length ? (
              <span className="font-display text-6xl font-semibold text-amber">
                SK
              </span>
            ) : (
              <Image
                key={PHOTO_CANDIDATES[candidateIndex]}
                src={withBasePath(PHOTO_CANDIDATES[candidateIndex])}
                alt="Shivam"
                fill
                sizes="(max-width: 768px) 280px, 340px"
                className="object-cover"
                onError={() => setCandidateIndex((n) => n + 1)}
              />
            )}
          </div>
        </div>

        <div ref={textRef} className="flex flex-col justify-center gap-6">
          <p className="font-display text-2xl font-medium leading-snug text-paper md:text-3xl">
            <span data-line className="block">
              B.Tech CSE (DevOps) student engineering
            </span>
            <span data-line className="block">
              systems that survive production, not just demos.
            </span>
          </p>
          <p className="max-w-xl text-base text-paper-dim md:text-lg">
            <span data-line className="block">
              Multi-agent RAG pipelines on one side, Terraform-provisioned
            </span>
            <span data-line className="block">
              infrastructure and chaos experiments on the other — same
            </span>
            <span data-line className="block">
              instinct either way:{" "}
              <span className="relative inline-block">
                build it, break it, make it hold
                <span
                  ref={underlineRef}
                  className="absolute inset-x-0 -bottom-0.5 h-[2px] origin-left scale-x-0 bg-amber"
                />
              </span>
              .
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
