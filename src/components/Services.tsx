"use client";

import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTilt3D } from "@/hooks/useTilt3D";
import { useInView } from "@/hooks/useInView";

// ═══════════════════════════════════════════════════════════════
// TIPURI
// ═══════════════════════════════════════════════════════════════

interface ServiceItem {
  id: number;
  icon: string;
  title: string;
  description: string;
  originalPrice: number;
  reducedPrice: number;
  discountPercent: number;
  category: ServiceCategory;
  popular?: boolean;
}

type ServiceCategory =
  | "web"
  | "mobile"
  | "design"
  | "marketing"
  | "consulting";

interface CategoryTab {
  id: ServiceCategory | "all";
  label: string;
  icon: string;
}

// ═══════════════════════════════════════════════════════════════
// CONSTANTE
// ═══════════════════════════════════════════════════════════════

const CATEGORIES: CategoryTab[] = [
  { id: "all", label: "Toate", icon: "fa-solid fa-grid-2" },
  { id: "web", label: "Web Development", icon: "fa-solid fa-code" },
  { id: "mobile", label: "Mobile Apps", icon: "fa-solid fa-mobile-screen" },
  { id: "design", label: "UI/UX Design", icon: "fa-solid fa-pen-ruler" },
  { id: "marketing", label: "Marketing & SEO", icon: "fa-solid fa-chart-line" },
  { id: "consulting", label: "Consultanță", icon: "fa-solid fa-comments" },
];

