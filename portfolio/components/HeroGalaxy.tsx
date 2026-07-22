"use client";

import { useEffect, useRef } from "react";

interface Particle {
  // logarithmic-spiral "home" parameters, fixed per particle
  theta: number;
  armOffset: number;
  radiusJitter: number;
  angleJitter: number;
  colorT: number; // 0 = core (bright), 1 = outer edge (dim)
  size: number;
  accent: boolean; // rare cool-toned "sparkle" star among the warm spiral
  // live simulation state
  x: number;
  y: number;
  vx: number;
  vy: number;
}

const NUM_ARMS = 2; // a 2-arm "grand design" spiral reads more clearly than 3+
// Less than half a turn from core to edge — enough to see the arms curve,
// not so much that each arm doubles back over itself. A prior version used
// ~2.1 turns per arm; with overlap from multiple arms that painted every
// angle at least once and read as a solid ring instead of distinct spokes.
const MAX_THETA = Math.PI * 1.35;
const TILT = 0.36; // vertical squash for the "viewed at an angle" disk look
const ROTATION_SPEED = 0.045; // rad/sec, slow continuous spin
const REPEL_RADIUS = 100;
const REPEL_STRENGTH = 2600;
const SPRING_STRENGTH = 5.2;
const DAMPING = 0.9;
const IDLE_MS = 2000;

const CORE_COLOR = [255, 214, 150]; // bright warm amber/gold core
const EDGE_COLOR = [214, 220, 232]; // soft white/silver toward the arm tips
const ACCENT_COLORS = [
  [125, 211, 252], // soft cyan-blue sparkle
  [216, 180, 254], // faint violet sparkle
];
const ACCENT_CHANCE = 0.07;

function lerpColor(t: number) {
  const r = CORE_COLOR[0] + (EDGE_COLOR[0] - CORE_COLOR[0]) * t;
  const g = CORE_COLOR[1] + (EDGE_COLOR[1] - CORE_COLOR[1]) * t;
  const b = CORE_COLOR[2] + (EDGE_COLOR[2] - CORE_COLOR[2]) * t;
  return `${Math.round(r)},${Math.round(g)},${Math.round(b)}`;
}

