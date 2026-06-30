"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
} from "framer-motion";

// ═══════════════════════════════════════════════════════════════
// TIPURI
// ═══════════════════════════════════════════════════════════════

interface HeroProps {
  /** Activează / dezactivează videoclipul de fundal */
  video?: boolean;
  /** Poster static pentru video (fallback) */
  poster?: string;
  /** Cale către logo-ul pentru Hero (fundal închis) */
  logo?: string;
  /** Alt text pentru logo */
  logoAlt?: string;
}

interface MorphMessage {
  id: number;
  text: string;
  gradient: string;
}

// ═══════════════════════════════════════════════════════════════
// CONSTANTE
// ═══════════════════════════════════════════════════════════════

const MORPH_MESSAGES: MorphMessage[] = [
  {
    id: 0,
    text: "Web Development",
    gradient: "linear-gradient(135deg, #c084fc 0%, #a855f7 40%, #7e22ce 100%)",
  },
  {
    id: 1,
    text: "Mobile Apps",
    gradient: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 40%, #d97706 100%)",
  },
  {
    id: 2,
    text: "Digital Excellence",
    gradient: "linear-gradient(135deg, #a855f7 0%, #c084fc 40%, #fbbf24 100%)",
  },
];

const MORPH_INTERVAL = 3200; // ms între mesaje
const MORPH_DURATION = 0.65; // secunde tranziție

const SUBTITLE_LINES: string[] = [
  "Construim experiențe digitale de elită — design rafinat,",
  "tehnologie de ultimă generație și performanță fără compromis.",
  "Partenerul tău pentru proiecte care definesc viitorul.",
];

const SUBTITLE_STAGGER = 0.35; // secunde între linii
const SUBTITLE_INITIAL_DELAY = 0.6; // secunde întârziere inițială

const BADGE_TEXT = "Ofertă limitată — 20% reducere";

const HERO_CTA_PRIMARY = {
  label: "Începe proiectul",
  href: "#contact",
};

const HERO_CTA_SECONDARY = {
  label: "Portofoliu",
  href: "#portfolio",
};

// ═══════════════════════════════════════════════════════════════
// VARIANTE FRAMER-MOTION
// ═══════════════════════════════════════════════════════════════

const sectionVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.15,
      duration: 0.6,
      ease: [0.33, 1, 0.68, 1],
    },
  },
};

const logoVariants = {
  hidden: { opacity: 0, y: -20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.7,
      ease: [0.33, 1, 0.68, 1],
    },
  },
};

const morphTextVariants = {
  enter: {
    y: 50,
    opacity: 0,
    scale: 0.92,
    filter: "blur(8px)",
  },
  center: {
    y: 0,
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
  },
  exit: {
    y: -40,
    opacity: 0,
    scale: 0.94,
    filter: "blur(6px)",
  },
};

const subtitleLineVariants = {
  hidden: {
    opacity: 0,
    y: 28,
    filter: "blur(4px)",
  },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      delay: SUBTITLE_INITIAL_DELAY + i * SUBTITLE_STAGGER,
      duration: 0.7,
      ease: [0.33, 1, 0.68, 1],
    },
  }),
};

const badgeVariants = {
  hidden: {
    opacity: 0,
    scale: 0.7,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      delay: SUBTITLE_INITIAL_DELAY + SUBTITLE_LINES.length * SUBTITLE_STAGGER + 0.2,
      duration: 0.55,
      ease: [0.34, 1.56, 0.64, 1], // spring-like
    },
  },
};

const ctaVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      delay: SUBTITLE_INITIAL_DELAY + SUBTITLE_LINES.length * SUBTITLE_STAGGER + 0.55,
      duration: 0.6,
      ease: [0.33, 1, 0.68, 1],
    },
  },
};

const scrollIndicatorVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      delay: 2.2,
      duration: 0.8,
      ease: [0.33, 1, 0.68, 1],
    },
  },
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTA HERO
// ═══════════════════════════════════════════════════════════════

