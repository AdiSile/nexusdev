"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useInView } from "@/hooks/useInView";

// ═══════════════════════════════════════════════════════════════
// TIPURI
// ═══════════════════════════════════════════════════════════════

interface TermItem {
  id: number;
  icon: string;
  title: string;
  description: string;
  /** Valoarea țintă pentru counter (numărul animat) */
  counterTarget: number;
  /** Sufixul counter-ului (ex: "zile", "revizii", "+") */
  counterSuffix: string;
  /** Procentul țintă pentru progress bar-ul circular (0-100) */
  progressPercent: number;
  /** Accent color pentru card (purple / gold / mixed) */
  accent: "purple" | "gold" | "mixed";
  /** Etichetă plasată sub counter */
  counterLabel: string;
}

// ═══════════════════════════════════════════════════════════════
// CONSTANTE
// ═══════════════════════════════════════════════════════════════

const TERMS: TermItem[] = [
  {
    id: 1,
    icon: "fa-solid fa-bolt",
    title: "Livrare Rapidă",
    description:
      "Proiectele sunt livrate în termen de 14 zile lucrătoare, cu milestone-uri clare și comunicare transparentă pe tot parcursul dezvoltării.",
    counterTarget: 14,
    counterSuffix: "zile",
    progressPercent: 93,
    accent: "purple",
    counterLabel: "timp mediu de livrare",
  },
  {
    id: 2,
    icon: "fa-solid fa-rotate",
    title: "Revizii Incluse",
    description:
      "Beneficiezi de până la 5 runde de revizii gratuite pentru fiecare proiect. Ne asigurăm că rezultatul final reflectă exact viziunea ta.",
    counterTarget: 5,
    counterSuffix: "revizii",
    progressPercent: 100,
    accent: "gold",
    counterLabel: "incluse gratuit",
  },
  {
    id: 3,
    icon: "fa-solid fa-shield-halved",
    title: "Garanție & Suport",
    description:
      "Oferim 30 de zile de suport gratuit post-lansare pentru a rezolva orice problemă și a ne asigura că totul funcționează impecabil.",
    counterTarget: 30,
    counterSuffix: "zile",
    progressPercent: 100,
    accent: "mixed",
    counterLabel: "suport post-lansare",
  },
];

const SECTION_HEADING = "Termene de Livrare";
const SECTION_SUBTITLE =
  "Transparență totală în ceea ce privește termenele, reviziile și suportul oferit. Lucrăm cu deadline-uri clare și livrabile de calitate.";

// ═══════════════════════════════════════════════════════════════
// UTILITARE
// ═══════════════════════════════════════════════════════════════

function getAccentColors(accent: TermItem["accent"]): {
  gradient: string;
  glow: string;
  border: string;
  text: string;
} {
  switch (accent) {
    case "purple":
      return {
        gradient:
          "linear-gradient(135deg, #7e22ce 0%, #a855f7 50%, #c084fc 100%)",
        glow: "rgba(168, 85, 247, 0.35)",
        border: "rgba(168, 85, 247, 0.3)",
        text: "#c084fc",
      };
    case "gold":
      return {
        gradient:
          "linear-gradient(135deg, #b45309 0%, #f59e0b 50%, #fbbf24 100%)",
        glow: "rgba(245, 158, 11, 0.35)",
        border: "rgba(245, 158, 11, 0.3)",
        text: "#fbbf24",
      };
    case "mixed":
      return {
        gradient:
          "linear-gradient(135deg, #7e22ce 0%, #a855f7 40%, #f59e0b 100%)",
        glow: "rgba(168, 85, 247, 0.25)",
        border: "rgba(192, 132, 252, 0.3)",
        text: "#c084fc",
      };
  }
}

// ═══════════════════════════════════════════════════════════════
// VARIANTE FRAMER-MOTION
// ═══════════════════════════════════════════════════════════════

const sectionVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.1,
      duration: 0.5,
      ease: [0.33, 1, 0.68, 1],
    },
  },
};

const headingVariants = {
  hidden: { opacity: 0, y: -30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.33, 1, 0.68, 1],
    },
  },
};

const subtitleVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.2,
      duration: 0.6,
      ease: [0.33, 1, 0.68, 1],
    },
  },
};

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 60,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.7,
      ease: [0.34, 1.56, 0.64, 1],
    },
  },
};

// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENTĂ: PROGRESS BAR CIRCULAR (SVG)
// ═══════════════════════════════════════════════════════════════

interface CircularProgressProps {
  percent: number;
  radius: number;
  strokeWidth: number;
  accent: TermItem["accent"];
  animate: boolean;
  duration?: number;
  cardId: number;
}

