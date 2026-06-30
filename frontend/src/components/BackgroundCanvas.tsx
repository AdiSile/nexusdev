"use client";

import { useEffect, useRef, useCallback } from "react";

// ═══════════════════════════════════════════════════════════════
// TIPURI
// ═══════════════════════════════════════════════════════════════

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseRadius: number;
  color: string;
  alpha: number;
  baseAlpha: number;
  phase: number;        // pentru animație auroră (unde sinusoidale)
  speed: number;        // viteză de drift
  type: "core" | "glow" | "spark";
}

interface MouseState {
  x: number;
  y: number;
  active: boolean;
}

// ═══════════════════════════════════════════════════════════════
// CONSTANTE
// ═══════════════════════════════════════════════════════════════

const PARTICLE_COUNT = 120;
const CONNECTION_DISTANCE = 140;
const MOUSE_RADIUS = 180;
const MOUSE_REPULSE_FORCE = 0.9;
const MOUSE_ATTRACT_FORCE = 0.08;
const AURORA_SPEED = 0.003;
const SPARK_CHANCE = 0.12;

// Paleta de culori: violet profund → violet deschis → alb
const PURPLE_PALETTE: string[] = [
  "#7e22ce", // purple-700
  "#9333ea", // purple-600
  "#a855f7", // purple-500
  "#c084fc", // purple-400
  "#d8b4fe", // purple-300
  "#e9d5ff", // purple-200
  "#f3e8ff", // purple-100
  "#faf5ff", // purple-50
  "#ffffff", // white
];

const AURORA_COLORS: string[] = [
  "#7e22ce",
  "#a855f7",
  "#c084fc",
  "#e9d5ff",
  "#faf5ff",
];

// ═══════════════════════════════════════════════════════════════
// FUNCȚII AJUTĂTOARE
// ═══════════════════════════════════════════════════════════════

