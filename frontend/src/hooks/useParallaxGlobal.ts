"use client";

import { useState, useEffect, useCallback, useRef } from "react";

// ═══════════════════════════════════════════════════════════════
// TIPURI
// ═══════════════════════════════════════════════════════════════

interface ParallaxGlobalState {
  /** Poziția curentă de scroll (px) */
  scrollY: number;
  /** Procent din înălțimea totală a documentului (0-1) */
  scrollPercent: number;
  /** Înălțimea viewport-ului */
  viewportHeight: number;
  /** Înălțimea totală a documentului */
  documentHeight: number;
  /** Direcția scroll-ului: 1 = jos, -1 = sus, 0 = staționar */
  scrollDirection: number;
  /** Viteza de scroll (px/frame) */
  scrollVelocity: number;
  /** Dacă hook-ul este inițializat și gata */
  isReady: boolean;
}

// ═══════════════════════════════════════════════════════════════
// HOOK: useParallaxGlobal
//
// Oferă stare globală de scroll pentru orchestrarea efectelor
// de parallax între secțiuni. Optimizat cu RAF și passive listener.
// ═══════════════════════════════════════════════════════════════

export function useParallaxGlobal(): ParallaxGlobalState {
  const [state, setState] = useState<ParallaxGlobalState>({
    scrollY: 0,
    scrollPercent: 0,
    viewportHeight: 0,
    documentHeight: 0,
    scrollDirection: 0,
    scrollVelocity: 0,
    isReady: false,
  });

  const prevScrollY = useRef(0);
  const rafRef = useRef<number>(0);
  const frameRef = useRef<number>(0);

  const updateDimensions = useCallback(() => {
    const vh = window.innerHeight;
    const dh = document.documentElement.scrollHeight;
    const sy = window.scrollY;
    const sp = dh > vh ? sy / (dh - vh) : 0;
    const dir = sy > prevScrollY.current ? 1 : sy < prevScrollY.current ? -1 : 0;
    const vel = Math.abs(sy - prevScrollY.current);

    prevScrollY.current = sy;

    setState({
      scrollY: sy,
      scrollPercent: Math.min(1, Math.max(0, sp)),
      viewportHeight: vh,
      documentHeight: dh,
      scrollDirection: dir,
      scrollVelocity: vel,
      isReady: true,
    });
  }, []);

  useEffect(() => {
    // Inițializare imediată
    updateDimensions();

    const onScroll = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        updateDimensions();
        rafRef.current = 0;
      });
    };

    const onResize = () => {
      frameRef.current = requestAnimationFrame(updateDimensions);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [updateDimensions]);

  return state;
}

export default useParallaxGlobal;