function CircularProgress({
  percent,
  radius,
  strokeWidth,
  accent,
  animate,
  duration = 1800,
  cardId,
}: CircularProgressProps) {
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = 2 * Math.PI * normalizedRadius;
  const targetOffset = circumference - (percent / 100) * circumference;

  const [offset, setOffset] = useState(circumference);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const colors = getAccentColors(accent);
  const gradientId = `progressGradient-${cardId}`;

  useEffect(() => {
    if (!animate) {
      setOffset(circumference);
      return;
    }

    const startValue = circumference;
    const endValue = targetOffset;
    const durationMs = duration;

    const animateProgress = (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const rawProgress = Math.min(elapsed / durationMs, 1);

      const eased = 1 - Math.pow(1 - rawProgress, 3);

      setOffset(startValue + (endValue - startValue) * eased);

      if (rawProgress < 1) {
        rafRef.current = requestAnimationFrame(animateProgress);
      } else {
        setOffset(endValue);
        rafRef.current = null;
      }
    };

    rafRef.current = requestAnimationFrame(animateProgress);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      startTimeRef.current = null;
    };
  }, [animate, circumference, targetOffset, duration]);

  return (
    <svg
      width={radius * 2}
      height={radius * 2}
      viewBox={`0 0 ${radius * 2} ${radius * 2}`}
      className="transform -rotate-90"
      aria-hidden="true"
    >
      <circle
        cx={radius}
        cy={radius}
        r={normalizedRadius}
        fill="none"
        stroke="rgba(255, 255, 255, 0.06)"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={radius}
        cy={radius}
        r={normalizedRadius}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{
          filter: `drop-shadow(0 0 6px ${colors.glow})`,
          transition: "stroke-dashoffset 0.05s linear",
        }}
      />
      <defs>
        <linearGradient
          id={gradientId}
          x1="0%"
          y1="0%"
          x2="100%"
          y2="0%"
        >
          {accent === "purple" && (
            <>
              <stop offset="0%" stopColor="#7e22ce" />
              <stop offset="50%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#c084fc" />
            </>
          )}
          {accent === "gold" && (
            <>
              <stop offset="0%" stopColor="#b45309" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#fbbf24" />
            </>
          )}
          {accent === "mixed" && (
            <>
              <stop offset="0%" stopColor="#7e22ce" />
              <stop offset="50%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#f59e0b" />
            </>
          )}
        </linearGradient>
      </defs>
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENTĂ: COUNTER ANIMAT
// ═══════════════════════════════════════════════════════════════

interface AnimatedCounterProps {
  target: number;
  suffix: string;
  animate: boolean;
  duration?: number;
  className?: string;
}

