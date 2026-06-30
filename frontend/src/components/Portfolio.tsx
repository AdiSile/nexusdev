"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTilt3D } from "@/hooks/useTilt3D";
import { useInView } from "@/hooks/useInView";

// ═══════════════════════════════════════════════════════════════
// TIPURI
// ═══════════════════════════════════════════════════════════════

interface ProjectItem {
  id: number;
  title: string;
  description: string;
  category: ProjectCategory;
  image: string;
  imageAlt: string;
  tags: string[];
  demoUrl?: string;
  githubUrl?: string;
  featured?: boolean;
}

type ProjectCategory = "web" | "mobile" | "ecommerce" | "design" | "dashboard";

interface CategoryFilter {
  id: ProjectCategory | "all";
  label: string;
  icon: string;
}

// ═══════════════════════════════════════════════════════════════
// CONSTANTE
// ═══════════════════════════════════════════════════════════════

const PROJECTS: ProjectItem[] = [
  // ═══════════ WEB ═══════════
  {
    id: 1,
    title: "Platformă SaaS Enterprise",
    description:
      "Aplicație web full-stack cu autentificare, dashboard administrativ, facturare automată și analytics în timp real.",
    category: "web",
    image: "/images/portfolio-dashboard.jpg",
    imageAlt: "Platformă SaaS enterprise cu dashboard analitic",
    tags: ["Next.js", "TypeScript", "PostgreSQL", "Stripe", "AWS"],
    demoUrl: "https://demo.example.com",
    featured: true,
  },
  {
    id: 2,
    title: "Portal Imobiliar Interactiv",
    description:
      "Motor de căutare cu filtre avansate, hartă interactivă, tururi virtuale 3D și sistem de notificări personalizate.",
    category: "web",
    image: "/images/portfolio-web.jpg",
    imageAlt: "Portal imobiliar cu hartă interactivă",
    tags: ["React", "Node.js", "MongoDB", "Mapbox", "Socket.io"],
    demoUrl: "https://demo.example.com",
    githubUrl: "https://github.com/example/realestate",
  },
  {
    id: 3,
    title: "Aplicație de Recrutare AI",
    description:
      "Platformă de matching automat între candidați și joburi, cu analiză semantică și scoring ML integrat.",
    category: "web",
    image: "/images/portfolio-software.jpg",
    imageAlt: "Aplicație recrutare cu AI",
    tags: ["Next.js", "Python", "TensorFlow", "Redis", "Docker"],
    githubUrl: "https://github.com/example/recruit-ai",
  },
  // ═══════════ MOBILE ═══════════
  {
    id: 4,
    title: "Aplicație Fitness & Nutriție",
    description:
      "Tracking calorii, planuri de antrenament, integrare Apple Health / Google Fit și social features.",
    category: "mobile",
    image: "/images/portfolio-mobile.jpg",
    imageAlt: "Aplicație mobilă fitness și nutriție",
    tags: ["React Native", "Firebase", "HealthKit", "Google Fit"],
    demoUrl: "https://demo.example.com",
    featured: true,
  },
  {
    id: 5,
    title: "Wallet Digital Crypto",
    description:
      "Portofel multi-currency cu schimb instant, istoric tranzacții, securitate biometrică și suport cold storage.",
    category: "mobile",
    image: "/images/portfolio-software.jpg",
    imageAlt: "Wallet digital pentru criptomonede",
    tags: ["Flutter", "Solidity", "Web3", "Biometric Auth"],
    githubUrl: "https://github.com/example/crypto-wallet",
  },
  // ═══════════ ECOMMERCE ═══════════
  {
    id: 6,
    title: "Magazin Online Premium",
    description:
      "E-commerce cu coș inteligent, recomandări AI, integrare plăți multiple și panel de analytics avansat.",
    category: "ecommerce",
    image: "/images/portfolio-ecommerce.jpg",
    imageAlt: "Magazin online premium cu design modern",
    tags: ["Next.js", "Stripe", "Algolia", "PostgreSQL", "Vercel"],
    demoUrl: "https://demo.example.com",
    githubUrl: "https://github.com/example/premium-store",
    featured: true,
  },
  {
    id: 7,
    title: "Marketplace P2P",
    description:
      "Platformă peer-to-peer cu escrow inteligent, rating utilizatori, chat integrat și sistem de dispute.",
    category: "ecommerce",
    image: "/images/portfolio-dashboard.jpg",
    imageAlt: "Marketplace P2P cu escrow",
    tags: ["Vue.js", "Laravel", "MySQL", "Pusher", "Redis"],
    demoUrl: "https://demo.example.com",
  },
  // ═══════════ DESIGN ═══════════
  {
    id: 8,
    title: "Rebranding Corporate Complet",
    description:
      "Identitate vizuală nouă, design system în Figma, ghid de stil, componente UI și prototipare interactivă.",
    category: "design",
    image: "/images/portfolio-design.jpg",
    imageAlt: "Rebranding corporate cu design system Figma",
    tags: ["Figma", "Design System", "UI Kit", "Prototyping"],
    demoUrl: "https://demo.example.com",
  },
  {
    id: 9,
    title: "Aplicație Bancară Mobile UI",
    description:
      "Redesign complet al interfeței mobile banking cu focus pe accesibilitate, dark mode și micro-interacțiuni.",
    category: "design",
    image: "/images/portfolio-mobile.jpg",
    imageAlt: "Interfață banking mobilă redesign",
    tags: ["Figma", "Prototyping", "Usability Testing", "WCAG 2.1"],
    featured: true,
  },
  // ═══════════ DASHBOARD ═══════════
  {
    id: 10,
    title: "Dashboard Analytics în Timp Real",
    description:
      "Vizualizare date complexe, grafice interactive D3.js, export rapoarte personalizate și alerte configurabile.",
    category: "dashboard",
    image: "/images/portfolio-dashboard.jpg",
    imageAlt: "Dashboard analytics cu grafice interactive",
    tags: ["React", "D3.js", "WebSocket", "Elasticsearch", "Kubernetes"],
    demoUrl: "https://demo.example.com",
  },
  {
    id: 11,
    title: "Back-office Logistică",
    description:
      "Sistem de management flotă, tracking GPS, optimizare rute, gestiune livrări și raportare financiară.",
    category: "dashboard",
    image: "/images/portfolio-web.jpg",
    imageAlt: "Back-office logistică cu tracking GPS",
    tags: ["Angular", "Node.js", "PostGIS", "Redis", "Docker"],
    demoUrl: "https://demo.example.com",
    githubUrl: "https://github.com/example/logistics",
  },
  {
    id: 12,
    title: "Platformă E-learning",
    description:
      "Sistem complet de cursuri online cu video streaming, quiz-uri, certificări și tracking progres studenți.",
    category: "dashboard",
    image: "/images/portfolio-software.jpg",
    imageAlt: "Platformă e-learning cu video și certificări",
    tags: ["Next.js", "GraphQL", "PostgreSQL", "Mux", "AWS S3"],
    demoUrl: "https://demo.example.com",
    featured: true,
  },
];

