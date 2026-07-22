"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canHover = window.matchMedia("(pointer: fine)").matches;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (!canHover || reducedMotion || !dotRef.current) return;

    const dot = dotRef.current;
    dot.style.display = "block";

    const xTo = gsap.quickTo(dot, "x", { duration: 0.5, ease: "power3.out" });
    const yTo = gsap.quickTo(dot, "y", { duration: 0.5, ease: "power3.out" });

    const onMove = (e: MouseEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
    };

    const onOver = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest("a, button, [role='button']");
      gsap.to(dot, { scale: target ? 2.4 : 1, duration: 0.3, ease: "power2.out" });
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseover", onOver);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
    };
  }, []);

  return (
    <div
      ref={dotRef}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[60] hidden h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber mix-blend-difference"
    />
  );
}
