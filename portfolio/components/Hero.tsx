"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import HeroGalaxy from "./HeroGalaxy";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const HEADLINE_WORDS = ["Ship", "it.", "Scale", "it.", "Own", "it."];

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const wordsRef = useRef<Array<HTMLSpanElement | null>>([]);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const subtextRef = useRef<HTMLParagraphElement>(null);
  const markerRef = useRef<HTMLDivElement>(null);

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

          const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

          if (reduced) {
            tl.set(wordsRef.current, { opacity: 1, y: 0 });
            tl.set(taglineRef.current, { opacity: 1, y: 0 });
            tl.set(subtextRef.current, { opacity: 1, y: 0 });
            tl.set(markerRef.current, { opacity: 1, y: 0 });
            return;
          }

          const distance = compact ? 40 : 70;

          tl.fromTo(
            wordsRef.current,
            { y: distance, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: compact ? 0.7 : 0.9,
              stagger: 0.08,
            }
          )
            .fromTo(
              taglineRef.current,
              { y: 22, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.7 },
              "-=0.45"
            )
            .fromTo(
              subtextRef.current,
              { y: 20, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.7 },
              "-=0.4"
            )
            .fromTo(
              markerRef.current,
              { y: 12, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.6 },
              "-=0.3"
            );

          return () => {
            tl.kill();
          };
        }
      );

      return () => mm.revert();
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative flex h-[100svh] w-full flex-col justify-between overflow-hidden px-6 py-8 md:px-12 md:py-12"
    >
      <HeroGalaxy />

      <div className="relative z-10 flex items-center justify-between">
        <span className="font-display text-lg font-semibold tracking-tight text-paper md:text-xl">
          Shivam<span className="text-amber">.</span>
        </span>
      </div>

      <div className="relative z-10 flex flex-col gap-5 md:gap-6 lg:max-w-[58%]">
        <h1 className="font-display text-[13vw] font-semibold leading-[0.95] tracking-tightest text-paper md:text-[7vw] lg:text-[6.5vw]">
          {HEADLINE_WORDS.map((word, i) => (
            <span key={i} className="reveal-mask mr-[0.22em]">
              <span
                ref={(el) => {
                  wordsRef.current[i] = el;
                }}
                className={i >= 4 ? "text-amber" : undefined}
              >
                {word}
              </span>
            </span>
          ))}
        </h1>

        <p
          ref={taglineRef}
          className="font-display text-2xl font-bold leading-snug text-paper md:text-3xl lg:text-4xl"
        >
          Structure first. <span className="text-amber">Detail always.</span>
        </p>

        <p
          ref={subtextRef}
          className="max-w-xl font-sans text-base text-paper-dim md:text-lg"
        >
          Shivam — B.Tech CSE (DevOps){" "}
          <span className="text-paper">|</span> Building resilient systems
        </p>
      </div>

      <div
        ref={markerRef}
        className="relative z-10 flex items-end justify-between font-mono text-xs uppercase tracking-widest text-paper-dim"
      >
        <span className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-amber" />
          Scroll
        </span>
        <span className="text-amber">01 — Build</span>
      </div>
    </section>
  );
}
