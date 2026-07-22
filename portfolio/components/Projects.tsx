"use client";

import { useRef, useState } from "react";
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
    tags: ["LangGraph", "ChromaDB", "Hybrid Retrieval", "Docker", "OCI"],
    github: "https://github.com/shivamkr27",
    cover: "/projects/insightengine/01.png",
    images: ["/projects/insightengine/01.png"],
    bullets: [
      "Multi-agent RAG in LangGraph with parallel agent fan-out, human-in-the-loop clarification, and 4-route query routing via Pydantic structured outputs.",
      "Hybrid retrieval — ChromaDB dense search + BM25 with weighted fusion and cross-encoder reranking — plus a Corrective RAG loop with automatic query rewriting.",
      "Containerized with Docker, deployed on OCI via GitHub Actions CI/CD behind a Caddy HTTPS reverse proxy.",
    ],
  },
  {
    id: "02",
    name: "Chaos Engineering + Multi-Region DR",
    hook: "Killing production on purpose, recovering in under 5 seconds.",
    tags: ["Terraform", "AWS Multi-Region", "K3s", "Cloudflare Workers"],
    github: "https://github.com/shivamkr27",
    cover: "/projects/chaos-dr/01.png",
    images: ["/projects/chaos-dr/01.png", "/projects/chaos-dr/02.png"],
    bullets: [
      "Active-passive multi-region AWS infrastructure via Terraform (VPC, EC2, EIP, RDS, IAM, SG) across us-east-1 and us-west-2 — zero manual console steps.",
      "Cloudflare Worker edge proxy for zero-TTL failover, rerouting to the DR region in under 5 seconds with no DNS-propagation delay.",
      "Validated with 4 chaos experiments: RTO under 5s, P99 latency 92ms, 99.9% availability.",
    ],
  },
  {
    id: "03",
    name: "Gnosis",
    hook: "7 services, one real-time quiz engine, zero manual deploys.",
    tags: ["Microservices", "Kubernetes", "ArgoCD", "Socket.io"],
    github: "https://github.com/shivamkr27",
    cover: "/projects/gnosis/01.png",
    images: [
      "/projects/gnosis/01.png",
      "/projects/gnosis/02.png",
      "/projects/gnosis/03.png",
      "/projects/gnosis/04.png",
    ],
    bullets: [
      "7-service microservices platform with JWT + Helmet CSP, an 8+ table PostgreSQL schema, and Redis-backed battle rooms and leaderboards.",
      "Real-time multiplayer quiz engine with Socket.io for 1v1 and group sessions up to 10 players.",
      "9-stage GitHub Actions CI/CD pipeline — multi-arch Docker, Trivy, Cosign, Syft SBOM, ArgoCD GitOps to OKE.",
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
          <div className="sticky top-28 h-[65vh] overflow-hidden rounded-2xl border border-white/10 bg-ink-raised">
            <AnimatePresence mode="wait">
              <motion.div
                key={PROJECTS[active].id}
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative h-full w-full"
              >
                <Image
                  src={withBasePath(PROJECTS[active].cover)}
                  alt={`${PROJECTS[active].name} screenshot`}
                  fill
                  sizes="50vw"
                  className="object-cover object-top"
                  priority={active === 0}
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/90 to-transparent p-6">
                  <span className="font-mono text-xs uppercase tracking-widest text-amber">
                    {PROJECTS[active].id} / {PROJECTS.length.toString().padStart(2, "0")}
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
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

      <div className="relative mt-2 aspect-video overflow-hidden rounded-lg border border-white/10 bg-ink md:hidden">
        <Image
          src={withBasePath(project.cover)}
          alt={`${project.name} screenshot`}
          fill
          loading="lazy"
          sizes="100vw"
          className="object-cover object-top"
        />
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

      <a
        href={project.github}
        target="_blank"
        rel="noreferrer"
        className="mt-1 w-fit font-mono text-xs uppercase tracking-widest text-amber underline decoration-amber/40 underline-offset-4 transition-colors hover:text-amber-bright"
      >
        View on GitHub →
      </a>
    </motion.div>
  );
}
