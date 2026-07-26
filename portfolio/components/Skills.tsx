"use client";

import { useEffect, useRef, useState } from "react";
import {
  forceSimulation,
  forceManyBody,
  forceLink,
  forceCollide,
  forceX,
  forceY,
  type Simulation,
  type SimulationNodeDatum,
} from "d3-force";
import SectionTag from "./SectionTag";

const CATEGORY_COLORS: Record<string, string> = {
  "Languages & Frameworks": "#e0b876",
  "DevOps & Cloud": "#c9974d",
  "Generative AI": "#8a6a3d",
  "Observability & Security": "#f3efe6",
  Concepts: "#b8735a",
};

const SKILL_GROUPS = [
  {
    label: "Languages & Frameworks",
    skills: [
      "Java",
      "Python",
      "JavaScript",
      "React.js",
      "Tailwind CSS",
      "Node.js",
      "Express.js",
      "REST APIs",
      "PostgreSQL",
      "Redis",
      "SQLite",
    ],
  },
  {
    label: "DevOps & Cloud",
    skills: [
      "Docker",
      "Kubernetes (HPA, K3s, OKE)",
      "Terraform",
      "Kustomize",
      "ArgoCD",
      "AWS (EC2, RDS, Lambda, SNS, EIP, VPC)",
      "OCI (Compute, OKE)",
      "GitHub Actions",
      "Jenkins",
    ],
  },
  {
    label: "Generative AI",
    skills: ["LangChain", "LangGraph", "ChromaDB", "Sentence Transformers"],
  },
  {
    label: "Observability & Security",
    skills: [
      "Prometheus",
      "Grafana",
      "Nginx",
      "Caddy",
      "HashiCorp Vault",
      "SonarQube",
      "Trivy",
      "Cosign",
      "Syft (SBOM)",
      "JWT",
      "Helmet",
    ],
  },
  {
    label: "Concepts",
    skills: ["CI/CD", "GitOps", "Infrastructure-as-Code", "Microservices", "Observability"],
  },
];

interface Node extends SimulationNodeDatum {
  id: string;
  label: string;
  kind: "hub" | "skill";
  category: string;
  color: string;
  r: number;
  anchorX: number;
  anchorY: number;
}

interface Link {
  source: string;
  target: string;
}

function buildGraph() {
  const nodes: Node[] = [];
  const links: Link[] = [];

  SKILL_GROUPS.forEach((group, gi) => {
    const hubId = `hub-${gi}`;
    const color = CATEGORY_COLORS[group.label];
    const angle = (gi / SKILL_GROUPS.length) * Math.PI * 2;
    const hubX = 500 + Math.cos(angle) * 180;
    const hubY = 340 + Math.sin(angle) * 180;

    nodes.push({
      id: hubId,
      label: group.label,
      kind: "hub",
      category: group.label,
      color,
      r: 30,
      x: hubX,
      y: hubY,
      anchorX: hubX,
      anchorY: hubY,
    });

    group.skills.forEach((skill, si) => {
      const id = `${hubId}-${si}`;
      const skillAngle = angle + (si - group.skills.length / 2) * 0.35;
      nodes.push({
        id,
        label: skill,
        kind: "skill",
        category: group.label,
        color,
        r: 5,
        x: 500 + Math.cos(skillAngle) * 260,
        y: 340 + Math.sin(skillAngle) * 260,
        // anchor satellites to their hub's seed spot (not their own scattered
        // start), so the whole cluster has one stable point to gently orbit
        // instead of slowly migrating across the canvas over time.
        anchorX: hubX,
        anchorY: hubY,
      });
      links.push({ source: hubId, target: id });
    });
  });

  return { nodes, links };
}

