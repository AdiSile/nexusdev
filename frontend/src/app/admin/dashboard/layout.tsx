"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, usePathname } from "next/navigation";

// ═══════════════════════════════════════════════════════════════
// CONSTANTE
// ═══════════════════════════════════════════════════════════════

const COOKIE_NAME = "admin_token";
const SIDEBAR_COLLAPSE_BREAKPOINT = 1024;

// Icon-uri FontAwesome
const ICONS = {
  SPINNER: "fa-solid fa-spinner",
  EXCLAMATION: "fa-solid fa-circle-exclamation",
  LOGOUT: "fa-solid fa-right-from-bracket",
  USER_SHIELD: "fa-solid fa-user-shield",
  CUBES: "fa-solid fa-cubes",
  GRID: "fa-solid fa-grid-2",
  FOLDER: "fa-solid fa-folder-open",
  BRIEFCASE: "fa-solid fa-briefcase",
  GEARS: "fa-solid fa-gears",
  MESSAGE: "fa-solid fa-message",
  GEAR: "fa-solid fa-gear",
  MAGNIFYING_GLASS: "fa-solid fa-magnifying-glass-chart",
  SHIELD: "fa-solid fa-shield-halved",
  BARS: "fa-solid fa-bars",
  XMARK: "fa-solid fa-xmark",
  CHEVRON_LEFT: "fa-solid fa-chevron-left",
  CHEVRON_RIGHT: "fa-solid fa-chevron-right",
  ARROW_RIGHT: "fa-solid fa-arrow-right",
  CHART_LINE: "fa-solid fa-chart-line",
  PALETTE: "fa-solid fa-palette",
  CODE: "fa-solid fa-code",
  ENVELOPE: "fa-solid fa-envelope",
  FILE_LINES: "fa-solid fa-file-lines",
  CLOCK: "fa-solid fa-clock-rotate-left",
  LOCK: "fa-solid fa-lock",
  TRIANGLE: "fa-solid fa-triangle-exclamation",
};

// ═══════════════════════════════════════════════════════════════
// TIPURI
// ═══════════════════════════════════════════════════════════════

interface NavSection {
  label: string;
  items: NavItem[];
}

interface NavItem {
  icon: string;
  label: string;
  href: string;
  badge?: string;
  badgeColor?: "purple" | "gold" | "emerald" | "red";
}

// ═══════════════════════════════════════════════════════════════
// CONFIGURARE NAVIGAȚIE SIDEBAR
// ═══════════════════════════════════════════════════════════════

