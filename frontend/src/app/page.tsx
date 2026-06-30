"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BackgroundCanvas from "@/components/BackgroundCanvas";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Portfolio from "@/components/Portfolio";
import Process from "@/components/Process";
import DeliveryTerms from "@/components/DeliveryTerms";
import FAQ from "@/components/FAQ";
import Contact from "@/components/Contact";
import { fetchSettings } from "@/lib/api";
import type { AppSettings } from "@/types";
import { useParallaxGlobal } from "@/hooks/useParallaxGlobal";

// ═══════════════════════════════════════════════════════════════
// CONSTANTE
// ═══════════════════════════════════════════════════════════════

const RETRY_DELAY_MS = 1500;
const FETCH_RETRY_MAX = 2;

const LOADING_MESSAGES: string[] = [
  "Inițializăm Nexus Core Neural...",
  "Pregătim experiența digitală...",
  "Calibrăm particulele cuantice...",
  "Sincronizăm designul imersiv...",
  "Optimizăm pentru performanță maximă...",
];

const ERROR_ICON = "fa-solid fa-triangle-exclamation";
const RETRY_ICON = "fa-solid fa-rotate-right";
const SPINNER_ICON = "fa-solid fa-spinner";

// ═══════════════════════════════════════════════════════════════
// VARIANTE FRAMER-MOTION
// ═══════════════════════════════════════════════════════════════

const loadingContentVariants = {
  animate: {
    transition: { staggerChildren: 0.25 },
  },
};

const loadingItemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.33, 1, 0.68, 1] },
  },
};

const errorVariants = {
  initial: { opacity: 0, scale: 0.94 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.55, ease: [0.34, 1.56, 0.64, 1] },
  },
};

const contentVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.7, ease: [0.33, 1, 0.68, 1] },
  },
};

// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENTĂ: LOADING SCREEN
// ═══════════════════════════════════════════════════════════════