function AnimatedCounter({
  target,
  suffix,
  animate,
  duration = 2000,
  className = "",
}: AnimatedCounterProps) {
  const [currentValue, setCurrentValue] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!animate) {
      setCurrentValue(0);
      return;
    }

    const startValue = 0;
    const endValue = target;

    const animateCounter = (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const rawProgress = Math.min(elapsed / duration, 1);

      const eased = 1 - Math.pow(1 - rawProgress, 5);

      const nextValue = Math.round(
        startValue + (endValue - startValue) * eased
      );
      setCurrentValue(nextValue);

      if (rawProgress < 1) {
        rafRef.current = requestAnimationFrame(animateCounter);
      } else {
        setCurrentValue(endValue);
        rafRef.current = null;
      }
    };

    rafRef.current = requestAnimationFrame(animateCounter);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      startTimeRef.current = null;
    };
  }, [animate, target, duration]);

  return (
    <span
      className={className}
      aria-live="polite"
      aria-atomic="true"
      aria-label={`${currentValue} ${suffix}`}
    >
      <span className="tabular-nums">{currentValue}</span>
      <span className="text-foreground-dim ml-1.5">{suffix}</span>
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENTĂ: TERM CARD
// ═══════════════════════════════════════════════════════════════

function TermCard({ term, index }: { term: TermItem; index: number }) {
  const { ref: inViewRef, isInView } = useInView({
    threshold: 0.15,
    once: true,
    rootMargin: "0px 0px -40px 0px",
    delay: index * 100,
  });

  const colors = getAccentColors(term.accent);
  const progressRadius = 62;
  const progressStrokeWidth = 5;

  const progressDelay = 300 + index * 150;

  const [animateProgress, setAnimateProgress] = useState(false);
  const progressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isInView) {
      progressTimer.current = setTimeout(() => {
        setAnimateProgress(true);
      }, progressDelay);
    }
    return () => {
      if (progressTimer.current) {
        clearTimeout(progressTimer.current);
      }
    };
  }, [isInView, progressDelay]);

  return (
    <motion.div
      ref={inViewRef}
      variants={cardVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className="relative group/card"
    >
      <div
        className="
          relative
          glass-lg glass-hover
          p-6 sm:p-8
          flex flex-col items-center gap-5
          overflow-hidden
          cursor-default
          min-h-[440px]
        "
        style={{
          borderColor: isInView ? colors.border : "var(--glass-border)",
          boxShadow: isInView
            ? `0 0 40px ${colors.glow.replace("0.35", "0.12")}, 0 16px 64px rgba(0, 0, 0, 0.45)`
            : "var(--glass-shadow)",
        }}
      >
        {/* GLOW LA HOVER */}
        <div
          className="
            absolute inset-0
            pointer-events-none
            opacity-0 group-hover/card:opacity-100
            transition-opacity duration-500
            rounded-[var(--glass-radius-lg)]
          "
          style={{
            background: `
              radial-gradient(
                ellipse 55% 40% at 50% 40%,
                ${colors.glow.replace("0.35", "0.07")} 0%,
                transparent 70%
              )
            `,
          }}
          aria-hidden="true"
        />

        {/* ICONIȚĂ */}
        <div
          className="
            relative z-10
            w-14 h-14
            flex items-center justify-center
            rounded-xl
            text-2xl
          "
          style={{
            background: `linear-gradient(135deg, ${colors.glow.replace("0.35", "0.14")}, ${colors.glow.replace("0.35", "0.06")})`,
            border: `1px solid ${colors.border}`,
            color: colors.text,
            boxShadow: `0 4px 16px ${colors.glow.replace("0.35", "0.15")}`,
          }}
        >
          <i className={term.icon} aria-hidden="true" />
        </div>

        {/* TITLU */}
        <h3
          className="
            relative z-10
            text-xl sm:text-2xl font-semibold
            text-white/95
            text-center
            leading-tight
          "
          style={{
            fontFamily: "var(--font-playfair), 'Playfair Display', serif",
          }}
        >
          {term.title}
        </h3>

        {/* PROGRESS BAR CIRCULAR + COUNTER (suprapuse) */}
        <div
          className="relative z-10 flex items-center justify-center"
          style={{ width: progressRadius * 2, height: progressRadius * 2 }}
        >
          <CircularProgress
            percent={term.progressPercent}
            radius={progressRadius}
            strokeWidth={progressStrokeWidth}
            accent={term.accent}
            animate={animateProgress}
            duration={1600}
            cardId={term.id}
          />

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <AnimatedCounter
              target={term.counterTarget}
              suffix={term.counterSuffix}
              animate={animateProgress}
              duration={1800}
              className="
                text-3xl sm:text-4xl font-bold
                text-white/95
                leading-none
              "
            />
            <span
              className="
                text-[11px] sm:text-xs
                text-foreground-dim
                uppercase tracking-wider
                mt-1.5
                text-center
                leading-tight
                px-2
              "
              style={{
                fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace",
              }}
            >
              {term.counterLabel}
            </span>
          </div>
        </div>

        {/* DESCRIERE */}
        <p
          className="
            relative z-10
            text-sm sm:text-base
            text-foreground-muted
            leading-relaxed
            text-center
            flex-1
          "
          style={{
            fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
          }}
        >
          {term.description}
        </p>

        {/* PROGRES TEXTUAL */}
        <div
          className="
            relative z-10
            flex items-center gap-2
            mt-auto pt-3
            w-full
            justify-center
          "
          style={{
            borderTop: "1px solid rgba(255, 255, 255, 0.06)",
          }}
        >
          <span
            className="text-xs font-semibold uppercase tracking-wider"
            style={{
              fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace",
              color: colors.text,
            }}
          >
            {term.progressPercent}%
          </span>
          <span
            className="text-xs text-foreground-dim"
            style={{
              fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace",
            }}
          >
            rata de satisfacție
          </span>
        </div>

        {/* LINII DECORATIVE INTERNE */}
        <div
          className="absolute inset-0 z-0 pointer-events-none opacity-[0.035]"
          aria-hidden="true"
        >
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 320 440"
            fill="none"
            preserveAspectRatio="none"
          >
            <circle cx="270" cy="70" r="80" stroke="white" strokeWidth="0.6" />
            <circle cx="270" cy="70" r="120" stroke="white" strokeWidth="0.3" />
            <line
              x1="20"
              y1="380"
              x2="300"
              y2="380"
              stroke="white"
              strokeWidth="0.3"
            />
          </svg>
        </div>

        {/* INEL PULSATIL DECORATIV */}
        <motion.div
          className="absolute pointer-events-none z-0"
          style={{
            top: "50%",
            left: "50%",
            width: progressRadius * 2 + 20,
            height: progressRadius * 2 + 20,
            marginTop: -progressRadius - 10,
            marginLeft: -progressRadius - 10,
            borderRadius: "50%",
            border: `1px solid ${colors.border.replace("0.3", "0.12")}`,
          }}
          animate={
            animateProgress
              ? {
                  scale: [1, 1.08, 1],
                  opacity: [0.5, 0.15, 0.5],
                }
              : { scale: 1, opacity: 0.5 }
          }
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: index * 0.4,
          }}
        />
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTA PRINCIPALĂ: DELIVERY TERMS
// ═══════════════════════════════════════════════════════════════