const NAV_SECTIONS: NavSection[] = [
  {
    label: "Principal",
    items: [
      {
        icon: ICONS.GRID,
        label: "Dashboard",
        href: "/admin/dashboard",
      },
      {
        icon: ICONS.CHART_LINE,
        label: "Analitice",
        href: "/admin/dashboard/analytics",
        badge: "Soon",
        badgeColor: "purple",
      },
    ],
  },
  {
    label: "Conținut",
    items: [
      {
        icon: ICONS.FOLDER,
        label: "Portofoliu",
        href: "/admin/dashboard/portfolio",
      },
      {
        icon: ICONS.BRIEFCASE,
        label: "Servicii",
        href: "/admin/dashboard/services",
      },
      {
        icon: ICONS.GEARS,
        label: "Proces",
        href: "/admin/dashboard/process",
        badge: "Soon",
        badgeColor: "gold",
      },
    ],
  },
  {
    label: "Comunicare",
    items: [
      {
        icon: ICONS.MESSAGE,
        label: "Mesaje",
        href: "/admin/dashboard/messages",
        badge: "24",
        badgeColor: "emerald",
      },
    ],
  },
  {
    label: "Setări",
    items: [
      {
        icon: ICONS.GEAR,
        label: "Setări site",
        href: "/admin/dashboard/settings",
      },
      {
        icon: ICONS.MAGNIFYING_GLASS,
        label: "SEO",
        href: "/admin/dashboard/seo",
        badge: "Soon",
        badgeColor: "purple",
      },
    ],
  },
  {
    label: "Sistem",
    items: [
      {
        icon: ICONS.SHIELD,
        label: "Admini",
        href: "/admin/dashboard/admins",
        badge: "Soon",
        badgeColor: "red",
      },
      {
        icon: ICONS.CLOCK,
        label: "Loguri",
        href: "/admin/dashboard/logs",
        badge: "Soon",
        badgeColor: "purple",
      },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════
// UTILITARE COOKIE
// ═══════════════════════════════════════════════════════════════

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    const raw = parts.pop()?.split(";").shift();
    return raw ? decodeURIComponent(raw) : null;
  }
  return null;
}

function deleteCookie(name: string): void {
  document.cookie = `${name}=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

// ═══════════════════════════════════════════════════════════════
// VARIANTE FRAMER-MOTION
// ═══════════════════════════════════════════════════════════════

const sidebarVariants = {
  open: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.3, ease: [0.33, 1, 0.68, 1] },
  },
  closed: {
    x: "-100%",
    opacity: 0,
    transition: { duration: 0.25, ease: [0.33, 1, 0.68, 1] },
  },
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

const pageTransition = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.33, 1, 0.68, 1] } },
};

// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENTĂ: LOADING STATE
// ═══════════════════════════════════════════════════════════════

function LoadingState() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#0a0a0f]">
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background: `
            radial-gradient(ellipse 40% 30% at 50% 40%, rgba(126,34,206,0.06) 0%, transparent 60%),
            radial-gradient(ellipse 35% 25% at 30% 60%, rgba(168,85,247,0.04) 0%, transparent 55%)
          `,
        }}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-6"
      >
        <motion.div
          className="w-14 h-14 rounded-full border-2 border-purple-500/20 flex items-center justify-center"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        >
          <i className={`${ICONS.SPINNER} text-purple-400 animate-spin`} aria-hidden="true" />
        </motion.div>
        <p
          className="text-sm text-foreground-dim tracking-wider"
          style={{ fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace" }}
        >
          Verificare sesiune...
        </p>
      </motion.div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENTĂ: UNAUTHORIZED STATE
// ═══════════════════════════════════════════════════════════════

function UnauthorizedState({ onRedirect }: { onRedirect: () => void }) {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#0a0a0f]">
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background: `radial-gradient(ellipse 40% 30% at 50% 40%, rgba(248,113,113,0.06) 0%, transparent 60%)`,
        }}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
        className="glass-lg p-8 sm:p-10 flex flex-col items-center text-center gap-6 mx-4 max-w-md"
      >
        <motion.div
          className="w-20 h-20 rounded-full flex items-center justify-center text-3xl"
          style={{
            background: "rgba(248,113,113,0.1)",
            border: "1px solid rgba(248,113,113,0.2)",
            color: "#f87171",
            boxShadow: "0 0 40px rgba(248,113,113,0.15)",
          }}
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <i className={ICONS.EXCLAMATION} aria-hidden="true" />
        </motion.div>
        <h2
          className="text-2xl sm:text-3xl font-bold text-white/95"
          style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif" }}
        >
          Acces restricționat
        </h2>
        <p
          className="text-sm text-foreground-muted leading-relaxed"
          style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}
        >
          Nu ești autentificat sau sesiunea a expirat. Întoarce-te la pagina de login pentru a te conecta.
        </p>
        <motion.button
          type="button"
          onClick={onRedirect}
          className="px-7 py-3.5 rounded-full text-base font-semibold text-white bg-gradient-to-r from-purple-700 via-purple-500 to-purple-700 bg-[length:200%_100%] shadow-[0_4px_24px_rgba(126,34,206,0.4)] hover:shadow-[0_6px_32px_rgba(126,34,206,0.55)]"
          style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
        >
          Mergi la Login
        </motion.button>
      </motion.div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENTĂ: SIDEBAR NAV ITEM
// ═══════════════════════════════════════════════════════════════

function SidebarNavItem({
  item,
  isActive,
  onClick,
}: {
  item: NavItem;
  isActive: boolean;
  onClick: () => void;
}) {
  const badgeColorMap: Record<string, { bg: string; text: string; border: string }> = {
    purple: {
      bg: "rgba(126,34,206,0.15)",
      text: "#c084fc",
      border: "rgba(126,34,206,0.25)",
    },
    gold: {
      bg: "rgba(245,158,11,0.12)",
      text: "#fbbf24",
      border: "rgba(245,158,11,0.25)",
    },
    emerald: {
      bg: "rgba(16,185,129,0.12)",
      text: "#34d399",
      border: "rgba(16,185,129,0.25)",
    },
    red: {
      bg: "rgba(239,68,68,0.12)",
      text: "#f87171",
      border: "rgba(239,68,68,0.25)",
    },
  };

  const badgeStyle = item.badgeColor ? badgeColorMap[item.badgeColor] : badgeColorMap.purple;

  return (
    <motion.a
      href={item.href}
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group no-underline ${
        isActive
          ? "text-white"
          : "text-foreground-muted hover:text-white"
      }`}
      style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}
      whileHover={{ x: 2 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Fundal activ */}
      {isActive && (
        <motion.div
          layoutId="sidebar-active-pill"
          className="absolute inset-0 rounded-lg"
          style={{
            background: "linear-gradient(135deg, rgba(126,34,206,0.2), rgba(168,85,247,0.08))",
            border: "1px solid rgba(168,85,247,0.2)",
          }}
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}

      {/* Icon */}
      <span
        className={`relative z-10 w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0 transition-all duration-200 ${
          isActive ? "" : "group-hover:bg-white/5"
        }`}
        style={isActive ? { color: "#c084fc" } : {}}
      >
        <i className={item.icon} aria-hidden="true" />
      </span>

      {/* Label */}
      <span className="relative z-10 truncate">{item.label}</span>

      {/* Badge */}
      {item.badge && (
        <span
          className="relative z-10 ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full border"
          style={{
            background: badgeStyle.bg,
            color: badgeStyle.text,
            borderColor: badgeStyle.border,
            fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace",
          }}
        >
          {item.badge}
        </span>
      )}
    </motion.a>
  );
}

// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENTĂ: SIDEBAR
// ═══════════════════════════════════════════════════════════════

function Sidebar({
  isOpen,
  onClose,
  pathname,
  onNavigate,
}: {
  isOpen: boolean;
  onClose: () => void;
  pathname: string;
  onNavigate: () => void;
}) {
  const isActive = (href: string): boolean => {
    if (href === "/admin/dashboard") {
      return pathname === "/admin/dashboard";
    }
    return pathname.startsWith(href);
  };

  return (
    <motion.aside
      initial="closed"
      animate={isOpen ? "open" : "closed"}
      variants={sidebarVariants}
      className="fixed top-0 left-0 bottom-0 z-50 w-72 flex flex-col overflow-hidden"
      style={{
        background: "linear-gradient(180deg, rgba(10,10,15,0.98) 0%, rgba(18,18,26,0.98) 100%)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        boxShadow: "8px 0 40px rgba(0,0,0,0.4)",
      }}
    >
      {/* Header Sidebar */}
      <div className="flex items-center justify-between px-5 h-16 flex-shrink-0 border-b border-white/5">
        <a
          href="/admin/dashboard"
          onClick={(e) => {
            e.preventDefault();
            onNavigate();
          }}
          className="flex items-center gap-3 no-underline group"
        >
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{
              background: "#000000",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <img
              src="/images/logo-black-bg.png"
              alt="Nexus Dev Studio"
              className="w-6 h-6 object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = `<span class="flex items-center justify-center w-full h-full text-sm text-purple-400"><i class="${ICONS.CUBES}"></i></span>`;
                }
              }}
            />
          </div>
          <span
            className="text-lg font-bold tracking-tight"
            style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif" }}
          >
            <span className="text-gradient-purple">Nexus</span>
            <span className="text-white/50 ml-1 font-light italic text-sm">Admin</span>
          </span>
        </a>

        {/* Close button (mobil) */}
        <button
          type="button"
          onClick={onClose}
          className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center text-foreground-dim hover:text-white hover:bg-white/5 transition-all duration-200"
          aria-label="Închide meniul lateral"
        >
          <i className={ICONS.XMARK} aria-hidden="true" />
        </button>
      </div>

      {/* Nav Sections */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <p
              className="px-3 mb-2 text-[11px] font-medium uppercase tracking-widest text-foreground-dim/50"
              style={{ fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace" }}
            >
              {section.label}
            </p>
            <div className="flex flex-col gap-0.5">
              {section.items.map((item) => (
                <SidebarNavItem
                  key={item.href}
                  item={item}
                  isActive={isActive(item.href)}
                  onClick={onNavigate}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer Sidebar */}
      <div className="px-5 py-4 border-t border-white/5 flex-shrink-0">
        <div
          className="flex items-center gap-2 text-xs text-foreground-dim/50"
          style={{ fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace" }}
        >
          <i className={`${ICONS.SHIELD} text-[10px] text-purple-500/40`} aria-hidden="true" />
          <span>Sesiune securizată</span>
        </div>
        <p
          className="text-[10px] text-foreground-dim/30 mt-1.5"
          style={{ fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace" }}
        >
          Nexus Dev Studio &copy; {new Date().getFullYear()}
        </p>
      </div>
    </motion.aside>
  );
}

// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENTĂ: TOP BAR
// ═══════════════════════════════════════════════════════════════

function TopBar({
  onToggleSidebar,
  onLogout,
  sidebarOpen,
}: {
  onToggleSidebar: () => void;
  onLogout: () => void;
  sidebarOpen: boolean;
}) {
  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.33, 1, 0.68, 1] }}
      className="sticky top-0 z-40 h-16 flex items-center border-b border-white/5"
      style={{
        background: "rgba(10,10,15,0.85)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
    >
      <div className="w-full px-4 sm:px-6 flex items-center justify-between">
        {/* Left: Toggle sidebar + breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-foreground-dim hover:text-white hover:bg-white/5 transition-all duration-200"
            aria-label={sidebarOpen ? "Închide meniul lateral" : "Deschide meniul lateral"}
          >
            <i className={sidebarOpen ? ICONS.XMARK : ICONS.BARS} aria-hidden="true" />
          </button>

          {/* Brand minim (mobile) */}
          <span className="lg:hidden flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-md flex items-center justify-center"
              style={{ background: "#000000", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              <img
                src="/images/logo-black-bg.png"
                alt=""
                className="w-5 h-5 object-contain"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            </div>
            <span
              className="text-base font-bold tracking-tight"
              style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif" }}
            >
              <span className="text-gradient-purple">Nexus</span>
              <span className="text-white/50 ml-0.5 font-light italic text-xs">Admin</span>
            </span>
          </span>
        </div>

        {/* Right: Admin info + Logout */}
        <div className="flex items-center gap-4">
          <span
            className="hidden sm:flex items-center gap-1.5 text-xs text-foreground-dim"
            style={{ fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace" }}
          >
            <i className={`${ICONS.USER_SHIELD} text-purple-500/60`} aria-hidden="true" />
            Administrator
          </span>

          <motion.button
            type="button"
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-red-400/80 hover:text-red-300 border border-red-500/15 hover:border-red-500/30 bg-red-500/5 hover:bg-red-500/10 transition-all duration-200"
            style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <i className={ICONS.LOGOUT} aria-hidden="true" />
            <span className="hidden sm:inline">Deconectare</span>
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTA PRINCIPALĂ: DASHBOARD LAYOUT
// ═══════════════════════════════════════════════════════════════

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // ── Verificare autentificare ──────────────────────────────
  useEffect(() => {
    setMounted(true);
    const token = getCookie(COOKIE_NAME);
    if (!token) {
      setChecking(false);
      setAuthenticated(false);
      return;
    }
    setAuthenticated(true);
    setChecking(false);
  }, []);

  // ── Sidebar auto-închidere la resize (desktop) ───────────
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= SIDEBAR_COLLAPSE_BREAKPOINT) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ── Blochează scroll body când sidebar-ul mobil e deschis ─
  useEffect(() => {
    if (sidebarOpen && window.innerWidth < SIDEBAR_COLLAPSE_BREAKPOINT) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  // ── Handlers ─────────────────────────────────────────────
  const handleLogout = useCallback(() => {
    deleteCookie(COOKIE_NAME);
    router.push("/admin");
  }, [router]);

  const handleGoToLogin = useCallback(() => {
    router.push("/admin");
  }, [router]);

  const handleToggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const handleCloseSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  const handleNavigate = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  // ── State: loading ───────────────────────────────────────
  if (checking) return <LoadingState />;

  // ── State: neautentificat ────────────────────────────────
  if (!authenticated) return <UnauthorizedState onRedirect={handleGoToLogin} />;

  // ── State: autentificat ──────────────────────────────────
  return (
    <div className="relative min-h-screen bg-[#0a0a0f]">
      {/* Background decorativ */}
      <div
        className="fixed inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background: `
            radial-gradient(ellipse 50% 30% at 50% 0%, rgba(126,34,206,0.06) 0%, transparent 60%),
            radial-gradient(ellipse 40% 25% at 80% 40%, rgba(168,85,247,0.03) 0%, transparent 55%),
            radial-gradient(ellipse 35% 25% at 20% 80%, rgba(251,191,36,0.02) 0%, transparent 55%)
          `,
        }}
      />

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={handleCloseSidebar}
        pathname={pathname}
        onNavigate={handleNavigate}
      />

      {/* Overlay pentru mobil */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={handleCloseSidebar}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Conținut principal */}
      <div className="lg:ml-0 flex flex-col min-h-screen">
        <TopBar
          onToggleSidebar={handleToggleSidebar}
          onLogout={handleLogout}
          sidebarOpen={sidebarOpen}
        />

        <motion.main
          key={pathname}
          initial="initial"
          animate="animate"
          variants={pageTransition}
          className="flex-1"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}