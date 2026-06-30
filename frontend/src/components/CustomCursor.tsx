"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

// ═══════════════════════════════════════════════════════════════
// TIPURI
// ═══════════════════════════════════════════════════════════════

interface TrailParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  radius: number;
  color: string;
}

interface MousePos {
  x: number;
  y: number;
}

// ═══════════════════════════════════════════════════════════════
// CONSTANTE
// ═══════════════════════════════════════════════════════════════

const TRAIL_MAX_PARTICLES = 80;
const TRAIL_FADE_SPEED = 0.018;

const CURSOR_DOT_SIZE = 8;
const CURSOR_RING_SIZE = 36;
const CURSOR_RING_HOVER_SIZE = 56;
const CURSOR_GLOW_SIZE = 80;

const GOLD_COLORS: string[] = [
  "#fef3c7",
  "#fde68a",
  "#fcd34d",
  "#fbbf24",
  "#f59e0b",
  "#d97706",
];

const INTERACTIVE_SELECTOR: string = [
  "a[href]",
  "button",
  "input",
  "textarea",
  "select",
  "[role='button']",
  "[tabindex]:not([tabindex='-1'])",
  "[data-cursor-hover]",
  ".cursor-hover",
  "label",
  "details summary",
].join(",");

// ═══════════════════════════════════════════════════════════════
// FUNCȚII AJUTĂTOARE
// ═══════════════════════════════════════════════════════════════

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function randomGoldColor(): string {
  const idx = Math.floor(Math.random() * GOLD_COLORS.length);
  return (GOLD_COLORS[idx] as string | undefined) ?? "#f59e0b";
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTA PRINCIPALĂ
// ═══════════════════════════════════════════════════════════════

export default function CustomCursor() {
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<TrailParticle[]>([]);
  const mouseRef = useRef<MousePos>({ x: -200, y: -200 });
  const prevMouseRef = useRef<MousePos>({ x: -200, y: -200 });
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  const motionX = useMotionValue(-100);
  const motionY = useMotionValue(-100);

  const springConfig = { damping: 26, stiffness: 350, mass: 0.7 };
  const ringX = useSpring(motionX, springConfig);
  const ringY = useSpring(motionY, springConfig);

  const glowConfig = { damping: 40, stiffness: 200, mass: 1.2 };
  const glowX = useSpring(motionX, glowConfig);
  const glowY = useSpring(motionY, glowConfig);

  // ── Canvas trail loop ────────────────────────────────────
  const animateTrail = useCallback(
    (timestamp: number) => {
      const canvas = canvasRef.current;
      if (!canvas) {
        rafRef.current = requestAnimationFrame(animateTrail);
        return;
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        rafRef.current = requestAnimationFrame(animateTrail);
        return;
      }

      const _dt =
        lastTimeRef.current === 0
          ? 0.016
          : (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;

      void _dt;

      const { w, h } = { w: canvas.width, h: canvas.height };
      const mouse = mouseRef.current;
      const prevMouse = prevMouseRef.current;

      ctx.clearRect(0, 0, w, h);

      // Spawn particule
      const dx = mouse.x - prevMouse.x;
      const dy = mouse.y - prevMouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      const segments = Math.max(1, Math.floor(dist / 3));
      for (let s = 0; s < segments; s++) {
        const t = s / Math.max(segments, 1);
        const spawnX = prevMouse.x + dx * t;
        const spawnY = prevMouse.y + dy * t;

        const count = Math.random() < 0.5 ? 1 : 2;
        for (let i = 0; i < count; i++) {
          if (particlesRef.current.length >= TRAIL_MAX_PARTICLES) break;

          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 0.6 + 0.1;
          const color = isHovering ? randomGoldColor() : "#c084fc";
          const radius = isHovering
            ? Math.random() * 2.5 + 1.2
            : Math.random() * 1.8 + 0.6;

          particlesRef.current.push({
            x: spawnX + (Math.random() - 0.5) * 4,
            y: spawnY + (Math.random() - 0.5) * 4,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 1,
            maxLife: 0.4 + Math.random() * 0.4,
            radius,
            color,
          });
        }
      }

      prevMouseRef.current = { x: mouse.x, y: mouse.y };

      // Update & draw
      const alive: TrailParticle[] = [];
      for (const p of particlesRef.current) {
        p.life -= TRAIL_FADE_SPEED / Math.max(p.maxLife, 0.1);
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.96;
        p.vy *= 0.96;
        p.radius *= 0.992;

        if (p.life <= 0) continue;
        alive.push(p);

        ctx.save();
        const alpha = p.life * (isHovering ? 0.9 : 0.6);
        const grad = ctx.createRadialGradient(
          p.x,
          p.y,
          0,
          p.x,
          p.y,
          p.radius * 2.5
        );
        grad.addColorStop(0, hexToRgba(p.color, alpha));
        grad.addColorStop(0.4, hexToRgba(p.color, alpha * 0.5));
        grad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      particlesRef.current = alive;

      // Canvas glow subtil sub cursor
      if (mouse.x > 0 && mouse.y > 0 && isVisible) {
        ctx.save();
        const glowRadius = isHovering ? 60 : 28;
        const glowAlpha = isHovering ? 0.15 : 0.06;
        const glowColor = isHovering ? "#f59e0b" : "#c084fc";

        const glowGrad = ctx.createRadialGradient(
          mouse.x,
          mouse.y,
          0,
          mouse.x,
          mouse.y,
          glowRadius
        );
        glowGrad.addColorStop(0, hexToRgba(glowColor, glowAlpha));
        glowGrad.addColorStop(0.4, hexToRgba(glowColor, glowAlpha * 0.5));
        glowGrad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, glowRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      rafRef.current = requestAnimationFrame(animateTrail);
    },
    [isHovering, isVisible]
  );

  // ── Detectare elemente interactive ──────────────────────
  const checkInteractive = useCallback((el: Element | null): boolean => {
    if (!el) return false;
    try {
      return el.matches(INTERACTIVE_SELECTOR);
    } catch {
      return false;
    }
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      motionX.set(e.clientX);
      motionY.set(e.clientY);
      mouseRef.current = { x: e.clientX, y: e.clientY };

      if (!isVisible) setIsVisible(true);

      const target = e.target as Element | null;
      setIsHovering(checkInteractive(target));
    },
    [motionX, motionY, isVisible, checkInteractive]
  );

  const handleMouseLeave = useCallback(() => {
    setIsVisible(false);
    setIsHovering(false);
  }, []);

  const handleMouseEnter = useCallback(
    (e: MouseEvent) => {
      motionX.set(e.clientX);
      motionY.set(e.clientY);
      mouseRef.current = { x: e.clientX, y: e.clientY };
      prevMouseRef.current = { x: e.clientX, y: e.clientY };
      setIsVisible(true);
    },
    [motionX, motionY]
  );

  // ── Effet principal ─────────────────────────────────────
  useEffect(() => {
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

    lastTimeRef.current = 0;
    rafRef.current = requestAnimationFrame(animateTrail);

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("mouseenter", handleMouseEnter as EventListener);
    document.body.style.cursor = "none";

    const handleResize = () => {
      const dpr2 = window.devicePixelRatio || 1;
      const w2 = window.innerWidth;
      const h2 = window.innerHeight;
      canvas.width = w2 * dpr2;
      canvas.height = h2 * dpr2;
      canvas.style.width = `${w2}px`;
      canvas.style.height = `${h2}px`;
      const ctx2 = canvas.getContext("2d");
      if (ctx2) ctx2.scale(dpr2, dpr2);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener(
        "mouseenter",
        handleMouseEnter as EventListener
      );
      window.removeEventListener("resize", handleResize);
      document.body.style.cursor = "";
    };
  }, [animateTrail, handleMouseMove, handleMouseLeave, handleMouseEnter]);

  // ── Render ──────────────────────────────────────────────
  return (
    <>
      {/* Canvas trail particles */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 9998 }}
      />

      {/* Glow auriu la hover */}
      <motion.div
        aria-hidden="true"
        className="fixed pointer-events-none rounded-full"
        style={{
          zIndex: 9997,
          x: glowX,
          y: glowY,
          width: CURSOR_GLOW_SIZE,
          height: CURSOR_GLOW_SIZE,
          marginLeft: -CURSOR_GLOW_SIZE / 2,
          marginTop: -CURSOR_GLOW_SIZE / 2,
          opacity: isHovering ? 1 : 0,
          background: `radial-gradient(circle, ${hexToRgba(
            "#f59e0b",
            0.35
          )} 0%, ${hexToRgba("#d97706", 0.12)} 40%, transparent 70%)`,
          filter: "blur(4px)",
          transition: "opacity 0.25s ease-out",
        }}
      />

      {/* Inel exterior cu efect spring */}
      <motion.div
        aria-hidden="true"
        className="fixed pointer-events-none rounded-full flex items-center justify-center"
        style={{
          zIndex: 9999,
          x: ringX,
          y: ringY,
          width: isHovering ? CURSOR_RING_HOVER_SIZE : CURSOR_RING_SIZE,
          height: isHovering ? CURSOR_RING_HOVER_SIZE : CURSOR_RING_SIZE,
          marginLeft: isHovering
            ? -CURSOR_RING_HOVER_SIZE / 2
            : -CURSOR_RING_SIZE / 2,
          marginTop: isHovering
            ? -CURSOR_RING_HOVER_SIZE / 2
            : -CURSOR_RING_SIZE / 2,
          border: isHovering
            ? "1.5px solid rgba(245, 158, 11, 0.7)"
            : "1.5px solid rgba(168, 85, 247, 0.5)",
          boxShadow: isHovering
            ? "0 0 18px rgba(245, 158, 11, 0.5), 0 0 40px rgba(245, 158, 11, 0.2), inset 0 0 8px rgba(245, 158, 11, 0.15)"
            : "0 0 10px rgba(168, 85, 247, 0.3), 0 0 24px rgba(168, 85, 247, 0.1)",
          backgroundColor: isHovering
            ? "rgba(245, 158, 11, 0.08)"
            : "rgba(168, 85, 247, 0.05)",
          opacity: isVisible ? 1 : 0,
          transition: `
            width 0.25s ease-out,
            height 0.25s ease-out,
            margin-left 0.25s ease-out,
            margin-top 0.25s ease-out,
            border-color 0.25s ease-out,
            box-shadow 0.25s ease-out,
            background-color 0.25s ease-out
          `,
        }}
      />

      {/* Punct central */}
      <motion.div
        aria-hidden="true"
        className="fixed pointer-events-none rounded-full"
        style={{
          zIndex: 10000,
          x: motionX,
          y: motionY,
          width: CURSOR_DOT_SIZE,
          height: CURSOR_DOT_SIZE,
          marginLeft: -CURSOR_DOT_SIZE / 2,
          marginTop: -CURSOR_DOT_SIZE / 2,
          backgroundColor: isHovering ? "#f59e0b" : "#a855f7",
          boxShadow: isHovering
            ? "0 0 10px rgba(245, 158, 11, 0.9), 0 0 22px rgba(245, 158, 11, 0.5)"
            : "0 0 6px rgba(168, 85, 247, 0.8), 0 0 14px rgba(168, 85, 247, 0.4)",
          opacity: isVisible ? 1 : 0,
          scale: isHovering ? 1.4 : 1,
          transition: `
            background-color 0.2s ease-out,
            box-shadow 0.2s ease-out,
            opacity 0.15s ease-out,
            scale 0.25s ease-out
          `,
        }}
      />
    </>
  );
}