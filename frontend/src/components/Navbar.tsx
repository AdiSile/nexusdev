"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ═══════════════════════════════════════════════════════════════
// TIPURI
// ═══════════════════════════════════════════════════════════════

interface NavLink {
  label: string;
  href: string;
}

// ═══════════════════════════════════════════════════════════════
// CONSTANTE
// ═══════════════════════════════════════════════════════════════

const NAV_LINKS: NavLink[] = [
  { label: "Acasă", href: "#hero" },
  { label: "Servicii", href: "#services" },
  { label: "Portofoliu", href: "#portfolio" },
  { label: "Despre", href: "#about" },
];

const SCROLL_THRESHOLD = 60;

// ═══════════════════════════════════════════════════════════════
// VARIANTE ANIMAȚIE FRAMER-MOTION
// ═══════════════════════════════════════════════════════════════

const navbarVariants = {
  top: {
    background: "rgba(18, 18, 26, 0.45)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    borderColor: "rgba(255, 255, 255, 0.06)",
    boxShadow: "0 4px 24px rgba(0, 0, 0, 0.15)",
    paddingTop: "1rem",
    paddingBottom: "1rem",
  },
  scrolled: {
    background: "rgba(18, 18, 26, 0.78)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    borderColor: "rgba(255, 255, 255, 0.1)",
    boxShadow: "0 8px 40px rgba(0, 0, 0, 0.4), 0 0 30px rgba(126, 34, 206, 0.1)",
    paddingTop: "0.55rem",
    paddingBottom: "0.55rem",
  },
};

const mobileMenuVariants = {
  closed: {
    opacity: 0,
    height: 0,
    transition: {
      duration: 0.35,
      ease: [0.33, 1, 0.68, 1],
      opacity: { duration: 0.2 },
      height: { duration: 0.35 },
    },
  },
  open: {
    opacity: 1,
    height: "auto",
    transition: {
      duration: 0.4,
      ease: [0.33, 1, 0.68, 1],
      opacity: { duration: 0.25, delay: 0.05 },
      height: { duration: 0.4 },
    },
  },
};

const linkItemVariants = {
  closed: {
    opacity: 0,
    x: -20,
  },
  open: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: 0.08 + i * 0.06,
      duration: 0.35,
      ease: [0.33, 1, 0.68, 1],
    },
  }),
};

const hamburgerLineTop = {
  closed: { rotate: 0, y: 0 },
  open: { rotate: 45, y: 7 },
};

const hamburgerLineMiddle = {
  closed: { opacity: 1, x: 0 },
  open: { opacity: 0, x: 8 },
};

