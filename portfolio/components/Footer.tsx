"use client";

import { useEffect, useRef, useState } from "react";
import SectionTag from "./SectionTag";
import { useReveal } from "@/lib/useReveal";
import { withBasePath } from "@/lib/basePath";

const LAUNCH_DATE = new Date("2026-07-21T00:00:00Z");
const VISITOR_API_URL =
  "https://danh682p26.execute-api.ap-south-1.amazonaws.com/prod/visitorcountapi";

const LINKS = [
  { label: "Email", value: "shivamkumarbxr8@gmail.com", href: "mailto:shivamkumarbxr8@gmail.com" },
  { label: "GitHub", value: "github.com/shivamkr27", href: "https://github.com/shivamkr27" },
  { label: "LinkedIn", value: "linkedin.com/in/shivamkr2004", href: "https://linkedin.com/in/shivamkr2004" },
];

export default function Footer() {
  const sectionRef = useRef<HTMLElement>(null);
  const [now, setNow] = useState<Date | null>(null);
  const [visitorCount, setVisitorCount] = useState<number | null>(null);
  const visitorFetchedRef = useRef(false);

  useReveal(sectionRef, { stagger: 0.12 });

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // real visitor count from the Cloud Resume Challenge Lambda + DynamoDB API.
  // Guarded so React Strict Mode's dev double-invoke never double-increments it.
  useEffect(() => {
    if (visitorFetchedRef.current) return;
    visitorFetchedRef.current = true;

    fetch(VISITOR_API_URL)
      .then((res) => res.text())
      .then((text) => {
        const n = parseInt(text, 10);
        if (!Number.isNaN(n)) setVisitorCount(n);
      })
      .catch(() => {});
  }, []);

  const uptime = now ? formatUptime(now.getTime() - LAUNCH_DATE.getTime()) : null;

  return (
    <footer
      ref={sectionRef}
      id="contact"
      className="mx-auto max-w-content px-6 py-24 md:px-12 md:py-36"
    >
      <SectionTag index="07" label="Contact" />

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-ink-raised">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-3.5 sm:px-6">
          <span className="font-display text-sm font-semibold uppercase tracking-widest text-paper">
            Contact <span className="text-amber">/</span> Status
          </span>

          <div className="flex items-center gap-4">
            {visitorCount !== null && (
              <span className="font-mono text-[10px] uppercase tracking-widest text-paper-dim">
                Visitor No. <span className="text-amber">{visitorCount}</span>
              </span>
            )}
            <span className="flex items-center gap-2 rounded-full border border-amber/40 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-amber">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-amber" />
              </span>
              Open to opportunities
            </span>
            <span
              suppressHydrationWarning
              className="hidden font-mono text-[11px] text-paper-dim sm:block"
            >
              {now ? now.toLocaleTimeString("en-US", { hour12: false }) : "--:--:--"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 p-6 sm:p-8 md:grid-cols-[1.2fr_1fr] md:gap-12 md:p-10">
          <div data-reveal className="flex flex-col gap-6">
            <p className="max-w-lg font-display text-2xl font-medium leading-snug text-paper md:text-3xl">
              Open to internships and collaborations — reach out.
            </p>

            <a
              href={withBasePath("/resume/Shivam-Kumar-Resume.pdf")}
              download
              className="w-fit rounded-full border border-amber px-6 py-3 font-mono text-xs uppercase tracking-widest text-amber transition-colors duration-200 hover:bg-amber hover:text-ink"
            >
              Download Resume
            </a>
          </div>

          <div data-reveal className="flex flex-col gap-3">
            {LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.href.startsWith("http") ? "_blank" : undefined}
                rel={link.href.startsWith("http") ? "noreferrer" : undefined}
                className="group flex items-center justify-between gap-4 rounded-lg border border-white/10 px-4 py-3 transition-colors duration-200 hover:border-amber/40 hover:bg-white/[0.03]"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-paper-dim">
                    {link.label}
                  </span>
                  <span className="text-sm text-paper md:text-base">{link.value}</span>
                </div>
                <span className="font-mono text-paper-dim transition-transform duration-200 group-hover:translate-x-1 group-hover:text-amber">
                  →
                </span>
              </a>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 px-5 py-3.5 font-mono text-[11px] text-paper-dim sm:px-6">
          <span suppressHydrationWarning>
            {uptime ? `Site running for ${uptime}` : "Site running since Jul 21, 2026"}
          </span>
          <span>&copy; {new Date().getFullYear()} Shivam</span>
        </div>
      </div>
    </footer>
  );
}

function formatUptime(ms: number) {
  if (ms < 0) return "0m";
  const minutes = Math.floor(ms / 60000);
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  const mins = minutes % 60;
  return `${days}d ${hours}h ${mins}m`;
}
