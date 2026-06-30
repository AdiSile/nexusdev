"use client";

import { useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { useInView } from "@/hooks/useInView";

// ═══════════════════════════════════════════════════════════════
// TIPURI
// ═══════════════════════════════════════════════════════════════

interface ProcessStep {
  id: number;
  step: string;
  icon: string;
  title: string;
  description: string;
  highlights: string[];
  gradient: string;
}

interface ProcessProps {
  /** Imagine de fundal pentru secțiune */
  backgroundImage?: string;
}

// ═══════════════════════════════════════════════════════════════
// CONSTANTE
// ═══════════════════════════════════════════════════════════════

const PROCESS_STEPS: ProcessStep[] = [
  {
    id: 1,
    step: "Pasul 1",
    icon: "fa-solid fa-magnifying-glass-chart",
    title: "Discovery & Strategie",
    description:
      "Analizăm obiectivele tale de business, publicul țintă și piața pentru a defini o strategie digitală precisă, aliniată cu viziunea ta.",
    highlights: [
      "Audit complet al cerințelor",
      "Cercetare de piață & competiție",
      "Arhitectură informațională",
      "Roadmap & milestone-uri",
    ],
    gradient: "linear-gradient(135deg, #7e22ce 0%, #a855f7 50%, #c084fc 100%)",
  },
  {
    id: 2,
    step: "Pasul 2",
    icon: "fa-solid fa-pen-ruler",
    title: "Design & Prototipare",
    description:
      "Creăm interfețe elegante și intuitive — de la wireframe-uri low-fidelity la prototipuri interactive high-fidelity, validate cu utilizatori reali.",
    highlights: [
      "Wireframing & flows UX",
      "Design system în Figma",
      "Prototipare interactivă",
      "Testare de utilizabilitate",
    ],
    gradient: "linear-gradient(135deg, #b45309 0%, #f59e0b 50%, #fbbf24 100%)",
  },
  {
    id: 3,
    step: "Pasul 3",
    icon: "fa-solid fa-code",
    title: "Dezvoltare & Testare",
    description:
      "Scriem cod curat, modular și scalabil folosind cele mai noi tehnologii. Fiecare feature trece prin QA riguros, CI/CD și code review.",
    highlights: [
      "Frontend & backend modern",
      "Integrare API-uri terțe",
      "Testare automatizată",
      "CI/CD pipelines",
    ],
    gradient: "linear-gradient(135deg, #6b21a8 0%, #9333ea 50%, #a855f7 100%)",
  },
  {
    id: 4,
    step: "Pasul 4",
    icon: "fa-solid fa-rocket",
    title: "Lansare & Suport",
    description:
      "Lansăm proiectul în producție cu monitorizare 24/7, analiză de performanță și suport continuu pentru iterații viitoare.",
    highlights: [
      "Deployment securizat",
      "Monitorizare & analytics",
      "Optimizare post-lansare",
      "Suport & mentenanță",
    ],
    gradient: "linear-gradient(135deg, #7e22ce 0%, #c084fc 40%, #fbbf24 100%)",
  },
];

const SECTION_HEADING = "Procesul Nostru";
const SECTION_SUBTITLE =
  "O metodologie clară, în 4 pași, care transformă ideile în produse digitale de excepție. Fiecare etapă este gândită pentru transparență, calitate și predictibilitate.";

const CTA_LABEL = "Începe proiectul tău";
const CTA_HREF = "#contact";

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

const lineVariants = {
  hidden: { scaleY: 0 },
  visible: {
    scaleY: 1,
    transition: {
      duration: 0.8,
      ease: [0.33, 1, 0.68, 1],
    },
  },
};

const nodeVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 20,
    },
  },
};

const ctaVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.6,
      duration: 0.6,
      ease: [0.33, 1, 0.68, 1],
    },
  },
};

// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENTĂ: TIMELINE CARD (ALTERNANT)
// ═══════════════════════════════════════════════════════════════

