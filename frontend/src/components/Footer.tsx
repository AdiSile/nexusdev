"use client";

import { useCallback } from "react";
import { motion } from "framer-motion";
import { useInView } from "@/hooks/useInView";

// ═══════════════════════════════════════════════════════════════
// TIPURI
// ═══════════════════════════════════════════════════════════════

interface QuickLink {
  label: string;
  href: string;
}

interface SocialLink {
  label: string;
  href: string;
  icon: string;
  ariaLabel: string;
}

// ═══════════════════════════════════════════════════════════════
// CONSTANTE
// ═══════════════════════════════════════════════════════════════

const QUICK_LINKS: QuickLink[] = [
  { label: "Acasă", href: "#hero" },
  { label: "Servicii", href: "#services" },
  { label: "Portofoliu", href: "#portfolio" },
  { label: "Proces", href: "#process" },
  { label: "Întrebări", href: "#faq" },
  { label: "Contact", href: "#contact" },
];

const SOCIAL_LINKS: SocialLink[] = [
  {
    label: "Facebook",
    href: "#",
    icon: "fa-brands fa-facebook-f",
    ariaLabel: "Nexus Dev Studio pe Facebook",
  },
  {
    label: "TikTok",
    href: "#",
    icon: "fa-brands fa-tiktok",
    ariaLabel: "Nexus Dev Studio pe TikTok",
  },
];

const COPYRIGHT_YEAR = "2026";
const COPYRIGHT_TEXT = "Nexus Dev Studio. Toate drepturile rezervate.";
const TAGLINE = "Transformăm idei în experiențe digitale.";

// ═══════════════════════════════════════════════════════════════
// VARIANTE ANIMAȚII FRAMER-MOTION
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

const columnVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.33, 1, 0.68, 1] },
  },
};

const linkItemVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: 0.05 * i,
      duration: 0.4,
      ease: [0.33, 1, 0.68, 1],
    },
  }),
};

const dividerVariants = {
  hidden: { scaleX: 0, opacity: 0 },
  visible: {
    scaleX: 1,
    opacity: 1,
    transition: { delay: 0.5, duration: 0.7, ease: [0.33, 1, 0.68, 1] },
  },
};

const bottomVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { delay: 0.4, duration: 0.5, ease: [0.33, 1, 0.68, 1] },
  },
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTA FOOTER
// ═══════════════════════════════════════════════════════════════

