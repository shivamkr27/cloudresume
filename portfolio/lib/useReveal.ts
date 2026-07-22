"use client";

import type { RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface RevealOptions {
  selector?: string;
  start?: string;
  stagger?: number;
  scale?: boolean;
}

/** Consistent fade + slide-up (+ subtle scale-in) reveal used across every section. */
export function useReveal(
  containerRef: RefObject<HTMLElement | null>,
  {
    selector = "[data-reveal]",
    start = "top 82%",
    stagger = 0.12,
    scale = true,
  }: RevealOptions = {}
) {
  useGSAP(
    () => {
      if (!containerRef.current) return;

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

          const targets = containerRef.current?.querySelectorAll(selector) ?? [];
          if (!targets.length) return;

          if (reduced) {
            gsap.set(targets, { opacity: 1, y: 0, scale: 1 });
            return;
          }

          gsap.fromTo(
            targets,
            {
              y: compact ? 28 : 48,
              opacity: 0,
              scale: scale ? 0.94 : 1,
            },
            {
              y: 0,
              opacity: 1,
              scale: 1,
              duration: 0.9,
              stagger,
              ease: "power3.out",
              scrollTrigger: {
                trigger: containerRef.current,
                start,
                once: true,
              },
            }
          );
        }
      );

      return () => mm.revert();
    },
    { scope: containerRef, dependencies: [selector, start, stagger, scale] }
  );
}
