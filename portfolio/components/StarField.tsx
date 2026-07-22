"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** Deterministic PRNG so the star layout matches between server and client render. */
function createSeededRandom(seed: number) {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

const random = createSeededRandom(42);
const STARS = Array.from({ length: 70 }, (_, i) => ({
  id: i,
  left: random() * 100,
  top: random() * 100,
  size: random() * 1.8 + 0.6,
  opacity: random() * 0.5 + 0.3,
  delay: random() * 6,
  duration: random() * 4 + 3,
}));

export default function StarField() {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      if (reducedMotion || !ref.current) return;

      gsap.to(ref.current, {
        yPercent: 10,
        ease: "none",
        scrollTrigger: {
          trigger: document.body,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
        },
      });
    },
    { scope: ref }
  );

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {STARS.map((star) => (
        <span
          key={star.id}
          className="absolute rounded-full bg-paper motion-safe:animate-twinkle"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
            animationDelay: `${star.delay}s`,
            animationDuration: `${star.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