export default function Footer() {
  const { ref: footerRef, isInView } = useInView({
    threshold: 0.05,
    once: true,
    rootMargin: "0px 0px -40px 0px",
  });

  const handleLinkClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      if (href.startsWith("#")) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    },
    []
  );

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════
  return (
    <motion.footer
      ref={footerRef}
      role="contentinfo"
      aria-label="Subsolul site-ului"
      variants={sectionVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className="relative w-full pt-20 pb-10 sm:pt-24 sm:pb-12 overflow-hidden"
    >
      {/* ── Fundal decorativ ─────────────────────────────── */}
      <div className="absolute inset-0 bg-gradient-dark pointer-events-none" />
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        aria-hidden="true"
        style={{
          background: `
            radial-gradient(ellipse 50% 30% at 50% 100%, rgba(126,34,206,0.1) 0%, transparent 60%),
            radial-gradient(ellipse 35% 25% at 20% 80%, rgba(168,85,247,0.05) 0%, transparent 55%),
            radial-gradient(ellipse 35% 25% at 80% 80%, rgba(245,158,11,0.04) 0%, transparent 55%)
          `,
        }}
      />

      {/* Linie subtilă superioară cu gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[90%] max-w-5xl h-px bg-gradient-to-r from-transparent via-purple-500/25 to-transparent pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ── GRID PRINCIPAL ────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-14 mb-10 sm:mb-14">
          {/* ── Coloana 1: Logo + Descriere ────────────────── */}
          <motion.div variants={columnVariants} className="md:col-span-5 lg:col-span-4">
            {/* Logo */}
            <a
              href="#hero"
              onClick={(e) => handleLinkClick(e, "#hero")}
              className="inline-block group no-underline mb-4"
              aria-label="Nexus Dev Studio – Acasă"
            >
              <span
                className="text-2xl sm:text-3xl font-bold tracking-tight"
                style={{
                  fontFamily: "var(--font-playfair), 'Playfair Display', serif",
                }}
              >
                <span className="text-gradient-purple">Nexus</span>
                <span className="text-white/90 ml-1.5 font-light italic text-xl sm:text-2xl">
                  Dev
                </span>
              </span>
              {/* Decorative underline */}
              <span className="block mt-1 h-[2px] w-3/4 rounded-full bg-gradient-to-r from-purple-500 via-purple-400 to-transparent transition-all duration-300 group-hover:w-full" />
            </a>

            {/* Tagline */}
            <p
              className="text-sm sm:text-base text-foreground-muted leading-relaxed max-w-sm mt-3"
              style={{
                fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
              }}
            >
              {TAGLINE}
            </p>
          </motion.div>

          {/* ── Coloana 2: Link-uri rapide ─────────────────── */}
          <motion.div variants={columnVariants} className="md:col-span-3 lg:col-span-3">
            <h4
              className="text-sm font-semibold text-white/80 uppercase tracking-wider mb-5"
              style={{
                fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
              }}
            >
              Link-uri rapide
              <span className="block mt-2 w-8 h-[2px] rounded-full bg-gradient-to-r from-purple-500 to-purple-400" />
            </h4>

            <ul className="flex flex-col gap-2" role="list">
              {QUICK_LINKS.map((link, i) => (
                <motion.li
                  key={link.href}
                  custom={i}
                  variants={linkItemVariants}
                >
                  <a
                    href={link.href}
                    onClick={(e) => handleLinkClick(e, link.href)}
                    className="inline-flex items-center gap-2 text-sm text-foreground-muted hover:text-white transition-colors duration-200 py-1 no-underline group"
                    style={{
                      fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
                    }}
                  >
                    <span className="w-1 h-1 rounded-full bg-purple-500/40 group-hover:bg-purple-400 group-hover:w-1.5 transition-all duration-200 flex-shrink-0" />
                    {link.label}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* ── Coloana 3: Rețele sociale ──────────────────── */}
          <motion.div variants={columnVariants} className="md:col-span-4 lg:col-span-3">
            <h4
              className="text-sm font-semibold text-white/80 uppercase tracking-wider mb-5"
              style={{
                fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
              }}
            >
              Urmărește-ne
              <span className="block mt-2 w-8 h-[2px] rounded-full bg-gradient-to-r from-purple-500 to-purple-400" />
            </h4>

            <div className="flex items-center gap-4">
              {SOCIAL_LINKS.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.ariaLabel}
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-base sm:text-lg text-white/75 hover:text-white transition-colors duration-200 no-underline"
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                  }}
                  whileHover={{
                    rotate: 360,
                    scale: 1.12,
                    background: "rgba(126, 34, 206, 0.2)",
                    borderColor: "rgba(168, 85, 247, 0.4)",
                    boxShadow: "0 0 28px rgba(126, 34, 206, 0.35)",
                  }}
                  whileTap={{ scale: 0.92 }}
                  transition={{
                    rotate: { duration: 0.55, ease: [0.33, 1, 0.68, 1] },
                    scale: { duration: 0.2 },
                    background: { duration: 0.2 },
                    borderColor: { duration: 0.2 },
                    boxShadow: { duration: 0.2 },
                  }}
                >
                  <i className={social.icon} aria-hidden="true" />
                </motion.a>
              ))}
            </div>

            {/* Subtle indicator text */}
            <p
              className="text-xs text-foreground-dim mt-4"
              style={{
                fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
              }}
            >
              Rămâi conectat pentru noutăți și oferte exclusive.
            </p>
          </motion.div>
        </div>

        {/* ── DIVIDER ─────────────────────────────────────────── */}
        <motion.div
          variants={dividerVariants}
          className="h-px w-full bg-gradient-to-r from-transparent via-white/8 to-transparent mb-6 sm:mb-8 origin-center"
        />

        {/* ── COPYRIGHT + INFO BOTTOM ─────────────────────────── */}
        <motion.div
          variants={bottomVariants}
          className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left"
        >
          {/* Copyright */}
          <p
            className="text-xs sm:text-sm text-foreground-dim flex items-center gap-1.5 flex-wrap justify-center sm:justify-start"
            style={{
              fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
            }}
          >
            <i className="fa-regular fa-copyright text-[10px] text-purple-400/70" aria-hidden="true" />
            <span>{COPYRIGHT_YEAR}</span>
            <span className="text-foreground-dim/60">{COPYRIGHT_TEXT}</span>
          </p>

          {/* Back to top subtle */}
          <a
            href="#hero"
            onClick={(e) => handleLinkClick(e, "#hero")}
            className="inline-flex items-center gap-1.5 text-xs text-foreground-dim hover:text-purple-400 transition-colors duration-200 no-underline"
            style={{
              fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
            }}
            aria-label="Înapoi sus"
          >
            <i className="fa-solid fa-arrow-up text-[10px]" aria-hidden="true" />
            Înapoi sus
          </a>
        </motion.div>
      </div>

      {/* ── Accent decorativ colțuri ──────────────────────── */}
      <div className="absolute inset-0 pointer-events-none z-0" aria-hidden="true">
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-purple-900/8 via-purple-800/2 to-transparent rounded-tr-full" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-gradient-to-tl from-purple-900/6 via-purple-800/1 to-transparent rounded-tl-full" />
      </div>
    </motion.footer>
  );
}