export default function Hero({
  video = true,
  poster = "/images/hero-poster.jpg",
  logo = "/images/logo-black-bg.png",
  logoAlt = "Nexus Dev Studio",
}: HeroProps) {
  const [morphIndex, setMorphIndex] = useState<number>(0);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const sectionRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // ── Parallax via useScroll ──────────────────────────────────
  const { scrollY } = useScroll();

  // Mouse position pentru parallax subtil al elementelor
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springMouseX = useSpring(mouseX, { damping: 40, stiffness: 120, mass: 0.6 });
  const springMouseY = useSpring(mouseY, { damping: 40, stiffness: 120, mass: 0.6 });

  // Transformări parallax pe scroll
  const logoY = useTransform(scrollY, [0, 800], [0, -40]);
  const titleY = useTransform(scrollY, [0, 800], [0, -120]);
  const subtitleY = useTransform(scrollY, [0, 800], [0, -90]);
  const badgeY = useTransform(scrollY, [0, 800], [0, -60]);
  const ctaY = useTransform(scrollY, [0, 800], [0, -50]);
  const overlayOpacity = useTransform(scrollY, [0, 500], [0.55, 0.75]);
  const videoScale = useTransform(scrollY, [0, 1000], [1, 1.15]);

  // ── Mount check ────────────────────────────────────────────
  useEffect(() => {
    setMounted(true);
  }, []);

  // ── Morphing text cycle ────────────────────────────────────
  useEffect(() => {
    if (!mounted) return;

    const timer = setInterval(() => {
      setMorphIndex((prev) => (prev + 1) % MORPH_MESSAGES.length);
    }, MORPH_INTERVAL);

    return () => clearInterval(timer);
  }, [mounted]);

  // ── Mouse move parallax handler ────────────────────────────
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const el = e.currentTarget;
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5; // [-0.5, 0.5]
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      mouseX.set(x * 30);
      mouseY.set(y * 30);
    },
    [mouseX, mouseY]
  );

  // ── Video events ───────────────────────────────────────────
  const handleVideoLoaded = useCallback(() => setVideoLoaded(true), []);
  const handleVideoError = useCallback(() => setVideoError(true), []);

  // ── Logo error handler ─────────────────────────────────────
  const handleLogoError = useCallback(() => setLogoError(true), []);

  // ── Mouse parallax pentru elementele plutitoare ────────────
  const floatingTitleX = useTransform(springMouseX, [-30, 30], [-18, 18]);
  const floatingTitleY = useTransform(springMouseY, [-30, 30], [-10, 10]);
  const floatingBadgeX = useTransform(springMouseX, [-30, 30], [-8, 8]);
  const floatingBadgeY = useTransform(springMouseY, [-30, 30], [-4, 4]);
  const floatingLogoX = useTransform(springMouseX, [-30, 30], [-12, 12]);
  const floatingLogoY = useTransform(springMouseY, [-30, 30], [-6, 6]);

  // ── Particule decorative (static, redate o singură dată) ───
  const decorativeParticles = useRef(
    Array.from({ length: 18 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1.5,
      duration: Math.random() * 6 + 4,
      delay: Math.random() * 4,
      opacity: Math.random() * 0.25 + 0.06,
      color: i % 3 === 0 ? "#c084fc" : i % 3 === 1 ? "#fbbf24" : "#a855f7",
    }))
  );

  // ── Current morph message ──────────────────────────────────
  const currentMessage: MorphMessage =
    MORPH_MESSAGES[morphIndex] ?? MORPH_MESSAGES[0]!;

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════
  return (
    <section
      id="hero"
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      className="
        relative w-full min-h-screen
        flex items-center justify-center
        overflow-hidden
        bg-gradient-dark
      "
      aria-label="Hero — Nexus Dev Studio"
    >
      {/* ═══════════════════════════════════════════════════════
          FUNDAL VIDEO (OPȚIONAL)
          ═══════════════════════════════════════════════════ */}
      {video && !videoError && (
        <motion.div
          className="absolute inset-0 z-0"
          style={{ scale: videoScale }}
        >
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            poster={poster}
            onLoadedData={handleVideoLoaded}
            onError={handleVideoError}
            className={`
              absolute inset-0 w-full h-full object-cover
              transition-opacity duration-1000
              ${videoLoaded ? "opacity-100" : "opacity-0"}
            `}
            aria-hidden="true"
            preload="auto"
          >
            <source src="/video/hero-background.mp4" type="video/mp4" />
          </video>

          {/* Overlay gradient peste video */}
          <motion.div
            className="absolute inset-0 z-[1]"
            style={{ opacity: overlayOpacity }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f]/70 via-[#0a0a0f]/40 to-[#0a0a0f]/90" />
            <div className="absolute inset-0 bg-gradient-to-r from-purple-950/30 via-transparent to-purple-950/30" />
          </motion.div>

          {/* Noise overlay */}
          <div
            className="absolute inset-0 z-[1] opacity-[0.025] pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
              backgroundRepeat: "repeat",
              backgroundSize: "200px 200px",
            }}
          />
        </motion.div>
      )}

      {/* ═══════════════════════════════════════════════════════
          FUNDAL STATIC (FALLBACK)
          ═══════════════════════════════════════════════════ */}
      {(!video || videoError) && (
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-dark" />
          {/* Efect auroră statică */}
          <div
            className="absolute inset-0 opacity-40"
            style={{
              background: `
                radial-gradient(ellipse 60% 50% at 50% 40%, rgba(126,34,206,0.15) 0%, transparent 70%),
                radial-gradient(ellipse 40% 35% at 30% 60%, rgba(168,85,247,0.1) 0%, transparent 65%),
                radial-gradient(ellipse 45% 40% at 70% 50%, rgba(245,158,11,0.06) 0%, transparent 60%)
              `,
            }}
          />
          {/* Noise overlay */}
          <div
            className="absolute inset-0 opacity-[0.025] pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
              backgroundRepeat: "repeat",
              backgroundSize: "200px 200px",
            }}
          />
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          PARTICULE DECORATIVE PLUTITOARE
          ═══════════════════════════════════════════════════ */}
      <div className="absolute inset-0 z-[2] pointer-events-none overflow-hidden">
        {mounted &&
          decorativeParticles.current.map((p) => (
            <motion.div
              key={p.id}
              className="absolute rounded-full"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: p.size,
                height: p.size,
                backgroundColor: p.color,
                opacity: p.opacity,
                boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
              }}
              animate={{
                y: [0, -30, 0, 20, 0],
                x: [0, 15, -10, 8, 0],
                opacity: [p.opacity, p.opacity * 1.8, p.opacity, p.opacity * 0.6, p.opacity],
                scale: [1, 1.4, 1, 0.8, 1],
              }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
      </div>

      {/* ═══════════════════════════════════════════════════════
          CONȚINUT PRINCIPAL
          ═══════════════════════════════════════════════════ */}
      <motion.div
        ref={containerRef}
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        className="
          relative z-10 w-full max-w-5xl mx-auto
          px-6 sm:px-8 lg:px-12
          flex flex-col items-center justify-center
          text-center
          min-h-screen
          py-24 sm:py-28
        "
      >
        {/* ── LOGO HERO ────────────────────────────────────── */}
        {!logoError && (
          <motion.div
            variants={logoVariants}
            style={{
              y: logoY,
              x: floatingLogoX,
            }}
            className="mb-10 sm:mb-12"
          >
            <motion.img
              src={logo}
              alt={logoAlt}
              onError={handleLogoError}
              className="h-16 sm:h-20 md:h-24 w-auto object-contain"
              style={{
                filter: "drop-shadow(0 0 30px rgba(168, 85, 247, 0.35))",
              }}
              animate={{
                filter: [
                  "drop-shadow(0 0 20px rgba(168, 85, 247, 0.25))",
                  "drop-shadow(0 0 40px rgba(168, 85, 247, 0.45))",
                  "drop-shadow(0 0 20px rgba(168, 85, 247, 0.25))",
                ],
              }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.div>
        )}

        {/* ── BADGE OFERTĂ CU GLOW PULSATORIU ──────────────── */}
        <motion.div
          variants={badgeVariants}
          style={{
            y: badgeY,
            x: floatingBadgeX,
          }}
          className="mb-8 sm:mb-10"
        >
          <motion.span
            className="
              inline-flex items-center gap-2
              px-5 py-2.5 sm:px-6 sm:py-3
              rounded-full
              text-sm sm:text-base font-semibold
              text-white/95
              border
              animate-pulse-glow
            "
            style={{
              fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
              background: "rgba(126, 34, 206, 0.18)",
              borderColor: "rgba(168, 85, 247, 0.4)",
              boxShadow: `
                0 0 20px rgba(126, 34, 206, 0.3),
                0 0 50px rgba(126, 34, 206, 0.12),
                inset 0 0 18px rgba(168, 85, 247, 0.08)
              `,
            }}
            whileHover={{
              scale: 1.05,
              boxShadow: `
                0 0 30px rgba(126, 34, 206, 0.45),
                0 0 70px rgba(126, 34, 206, 0.2),
                inset 0 0 24px rgba(168, 85, 247, 0.14)
              `,
              transition: { duration: 0.3, ease: "easeOut" },
            }}
          >
            {/* Iconiță pulsatorie Font Awesome (fără emoji) */}
            <span
              className="relative flex items-center justify-center"
              aria-hidden="true"
            >
              <span className="animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-purple-400 opacity-75" />
              <i
                className="fas fa-bolt relative text-xs text-purple-300"
                style={{ textShadow: "0 0 6px rgba(192, 132, 252, 0.6)" }}
              />
            </span>
            {BADGE_TEXT}
          </motion.span>
        </motion.div>

        {/* ── TITLU MORPHING TEXT ──────────────────────────── */}
        <motion.div
          style={{
            y: titleY,
            x: floatingTitleX,
          }}
          className="mb-6 sm:mb-8 relative"
        >
          {/* Text static prefix */}
          <h1
            className="
              text-4xl sm:text-5xl md:text-6xl lg:text-7xl
              font-bold tracking-tight
              leading-[1.15]
            "
            style={{
              fontFamily: "var(--font-playfair), 'Playfair Display', serif",
            }}
          >
            <span className="text-white/90">Construim </span>

            {/* Text morphing */}
            <span className="relative inline-block">
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentMessage.id}
                  variants={morphTextVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    duration: MORPH_DURATION,
                    ease: [0.33, 1, 0.68, 1],
                  }}
                  className="inline-block"
                  style={{
                    background: currentMessage.gradient,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {currentMessage.text}
                </motion.span>
              </AnimatePresence>

              {/* Cursor blinking după text */}
              <motion.span
                aria-hidden="true"
                className="inline-block w-[3px] h-[0.75em] ml-1 align-middle rounded-full"
                style={{
                  background: "linear-gradient(180deg, #c084fc, #a855f7)",
                }}
                animate={{
                  opacity: [1, 1, 0, 0, 1],
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  times: [0, 0.5, 0.51, 0.9, 1],
                }}
              />
            </span>
          </h1>

          {/* Lumină ambientală sub titlu */}
          <motion.div
            aria-hidden="true"
            className="absolute -inset-x-20 top-1/2 -translate-y-1/2 h-[120%] pointer-events-none"
            style={{
              background: `
                radial-gradient(ellipse 80% 60% at 50% 50%,
                  rgba(168,85,247,0.08) 0%,
                  transparent 70%
                )
              `,
            }}
            animate={{
              opacity: [0.5, 0.8, 0.5],
              scale: [0.96, 1.04, 0.96],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>

        {/* ── SUBTITLU FADE-IN SECVENȚIAL ─────────────────── */}
        <motion.div
          style={{ y: subtitleY }}
          className="mb-8 sm:mb-10 max-w-2xl mx-auto"
        >
          {SUBTITLE_LINES.map((line, i) => (
            <motion.p
              key={i}
              custom={i}
              variants={subtitleLineVariants}
              className={`
                text-base sm:text-lg md:text-xl
                leading-relaxed
                ${i === 0 ? "text-white/80" : i === 1 ? "text-white/65" : "text-white/50"}
                ${i > 0 ? "mt-1" : ""}
              `}
              style={{
                fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
              }}
            >
              {line}
            </motion.p>
          ))}
        </motion.div>

        {/* ── CTA BUTTONS ──────────────────────────────────── */}
        <motion.div
          variants={ctaVariants}
          style={{ y: ctaY }}
          className="flex flex-col sm:flex-row items-center gap-4"
        >
          {/* CTA Primar */}
          <motion.a
            href={HERO_CTA_PRIMARY.href}
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
              background: "linear-gradient(135deg, #7e22ce 0%, #a855f7 50%, #7e22ce 100%)",
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
            <span className="relative z-10">{HERO_CTA_PRIMARY.label}</span>
            <i
              className="fas fa-arrow-right relative z-10 text-sm"
              aria-hidden="true"
            />
            {/* Shimmer hover effect */}
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

          {/* CTA Secundar */}
          <motion.a
            href={HERO_CTA_SECONDARY.href}
            className="
              group inline-flex items-center gap-2
              px-7 py-4
              rounded-full
              text-base sm:text-lg font-medium
              no-underline
              transition-all duration-300
            "
            style={{
              fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
              color: "rgba(255, 255, 255, 0.75)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              background: "rgba(255, 255, 255, 0.04)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
            whileHover={{
              color: "#ffffff",
              borderColor: "rgba(168, 85, 247, 0.5)",
              background: "rgba(126, 34, 206, 0.1)",
              boxShadow: "0 0 30px rgba(126, 34, 206, 0.15)",
              scale: 1.03,
              transition: { duration: 0.3, ease: "easeOut" },
            }}
            whileTap={{ scale: 0.97 }}
          >
            <i className="fas fa-briefcase text-sm" aria-hidden="true" />
            {HERO_CTA_SECONDARY.label}
          </motion.a>
        </motion.div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════
          SCROLL INDICATOR
          ═══════════════════════════════════════════════════════ */}
      <motion.div
        variants={scrollIndicatorVariants}
        initial="hidden"
        animate="visible"
        className="
          absolute bottom-8 left-1/2 -translate-x-1/2
          z-10 flex flex-col items-center gap-2
          cursor-pointer
        "
        onClick={() => {
          const servicesSection = document.getElementById("services");
          if (servicesSection) {
            servicesSection.scrollIntoView({ behavior: "smooth" });
          } else {
            window.scrollBy({ top: window.innerHeight, behavior: "smooth" });
          }
        }}
        role="button"
        aria-label="Derulează mai jos"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            const servicesSection = document.getElementById("services");
            if (servicesSection) {
              servicesSection.scrollIntoView({ behavior: "smooth" });
            } else {
              window.scrollBy({ top: window.innerHeight, behavior: "smooth" });
            }
          }
        }}
      >
        <span
          className="text-xs uppercase tracking-widest text-white/35"
          style={{ fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace" }}
        >
          Scroll
        </span>
        <motion.div
          className="w-6 h-10 rounded-full border border-white/15 flex items-start justify-center p-1.5"
          style={{
            background: "rgba(255, 255, 255, 0.03)",
          }}
        >
          <motion.div
            className="w-1.5 h-2.5 rounded-full bg-purple-400/80"
            animate={{
              y: [0, 12, 0],
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════
          VIGNETĂ CORNER DECORATIVĂ
          ═══════════════════════════════════════════════════ */}
      <div aria-hidden="true" className="absolute inset-0 z-[1] pointer-events-none">
        {/* Top-left */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-purple-800/8 via-purple-900/3 to-transparent rounded-br-full" />
        {/* Bottom-right */}
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-purple-900/10 via-purple-800/3 to-transparent rounded-tl-full" />
        {/* Linii decorative geometrice */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.03]"
          viewBox="0 0 1440 900"
          fill="none"
          preserveAspectRatio="none"
        >
          <line x1="0" y1="200" x2="1440" y2="200" stroke="white" strokeWidth="0.5" />
          <line x1="0" y1="700" x2="1440" y2="700" stroke="white" strokeWidth="0.5" />
          <circle cx="720" cy="450" r="300" stroke="white" strokeWidth="0.5" />
          <circle cx="720" cy="450" r="450" stroke="white" strokeWidth="0.3" />
        </svg>
      </div>
    </section>
  );
}