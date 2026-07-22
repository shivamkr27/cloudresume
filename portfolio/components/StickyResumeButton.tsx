"use client";

import { withBasePath } from "@/lib/basePath";

export default function StickyResumeButton() {
  return (
    <a
      href={withBasePath("/resume/Shivam-Kumar-Resume.pdf")}
      download
      aria-label="Download resume"
      className="fixed bottom-4 right-4 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-amber/50 bg-ink/90 text-amber backdrop-blur transition-colors duration-200 hover:bg-amber hover:text-ink sm:h-auto sm:w-auto sm:gap-2 sm:px-4 sm:py-2.5 md:bottom-8 md:right-8"
    >
      <svg
        viewBox="0 0 16 16"
        fill="none"
        className="h-3.5 w-3.5 shrink-0"
        aria-hidden="true"
      >
        <path
          d="M8 1v9m0 0L4.5 6.5M8 10l3.5-3.5M2 12.5h12"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="hidden font-mono text-xs uppercase tracking-widest sm:inline">
        Resume
      </span>
    </a>
  );
}