function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function pickPaletteColor(i: number, total: number): string {
  const ratio = i / total;
  const index = Math.floor(ratio * (PURPLE_PALETTE.length - 1));
  return PURPLE_PALETTE[Math.min(index, PURPLE_PALETTE.length - 1)];
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTA
// ═══════════════════════════════════════════════════════════════

export default function BackgroundCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef<MouseState>({ x: -1000, y: -1000, active: false });
  const rafRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  const dimensionsRef = useRef<{ w: number; h: number }>({ w: 0, h: 0 });

  // ── Creare particule ──────────────────────────────────────
  const createParticles = useCallback(
    (w: number, h: number): Particle[] => {
      const particles: Particle[] = [];

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const colorHex = pickPaletteColor(i, PARTICLE_COUNT);
        const typeRand = Math.random();

        let type: Particle["type"];
        let radius: number;
        let alpha: number;
        let speed: number;

        if (typeRand < 0.15) {
          type = "spark";
          radius = randomBetween(0.8, 1.6);
          alpha = randomBetween(0.55, 0.9);
          speed = randomBetween(0.3, 0.7);
        } else if (typeRand < 0.45) {
          type = "glow";
          radius = randomBetween(2.2, 3.8);
          alpha = randomBetween(0.18, 0.35);
          speed = randomBetween(0.1, 0.35);
        } else {
          type = "core";
          radius = randomBetween(1.2, 2.4);
          alpha = randomBetween(0.3, 0.55);
          speed = randomBetween(0.15, 0.5);
        }

        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          radius,
          baseRadius: radius,
          color: colorHex,
          alpha,
          baseAlpha: alpha,
          phase: Math.random() * Math.PI * 2,
          speed,
          type,
        });
      }

      return particles;
    },
    []
  );

  // ── Redimensionare canvas ─────────────────────────────────
  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const ctx = canvas.getContext("2d");
    if (ctx) ctx.scale(dpr, dpr);

    dimensionsRef.current = { w, h };
    particlesRef.current = createParticles(w, h);
  }, [createParticles]);

  // ── Loop principal ────────────────────────────────────────
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { w, h } = dimensionsRef.current;
    const mouse = mouseRef.current;
    const particles = particlesRef.current;
    const time = timeRef.current;

    // Clear canvas
    ctx.clearRect(0, 0, w, h);

    // ── Fundal auroră subtil (vertical gradient wave) ──────
    const auroraGrad = ctx.createRadialGradient(
      w * 0.5 + Math.sin(time * 0.4) * w * 0.15,
      h * 0.45 + Math.cos(time * 0.3) * h * 0.1,
      0,
      w * 0.5,
      h * 0.5,
      Math.max(w, h) * 0.65
    );
    auroraGrad.addColorStop(0, hexToRgba(AURORA_COLORS[1], 0.06));
    auroraGrad.addColorStop(0.4, hexToRgba(AURORA_COLORS[3], 0.03));
    auroraGrad.addColorStop(0.7, hexToRgba(AURORA_COLORS[0], 0.05));
    auroraGrad.addColorStop(1, "rgba(10,10,15,0)");
    ctx.fillStyle = auroraGrad;
    ctx.fillRect(0, 0, w, h);

    // A doua pată auroră (stânga sus)
    const auroraGrad2 = ctx.createRadialGradient(
      w * 0.25 + Math.cos(time * 0.5) * w * 0.08,
      h * 0.2 + Math.sin(time * 0.45) * h * 0.06,
      0,
      w * 0.25,
      h * 0.2,
      Math.max(w, h) * 0.4
    );
    auroraGrad2.addColorStop(0, hexToRgba(AURORA_COLORS[2], 0.05));
    auroraGrad2.addColorStop(0.5, hexToRgba(AURORA_COLORS[4], 0.02));
    auroraGrad2.addColorStop(1, "rgba(10,10,15,0)");
    ctx.fillStyle = auroraGrad2;
    ctx.fillRect(0, 0, w, h);

    // ── Update & draw particles ────────────────────────────
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      // --- Mișcare auroră (undă sinusoidală) ---
      const auroraWaveY = Math.sin(time * 0.8 + p.phase * 2) * 0.3;
      const auroraWaveX = Math.cos(time * 0.6 + p.phase) * 0.2;

      // --- Interacțiune mouse ---
      if (mouse.active) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < MOUSE_RADIUS && dist > 0.5) {
          const force =
            MOUSE_REPULSE_FORCE * (1 - dist / MOUSE_RADIUS) ** 2;
          const nx = dx / dist;
          const ny = dy / dist;

          // Repulsie + ușoară atracție orbitală
          p.vx += nx * force * 1.2;
          p.vy += ny * force * 1.2;

          // Atracție subtilă spre mouse (orbita)
          p.vx -= ny * MOUSE_ATTRACT_FORCE * (1 - dist / MOUSE_RADIUS);
          p.vy += nx * MOUSE_ATTRACT_FORCE * (1 - dist / MOUSE_RADIUS);

          // Crește luminozitatea lângă mouse
          p.alpha = Math.min(1, p.baseAlpha + 0.35 * (1 - dist / MOUSE_RADIUS));
          p.radius = p.baseRadius + 1.2 * (1 - dist / MOUSE_RADIUS);
        } else {
          p.alpha += (p.baseAlpha - p.alpha) * 0.05;
          p.radius += (p.baseRadius - p.radius) * 0.05;
        }
      } else {
        p.alpha += (p.baseAlpha - p.alpha) * 0.03;
        p.radius += (p.baseRadius - p.radius) * 0.03;
      }

      // --- Aplică viteza + drift auroră ---
      p.vx += auroraWaveX * AURORA_SPEED;
      p.vy += auroraWaveY * AURORA_SPEED;

      // Frânare ușoară
      p.vx *= 0.995;
      p.vy *= 0.995;

      p.x += p.vx + auroraWaveX * 0.15;
      p.y += p.vy + auroraWaveY * 0.15;

      // --- Wrap around (ecran toroidal) ---
      if (p.x < -20) p.x = w + 20;
      if (p.x > w + 20) p.x = -20;
      if (p.y < -20) p.y = h + 20;
      if (p.y > h + 20) p.y = -20;

      // --- Draw particle ---
      ctx.save();

      if (p.type === "spark") {
        // Spark: mic, strălucitor
        const sparkGrad = ctx.createRadialGradient(
          p.x, p.y, 0,
          p.x, p.y, p.radius * 2.5
        );
        sparkGrad.addColorStop(0, hexToRgba(p.color, p.alpha));
        sparkGrad.addColorStop(0.5, hexToRgba(p.color, p.alpha * 0.3));
        sparkGrad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = sparkGrad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 2.5, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === "glow") {
        // Glow: mare, blurat
        const glowGrad = ctx.createRadialGradient(
          p.x, p.y, 0,
          p.x, p.y, p.radius * 3
        );
        glowGrad.addColorStop(0, hexToRgba(p.color, p.alpha * 0.9));
        glowGrad.addColorStop(0.3, hexToRgba(p.color, p.alpha * 0.4));
        glowGrad.addColorStop(0.7, hexToRgba(p.color, p.alpha * 0.06));
        glowGrad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 3, 0, Math.PI * 2);
        ctx.fill();

        // Miez mai strălucitor
        const coreGrad = ctx.createRadialGradient(
          p.x, p.y, 0,
          p.x, p.y, p.radius * 0.8
        );
        coreGrad.addColorStop(0, hexToRgba("#ffffff", p.alpha * 0.6));
        coreGrad.addColorStop(0.5, hexToRgba(p.color, p.alpha * 0.5));
        coreGrad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 0.8, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Core: particulă standard
        const coreGrad = ctx.createRadialGradient(
          p.x, p.y, 0,
          p.x, p.y, p.radius * 2
        );
        coreGrad.addColorStop(0, hexToRgba("#ffffff", p.alpha * 0.9));
        coreGrad.addColorStop(0.3, hexToRgba(p.color, p.alpha * 0.7));
        coreGrad.addColorStop(0.7, hexToRgba(p.color, p.alpha * 0.1));
        coreGrad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    // ── Draw connections ────────────────────────────────────
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i];
        const b = particles[j];

        // Sari conexiunile dintre spark-uri mici
        if (a.type === "spark" && b.type === "spark") continue;

        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONNECTION_DISTANCE) {
          const maxAlpha = 0.12;
          const alpha = maxAlpha * (1 - dist / CONNECTION_DISTANCE);
          const midColor =
            parseInt(a.color.slice(1), 16) > parseInt(b.color.slice(1), 16)
              ? a.color
              : b.color;

          ctx.save();
          ctx.strokeStyle = hexToRgba(midColor, alpha);
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
          ctx.restore();
        }
      }
    }

    // ── Draw mouse halo ─────────────────────────────────────
    if (mouse.active) {
      const haloGrad = ctx.createRadialGradient(
        mouse.x, mouse.y, 0,
        mouse.x, mouse.y, MOUSE_RADIUS * 0.7
      );
      haloGrad.addColorStop(0, hexToRgba("#c084fc", 0.08));
      haloGrad.addColorStop(0.4, hexToRgba("#a855f7", 0.04));
      haloGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = haloGrad;
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, MOUSE_RADIUS * 0.7, 0, Math.PI * 2);
      ctx.fill();
    }

    // Incrementare timp
    timeRef.current += 0.016; // ~60fps
    rafRef.current = requestAnimationFrame(animate);
  }, []);

  // ── Event listeners ───────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    resize();
    rafRef.current = requestAnimationFrame(animate);

    const handleResize = () => resize();
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY, active: true };
    };
    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };
    const handleMouseEnter = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY, active: true };
    };
    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (touch) {
        mouseRef.current = {
          x: touch.clientX,
          y: touch.clientY,
          active: true,
        };
      }
    };
    const handleTouchEnd = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    canvas.addEventListener("mouseenter", handleMouseEnter as EventListener);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      canvas.removeEventListener("mouseenter", handleMouseEnter as EventListener);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [resize, animate]);

  // ── Render ────────────────────────────────────────────────
  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 z-0 pointer-events-none"
      style={{
        background: "transparent",
      }}
    />
  );
}