const CATEGORIES: CategoryFilter[] = [
  { id: "all", label: "Toate", icon: "fa-solid fa-grid-2" },
  { id: "web", label: "Aplicații Web", icon: "fa-solid fa-globe" },
  { id: "mobile", label: "Mobile Apps", icon: "fa-solid fa-mobile-screen" },
  { id: "ecommerce", label: "E-Commerce", icon: "fa-solid fa-cart-shopping" },
  { id: "design", label: "UI/UX Design", icon: "fa-solid fa-palette" },
  { id: "dashboard", label: "Dashboard-uri", icon: "fa-solid fa-chart-pie" },
];

const CATEGORY_BADGE_COLORS: Record<ProjectCategory, { bg: string; text: string; glow: string }> = {
  web: {
    bg: "rgba(126, 34, 206, 0.2)",
    text: "#c084fc",
    glow: "rgba(126, 34, 206, 0.35)",
  },
  mobile: {
    bg: "rgba(59, 130, 246, 0.2)",
    text: "#93c5fd",
    glow: "rgba(59, 130, 246, 0.35)",
  },
  ecommerce: {
    bg: "rgba(245, 158, 11, 0.2)",
    text: "#fcd34d",
    glow: "rgba(245, 158, 11, 0.35)",
  },
  design: {
    bg: "rgba(236, 72, 153, 0.2)",
    text: "#f9a8d4",
    glow: "rgba(236, 72, 153, 0.35)",
  },
  dashboard: {
    bg: "rgba(34, 197, 94, 0.2)",
    text: "#86efac",
    glow: "rgba(34, 197, 94, 0.35)",
  },
};

