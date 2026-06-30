"use client";

import { useCallback, useRef, useState } from "react";

// ═══════════════════════════════════════════════════════════════
// TIPURI
// ═══════════════════════════════════════════════════════════════

interface Tilt3DOptions {
  /** Unghi maxim de rotație (grade) – default: 12 */
  maxTilt?: number;
  /** Perspectivă (px) – default: 800 */
  perspective?: number;
  /** Factor de scalare la hover – default: 1.03 */
  scale?: number;
  /** Durata tranziției de revenire (ms) – default: 400 */
  speed?: number;
  /** Intensitate glow (0-1) – default: 0.15 */
  glowIntensity?: number;
}

interface Tilt3DResult {
  ref: React.RefCallback<HTMLElement>;
  style: React.CSSProperties;
  /** Procentaj poziție mouse X/Y normalizat (0-1) */
  mousePercentage: { x: number; y: number };
  /** Unghiuri curente */
  angles: { rotateX: number; rotateY: number };
  isHovering: boolean;
}

// ═══════════════════════════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════════════════════════

export function useTilt3D(options: Tilt3DOptions = {}): Tilt3DResult {
  const {
    maxTilt = 12,
    perspective = 800,
    scale = 1.03,
    speed = 400,
  } = options;

  const [mousePercentage, setMousePercentage] = useState<{ x: number; y: number }>({
    x: 0.5,
    y: 0.5,
  });
  const [angles, setAngles] = useState<{ rotateX: number; rotateY: number }>({
    rotateX: 0,
    rotateY: 0,
  });
  const [isHovering, setIsHovering] = useState(false);
  const elementRef = useRef<HTMLElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const targetAngles = useRef({ rotateX: 0, rotateY: 0 });
  const currentAngles = useRef({ rotateX: 0, rotateY: 0 });

  // ── Animație de revenire cu RAF ────────────────────────────
  const animateReset = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    const step = () => {
      const dx = targetAngles.current.rotateY - currentAngles.current.rotateY;
      const dy = targetAngles.current.rotateX - currentAngles.current.rotateX;

      if (Math.abs(dx) < 0.05 && Math.abs(dy) < 0.05) {
        currentAngles.current = { ...targetAngles.current };
        setAngles({ ...targetAngles.current });
        rafRef.current = null;
        return;
      }

      // Easing out
      const ease = 0.18;
      currentAngles.current = {
        rotateX: currentAngles.current.rotateX + dy * ease,
        rotateY: currentAngles.current.rotateY + dx * ease,
      };

      setAngles({ ...currentAngles.current });
      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
  }, []);

  // ── Handler mouse move ─────────────────────────────────────
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const el = elementRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width; // 0..1
      const y = (e.clientY - rect.top) / rect.height; // 0..1

      setMousePercentage({ x, y });

      targetAngles.current = {
        rotateY: (x - 0.5) * maxTilt * 2, // -maxTilt .. +maxTilt
        rotateX: (0.5 - y) * maxTilt * 2,
      };

      // Set direct (fără animație în timpul mișcării)
      currentAngles.current = { ...targetAngles.current };
      setAngles({ ...targetAngles.current });

      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    },
    [maxTilt]
  );

  // ── Handler mouse enter ────────────────────────────────────
  const handleMouseEnter = useCallback(() => {
    setIsHovering(true);
    if (elementRef.current) {
      elementRef.current.addEventListener("mousemove", handleMouseMove, {
        passive: true,
      });
    }
  }, [handleMouseMove]);

  // ── Handler mouse leave ────────────────────────────────────
  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    setMousePercentage({ x: 0.5, y: 0.5 });

    if (elementRef.current) {
      elementRef.current.removeEventListener("mousemove", handleMouseMove);
    }

    targetAngles.current = { rotateX: 0, rotateY: 0 };
    animateReset();
  }, [handleMouseMove, animateReset]);

  // ── Înregistrare / curățare event listeners pe element ────
  const setRef = useCallback(
    (node: HTMLElement | null) => {
      // Curățare vechi
      if (elementRef.current) {
        elementRef.current.removeEventListener("mouseenter", handleMouseEnter);
        elementRef.current.removeEventListener("mouseleave", handleMouseLeave);
        elementRef.current.removeEventListener("mousemove", handleMouseMove);
      }

      elementRef.current = node;

      if (node) {
        node.addEventListener("mouseenter", handleMouseEnter);
        node.addEventListener("mouseleave", handleMouseLeave);
      }
    },
    [handleMouseEnter, handleMouseLeave, handleMouseMove]
  );

  // ── Curățare la unmount ────────────────────────────────────
  // (nu putem folosi useEffect aici pentru că hook-ul e per-card;
  //  curățarea se face în setRef când node devine null)

  // ── Stil CSS generat ───────────────────────────────────────
  const { rotateX, rotateY } = angles;

  const style: React.CSSProperties = {
    transform: isHovering
      ? `perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale}, ${scale}, ${scale})`
      : `perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1, 1, 1)`,
    transition: isHovering
      ? "transform 0.1s ease-out"
      : `transform ${speed}ms cubic-bezier(0.34, 1.56, 0.64, 1)`,
    willChange: "transform",
    transformStyle: "preserve-3d",
  };

  return {
    ref: setRef,
    style,
    mousePercentage,
    angles,
    isHovering,
  };
}