const SERVICES: ServiceItem[] = [
  // ═══════════ WEB DEVELOPMENT (5) ═══════════
  {
    id: 1,
    icon: "fa-solid fa-rocket",
    title: "Landing Page Premium",
    description:
      "Pagină de aterizare optimizată pentru conversii, design personalizat și timp de încărcare sub 2 secunde.",
    originalPrice: 3500,
    reducedPrice: 2450,
    discountPercent: 30,
    category: "web",
    popular: true,
  },
  {
    id: 2,
    icon: "fa-solid fa-globe",
    title: "Aplicație Web Completă",
    description:
      "Platformă web full-stack cu autentificare, bază de date, API REST și dashboard administrativ.",
    originalPrice: 12000,
    reducedPrice: 8900,
    discountPercent: 26,
    category: "web",
  },
  {
    id: 3,
    icon: "fa-solid fa-cart-shopping",
    title: "E-Commerce Personalizat",
    description:
      "Magazin online cu coș, plăți integrate, administrare stocuri și panel de analytics.",
    originalPrice: 15000,
    reducedPrice: 11200,
    discountPercent: 25,
    category: "web",
  },
  {
    id: 4,
    icon: "fa-solid fa-building-columns",
    title: "Portal Web Enterprise",
    description:
      "Soluție enterprise cu roluri multiple, fluxuri de aprobare, SSO și audit logging.",
    originalPrice: 25000,
    reducedPrice: 19500,
    discountPercent: 22,
    category: "web",
  },
  {
    id: 5,
    icon: "fa-solid fa-gauge-high",
    title: "Optimizare Performanță",
    description:
      "Audit Lighthouse, optimizare Core Web Vitals, lazy loading și reducere TTFB sub 300ms.",
    originalPrice: 5000,
    reducedPrice: 3500,
    discountPercent: 30,
    category: "web",
  },
  // ═══════════ MOBILE APPS (4) ═══════════
  {
    id: 6,
    icon: "fa-brands fa-apple",
    title: "Aplicație iOS Nativă",
    description:
      "Dezvoltare nativă Swift/SwiftUI cu integrare completă a ecosistemului Apple.",
    originalPrice: 18000,
    reducedPrice: 13900,
    discountPercent: 23,
    category: "mobile",
    popular: true,
  },
  {
    id: 7,
    icon: "fa-brands fa-android",
    title: "Aplicație Android Nativă",
    description:
      "Kotlin/Jetpack Compose cu arhitectură MVVM, suport multi-device și Play Store.",
    originalPrice: 17000,
    reducedPrice: 13200,
    discountPercent: 22,
    category: "mobile",
  },
  {
    id: 8,
    icon: "fa-solid fa-layer-group",
    title: "Aplicație Cross-Platform",
    description:
      "React Native sau Flutter, cod partajat 90%+ între iOS și Android, lansare rapidă.",
    originalPrice: 22000,
    reducedPrice: 16800,
    discountPercent: 24,
    category: "mobile",
  },
  {
    id: 9,
    icon: "fa-solid fa-wifi",
    title: "Progressive Web App",
    description:
      "PWA cu offline-first, notificări push, instalare pe Home Screen și sincronizare.",
    originalPrice: 9000,
    reducedPrice: 6400,
    discountPercent: 29,
    category: "mobile",
  },
  // ═══════════ UI/UX DESIGN (4) ═══════════
  {
    id: 10,
    icon: "fa-solid fa-palette",
    title: "Design Interfață Web",
    description:
      "Design complet în Figma cu design system, componente reutilizabile și ghid de stil.",
    originalPrice: 6000,
    reducedPrice: 4200,
    discountPercent: 30,
    category: "design",
    popular: true,
  },
  {
    id: 11,
    icon: "fa-solid fa-mobile-button",
    title: "Design Interfață Mobilă",
    description:
      "UI pentru iOS/Android conform Human Interface Guidelines și Material Design 3.",
    originalPrice: 5500,
    reducedPrice: 3900,
    discountPercent: 29,
    category: "design",
  },
  {
    id: 12,
    icon: "fa-solid fa-cubes",
    title: "Prototipare Interactivă",
    description:
      "Prototip high-fidelity cu microinteracțiuni, animații și flow-uri complete testabile.",
    originalPrice: 4000,
    reducedPrice: 2700,
    discountPercent: 33,
    category: "design",
  },
  {
    id: 13,
    icon: "fa-solid fa-magnifying-glass-chart",
    title: "Audit UX & Research",
    description:
      "Analiză euristică, testare cu utilizatori, heatmaps și raport detaliat de recomandări.",
    originalPrice: 4500,
    reducedPrice: 3100,
    discountPercent: 31,
    category: "design",
  },
  // ═══════════ MARKETING & SEO (4) ═══════════
  {
    id: 14,
    icon: "fa-solid fa-magnifying-glass",
    title: "Strategie SEO Completă",
    description:
      "Audit tehnic, cercetare cuvinte cheie, optimizare on-page și link building organic.",
    originalPrice: 4000,
    reducedPrice: 2800,
    discountPercent: 30,
    category: "marketing",
    popular: true,
  },
  {
    id: 15,
    icon: "fa-solid fa-hashtag",
    title: "Marketing Social Media",
    description:
      "Strategie de conținut, design postări, calendar editorial și analiză engagement.",
    originalPrice: 3500,
    reducedPrice: 2400,
    discountPercent: 31,
    category: "marketing",
  },
  {
    id: 16,
    icon: "fa-brands fa-google",
    title: "Google Ads & PPC",
    description:
      "Campanii Search/Display/Shopping, optimizare Quality Score și reducere cost per conversie.",
    originalPrice: 5000,
    reducedPrice: 3600,
    discountPercent: 28,
    category: "marketing",
  },
  {
    id: 17,
    icon: "fa-solid fa-envelope-open-text",
    title: "Email Marketing",
    description:
      "Automatizări, segmentare avansată, template-uri responsive și analiză deliverability.",
    originalPrice: 3000,
    reducedPrice: 2000,
    discountPercent: 33,
    category: "marketing",
  },
  // ═══════════ CONSULTING (4) ═══════════
  {
    id: 18,
    icon: "fa-solid fa-brain",
    title: "Consultanță Tehnică",
    description:
      "Evaluare stack tehnologic, recomandări arhitecturale și plan de scalare pe termen lung.",
    originalPrice: 7000,
    reducedPrice: 5200,
    discountPercent: 26,
    category: "consulting",
    popular: true,
  },
  {
    id: 19,
    icon: "fa-solid fa-diagram-project",
    title: "Arhitectură Software",
    description:
      "Proiectare microservicii, event-driven, CQRS, API design și documentație tehnică.",
    originalPrice: 10000,
    reducedPrice: 7500,
    discountPercent: 25,
    category: "consulting",
  },
  {
    id: 20,
    icon: "fa-solid fa-shield-halved",
    title: "Audit de Securitate",
    description:
      "Penetration testing, OWASP Top 10, analiză dependențe și raport de remediere.",
    originalPrice: 8500,
    reducedPrice: 6000,
    discountPercent: 29,
    category: "consulting",
  },
  {
    id: 21,
    icon: "fa-solid fa-headset",
    title: "Mentenanță & Suport",
    description:
      "Pachet lunar de mentenanță, monitorizare 24/7, actualizări și suport prioritar.",
    originalPrice: 2500,
    reducedPrice: 1800,
    discountPercent: 28,
    category: "consulting",
  },
];