const hamburgerLineBottom = {
  closed: { rotate: 0, y: 0 },
  open: { rotate: -45, y: -7 },
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTA NAVBAR
// ═══════════════════════════════════════════════════════════════

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("");

  // ── Scroll listener ───────────────────────────────────────
  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > SCROLL_THRESHOLD);

    // Detectare secțiune activă pentru link-uri
    const sections = NAV_LINKS.map((link) => link.href.replace("#", ""));
    let current = "";
    for (const sectionId of sections) {
      const el = document.getElementById(sectionId);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= 120) {
          current = sectionId;
        }
      }
    }
    setActiveSection(current);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    // Verificare inițială
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // ── Închide meniul mobil la resize peste breakpoint ──────
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && isMobileOpen) {
        setIsMobileOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMobileOpen]);

  // ── Blochează scroll când meniul mobil e deschis ─────────
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  // ── Handler click pe link (închide mobilul) ──────────────
  const handleLinkClick = useCallback(() => {
    setIsMobileOpen(false);
  }, []);

  // ── Handler toggle mobil ──────────────────────────────────
  const handleToggle = useCallback(() => {
    setIsMobileOpen((prev) => !prev);
  }, []);

  // ── Clasă link activ ─────────────────────────────────────
  const isActive = (href: string): boolean => {
    const sectionId = href.replace("#", "");
    return activeSection === sectionId;
  };

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════
  return (
    <motion.nav
      role="navigation"
      aria-label="Navigare principală"
      initial="top"
      animate={isScrolled ? "scrolled" : "top"}
      variants={navbarVariants}
      transition={{ duration: 0.35, ease: [0.33, 1, 0.68, 1] }}
      className="fixed top-0 left-0 right-0 z-50 border-b"
      style={{
        borderBottomColor: "rgba(255, 255, 255, 0.06)",
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* ── LOGO ────────────────────────────────────────── */}
        <a
          href="#hero"
          onClick={handleLinkClick}
          className="relative group flex-shrink-0 no-underline"
          aria-label="Nexus Dev Studio – Acasă"
        >
          <span
            className="text-xl sm:text-2xl font-bold tracking-tight"
            style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif" }}
          >
            <span className="text-gradient-purple">Nexus</span>
            <span className="text-white/90 ml-1.5 font-light italic text-lg sm:text-xl">
              Dev
            </span>
          </span>
          {/* Pulsar decorativ sub logo */}
          <span
            className="absolute -bottom-0.5 left-0 h-[2px] rounded-full bg-gradient-to-r from-purple-500 via-purple-400 to-transparent transition-all duration-300"
            style={{
              width: isScrolled ? "60%" : "85%",
              opacity: isScrolled ? 0.5 : 0.8,
            }}
          />
        </a>

        {/* ── LINK-URI DESKTOP ────────────────────────────── */}
        <ul className="hidden lg:flex items-center gap-1" role="list">
          {NAV_LINKS.map((link) => {
            const active = isActive(link.href);
            return (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={handleLinkClick}
                  className={`
                    relative px-4 py-2 text-sm font-medium rounded-lg
                    transition-all duration-250 ease-out no-underline
                    ${
                      active
                        ? "text-white"
                        : "text-foreground-muted hover:text-white"
                    }
                  `}
                  aria-current={active ? "page" : undefined}
                >
                  {/* Background hover / activ */}
                  {active && (
                    <motion.span
                      layoutId="navbar-active-pill"
                      className="absolute inset-0 rounded-lg"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(126, 34, 206, 0.2), rgba(168, 85, 247, 0.1))",
                        border: "1px solid rgba(168, 85, 247, 0.2)",
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 30,
                      }}
                    />
                  )}
                  <span className="relative z-10">{link.label}</span>
                </a>
              </li>
            );
          })}
        </ul>

        {/* ── BUTON CONTACT + TOGGLE MOBIL ────────────────── */}
        <div className="flex items-center gap-3">
          {/* Buton Contact (desktop) */}
          <a
            href="#contact"
            onClick={handleLinkClick}
            className="
              hidden sm:inline-flex items-center gap-2
              px-5 py-2.5 rounded-full text-sm font-semibold
              bg-gradient-to-r from-purple-700 to-purple-600
              hover:from-purple-600 hover:to-purple-500
              text-white no-underline
              shadow-lg shadow-purple-900/30
              hover:shadow-purple-800/40
              transition-all duration-300 ease-out
              hover:scale-[1.03] active:scale-[0.97]
              border border-purple-500/20
            "
            style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}
          >
            <i className="fas fa-paper-plane text-xs" aria-hidden="true" />
            Contact
          </a>

          {/* Toggle Hamburger (mobil) */}
          <button
            type="button"
            onClick={handleToggle}
            className="
              lg:hidden relative z-50
              flex flex-col items-center justify-center
              w-10 h-10 rounded-lg
              transition-colors duration-200
              hover:bg-white/5
              focus-visible:outline-2 focus-visible:outline-purple-500
            "
            aria-expanded={isMobileOpen}
            aria-controls="mobile-menu"
            aria-label={isMobileOpen ? "Închide meniul" : "Deschide meniul"}
          >
            <span className="sr-only">
              {isMobileOpen ? "Închide meniul" : "Deschide meniul"}
            </span>
            <motion.span
              animate={isMobileOpen ? "open" : "closed"}
              variants={hamburgerLineTop}
              transition={{ duration: 0.3, ease: [0.33, 1, 0.68, 1] }}
              className="block w-5 h-[2px] bg-white rounded-full origin-center"
            />
            <motion.span
              animate={isMobileOpen ? "open" : "closed"}
              variants={hamburgerLineMiddle}
              transition={{ duration: 0.2, ease: [0.33, 1, 0.68, 1] }}
              className="block w-5 h-[2px] bg-white/80 rounded-full my-1"
            />
            <motion.span
              animate={isMobileOpen ? "open" : "closed"}
              variants={hamburgerLineBottom}
              transition={{ duration: 0.3, ease: [0.33, 1, 0.68, 1] }}
              className="block w-5 h-[2px] bg-white rounded-full origin-center"
            />
          </button>
        </div>
      </div>

      {/* ── MENIU MOBIL ────────────────────────────────────── */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            id="mobile-menu"
            initial="closed"
            animate="open"
            exit="closed"
            variants={mobileMenuVariants}
            className="lg:hidden overflow-hidden"
            role="menu"
            aria-label="Meniu mobil"
          >
            <div
              className="
                mx-4 mt-2 mb-4 px-4 py-5 rounded-2xl
                border border-white/10
              "
              style={{
                background:
                  "linear-gradient(180deg, rgba(26, 26, 37, 0.95) 0%, rgba(18, 18, 26, 0.9) 100%)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                boxShadow:
                  "0 16px 64px rgba(0, 0, 0, 0.5), 0 0 40px rgba(126, 34, 206, 0.08)",
              }}
            >
              {/* Link-uri mobile */}
              <ul className="flex flex-col gap-1" role="list">
                {NAV_LINKS.map((link, i) => {
                  const active = isActive(link.href);
                  return (
                    <motion.li
                      key={link.href}
                      custom={i}
                      initial="closed"
                      animate="open"
                      variants={linkItemVariants}
                      role="none"
                    >
                      <a
                        href={link.href}
                        onClick={handleLinkClick}
                        role="menuitem"
                        aria-current={active ? "page" : undefined}
                        className={`
                          block px-4 py-3 rounded-xl text-base font-medium
                          transition-all duration-200 no-underline
                          ${
                            active
                              ? "text-white bg-purple-700/20 border border-purple-500/20"
                              : "text-foreground-muted hover:text-white hover:bg-white/5 border border-transparent"
                          }
                        `}
                        style={{
                          fontFamily:
                            "var(--font-poppins), 'Poppins', sans-serif",
                        }}
                      >
                        {link.label}
                      </a>
                    </motion.li>
                  );
                })}
              </ul>

              {/* Separator */}
              <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ delay: 0.35, duration: 0.4 }}
                className="my-4 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"
              />

              {/* Buton Contact mobil */}
              <motion.a
                href="#contact"
                onClick={handleLinkClick}
                role="menuitem"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.35 }}
                className="
                  flex items-center justify-center gap-2
                  mx-2 py-3 rounded-xl text-base font-semibold
                  bg-gradient-to-r from-purple-700 to-purple-600
                  hover:from-purple-600 hover:to-purple-500
                  text-white no-underline
                  shadow-lg shadow-purple-900/20
                  transition-all duration-300
                  active:scale-[0.98]
                "
                style={{
                  fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
                }}
              >
                <i className="fas fa-paper-plane text-sm" aria-hidden="true" />
                Contactează-ne
              </motion.a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── OVERLAY ÎNCHIS MOBIL (click outside) ──────────── */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="lg:hidden fixed inset-0 -z-10 backdrop-brightness-50"
            style={{ top: 0 }}
            onClick={handleToggle}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>
    </motion.nav>
  );
}