const SECTION_ID = "portfolio";
const SECTION_HEADING = "Portofoliul Nostru";
const SECTION_SUBTITLE =
  "Proiecte reale care demonstrează expertiza noastră în design, dezvoltare și inovație digitală.";
const FILTER_LABEL = "Filtrează după categorie:";
const NO_PROJECTS = "Nu există proiecte în această categorie.";
const DEMO_LABEL = "Demo live";
const GITHUB_LABEL = "Cod sursă";
const ADMIN_SHORTCUT_HINT = "Ctrl+Shift+H pentru a ascunde/afișa secțiunea";
const SECTION_HIDDEN_MESSAGE =
  "Secțiunea Portofoliu este momentan ascunsă. Apasă Ctrl+Shift+H pentru a o afișa.";

// ═══════════════════════════════════════════════════════════════
// CHEIE LOCALSTORAGE PENTRU ADMIN TOGGLE
// ═══════════════════════════════════════════════════════════════

const LS_PORTFOLIO_HIDDEN = "nexusdev_portfolio_hidden";

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
// SUB-COMPONENTĂ: PROJECT CARD
// ═══════════════════════════════════════════════════════════════

function ProjectCard({
  project,
  index,
}: {
  project: ProjectItem;
  index: number;
}) {
  const tilt = useTilt3D({
    maxTilt: 12,
    perspective: 900,
    scale: 1.03,
    speed: 500,
  });

  const { ref: inViewRef, isInView } = useInView({
    threshold: 0.1,
    once: true,
    rootMargin: "0px 0px -40px 0px",
    delay: index * 60,
  });

  const combinedRef = useCallback(
    (node: HTMLElement | null) => {
      tilt.ref(node);
      inViewRef(node);
    },
    [tilt.ref, inViewRef]
  );

  const { mousePercentage, isHovering } = tilt;
  const badgeColor = CATEGORY_BADGE_COLORS[project.category];

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
      ${badgeColor.glow} 0%,
      rgba(126, 34, 206, 0.06) 35%,
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
      {/* Container cu tilt 3D */}
      <div
        className="
          relative
          glass-lg glass-hover
          overflow-hidden
          cursor-pointer
          flex flex-col
          min-h-[420px]
        "
        style={{
          ...tilt.style,
          transformStyle: "preserve-3d",
          borderColor: isHovering
            ? badgeColor.glow
            : "var(--glass-border)",
          boxShadow: isHovering
            ? `0 0 40px ${badgeColor.glow}, 0 16px 64px rgba(0, 0, 0, 0.45)`
            : "var(--glass-shadow)",
        }}
      >
        {/* Glow dinamic */}
        <div style={glowStyle} aria-hidden="true" />

        {/* ── IMAGINE ────────────────────────────────────── */}
        <div
          className="relative overflow-hidden h-48 sm:h-52"
          style={{ transform: "translateZ(18px)" }}
        >
          <img
            src={project.image}
            alt={project.imageAlt}
            loading="lazy"
            className="
              w-full h-full object-cover
              transition-transform duration-700 ease-out
              group-hover/card:scale-110
            "
          />
          {/* Overlay gradient peste imagine */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `
                linear-gradient(
                  to bottom,
                  transparent 55%,
                  rgba(10, 10, 15, 0.7) 85%,
                  rgba(10, 10, 15, 0.95) 100%
                )
              `,
            }}
          />

          {/* Etichetă featured */}
          {project.featured && (
            <div
              className="
                absolute top-3 right-3 z-20
                flex items-center gap-1.5
                px-3 py-1.5
                rounded-full
                text-xs font-semibold uppercase tracking-wider
                text-white/95
              "
              style={{
                fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
                background:
                  "linear-gradient(135deg, rgba(245, 158, 11, 0.85), rgba(217, 119, 6, 0.9))",
                boxShadow: "0 2px 12px rgba(245, 158, 11, 0.35)",
                transform: "translateZ(30px)",
              }}
            >
              <i className="fa-solid fa-star text-[10px]" aria-hidden="true" />
              Featured
            </div>
          )}

          {/* Badge categorie peste imagine */}
          <div
            className="
              absolute bottom-3 left-3 z-20
              inline-flex items-center gap-1.5
              px-2.5 py-1
              rounded-full
              text-xs font-medium
            "
            style={{
              fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
              background: badgeColor.bg,
              color: badgeColor.text,
              border: `1px solid ${badgeColor.glow}`,
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
              transform: "translateZ(28px)",
            }}
          >
            <i
              className={CATEGORIES.find((c) => c.id === project.category)?.icon ?? "fa-solid fa-folder"}
              style={{ fontSize: "10px" }}
              aria-hidden="true"
            />
            {CATEGORIES.find((c) => c.id === project.category)?.label ?? project.category}
          </div>
        </div>

        {/* ── CONȚINUT TEXT ──────────────────────────────── */}
        <div
          className="relative z-10 flex flex-col flex-1 p-5 sm:p-6 gap-3"
          style={{ transform: "translateZ(15px)" }}
        >
          {/* Titlu */}
          <h3
            className="
              text-lg sm:text-xl font-semibold
              text-white/95
              leading-tight
            "
            style={{
              fontFamily: "var(--font-playfair), 'Playfair Display', serif",
            }}
          >
            {project.title}
          </h3>

          {/* Descriere */}
          <p
            className="
              text-sm
              text-foreground-muted
              leading-relaxed
              flex-1
              line-clamp-3
            "
            style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}
          >
            {project.description}
          </p>

          {/* Tag-uri tehnologii */}
          <div className="flex flex-wrap gap-1.5 mt-auto">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="
                  px-2 py-1
                  rounded-md
                  text-[11px] font-medium
                  tracking-wide
                "
                style={{
                  fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace",
                  background: "rgba(255, 255, 255, 0.04)",
                  color: "rgba(255, 255, 255, 0.6)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                }}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Link-uri acțiune */}
          <div className="flex items-center gap-3 pt-2 mt-1 border-t border-white/5">
            {project.demoUrl && (
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  inline-flex items-center gap-1.5
                  text-sm font-medium
                  text-purple-400 hover:text-purple-300
                  transition-colors duration-200
                  no-underline
                "
                style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}
                onClick={(e) => e.stopPropagation()}
                aria-label={`Demo live pentru ${project.title}`}
              >
                <i className="fa-solid fa-arrow-up-right-from-square text-xs" aria-hidden="true" />
                {DEMO_LABEL}
              </a>
            )}

            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  inline-flex items-center gap-1.5
                  text-sm font-medium
                  text-foreground-muted hover:text-white/80
                  transition-colors duration-200
                  no-underline
                "
                style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}
                onClick={(e) => e.stopPropagation()}
                aria-label={`Cod sursă pentru ${project.title}`}
              >
                <i className="fa-brands fa-github text-xs" aria-hidden="true" />
                {GITHUB_LABEL}
              </a>
            )}
          </div>
        </div>

        {/* Strat decorativ geometric */}
        <div
          className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]"
          style={{ transform: "translateZ(5px)" }}
          aria-hidden="true"
        >
          <svg width="100%" height="100%" viewBox="0 0 360 420" fill="none" preserveAspectRatio="none">
            <circle cx="300" cy="70" r="100" stroke="white" strokeWidth="0.8" />
            <circle cx="300" cy="70" r="150" stroke="white" strokeWidth="0.4" />
            <line x1="30" y1="380" x2="330" y2="380" stroke="white" strokeWidth="0.4" />
          </svg>
        </div>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTA PRINCIPALĂ: PORTFOLIO
