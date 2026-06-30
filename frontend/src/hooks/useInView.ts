"use client";

import { useEffect, useRef, useState } from "react";

// ═══════════════════════════════════════════════════════════════
// TIPURI
// ═══════════════════════════════════════════════════════════════

interface UseInViewOptions {
  /** Threshold (0-1) – cât din element trebuie vizibil – default: 0.15 */
  threshold?: number;
  /** O singură dată (nu se mai reactivează) – default: true */
  once?: boolean;
  /** Root margin (ex: "0px 0px -60px 0px") – default: "0px" */
  rootMargin?: string;
  /** Delay în ms înainte de a marca vizibil – default: 0 */
  delay?: number;
}

interface UseInViewResult {
  ref: React.RefCallback<HTMLElement>;
  isInView: boolean;
  /** Index 0-based în rândul elementelor observate */
  entryIndex: number;
}

// ═══════════════════════════════════════════════════════════════
// REGISTRU GLOBAL PENTRU INDEXARE
// ═══════════════════════════════════════════════════════════════

let globalIndex = 0;

// ═══════════════════════════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════════════════════════

export function useInView(options: UseInViewOptions = {}): UseInViewResult {
  const {
    threshold = 0.15,
    once = true,
    rootMargin = "0px 0px -50px 0px",
    delay = 0,
  } = options;

  const [isInView, setIsInView] = useState(false);
  const elementRef = useRef<HTMLElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const hasTriggered = useRef(false);
  const delayTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const indexRef = useRef<number>(-1);

  // Alocăm index global o singură dată
  if (indexRef.current === -1) {
    indexRef.current = globalIndex++;
  }

  const setRef = (node: HTMLElement | null) => {
    // Curățăm observer-ul vechi
    if (observerRef.current && elementRef.current) {
      observerRef.current.unobserve(elementRef.current);
    }

    elementRef.current = node;

    if (node && observerRef.current) {
      observerRef.current.observe(node);
    }
  };

  useEffect(() => {
    // Creăm observer-ul
    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !hasTriggered.current) {
            if (delay > 0) {
              delayTimer.current = setTimeout(() => {
                setIsInView(true);
                hasTriggered.current = true;
                if (once && observerRef.current && elementRef.current) {
                  observerRef.current.unobserve(elementRef.current);
                }
              }, delay);
            } else {
              setIsInView(true);
              hasTriggered.current = true;
              if (once && observerRef.current && elementRef.current) {
                observerRef.current.unobserve(elementRef.current);
              }
            }
          } else if (!entry.isIntersecting && !once && hasTriggered.current) {
            setIsInView(false);
            hasTriggered.current = false;
          }
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    // Observăm elementul curent
    if (elementRef.current) {
      observerRef.current.observe(elementRef.current);
    }

    return () => {
      if (delayTimer.current) clearTimeout(delayTimer.current);
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [threshold, once, rootMargin, delay]);

  return {
    ref: setRef,
    isInView,
    entryIndex: indexRef.current,
  };
}