export default function HeroGalaxy() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let isMobile = window.innerWidth < 768;
    let particles: Particle[] = [];
    let a = 1;
    let b = 1;
    let maxRadius = 1;
    let centerX = 0;
    let centerY = 0;
    let rotation = 0;

    function homePosition(p: Particle) {
      let r = a * Math.exp(b * p.theta) + p.radiusJitter;
      if (r > maxRadius) r = maxRadius;
      const angle =
        p.theta + p.armOffset + p.angleJitter + rotation;
      return {
        x: centerX + Math.cos(angle) * r,
        y: centerY + Math.sin(angle) * r * TILT,
      };
    }

    function buildParticles() {
      const count = isMobile ? 340 : 1200;
      maxRadius = Math.min(width, height) * (isMobile ? 0.4 : 0.46);
      // a gentler growth rate (bigger starting radius `a`) keeps the log
      // spiral from cramming half the particles into the innermost 15% of
      // the radius — that reads as a blob, not arms.
      a = maxRadius * 0.09;
      b = Math.log(maxRadius / a) / MAX_THETA;

      particles = Array.from({ length: count }, () => {
        // sqrt-bias the sampling so more particles land in the outer arms
        // instead of piling up near the core.
        const theta = Math.sqrt(Math.random()) * MAX_THETA;
        const armOffset =
          Math.floor(Math.random() * NUM_ARMS) * ((Math.PI * 2) / NUM_ARMS);
        // jitter proportional to the *local* spiral radius at this theta —
        // a fixed jitter (relative to maxRadius) overwhelms the tiny radii
        // near the core and turns the spiral into a shapeless blob.
        const localR = a * Math.exp(b * theta);
        const p: Particle = {
          theta,
          armOffset,
          radiusJitter: (Math.random() - 0.5) * localR * 0.5,
          angleJitter: (Math.random() - 0.5) * 0.4,
          colorT: Math.min(1, theta / MAX_THETA + Math.random() * 0.15),
          size: 0.7 + Math.random() * 1.5,
          accent: Math.random() < ACCENT_CHANCE,
          x: 0,
          y: 0,
          vx: 0,
          vy: 0,
        };
        // start scattered — the idle spring will pull these into formation
        // on load, reusing the exact same mechanism as the auto-reform.
        const scatterAngle = Math.random() * Math.PI * 2;
        const scatterR = Math.random() * Math.max(width, height) * 0.6;
        p.x = centerX + Math.cos(scatterAngle) * scatterR;
        p.y = centerY + Math.sin(scatterAngle) * scatterR;
        return p;
      });
    }

    function resize() {
      const rect = container!.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      isMobile = window.innerWidth < 768;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      centerX = width * (isMobile ? 0.5 : 0.68);
      centerY = height * (isMobile ? 0.21 : 0.5);
      buildParticles();
    }

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    // --- interaction: localized scatter on click / touch / drag ---
    let pointerActive = false;
    let pointerX = 0;
    let pointerY = 0;
    let lastInteractionTime = -Infinity; // "expired" so formation plays on load

    function toLocal(clientX: number, clientY: number) {
      const rect = container!.getBoundingClientRect();
      return { x: clientX - rect.left, y: clientY - rect.top };
    }

    function onPointerDown(e: PointerEvent) {
      pointerActive = true;
      const p = toLocal(e.clientX, e.clientY);
      pointerX = p.x;
      pointerY = p.y;
      lastInteractionTime = performance.now();
    }
    function onPointerMove(e: PointerEvent) {
      if (!pointerActive) return;
      const p = toLocal(e.clientX, e.clientY);
      pointerX = p.x;
      pointerY = p.y;
      lastInteractionTime = performance.now();
    }
    function onPointerUp() {
      pointerActive = false;
    }

    container.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);

    let raf = 0;
    let lastTime = performance.now();

    function draw(now: number) {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      if (!reducedMotion) {
        rotation += ROTATION_SPEED * dt;
      }

      const idleFor = now - lastInteractionTime;
      const reforming = idleFor > IDLE_MS;
      const springStrength = reforming ? SPRING_STRENGTH : 0.15;

      ctx!.clearRect(0, 0, width, height);
      ctx!.globalCompositeOperation = "lighter";

      for (const p of particles) {
        if (pointerActive) {
          const dx = p.x - pointerX;
          const dy = p.y - pointerY;
          const dist = Math.sqrt(dx * dx + dy * dy) || 0.0001;
          if (dist < REPEL_RADIUS) {
            const force = ((REPEL_RADIUS - dist) / REPEL_RADIUS) * REPEL_STRENGTH;
            p.vx += (dx / dist) * force * dt;
            p.vy += (dy / dist) * force * dt;
          }
        }

        if (!reducedMotion) {
          const home = homePosition(p);
          p.vx += (home.x - p.x) * springStrength * dt;
          p.vy += (home.y - p.y) * springStrength * dt;

          p.vx *= DAMPING;
          p.vy *= DAMPING;
          p.x += p.vx * dt * 60;
          p.y += p.vy * dt * 60;
        } else {
          const home = homePosition(p);
          p.x = home.x;
          p.y = home.y;
        }

        const color = p.accent
          ? ACCENT_COLORS[p.colorT > 0.5 ? 1 : 0].join(",")
          : lerpColor(p.colorT);
        const alpha = (p.accent ? 0.95 : 0.92) - p.colorT * 0.45;

        // cheap glow: a soft low-alpha halo behind a crisp core, instead of
        // ctx.shadowBlur — shadowBlur per-shape is very expensive at this
        // particle count and tanks frame rate.
        ctx!.beginPath();
        ctx!.fillStyle = `rgba(${color},${alpha * (p.accent ? 0.4 : 0.32)})`;
        ctx!.arc(p.x, p.y, p.size * (p.accent ? 3.2 : 2.6), 0, Math.PI * 2);
        ctx!.fill();

        ctx!.beginPath();
        ctx!.fillStyle = `rgba(${color},${alpha})`;
        ctx!.arc(p.x, p.y, p.accent ? p.size * 1.15 : p.size, 0, Math.PI * 2);
        ctx!.fill();
      }

      ctx!.globalCompositeOperation = "source-over";

      raf = requestAnimationFrame(draw);
    }

    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      container!.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 touch-pan-y"
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