function LoadingScreen() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex(
        (prev) => (prev + 1) % LOADING_MESSAGES.length
      );
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  const currentMessage =
    LOADING_MESSAGES[messageIndex] ?? LOADING_MESSAGES[0]!;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
      className="fixed inset-0 z-[999] flex items-center justify-center bg-[#0a0a0f]"
      aria-label="Se încarcă..."
      role="status"
    >
      {/* Background auroră */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background: `
            radial-gradient(ellipse 40% 30% at 50% 40%, rgba(126,34,206,0.08) 0%, transparent 60%),
            radial-gradient(ellipse 35% 25% at 30% 60%, rgba(168,85,247,0.05) 0%, transparent 55%)
          `,
        }}
      />

      <motion.div
        variants={loadingContentVariants}
        animate="animate"
        className="relative z-10 flex flex-col items-center gap-8"
      >
        {/* Logo animat */}
        <motion.div
          variants={loadingItemVariants}
          className="relative"
        >
          <motion.span
            className="text-4xl sm:text-5xl font-bold tracking-tight"
            style={{
              fontFamily: "var(--font-playfair), 'Playfair Display', serif",
            }}
          >
            <span className="text-gradient-purple">Nexus</span>
            <span className="text-white/70 ml-1.5 font-light italic text-3xl sm:text-4xl">
              Dev
            </span>
          </motion.span>

          {/* Pulsar sub logo */}
          <motion.div
            className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-32 h-[2px] rounded-full bg-gradient-to-r from-transparent via-purple-500/70 to-transparent"
            animate={{
              opacity: [0.3, 1, 0.3],
              scaleX: [0.6, 1.2, 0.6],
            }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>

        {/* Spinner */}
        <motion.div variants={loadingItemVariants} className="relative">
          {/* Inel exterior */}
          <motion.div
            className="w-16 h-16 rounded-full border-2 border-purple-500/20"
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />

          {/* Segment animat */}
          <motion.div
            className="absolute inset-0 w-16 h-16 rounded-full border-2 border-transparent border-t-purple-500"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
          />

          {/* Iconiță centrală */}
          <span className="absolute inset-0 flex items-center justify-center text-purple-400 text-lg">
            <i className={`${SPINNER_ICON} animate-spin`} aria-hidden="true" />
          </span>
        </motion.div>

        {/* Particule plutitoare decorative */}
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: Math.random() * 3 + 1,
              height: Math.random() * 3 + 1,
              backgroundColor:
                i % 2 === 0 ? "#c084fc" : "#fbbf24",
              left: `${30 + Math.random() * 40}%`,
              top: `${20 + Math.random() * 60}%`,
            }}
            animate={{
              y: [0, -40, 0, 20, 0],
              x: [0, 20, -15, 10, 0],
              opacity: [0.2, 0.7, 0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Mesaj dinamic */}
        <motion.div
          key={messageIndex}
          variants={loadingItemVariants}
          initial="initial"
          animate="animate"
          className="text-center"
        >
          <p
            className="text-sm text-foreground-dim tracking-wider"
            style={{
              fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace",
            }}
          >
            <i className="fa-solid fa-terminal text-xs mr-2 text-purple-500/60" aria-hidden="true" />
            {currentMessage}
          </p>
        </motion.div>

        {/* Progress bar subtil */}
        <motion.div
          variants={loadingItemVariants}
          className="w-48 h-[2px] rounded-full bg-white/5 overflow-hidden"
        >
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-purple-600 via-purple-400 to-purple-600"
            animate={{
              x: ["-100%", "100%"],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENTĂ: ERROR STATE
// ═══════════════════════════════════════════════════════════════

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  const apiUrl =
    typeof process !== "undefined" &&
    (process.env as Record<string, string | undefined>)
      .NEXT_PUBLIC_API_URL
      ? (process.env as Record<string, string>).NEXT_PUBLIC_API_URL
      : "localhost:3001";

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-dark overflow-hidden">
      {/* BackgroundCanvas în fundal pentru context vizual */}
      <BackgroundCanvas />

      <motion.div
        variants={errorVariants}
        initial="initial"
        animate="animate"
        className="relative z-10 mx-auto max-w-lg px-4"
      >
        <div
          className="
            glass-lg
            p-8 sm:p-10
            flex flex-col items-center text-center gap-6
          "
        >
          {/* Iconiță eroare */}
          <motion.div
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center text-3xl sm:text-4xl"
            style={{
              background: "rgba(248, 113, 113, 0.1)",
              border: "1px solid rgba(248, 113, 113, 0.2)",
              color: "#f87171",
              boxShadow: "0 0 40px rgba(248, 113, 113, 0.15)",
            }}
            animate={{
              scale: [1, 1.04, 1],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <i className={ERROR_ICON} aria-hidden="true" />
          </motion.div>

          {/* Titlu */}
          <h2
            className="text-2xl sm:text-3xl font-bold text-white/95"
            style={{
              fontFamily: "var(--font-playfair), 'Playfair Display', serif",
            }}
          >
            Conexiune eșuată
          </h2>

          {/* Mesaj */}
          <p
            className="text-sm sm:text-base text-foreground-muted leading-relaxed"
            style={{
              fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
            }}
          >
            {message}
          </p>

          {/* Buton retry */}
          <motion.button
            type="button"
            onClick={onRetry}
            className="
              inline-flex items-center gap-3
              px-7 py-3.5
              rounded-full
              text-base font-semibold
              text-white
              overflow-hidden
              relative
              group
            "
            style={{
              fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
              background:
                "linear-gradient(135deg, #7e22ce 0%, #a855f7 50%, #7e22ce 100%)",
              backgroundSize: "200% 100%",
              boxShadow:
                "0 4px 24px rgba(126, 34, 206, 0.4), 0 0 50px rgba(168, 85, 247, 0.15)",
            }}
            whileHover={{
              scale: 1.04,
              backgroundPosition: "100% 50%",
              boxShadow:
                "0 6px 32px rgba(126, 34, 206, 0.55), 0 0 70px rgba(168, 85, 247, 0.25)",
            }}
            whileTap={{ scale: 0.97 }}
          >
            <i className={`${RETRY_ICON} text-sm`} aria-hidden="true" />
            Reîncearcă conectarea
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
              <div
                className="absolute inset-0"
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
                  animation: "shimmer 2s ease-in-out infinite",
                }}
              />
            </div>
          </motion.button>

          {/* Notă subtilă */}
          <p
            className="text-xs text-foreground-dim/50"
            style={{
              fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace",
            }}
          >
            Verifică dacă serverul rulează pe{" "}
            <code className="text-purple-400/60">
              {apiUrl}
            </code>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTA PRINCIPALĂ: HOME (SPA ORCHESTRATOR)
//
// Responsabilități:
//  1. Fetch setări de la API (GET /api/settings)
//  2. Loading state → LoadingScreen cu mesaje animate
//  3. Error handling → ErrorState cu retry + auto-retry
//  4. Parallax global → useParallaxGlobal (scroll tracking)
//  5. Compunere secțiuni → Hero, Services, Portfolio, Process,
//     DeliveryTerms, FAQ, Contact
// ═══════════════════════════════════════════════════════════════

export default function Home() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  const fetchAttempted = useRef(false);
  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Parallax global ──────────────────────────────────────
  const parallax = useParallaxGlobal();

  // ── Mount check ─────────────────────────────────────────
  useEffect(() => {
    setMounted(true);
  }, []);

  // ── Fetch setări de la API ──────────────────────────────
  const loadSettings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetchSettings();

      if (result.error) {
        // Dacă am mai puțin de FETCH_RETRY_MAX încercări, reîncearcă automat
        if (retryCount < FETCH_RETRY_MAX) {
          const nextRetry = retryCount + 1;
          setRetryCount(nextRetry);
          retryTimer.current = setTimeout(() => {
            loadSettings();
          }, RETRY_DELAY_MS);
          setError(
            `${result.error}. Reîncercare automată ${nextRetry}/${FETCH_RETRY_MAX}...`
          );
          setLoading(true);
          return;
        }

        setError(
          result.error ||
            "Nu s-au putut încărca setările de la server."
        );
        setLoading(false);
        return;
      }

      if (result.data) {
        setSettings(result.data);
      }

      setLoading(false);
      fetchAttempted.current = true;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Eroare necunoscută.";
      setError(message);
      setLoading(false);
    }
  }, [retryCount]);

  useEffect(() => {
    if (!fetchAttempted.current) {
      loadSettings();
    }

    return () => {
      if (retryTimer.current) {
        clearTimeout(retryTimer.current);
      }
    };
  }, [loadSettings]);

  // ── Handler retry manual ────────────────────────────────
  const handleRetry = useCallback(() => {
    setRetryCount(0);
    setError(null);
    if (retryTimer.current) {
      clearTimeout(retryTimer.current);
      retryTimer.current = null;
    }
    loadSettings();
  }, [loadSettings]);

  // ── Mesaje hero din settings (dacă sunt disponibile) ──
  // NOTĂ: Hero folosește momentan mesaje hardcodate intern.
  // Aceste variabile sunt pregătite pentru când Hero va suporta
  // props opționale pentru custom messages / badge.
  void settings; // Referință pentru a evita warning-ul de unused

  // ═══════════════════════════════════════════════════════════
  // RENDER: LOADING
  // ═══════════════════════════════════════════════════════════
  if (loading && !error) {
    return (
      <AnimatePresence mode="wait">
        <LoadingScreen key="loading" />
      </AnimatePresence>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // RENDER: ERROR
  // ═══════════════════════════════════════════════════════════
  if (error) {
    return <ErrorState message={error} onRetry={handleRetry} />;
  }

  // ═══════════════════════════════════════════════════════════
  // RENDER: CONȚINUT PRINCIPAL
  //
  // BackgroundCanvas-ul este persistat manual aici pentru
  // a se asigura stackarea corectă în ierarhia vizuală.
  // ═══════════════════════════════════════════════════════════
  return (
    <motion.div
      variants={contentVariants}
      initial="hidden"
      animate={mounted ? "visible" : "hidden"}
    >
      {/* Fundal particule canvas */}
      <BackgroundCanvas />

      {/* ═══════════════════════════════════════════════════════
          SECȚIUNILE PAGINII
          ═══════════════════════════════════════════════════ */}

      <Hero
        video
        poster="/images/hero-poster.jpg"
        logo="/images/logo-black-bg.png"
        logoAlt="Nexus Dev Studio"
      />

      <Services />

      <Portfolio />

      <Process backgroundImage="/images/process-bg.jpg" />

      <DeliveryTerms />

      <FAQ />

      <Contact />

      {/* ═══════════════════════════════════════════════════════
          INDICATOR PARALLAX (EASTER EGG / DEBUG)
          Atributul data-* permite tool-urilor de dev să
          inspecteze starea globală de scroll.
          ═══════════════════════════════════════════════════ */}
      {parallax.isReady && (
        <div
          className="fixed bottom-4 left-4 z-50 pointer-events-none opacity-0"
          aria-hidden="true"
          data-parallax-scroll-y={parallax.scrollY}
          data-parallax-scroll-percent={parallax.scrollPercent.toFixed(4)}
          data-parallax-direction={parallax.scrollDirection}
        />
      )}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// NOTE DE ARHITECTURĂ
//
// 1. API Fetching
//    Setările sunt încărcate client-side prin fetchSettings().
//    În cazul unui static export (output: "export"), datele sunt
//    fetch-uite la runtime. Layout-ul (server component) face deja
//    fetch pentru SEO la build time; page.tsx face fetch la
//    runtime pentru conținut dinamic.
//
// 2. Parallax Global
//    Hook-ul useParallaxGlobal() oferă starea globală de scroll
//    (poziție, procent, direcție, viteză). Fiecare secțiune își
//    gestionează propriul parallax intern prin useScroll de la
//    framer-motion, dar hook-ul global permite orchestrarea
//    efectelor cross-secțiune (ex: tranziții între secțiuni).
//
// 3. Loading & Error
//    LoadingScreen: ecran full-screen cu logo, spinner, mesaje
//    animate și progress bar. ErrorState: card centrat cu iconiță,
//    mesaj, buton retry și auto-retry (max 2 încercări).
//
// 4. Extensibilitate
//    Variabilele heroMessages și heroBadge sunt pregătite pentru
//    a fi pasate la Hero când acesta va accepta props opționale
//    pentru override din API. Momentan Hero folosește constante
//    interne (MORPH_MESSAGES, BADGE_TEXT).
// ═══════════════════════════════════════════════════════════════