function TimelineCard({
  step,
  side,
  index,
}: {
  step: ProcessStep;
  side: "left" | "right";
  index: number;
}) {
  const { ref, isInView } = useInView({
    threshold: 0.15,
    once: true,
    rootMargin: "0px 0px -40px 0px",
    delay: index * 120,
  });

  const cardContent = (
    <div
      className={`
        relative
        glass-lg glass-hover
        p-6 sm:p-8
        group/card
        overflow-hidden
        cursor-default
      `}
      style={{
        borderColor: "var(--glass-border)",
      }}
    >
      {/* GLOW LA HOVER */}
      <div
        className="absolute inset-0 pointer-events-none opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 rounded-[var(--glass-radius-lg)]"
        style={{
          background: `
            radial-gradient(
              ellipse 60% 40% at 50% 50%,
              rgba(168, 85, 247, 0.08) 0%,
              transparent 70%
            )
          `,
        }}
        aria-hidden="true"
      />

      {/* ETAPA */}
      <span
        className="
          relative z-10
          inline-flex items-center gap-2
          px-3 py-1
          rounded-full
          text-xs font-semibold uppercase tracking-widest
          mb-4
        "
        style={{
          fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace",
          background: "rgba(168, 85, 247, 0.12)",
          color: "#c084fc",
          border: "1px solid rgba(168, 85, 247, 0.2)",
        }}
      >
        <i
          className={`${step.icon} text-[10px]`}
          aria-hidden="true"
          style={{ color: "#c084fc" }}
        />
        {step.step}
      </span>

      {/* TITLU */}
      <h3
        className="
          relative z-10
          text-xl sm:text-2xl font-bold
          text-white/95
          mb-3
          leading-tight
        "
        style={{
          fontFamily: "var(--font-playfair), 'Playfair Display', serif",
        }}
      >
        {step.title}
      </h3>

      {/* DESCRIERE */}
      <p
        className="
          relative z-10
          text-sm sm:text-base
          text-foreground-muted
          leading-relaxed
          mb-5
        "
        style={{
          fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
        }}
      >
        {step.description}
      </p>

      {/* HIGHLIGHTS */}
      <ul className="relative z-10 space-y-2">
        {step.highlights.map((item, i) => (
          <li
            key={i}
            className="
              flex items-start gap-3
              text-sm
              text-foreground-muted
            "
            style={{
              fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
            }}
          >
            <span
              className="
                inline-flex items-center justify-center
                w-5 h-5 mt-0.5
                rounded-full
                flex-shrink-0
              "
              style={{
                background: step.gradient,
                boxShadow: "0 0 10px rgba(168, 85, 247, 0.3)",
              }}
            >
              <i
                className="fa-solid fa-check text-[8px] text-white"
                aria-hidden="true"
              />
            </span>
            {item}
          </li>
        ))}
      </ul>

      {/* LINII DECORATIVE INTERNE */}
      <div
        className="absolute inset-0 z-0 pointer-events-none opacity-[0.035]"
        aria-hidden="true"
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 400 320"
          fill="none"
          preserveAspectRatio="none"
        >
          <circle cx="350" cy="50" r="90" stroke="white" strokeWidth="0.8" />
          <circle cx="350" cy="50" r="140" stroke="white" strokeWidth="0.4" />
          <line
            x1="30"
            y1="280"
            x2="370"
            y2="280"
            stroke="white"
            strokeWidth="0.4"
          />
        </svg>
      </div>

      {/* CONECTOR SĂGEATĂ DECORATIVĂ CĂTRE LINIA CENTRALĂ */}
      <div
        className={`
          absolute top-1/2 -translate-y-1/2
          hidden lg:block
          pointer-events-none
          ${side === "left" ? "-right-3" : "-left-3"}
        `}
        aria-hidden="true"
      >
        <div
          className={`
            w-3 h-3
            rotate-45
            border
            ${side === "left" ? "border-l-0 border-b-0" : "border-r-0 border-t-0"}
          `}
          style={{
            background:
              side === "left"
                ? "linear-gradient(135deg, rgba(18,18,26,0.55), rgba(26,26,37,0.8))"
                : "linear-gradient(315deg, rgba(18,18,26,0.55), rgba(26,26,37,0.8))",
            borderColor:
              side === "left"
                ? "rgba(255,255,255,0.08) rgba(255,255,255,0.08) transparent transparent"
                : "transparent transparent rgba(255,255,255,0.08) rgba(255,255,255,0.08)",
            backdropFilter: "blur(12px)",
          }}
        />
      </div>
    </div>
  );

  const cardVariants = {
    hidden: {
      opacity: 0,
      x: side === "left" ? -60 : 60,
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.7,
        ease: [0.34, 1.56, 0.64, 1],
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      variants={cardVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className={`relative ${side === "left" ? "lg:pr-16" : "lg:pl-16"}`}
    >
      {cardContent}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENTĂ: NOD TIMELINE (PUNCTUL DE PE LINIE)
// ═══════════════════════════════════════════════════════════════

function TimelineNode({
  step,
  index,
}: {
  step: ProcessStep;
  index: number;
}) {
  const { ref, isInView } = useInView({
    threshold: 0.5,
    once: true,
    rootMargin: "0px 0px -20px 0px",
    delay: index * 120 + 100,
  });

  return (
    <motion.div
      ref={ref}
      variants={nodeVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className="
        relative z-20
        w-12 h-12 sm:w-14 sm:h-14
        flex items-center justify-center
        rounded-full
        flex-shrink-0
      "
      style={{
        background: "var(--background)",
        border: "2px solid rgba(168, 85, 247, 0.3)",
        boxShadow: `
          0 0 0 6px rgba(126, 34, 206, 0.08),
          0 0 24px rgba(126, 34, 206, 0.2)
        `,
      }}
      aria-hidden="true"
    >
      {/* Inel exterior animat */}
      <motion.span
        className="absolute inset-0 rounded-full"
        style={{
          border: "1px solid rgba(168, 85, 247, 0.15)",
        }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.6, 0, 0.6],
        }}
        transition={{
          duration: 2.8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: index * 0.5,
        }}
      />

      {/* Iconiță */}
      <i
        className={`${step.icon} text-base sm:text-lg relative z-10`}
        style={{
          background: step.gradient,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          filter: "drop-shadow(0 0 6px rgba(168, 85, 247, 0.5))",
        }}
        aria-hidden="true"
      />
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTA PRINCIPALĂ: PROCESS
// ═══════════════════════════════════════════════════════════════

export default function Process({
  backgroundImage = "/images/process-bg.jpg",
}: ProcessProps) {
  const { ref: sectionRef, isInView: sectionInView } = useInView({
    threshold: 0.03,
    once: true,
    rootMargin: "0px 0px -80px 0px",
  });

  const timelineLineRef = useRef<HTMLDivElement | null>(null);

  return (
    <section
      id="process"
      ref={sectionRef}
      className="
        relative w-full
        py-24 sm:py-32 lg:py-40
        overflow-hidden
      "
      aria-label="Procesul de lucru Nexus Dev Studio"
    >
      {/* FUNDAL DECORATIV */}
      <div className="absolute inset-0 bg-gradient-dark pointer-events-none" />

      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
        aria-hidden="true"
      />

      <div
        className="absolute inset-0 pointer-events-none opacity-35"
        aria-hidden="true"
        style={{
          background: `
            radial-gradient(ellipse 55% 40% at 50% 30%, rgba(126,34,206,0.12) 0%, transparent 70%),
            radial-gradient(ellipse 35% 30% at 80% 60%, rgba(245,158,11,0.05) 0%, transparent 60%),
            radial-gradient(ellipse 40% 35% at 20% 55%, rgba(168,85,247,0.06) 0%, transparent 60%)
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
          backgroundSize: "64px 64px",
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
          className="text-center mb-20 sm:mb-28"
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

        {/* TIMELINE VERTICAL */}
        <div className="relative">
          {/* LINIA VERTICALĂ CENTRALĂ (desktop) */}
          <motion.div
            ref={timelineLineRef}
            variants={lineVariants}
            initial="hidden"
            animate={sectionInView ? "visible" : "hidden"}
            className="
              absolute left-1/2 top-0 bottom-0
              w-[2px]
              -translate-x-1/2
              hidden lg:block
            "
            style={{
              background: `
                linear-gradient(
                  180deg,
                  transparent 0%,
                  rgba(168, 85, 247, 0.3) 8%,
                  rgba(168, 85, 247, 0.5) 25%,
                  rgba(168, 85, 247, 0.5) 75%,
                  rgba(168, 85, 247, 0.3) 92%,
                  transparent 100%
                )
              `,
              transformOrigin: "top center",
            }}
            aria-hidden="true"
          />

          {/* Particule luminoase pe linie */}
          <div
            className="
              absolute left-1/2 top-0 bottom-0
              -translate-x-1/2
              hidden lg:block
              pointer-events-none
            "
            aria-hidden="true"
          >
            {PROCESS_STEPS.map((_, i) => {
              const topPercent = 12 + i * 25.33;
              return (
                <motion.div
                  key={i}
                  className="absolute left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                  style={{
                    top: `${topPercent}%`,
                    background: "#c084fc",
                    boxShadow: "0 0 8px rgba(192, 132, 252, 0.7)",
                  }}
                  animate={{
                    opacity: [0.3, 1, 0.3],
                    scale: [0.8, 1.4, 0.8],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.8,
                  }}
                />
              );
            })}
          </div>

          {/* LINIA MOBILĂ (stânga) */}
          <div
            className="
              absolute left-6 sm:left-8 top-0 bottom-0
              w-[2px]
              lg:hidden
            "
            style={{
              background: `
                linear-gradient(
                  180deg,
                  transparent 0%,
                  rgba(168, 85, 247, 0.25) 8%,
                  rgba(168, 85, 247, 0.4) 25%,
                  rgba(168, 85, 247, 0.4) 75%,
                  rgba(168, 85, 247, 0.25) 92%,
                  transparent 100%
                )
              `,
            }}
            aria-hidden="true"
          />

          {/* ETAPELE TIMELINE */}
          <div className="flex flex-col gap-12 sm:gap-16 lg:gap-20">
            {PROCESS_STEPS.map((step, index) => {
              const side: "left" | "right" = index % 2 === 0 ? "left" : "right";

              return (
                <div
                  key={step.id}
                  className="
                    relative
                    flex flex-col lg:flex-row lg:items-center
                    gap-4 lg:gap-0
                  "
                >
                  {side === "left" ? (
                    <>
                      {/* Card stânga */}
                      <div className="lg:order-1 lg:w-1/2 pl-12 sm:pl-14 lg:pl-0">
                        <TimelineCard step={step} side={side} index={index} />
                      </div>
                      {/* Nod central (desktop) */}
                      <div className="hidden lg:flex lg:order-2 lg:w-[76px] lg:justify-center lg:flex-shrink-0">
                        <TimelineNode step={step} index={index} />
                      </div>
                      {/* Spacer dreapta */}
                      <div className="hidden lg:block lg:order-3 lg:w-1/2" />
                    </>
                  ) : (
                    <>
                      {/* Spacer stânga */}
                      <div className="hidden lg:block lg:order-1 lg:w-1/2" />
                      {/* Nod central (desktop) */}
                      <div className="hidden lg:flex lg:order-2 lg:w-[76px] lg:justify-center lg:flex-shrink-0">
                        <TimelineNode step={step} index={index} />
                      </div>
                      {/* Card dreapta */}
                      <div className="lg:order-3 lg:w-1/2 pl-12 sm:pl-14 lg:pl-0">
                        <TimelineCard step={step} side={side} index={index} />
                      </div>
                    </>
                  )}

                  {/* NOD MOBIL (stânga) */}
                  <div
                    className="
                      absolute left-6 sm:left-8
                      top-8
                      lg:hidden
                    "
                    style={{ transform: "translateX(-50%)" }}
                  >
                    <TimelineNode step={step} index={index} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA FINAL */}
        <motion.div
          variants={ctaVariants}
          initial="hidden"
          animate={sectionInView ? "visible" : "hidden"}
          className="mt-20 sm:mt-28 text-center"
        >
          <motion.a
            href={CTA_HREF}
            className="
              group relative inline-flex items-center gap-3
              px-8 py-4
              rounded-full
              text-base sm:text-lg font-semibold
              text-white
              no-underline
              overflow-hidden
            "
            style={{
              fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
              background:
                "linear-gradient(135deg, #7e22ce 0%, #a855f7 50%, #7e22ce 100%)",
              backgroundSize: "200% 100%",
              boxShadow: `
                0 4px 24px rgba(126, 34, 206, 0.4),
                0 0 50px rgba(168, 85, 247, 0.15)
              `,
            }}
            whileHover={{
              scale: 1.04,
              backgroundPosition: ["0% 50%", "100% 50%"],
              boxShadow: `
                0 6px 32px rgba(126, 34, 206, 0.55),
                0 0 70px rgba(168, 85, 247, 0.25)
              `,
              transition: {
                scale: { duration: 0.3, ease: "easeOut" },
                backgroundPosition: { duration: 1.2, ease: "easeInOut" },
                boxShadow: { duration: 0.3, ease: "easeOut" },
              },
            }}
            whileTap={{ scale: 0.97 }}
          >
            <span className="relative z-10">{CTA_LABEL}</span>
            <i
              className="fas fa-arrow-right relative z-10 text-sm"
              aria-hidden="true"
            />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div
                className="absolute inset-0 animate-shimmer"
                style={{
                  background: `
                    linear-gradient(
                      110deg,
                      transparent 30%,
                      rgba(255,255,255,0.12) 50%,
                      transparent 70%
                    )
                  `,
                  backgroundSize: "200% 100%",
                }}
              />
            </div>
          </motion.a>
        </motion.div>
      </div>

      {/* VIGNETĂ COLTURI */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        aria-hidden="true"
      >
        <div className="absolute top-0 left-0 w-80 h-80 bg-gradient-to-br from-purple-800/6 via-purple-900/2 to-transparent rounded-br-full" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-purple-900/8 via-purple-800/2 to-transparent rounded-tl-full" />
      </div>
    </section>
  );
}