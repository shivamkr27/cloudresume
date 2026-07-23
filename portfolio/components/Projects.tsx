"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import SectionTag from "./SectionTag";
import { useReveal } from "@/lib/useReveal";
import { withBasePath } from "@/lib/basePath";

const PROJECTS = [
  {
    id: "01",
    name: "InsightEngine",
    hook: "A multi-agent RAG system that reasons in hops, not guesses.",
    tags: ["LangGraph", "Hybrid RAG", "Groq Llama 3.3", "FastAPI", "OCI"],
    github: "https://github.com/shivamkr27/Insight-engine-agent",
    live: "http://80.225.212.121:8000",
    images: [
      "/projects/insightengine/01.png",
      "/projects/insightengine/02.png",
      "/projects/insightengine/03.png",
      "/projects/insightengine/04.png",
    ],
    bullets: [
      "Multi-agent RAG in LangGraph with parallel agent fan-out, human-in-the-loop clarification, and 4-route query classification via Pydantic structured outputs.",
      "Hybrid retrieval — ChromaDB dense search + BM25 with adaptive weighting per query type, cross-encoder reranking, and a Corrective RAG loop with automatic query rewriting.",
      "LLM-as-judge hallucination scoring, Hindi-mode output, and 159 automated tests; containerized with Docker and deployed on OCI via GitHub Actions behind a Caddy HTTPS proxy.",
    ],
  },
  {
    id: "02",
    name: "Chaos Engineering + Multi-Region DR",
    hook: "Killing production on purpose, recovering in under 5 seconds.",
    tags: ["Terraform", "AWS Multi-Region", "K3s", "Cloudflare Workers", "Chaos Engineering"],
    github: "https://github.com/shivamkr27/Chaos-and-DR",
    live: "https://shivamkr27.github.io/Chaos-and-DR",
    images: [
      "/projects/chaos-dr/01.png",
      "/projects/chaos-dr/02.png",
      "/projects/chaos-dr/03.png",
      "/projects/chaos-dr/04.png",
    ],
    bullets: [
      "Active-passive multi-region AWS infrastructure via Terraform (VPC, EC2, EIP, RDS, IAM, SG) across us-east-1 and us-west-2 — zero manual console steps.",
      "Cloudflare Worker edge proxy checks health on every request and fails over to the DR region in under 5 seconds, with no DNS-propagation delay.",
      "Proven live: 17s pod recovery, <5s regional RTO, ~95ms P99 latency, ≥99.5% availability — validated through a scripted chaos lab with pod-kill, latency-injection, and CPU-stress experiments.",
    ],
  },
  {
    id: "03",
    name: "Gnosis",
    hook: "7 services, one real-time quiz engine, zero manual deploys.",
    tags: ["Microservices", "Kubernetes", "ArgoCD", "Socket.io"],
    github: "https://github.com/shivamkr27/gnosis-devops",
    live: "http://80.225.228.31",
    images: [
      "/projects/gnosis/01.png",
      "/projects/gnosis/02.png",
      "/projects/gnosis/03.png",
      "/projects/gnosis/04.png",
      "/projects/gnosis/05.png",
      "/projects/gnosis/06.png",
    ],
    bullets: [
      "7-service microservices platform on OCI with JWT + Helmet CSP, an 8+ table PostgreSQL schema, and Redis-backed battle rooms and leaderboards.",
      "Real-time 1v1 and group quiz battles via Socket.io, XP and level progression across 25 BTech subjects, with AI-generated questions via Gemini.",
      "9-stage GitHub Actions pipeline — multi-arch Docker, Trivy, Cosign, Syft SBOM — GitOps'd to OKE via ArgoCD, with Prometheus/Grafana observability and HPA autoscaling.",
    ],
  },
];