export default function Skills() {
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const nodeRefs = useRef<Map<string, SVGGElement>>(new Map());
  const linkRefs = useRef<Map<string, SVGLineElement>>(new Map());
  const adjacency = useRef<Map<string, Set<string>>>(new Map());
  const simRef = useRef<Simulation<Node, undefined> | null>(null);
  const [dims, setDims] = useState({ width: 1000, height: 760 });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const width = entry.contentRect.width;
      const height = window.innerWidth < 768 ? 620 : 760;
      setDims({ width, height });
      setReady(true);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!ready) return;

    const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const simplified = isCoarsePointer || window.innerWidth < 768;

    const { nodes, links } = buildGraph();

    // recenter seed positions (and their anchors) to the actual measured container
    const cx = dims.width / 2;
    const cy = dims.height / 2;
    const scaleX = Math.min(dims.width, 900) / 900;
    const scaleY = dims.height / 680;
    nodes.forEach((n) => {
      n.x = cx + ((n.x ?? cx) - 500) * scaleX;
      n.y = cy + ((n.y ?? cy) - 340) * scaleY;
      n.anchorX = cx + (n.anchorX - 500) * scaleX;
      n.anchorY = cy + (n.anchorY - 340) * scaleY;
    });

    const adj = new Map<string, Set<string>>();
    nodes.forEach((n) => adj.set(n.id, new Set([n.id])));
    links.forEach((l) => {
      adj.get(l.source)?.add(l.target);
      adj.get(l.target)?.add(l.source);
    });
    adjacency.current = adj;

    // d3 mutates link.source/target from ids into node object refs once the
    // link force initializes — capture the original id-based keys now, before
    // that happens, so the tick handler can still find the right <line> ref.
    const linkKeys = links.map((l, i) => `${l.source}-${l.target}-${i}`);

    const sim = forceSimulation<Node>(nodes)
      .force(
        "link",
        forceLink<Node, { source: string; target: string }>(links)
          .id((d) => d.id)
          .distance((l) => {
            const s = l.source as unknown as Node;
            const t = l.target as unknown as Node;
            return s.r + t.r + 46;
          })
          .strength(0.55)
      )
      .force(
        "charge",
        forceManyBody<Node>().strength((d) => (d.kind === "hub" ? -340 : -34))
      )
      .force(
        "collide",
        forceCollide<Node>().radius((d) => d.r + (d.kind === "hub" ? 20 : 34)).strength(0.9)
      )
      .force(
        "x",
        forceX<Node>((d) => d.anchorX).strength((d) => (d.kind === "hub" ? 0.12 : 0.05))
      )
      .force(
        "y",
        forceY<Node>((d) => d.anchorY).strength((d) => (d.kind === "hub" ? 0.12 : 0.05))
      )
      .alphaDecay(simplified ? 0.05 : 0.02)
      .velocityDecay(0.55);

    simRef.current = sim;

    const clamp = (v: number, min: number, max: number) =>
      Math.max(min, Math.min(max, v));

    sim.on("tick", () => {
      nodes.forEach((n) => {
        n.x = clamp(n.x ?? cx, n.r + 4, dims.width - n.r - 4);
        n.y = clamp(n.y ?? cy, n.r + 4, dims.height - n.r - 4);

        const g = nodeRefs.current.get(n.id);
        if (g) g.setAttribute("transform", `translate(${n.x},${n.y})`);
      });

      links.forEach((l, i) => {
        const line = linkRefs.current.get(linkKeys[i]);
        if (!line) return;
        // by tick time, d3's link force has already resolved these to node refs
        const s = l.source as unknown as Node;
        const t = l.target as unknown as Node;
        line.setAttribute("x1", String(s.x));
        line.setAttribute("y1", String(s.y));
        line.setAttribute("x2", String(t.x));
        line.setAttribute("y2", String(t.y));
      });
    });

    if (!reducedMotion && !simplified) {
      sim.alphaTarget(0.02);
    } else {
      // let it settle once, then stop entirely to save CPU on touch/low-power devices
      window.setTimeout(() => sim.alphaTarget(0).stop(), 2200);
    }

    // drag handling
    let dragNode: Node | null = null;

    function toLocalPoint(e: PointerEvent) {
      const svg = svgRef.current;
      if (!svg) return { x: 0, y: 0 };
      const rect = svg.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }

    function onPointerDown(e: PointerEvent, node: Node) {
      dragNode = node;
      (e.target as Element).setPointerCapture(e.pointerId);
      if (!reducedMotion) sim.alphaTarget(0.3).restart();
      const p = toLocalPoint(e);
      node.fx = p.x;
      node.fy = p.y;
    }

    function onPointerMove(e: PointerEvent) {
      if (!dragNode) return;
      const p = toLocalPoint(e);
      dragNode.fx = p.x;
      dragNode.fy = p.y;
      if (reducedMotion || simplified) {
        dragNode.x = p.x;
        dragNode.y = p.y;
        const g = nodeRefs.current.get(dragNode.id);
        if (g) g.setAttribute("transform", `translate(${p.x},${p.y})`);
      }
    }

    function onPointerUp() {
      if (!dragNode) return;
      dragNode.fx = null;
      dragNode.fy = null;
      if (!reducedMotion && !simplified) sim.alphaTarget(0.02);
      dragNode = null;
    }

    const cleanups: Array<() => void> = [];
    nodeRefs.current.forEach((g, id) => {
      const node = nodes.find((n) => n.id === id);
      if (!node) return;
      const handleDown = (e: PointerEvent) => onPointerDown(e, node);
      g.addEventListener("pointerdown", handleDown);
      cleanups.push(() => g.removeEventListener("pointerdown", handleDown));
    });
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    return () => {
      sim.stop();
      cleanups.forEach((fn) => fn());
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [ready, dims.width, dims.height]);

  const { nodes: staticNodes, links: staticLinks } = buildGraph();

  const [hovered, setHovered] = useState<string | null>(null);
  const connected = hovered ? adjacency.current.get(hovered) : null;

  return (
    <section
      ref={sectionRef}
      id="skills"
      className="mx-auto max-w-content px-6 py-24 md:px-12 md:py-36"
    >
      <SectionTag index="05" label="Skills" />

      <p className="mb-6 font-mono text-xs text-paper-dim">
        Drag a node. Hover to trace its connections.
      </p>

      <div
        ref={containerRef}
        className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-ink-raised"
        style={{ height: dims.height }}
      >
        <svg
          ref={svgRef}
          width={dims.width}
          height={dims.height}
          className="block touch-none select-none"
        >
          <g>
            {staticLinks.map((l, i) => (
              <line
                key={`${l.source}-${l.target}-${i}`}
                ref={(el) => {
                  if (el) linkRefs.current.set(`${l.source}-${l.target}-${i}`, el);
                }}
                stroke="#c9974d"
                strokeOpacity={
                  connected
                    ? connected.has(l.source) && connected.has(l.target)
                      ? 0.7
                      : 0.06
                    : 0.18
                }
                strokeWidth={1}
                style={{ transition: "stroke-opacity 0.25s ease" }}
              />
            ))}
          </g>
          <g>
            {staticNodes.map((n) => {
              const isDim = connected ? !connected.has(n.id) : false;
              const isHovered = hovered === n.id;
              return (
                <g
                  key={n.id}
                  ref={(el) => {
                    if (el) nodeRefs.current.set(n.id, el);
                  }}
                  onPointerEnter={() => setHovered(n.id)}
                  onPointerLeave={() => setHovered((h) => (h === n.id ? null : h))}
                  style={{
                    cursor: "grab",
                    opacity: isDim ? 0.2 : 1,
                    transition: "opacity 0.25s ease",
                  }}
                >
                  <circle
                    r={isHovered ? n.r * 1.35 : n.r}
                    fill={n.kind === "hub" ? n.color : n.color}
                    fillOpacity={n.kind === "hub" ? 0.16 : 0.9}
                    stroke={n.color}
                    strokeWidth={n.kind === "hub" ? 1.5 : 0}
                    style={{ transition: "r 0.2s ease" }}
                  />
                  <text
                    x={n.kind === "hub" ? 0 : n.r + 6}
                    y={n.kind === "hub" ? -n.r - 10 : 3}
                    textAnchor={n.kind === "hub" ? "middle" : "start"}
                    className="pointer-events-none select-none"
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: n.kind === "hub" ? 12 : 9,
                      fontWeight: n.kind === "hub" ? 600 : 400,
                      fill: n.kind === "hub" ? n.color : "#8f8b81",
                      textTransform: n.kind === "hub" ? "uppercase" : "none",
                      letterSpacing: n.kind === "hub" ? "0.05em" : "normal",
                    }}
                  >
                    {n.label}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>
    </section>
  );
}
