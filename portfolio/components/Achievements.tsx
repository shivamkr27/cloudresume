"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import SectionTag from "./SectionTag";
import { withBasePath } from "@/lib/basePath";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const LOG_LINES = [
  {
    title: "AWS Certified Cloud Practitioner",
    detail: "Amazon Web Services",
    time: "00:00:02",
    href: null,
  },
  {
    title: "Amazon Connect Development Fundamentals",
    detail: "AWS Training & Certification · Apr 2026",
    time: "00:00:05",
    href: "/certifications/amazon-connect-development-fundamentals.pdf",
  },
  {
    title: "Serverless Web Apps using Amazon DynamoDB — Part 1",
    detail: "AWS Training & Certification · Jun 2026",
    time: "00:00:09",
    href: "/certifications/serverless-web-apps-dynamodb-part1.pdf",
  },
  {
    title: "Amazon DynamoDB for Serverless Architectures",
    detail: "AWS Training & Certification · Jun 2026",
    time: "00:00:13",
    href: "/certifications/dynamodb-for-serverless-architectures.pdf",
  },
  {
    title: "Getting into the Serverless Mindset",
    detail: "AWS Training & Certification · Jun 2026",
    time: "00:00:17",
    href: "/certifications/getting-into-the-serverless-mindset.pdf",
  },
  {
    title: "Introduction to Serverless Development",
    detail: "AWS Training & Certification · Jun 2026",
    time: "00:00:21",
    href: "/certifications/introduction-to-serverless-development.pdf",
  },
  {
    title: "Winner — Intra-Department Badminton Tournament, UPES",
    detail: "Achievement",
    time: "00:00:25",
    href: null,
  },
];

export default function Achievements() {
  const sectionRef = useRef<HTMLElement>(null);
  const lineRefs = useRef<Array<HTMLDivElement | null>>([]);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add({ all: "all", reduced: "(prefers-reduced-motion: reduce)" }, (context) => {
        const { reduced } = context.conditions as { reduced: boolean };
        const targets = lineRefs.current.filter(Boolean);
        if (!targets.length) return;

        if (reduced) {
          gsap.set(targets, { clipPath: "inset(0 0% 0 0)", opacity: 1 });
          return;
        }

        gsap.fromTo(
          targets,
          { clipPath: "inset(0 100% 0 0)", opacity: 0.4 },
          {
            clipPath: "inset(0 0% 0 0)",
            opacity: 1,
            duration: 0.7,
            stagger: 0.22,
            ease: "steps(14)",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 75%",
              once: true,
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
      id="achievements"
      className="mx-auto max-w-content px-6 py-24 md:px-12 md:py-36"
    >
      <SectionTag index="06" label="Achievements & Certifications" />

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#050504]">
        <div className="flex items-center gap-2 border-b border-white/10 bg-ink-raised px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber/50" />
          <span className="ml-3 font-mono text-[11px] uppercase tracking-widest text-paper-dim">
            pipeline / verify-certifications.sh
          </span>
        </div>

        <div className="flex flex-col gap-3 p-5 font-mono text-xs sm:p-6 sm:text-sm">
          <p className="text-paper-dim">
            <span className="text-amber">root@shivam</span>:~$ ./verify-certifications.sh
          </p>

          {LOG_LINES.map((line, i) => {
            const content = (
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <span className="text-amber">[✓]</span>
                <span className="text-paper">{line.title}</span>
                <span className="mx-1 hidden h-px flex-1 self-center border-t border-dotted border-white/15 sm:block" />
                <span className="text-[10px] uppercase tracking-wide text-paper-dim sm:text-xs">
                  {line.detail}
                </span>
                <span className="text-amber">PASSED</span>
                <span className="text-paper-dim">{line.time}</span>
              </div>
            );

            return (
              <div
                key={line.title}
                ref={(el) => {
                  lineRefs.current[i] = el;
                }}
              >
                {line.href ? (
                  <a
                    href={withBasePath(line.href)}
                    target="_blank"
                    rel="noreferrer"
                    className="-mx-2 block rounded px-2 py-0.5 transition-colors hover:bg-white/5"
                  >
                    {content}
                  </a>
                ) : (
                  content
                )}
              </div>
            );
          })}

          <p className="flex items-center gap-2 pt-1 text-paper-dim">
            <span>$</span>
            <span className="inline-block h-4 w-2 bg-amber animate-blink" />
          </p>
        </div>
      </div>
    </section>
  );
}