export default function Projects() {
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);

  useReveal(sectionRef);

  return (
    <section
      ref={sectionRef}
      id="projects"
      className="mx-auto max-w-content px-6 py-24 md:px-12 md:py-36"
    >
      <SectionTag index="04" label="Projects" />

      <div className="grid grid-cols-1 gap-16 md:grid-cols-2 md:gap-12">
        <div className="hidden md:block">
          <div className="sticky top-28 h-[65vh] overflow-hidden rounded-2xl border border-white/10 bg-ink-raised p-3">
            <div className="relative h-full w-full overflow-hidden rounded-xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={PROJECTS[active].id}
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="absolute inset-0"
                >
                  <ImageCarousel
                    images={PROJECTS[active].images}
                    alt={`${PROJECTS[active].name} screenshot`}
                    priority={active === 0}
                  />
                  <div className="pointer-events-none absolute left-4 top-4 z-10 rounded-full border border-white/10 bg-ink/70 px-3 py-1 backdrop-blur-sm">
                    <span className="font-mono text-xs uppercase tracking-widest text-amber">
                      {PROJECTS[active].id} / {PROJECTS.length.toString().padStart(2, "0")}
                    </span>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-24 md:gap-32">
          {PROJECTS.map((project, i) => (
            <ProjectEntry
              key={project.id}
              project={project}
              isActive={active === i}
              onActivate={() => setActive(i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectEntry({
  project,
  isActive,
  onActivate,
}: {
  project: (typeof PROJECTS)[number];
  isActive: boolean;
  onActivate: () => void;
}) {
  return (
    <motion.div
      onViewportEnter={onActivate}
      viewport={{ margin: "-35% 0px -45% 0px" }}
      animate={{ opacity: isActive ? 1 : 0.4 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-4"
    >
      <div className="flex items-baseline gap-4">
        <span className="font-mono text-sm text-amber">{project.id}</span>
        <h3 className="font-display text-2xl font-semibold text-paper md:text-3xl">
          {project.name}
        </h3>
      </div>

      <p className="max-w-md text-base text-paper-dim md:text-lg">
        {project.hook}
      </p>

      <div className="flex flex-wrap gap-2">
        {project.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-white/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide text-paper-dim"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="relative mt-2 aspect-video overflow-hidden rounded-xl border border-white/10 bg-ink-raised p-2 md:hidden">
        <ImageCarousel images={project.images} alt={`${project.name} screenshot`} />
      </div>

      <ul className="mt-2 flex flex-col gap-2.5">
        {project.bullets.map((bullet, i) => (
          <li
            key={i}
            className="max-w-lg text-sm leading-relaxed text-paper-dim md:text-base"
          >
            {bullet}
          </li>
        ))}
      </ul>

      <div className="mt-1 flex flex-wrap items-center gap-x-5 gap-y-2">
        <a
          href={project.github}
          target="_blank"
          rel="noreferrer"
          className="w-fit font-mono text-xs uppercase tracking-widest text-amber underline decoration-amber/40 underline-offset-4 transition-colors hover:text-amber-bright"
        >
          View on GitHub →
        </a>
        {project.live && (
          <a
            href={project.live}
            target="_blank"
            rel="noreferrer"
            className="w-fit font-mono text-xs uppercase tracking-widest text-paper-dim underline decoration-white/20 underline-offset-4 transition-colors hover:text-paper"
          >
            Live Demo ↗
          </a>
        )}
      </div>
    </motion.div>
  );
}

function ImageCarousel({
  images,
  alt,
  priority,
  intervalMs = 3200,
}: {
  images: string[];
  alt: string;
  priority?: boolean;
  intervalMs?: number;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    setIndex(0);
  }, [images]);

  useEffect(() => {
    if (images.length <= 1 || paused) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [images, paused, intervalMs]);

  return (
    <div
      className="relative h-full w-full overflow-hidden rounded-xl border border-white/10 bg-ink"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <AnimatePresence initial={false}>
        <motion.div
          key={images[index]}
          initial={{ x: "18%", opacity: 0 }}
          animate={{ x: "0%", opacity: 1 }}
          exit={{ x: "-18%", opacity: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          <Image
            src={withBasePath(images[index])}
            alt={alt}
            fill
            loading={priority && index === 0 ? undefined : "lazy"}
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-contain object-center p-2"
            priority={priority && index === 0}
          />
        </motion.div>
      </AnimatePresence>

      {images.length > 1 && (
        <div className="pointer-events-none absolute inset-x-0 bottom-2 z-10 flex justify-center gap-1.5">
          {images.map((_, i) => (
            <span
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === index ? "w-4 bg-amber" : "w-1 bg-white/25"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