const SECTION_HEADING = "Serviciile Noastre";
const SECTION_SUBTITLE =
  "De la design la lansare, oferim soluții complete pentru proiecte digitale de orice complexitate.";
const FILTER_LABEL = "Filtrează după categorie:";
const NO_RESULTS = "Nu există servicii în această categorie.";
const CURRENCY = "EUR";

// ═══════════════════════════════════════════════════════════════
// VARIANTE FRAMER-MOTION
// ═══════════════════════════════════════════════════════════════

const sectionVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.08,
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

const tabsVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.35,
      duration: 0.5,
      ease: [0.33, 1, 0.68, 1],
    },
  },
};

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 60,
    scale: 0.88,
    rotateX: 15,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    rotateX: 0,
    transition: {
      duration: 0.7,
      ease: [0.34, 1.56, 0.64, 1],
    },
  },
};

// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENTĂ: SERVICE CARD
// ═══════════════════════════════════════════════════════════════

function ServiceCard({
  service,
  index,
}: {
  service: ServiceItem;
  index: number;
}) {
  const tilt = useTilt3D({
    maxTilt: 14,
    perspective: 900,
    scale: 1.04,
    speed: 500,
  });

  const { ref: inViewRef, isInView } = useInView({
    threshold: 0.1,
    once: true,
    rootMargin: "0px 0px -40px 0px",
    delay: index * 60, // Efect de val: fiecare card are un delay incremental
  });

  // Combinăm ref-urile
  const combinedRef = useCallback(
    (node: HTMLElement | null) => {
      tilt.ref(node);
      inViewRef(node);
    },
    [tilt.ref, inViewRef]
  );

  // Poziția mouse-ului pentru glow
  const { mousePercentage, isHovering } = tilt;

  // Glow care urmărește mouse-ul
  const glowStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    borderRadius: "var(--glass-radius-lg)",
    pointerEvents: "none",
    zIndex: 0,
    opacity: isHovering ? 1 : 0,
    transition: "opacity 0.3s ease",
    background: `radial-gradient(
      circle at ${mousePercentage.x * 100}% ${mousePercentage.y * 100}%,
      rgba(168, 85, 247, 0.22) 0%,
      rgba(126, 34, 206, 0.08) 35%,
      transparent 65%
    )`,
  };

  return (
    <motion.div
      ref={combinedRef}
      variants={cardVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className="relative group/card"
      style={{
        perspective: "900px",
        transformStyle: "preserve-3d",
      }}
    >
      {/* Container cu tilt */}
      <div
        className="
          relative
          glass-lg glass-hover
          p-6 sm:p-7
          flex flex-col gap-5
          overflow-hidden
          cursor-pointer
          min-h-[340px]
        "
        style={{
          ...tilt.style,
          transformStyle: "preserve-3d",
          borderColor: isHovering
            ? "rgba(168, 85, 247, 0.3)"
            : "var(--glass-border)",
          boxShadow: isHovering
            ? "0 0 40px rgba(168, 85, 247, 0.15), 0 16px 64px rgba(0, 0, 0, 0.45)"
            : "var(--glass-shadow)",
        }}
      >
        {/* ── GLOW DINAMIC ──────────────────────────────── */}
        <div style={glowStyle} aria-hidden="true" />

        {/* ── ETICHETĂ POPULAR (opțional) ────────────────── */}
        {service.popular && (
          <div
            className="
              absolute top-0 right-0 z-20
              flex items-center gap-1.5
              px-3.5 py-1.5
              rounded-bl-xl rounded-tr-xl
              text-xs font-semibold uppercase tracking-wider
              text-white/95
            "
            style={{
              fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
              background:
                "linear-gradient(135deg, rgba(245, 158, 11, 0.85), rgba(217, 119, 6, 0.9))",
              boxShadow: "0 2px 12px rgba(245, 158, 11, 0.3)",
              transform: "translateZ(30px)",
            }}
          >
            <i className="fa-solid fa-star text-[10px]" aria-hidden="true" />
            Popular
          </div>
        )}

        {/* ── ICONIȚĂ ──────────────────────────────────── */}
        <div
          className="
            relative z-10
            w-12 h-12 sm:w-14 sm:h-14
            flex items-center justify-center
            rounded-xl
            text-xl sm:text-2xl
          "
          style={{
            background:
              "linear-gradient(135deg, rgba(126, 34, 206, 0.16), rgba(168, 85, 247, 0.08))",
            border: "1px solid rgba(168, 85, 247, 0.2)",
            color: "#c084fc",
            transform: "translateZ(25px)",
            boxShadow: "0 4px 16px rgba(126, 34, 206, 0.15)",
          }}
        >
          <i className={service.icon} aria-hidden="true" />
        </div>

        {/* ── TITLU ────────────────────────────────────── */}
        <h3
          className="
            relative z-10
            text-lg sm:text-xl font-semibold
            text-white/95
            leading-tight
          "
          style={{
            fontFamily: "var(--font-playfair), 'Playfair Display', serif",
            transform: "translateZ(20px)",
          }}
        >
          {service.title}
        </h3>

        {/* ── DESCRIERE ────────────────────────────────── */}
        <p
          className="
            relative z-10
            text-sm sm:text-base
            text-foreground-muted
            leading-relaxed
            flex-1
          "
          style={{
            fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
            transform: "translateZ(15px)",
          }}
        >
          {service.description}
        </p>

        {/* ── PREȚ + REDUCERE ───────────────────────────── */}
        <div
          className="
            relative z-10
            flex items-end justify-between
            mt-auto pt-4
            border-t
          "
          style={{
            borderColor: "rgba(255, 255, 255, 0.06)",
            transform: "translateZ(22px)",
          }}
        >
          {/* Preț */}
          <div className="flex flex-col">
            {/* Preț original tăiat */}
            <span
              className="text-sm text-foreground-dim line-through"
              style={{ fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace" }}
            >
              {service.originalPrice.toLocaleString("ro-RO")} {CURRENCY}
            </span>
            {/* Preț redus */}
            <span
              className="text-xl sm:text-2xl font-bold text-white/95"
              style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}
            >
              {service.reducedPrice.toLocaleString("ro-RO")}{" "}
              <span className="text-sm text-foreground-muted">{CURRENCY}</span>
            </span>
          </div>

          {/* Etichetă reducere */}
          <span
            className="
              inline-flex items-center
              px-3 py-1.5
              rounded-full
              text-sm font-bold
              text-white/95
            "
            style={{
              fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
              background:
                "linear-gradient(135deg, rgba(220, 38, 38, 0.85), rgba(185, 28, 28, 0.9))",
              boxShadow: "0 2px 10px rgba(220, 38, 38, 0.25)",
            }}
          >
            -{service.discountPercent}%
          </span>
        </div>

        {/* ── STRAT DECORATIV INTERN (3D) ────────────────── */}
        {/* Linii geometrice subtile */}
        <div
          className="absolute inset-0 z-0 pointer-events-none opacity-[0.04]"
          style={{ transform: "translateZ(5px)" }}
          aria-hidden="true"
        >
          <svg width="100%" height="100%" viewBox="0 0 300 340" fill="none" preserveAspectRatio="none">
            <circle cx="250" cy="60" r="80" stroke="white" strokeWidth="0.8" />
            <circle cx="250" cy="60" r="120" stroke="white" strokeWidth="0.4" />
            <line x1="20" y1="280" x2="280" y2="280" stroke="white" strokeWidth="0.4" />
          </svg>
        </div>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTA PRINCIPALĂ: SERVICES
// ═══════════════════════════════════════════════════════════════

export default function Services() {
  const [activeCategory, setActiveCategory] = useState<ServiceCategory | "all">("all");

  const { ref: sectionRef, isInView: sectionInView } = useInView({
    threshold: 0.05,
    once: true,
    rootMargin: "0px 0px -80px 0px",
  });

  // ── Filtrare servicii ─────────────────────────────────────
  const filteredServices = useMemo(() => {
    if (activeCategory === "all") return SERVICES;
    return SERVICES.filter((s) => s.category === activeCategory);
  }, [activeCategory]);

  // ── Handler schimbare categorie ───────────────────────────
  const handleCategoryChange = useCallback((cat: ServiceCategory | "all") => {
    setActiveCategory(cat);
  }, []);

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════
  return (
    <section
      id="services"
      ref={sectionRef}
      className="
        relative w-full
        py-24 sm:py-32 lg:py-40
        overflow-hidden
      "
      aria-label="Serviciile Nexus Dev Studio"
    >
      {/* ═══════════════════════════════════════════════════════
          FUNDAL DECORATIV
          ═══════════════════════════════════════════════════ */}

      {/* Gradient orizontal */}
      <div className="absolute inset-0 bg-gradient-dark pointer-events-none" />

      {/* Auroră decorativă */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        aria-hidden="true"
        style={{
          background: `
            radial-gradient(ellipse 50% 35% at 50% 20%, rgba(126,34,206,0.1) 0%, transparent 70%),
            radial-gradient(ellipse 40% 30% at 20% 70%, rgba(168,85,247,0.05) 0%, transparent 60%),
            radial-gradient(ellipse 45% 35% at 80% 60%, rgba(245,158,11,0.04) 0%, transparent 60%)
          `,
        }}
      />

      {/* Grilă subtilă de fundal */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        aria-hidden="true"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Noise overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.02]"
        aria-hidden="true"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "200px 200px",
        }}
      />

      {/* ═══════════════════════════════════════════════════════
          CONȚINUT
          ═══════════════════════════════════════════════════ */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ── HEADING ────────────────────────────────────── */}
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
            style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif" }}
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
            style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}
          >
            {SECTION_SUBTITLE}
          </motion.p>

          {/* ── LINIE DECORATIVĂ ─────────────────────────── */}
          <motion.div
            variants={headingVariants}
            className="mt-6 mx-auto w-24 h-1 rounded-full bg-gradient-to-r from-purple-600 via-purple-500 to-purple-400"
          />
        </motion.div>

        {/* ── FILTRE CATEGORII ───────────────────────────── */}
        <motion.div
          variants={tabsVariants}
          initial="hidden"
          animate={sectionInView ? "visible" : "hidden"}
          className="mb-14 sm:mb-18"
        >
          {/* Label */}
          <p
            className="text-center text-xs sm:text-sm uppercase tracking-widest text-foreground-dim mb-4"
            style={{ fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace" }}
          >
            {FILTER_LABEL}
          </p>

          {/* Tab-uri */}
          <div
            className="
              flex flex-wrap justify-center gap-2 sm:gap-3
              mx-auto max-w-3xl
            "
            role="tablist"
            aria-label="Categorii servicii"
          >
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`
                    relative inline-flex items-center gap-2
                    px-4 py-2.5 sm:px-5 sm:py-3
                    rounded-full
                    text-sm sm:text-base font-medium
                    transition-all duration-300 ease-out
                    focus-visible:outline-2 focus-visible:outline-purple-500
                    ${
                      isActive
                        ? "text-white shadow-lg"
                        : "text-foreground-muted hover:text-white/85 hover:bg-white/5 border border-white/8"
                    }
                  `}
                  style={{
                    fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
                    ...(isActive
                      ? {
                          background:
                            "linear-gradient(135deg, #7e22ce 0%, #a855f7 60%, #7e22ce 100%)",
                          backgroundSize: "200% 100%",
                          boxShadow:
                            "0 4px 20px rgba(126, 34, 206, 0.35), 0 0 30px rgba(168, 85, 247, 0.1)",
                          border: "1px solid rgba(168, 85, 247, 0.3)",
                        }
                      : {}),
                  }}
                >
                  <i
                    className={`${cat.icon} text-xs sm:text-sm`}
                    aria-hidden="true"
                  />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* ── GRID CARDURI ───────────────────────────────── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: [0.33, 1, 0.68, 1] }}
          >
            {filteredServices.length > 0 ? (
              <div
                className="
                  grid gap-6 sm:gap-8
                  grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
                "
              >
                {filteredServices.map((service, idx) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    index={idx}
                  />
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="
                  text-center py-20
                  glass
                  rounded-2xl
                "
              >
                <i
                  className="fa-solid fa-search text-4xl text-foreground-dim mb-4"
                  aria-hidden="true"
                />
                <p
                  className="text-lg text-foreground-muted"
                  style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}
                >
                  {NO_RESULTS}
                </p>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* ── CONTOR CARDURI ──────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={sectionInView ? { opacity: 1 } : { opacity: 0 }}
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
            <i className="fa-solid fa-cube text-[10px]" aria-hidden="true" />
            {filteredServices.length} / {SERVICES.length} servicii disponibile
          </span>
        </motion.div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          VIGNETĂ COLTURI
          ═══════════════════════════════════════════════════ */}
      <div className="absolute inset-0 pointer-events-none z-0" aria-hidden="true">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-purple-800/5 via-purple-900/2 to-transparent rounded-bl-full" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-900/4 via-purple-800/1 to-transparent rounded-tr-full" />
      </div>
    </section>
  );
}