export default function DeliveryTerms() {
  const { ref: sectionRef, isInView: sectionInView } = useInView({
    threshold: 0.05,
    once: true,
    rootMargin: "0px 0px -80px 0px",
  });

  return (
    <section
      id="delivery-terms"
      ref={sectionRef}
      className="
        relative w-full
        py-24 sm:py-32 lg:py-40
        overflow-hidden
      "
      aria-label="Termene de livrare Nexus Dev Studio"
    >
      {/* FUNDAL DECORATIV */}
      <div className="absolute inset-0 bg-gradient-dark pointer-events-none" />

      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        aria-hidden="true"
        style={{
          background: `
            radial-gradient(ellipse 50% 35% at 50% 20%, rgba(126,34,206,0.1) 0%, transparent 70%),
            radial-gradient(ellipse 40% 30% at 20% 70%, rgba(245,158,11,0.06) 0%, transparent 60%),
            radial-gradient(ellipse 45% 35% at 80% 60%, rgba(168,85,247,0.05) 0%, transparent 60%)
          `,
        }}
      />

      <div
        className="absolute inset-0 pointer-events-none opacity-[0.022]"
        aria-hidden="true"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      <div
        className="absolute inset-0 pointer-events-none opacity-[0.018]"
        aria-hidden="true"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "200px 200px",
        }}
      />

      {/* CONȚINUT */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* HEADING */}
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          animate={sectionInView ? "visible" : "hidden"}
          className="text-center mb-16 sm:mb-20"
        >
          <motion.h2
            variants={headingVariants}
            className="
              text-3xl sm:text-4xl md:text-5xl
              font-bold tracking-tight
              mb-5
            "
            style={{
              fontFamily: "var(--font-playfair), 'Playfair Display', serif",
            }}
          >
            <span className="text-gradient-purple">{SECTION_HEADING}</span>
          </motion.h2>

          <motion.p
            variants={subtitleVariants}
            className="
              max-w-2xl mx-auto
              text-base sm:text-lg md:text-xl
              text-foreground-muted
              leading-relaxed
            "
            style={{
              fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
            }}
          >
            {SECTION_SUBTITLE}
          </motion.p>

          <motion.div
            variants={headingVariants}
            className="mt-6 mx-auto w-24 h-1 rounded-full bg-gradient-to-r from-purple-600 via-purple-500 to-purple-400"
          />
        </motion.div>

        {/* GRID CARDURI */}
        <div
          className="
            grid gap-6 sm:gap-8
            grid-cols-1 md:grid-cols-2 lg:grid-cols-3
          "
        >
          {TERMS.map((term, idx) => (
            <TermCard key={term.id} term={term} index={idx} />
          ))}
        </div>

        {/* NOTĂ INFORMAȚIONALĂ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={sectionInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-14 text-center"
        >
          <span
            className="
              inline-flex items-center gap-2
              px-4 py-2
              rounded-full
              text-xs sm:text-sm
              text-foreground-dim
              border border-white/6
            "
            style={{
              fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace",
              background: "rgba(255, 255, 255, 0.02)",
            }}
          >
            <i
              className="fa-solid fa-circle-check text-[10px]"
              style={{ color: "#c084fc" }}
              aria-hidden="true"
            />
            Toate termenele sunt garantate contractual
          </span>
        </motion.div>
      </div>

      {/* VIGNETĂ COLTURI */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        aria-hidden="true"
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-purple-800/5 via-purple-900/2 to-transparent rounded-bl-full" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-900/4 via-purple-800/1 to-transparent rounded-tr-full" />
      </div>
    </section>
  );
}