// ═══════════════════════════════════════════════════════════════

export default function Portfolio() {
  const [activeCategory, setActiveCategory] = useState<ProjectCategory | "all">("all");
  const [isHidden, setIsHidden] = useState(false);
  const [showAdminToast, setShowAdminToast] = useState(false);

  const { ref: sectionRef, isInView: sectionInView } = useInView({
    threshold: 0.05,
    once: true,
    rootMargin: "0px 0px -80px 0px",
  });

  // ── Citim starea din localStorage la montare ───────────────
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LS_PORTFOLIO_HIDDEN);
      if (stored === "true") {
        setIsHidden(true);
      }
    } catch {
      // localStorage indisponibil
    }
  }, []);

  // ── Keyboard shortcut admin: Ctrl+Shift+H ─────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "H") {
        e.preventDefault();
        setIsHidden((prev) => {
          const next = !prev;
          try {
            localStorage.setItem(LS_PORTFOLIO_HIDDEN, String(next));
          } catch {
            // localStorage indisponibil
          }
          return next;
        });
        setShowAdminToast(true);
        setTimeout(() => setShowAdminToast(false), 3000);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // ── Filtrare proiecte ─────────────────────────────────────
  const filteredProjects = useMemo(() => {
    if (activeCategory === "all") return PROJECTS;
    return PROJECTS.filter((p) => p.category === activeCategory);
  }, [activeCategory]);

  // ── Handler categorie ────────────────────────────────────
  const handleCategoryChange = useCallback((cat: ProjectCategory | "all") => {
    setActiveCategory(cat);
  }, []);

  // ═══════════════════════════════════════════════════════════
  // RENDER: SECȚIUNEA ASCUNSĂ
  // ═══════════════════════════════════════════════════════════
  if (isHidden) {
    return (
      <section
        id={SECTION_ID}
        className="
          relative w-full
          py-16 sm:py-20
          overflow-hidden
          bg-gradient-dark
        "
        aria-label="Portofoliu (ascuns)"
      >
        <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.33, 1, 0.68, 1] }}
            className="
              glass
              rounded-2xl
              py-12 sm:py-16 px-6
              flex flex-col items-center gap-4
            "
          >
            <motion.div
              animate={{
                y: [0, -6, 0],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <i
                className="fa-solid fa-eye-slash text-4xl text-foreground-dim"
                aria-hidden="true"
              />
            </motion.div>
            <p
              className="text-base sm:text-lg text-foreground-muted"
              style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}
            >
              {SECTION_HIDDEN_MESSAGE}
            </p>
            <button
              type="button"
              onClick={() => {
                setIsHidden(false);
                try {
                  localStorage.setItem(LS_PORTFOLIO_HIDDEN, "false");
                } catch {
                  // ignore
                }
              }}
              className="
                mt-2
                inline-flex items-center gap-2
                px-5 py-2.5
                rounded-full
                text-sm font-medium
                text-white/90
                transition-all duration-300
                hover:scale-105
                focus-visible:outline-2 focus-visible:outline-purple-500
              "
              style={{
                fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
                background: "rgba(126, 34, 206, 0.2)",
                border: "1px solid rgba(168, 85, 247, 0.3)",
              }}
            >
              <i className="fa-solid fa-eye text-xs" aria-hidden="true" />
              Afișează secțiunea
            </button>
          </motion.div>
        </div>
      </section>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // RENDER: SECȚIUNEA VIZIBILĂ
  // ═══════════════════════════════════════════════════════════
  return (
    <section
      id={SECTION_ID}
      ref={sectionRef}
      className="
        relative w-full
        py-24 sm:py-32 lg:py-40
        overflow-hidden
      "
      aria-label="Portofoliul Nexus Dev Studio"
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

      {/* Grilă subtilă */}
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
        {/* ── HEADING ──────────────────────────────────────── */}
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

          {/* Linie decorativă */}
          <motion.div
            variants={headingVariants}
            className="mt-6 mx-auto w-24 h-1 rounded-full bg-gradient-to-r from-purple-600 via-purple-500 to-purple-400"
          />

          {/* Admin hint */}
          <motion.p
            variants={subtitleVariants}
            className="
              mt-4
              text-xs
              text-foreground-dim/40
              tracking-wider
            "
            style={{ fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace" }}
          >
            <i className="fa-solid fa-keyboard text-[10px] mr-1.5" aria-hidden="true" />
            {ADMIN_SHORTCUT_HINT}
          </motion.p>
        </motion.div>

        {/* ── FILTRE CATEGORII ─────────────────────────────── */}
        <motion.div
          variants={tabsVariants}
          initial="hidden"
          animate={sectionInView ? "visible" : "hidden"}
          className="mb-14 sm:mb-18"
        >
          <p
            className="text-center text-xs sm:text-sm uppercase tracking-widest text-foreground-dim mb-4"
            style={{ fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace" }}
          >
            {FILTER_LABEL}
          </p>

          <div
            className="
              flex flex-wrap justify-center gap-2 sm:gap-3
              mx-auto max-w-3xl
            "
            role="tablist"
            aria-label="Categorii portofoliu"
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

        {/* ── GRID PROIECTE ────────────────────────────────── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: [0.33, 1, 0.68, 1] }}
          >
            {filteredProjects.length > 0 ? (
              <div
                className="
                  grid gap-6 sm:gap-8
                  grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
                "
              >
                {filteredProjects.map((project, idx) => (
                  <ProjectCard key={project.id} project={project} index={idx} />
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
                  className="fa-solid fa-folder-open text-4xl text-foreground-dim mb-4"
                  aria-hidden="true"
                />
                <p
                  className="text-lg text-foreground-muted"
                  style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}
                >
                  {NO_PROJECTS}
                </p>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* ── CONTOR PROIECTE ──────────────────────────────── */}
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
            <i className="fa-solid fa-diagram-project text-[10px]" aria-hidden="true" />
            {filteredProjects.length} / {PROJECTS.length} proiecte
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

      {/* ═══════════════════════════════════════════════════════
          TOAST ADMIN
          ═══════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showAdminToast && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.35, ease: [0.33, 1, 0.68, 1] }}
            className="
              fixed bottom-6 right-6 z-50
              glass-dark
              px-5 py-3
              rounded-full
              flex items-center gap-3
              shadow-lg
            "
            role="status"
            aria-live="polite"
            style={{
              border: "1px solid rgba(168, 85, 247, 0.3)",
              boxShadow: "0 8px 32px rgba(126, 34, 206, 0.2)",
            }}
          >
            <i
              className={`fa-solid ${isHidden ? "fa-eye-slash" : "fa-eye"} text-sm text-purple-400`}
              aria-hidden="true"
            />
            <span
              className="text-sm text-white/85"
              style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}
            >
              {isHidden
                ? "Secțiunea Portofoliu a fost ascunsă"
                : "Secțiunea Portofoliu este vizibilă"}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}