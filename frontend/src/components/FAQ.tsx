"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import {
  motion,
  AnimatePresence,
} from "framer-motion";
import { useInView } from "@/hooks/useInView";

// ═══════════════════════════════════════════════════════════════
// TIPURI
// ═══════════════════════════════════════════════════════════════

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: FAQCategory;
}

type FAQCategory =
  | "general"
  | "preturi"
  | "proces"
  | "tehnic";

interface CategoryChip {
  id: FAQCategory | "toate";
  label: string;
}

// ═══════════════════════════════════════════════════════════════
// CONSTANTE
// ═══════════════════════════════════════════════════════════════

const FAQ_DATA: FAQItem[] = [
  // ── GENERAL ──────────────────────────────────────────────
  {
    id: 1,
    question: "Ce este Nexus Dev Studio și cu ce vă diferențiați?",
    answer:
      "Nexus Dev Studio este o agenție digitală full-stack specializată în dezvoltare web, aplicații mobile, design UI/UX și marketing digital. Ne diferențiem prin abordarea noastră holistică: fiecare proiect beneficiază de o strategie personalizată, design de elită și tehnologie de ultimă generație, livrată cu transparență totală și termene clare.",
    category: "general",
  },
  {
    id: 2,
    question: "În cât timp pot avea un site sau o aplicație funcțională?",
    answer:
      "Termenele variază în funcție de complexitate. O landing page premium poate fi livrată în 5–10 zile lucrătoare. O aplicație web completă necesită între 4 și 10 săptămâni. Proiectele enterprise pot dura 3–6 luni. La începutul colaborării îți oferim un calendar detaliat cu milestone-uri clare, pe care îl respectăm cu strictețe.",
    category: "general",
  },
  {
    id: 3,
    question: "Oferiți mentenanță și suport după lansare?",
    answer:
      "Da, absolut. Toate proiectele includ o perioadă de garanție de 30 de zile pentru remedierea oricăror bug-uri. Ulterior, poți opta pentru pachete lunare de mentenanță care includ monitorizare 24/7, actualizări de securitate, backup-uri automate și suport prioritar cu timp de răspuns sub 2 ore.",
    category: "general",
  },
  {
    id: 4,
    question: "Cum decurge comunicarea pe parcursul proiectului?",
    answer:
      "Comunicarea este un pilon central al colaborării noastre. Vei avea acces la un canal dedicat pe Slack/Discord, întâlniri săptămânale de progres și un dashboard live unde poți urmări statusul în timp real. Răspundem în maxim 4 ore în timpul programului de lucru (L-V, 9:00-18:00 EET).",
    category: "general",
  },
  {
    id: 5,
    question: "Păstrați confidențialitatea proiectului și a datelor?",
    answer:
      "Confidențialitatea este garantată. Semnăm un NDA (Acord de Confidențialitate) înainte de a începe orice colaborare. Toate datele sunt stocate criptat pe servere europene (conform GDPR). La finalizare, îți transferăm toate drepturile de proprietate intelectuală asupra codului și designului.",
    category: "general",
  },
  // ── PREȚURI ─────────────────────────────────────────────
  {
    id: 6,
    question: "Cum sunt structurate prețurile serviciilor voastre?",
    answer:
      "Prețurile sunt transparente și fixe per proiect, nu per oră. În secțiunea Servicii găsești prețurile complete pentru fiecare tip de proiect. Oferim și o reducere temporară de 20% pentru clienții noi. Prețul afișat include design, dezvoltare, testare și deploy — fără costuri ascunse.",
    category: "preturi",
  },
  {
    id: 7,
    question: "Aveți prețuri pentru startup-uri sau proiecte mici?",
    answer:
      "Da, înțelegem că bugetele variază. Pentru startup-uri și proiecte mici oferim pachete personalizate și planuri de plată flexibile (50% avans, 50% la finalizare). De asemenea, putem începe cu un MVP (produs minim viabil) la un cost redus, pe care îl scalăm ulterior pe măsură ce afacerea crește.",
    category: "preturi",
  },
  {
    id: 8,
    question: "Ce metode de plată acceptați?",
    answer:
      "Acceptăm transfer bancar, card de credit/debit (prin Stripe), PayPal și SEPA. Pentru clienții din România emitem factură fiscală. Plata se face în două tranșe: 50% la semnarea contractului și 50% la livrarea finală. Pentru proiecte mari putem stabili tranșe intermediare legate de milestone-uri.",
    category: "preturi",
  },
  // ── PROCES ──────────────────────────────────────────────
  {
    id: 9,
    question: "Care sunt etapele unui proiect tipic?",
    answer:
      "Procesul nostru structurat are 5 etape: (1) Discovery — analizăm nevoile și obiectivele tale, (2) Design — creăm wireframe-uri și design high-fidelity în Figma, (3) Development — implementăm soluția cu cele mai noi tehnologii, (4) Testing — testare riguroasă cross-browser și cross-device, (5) Launch — deploy și transfer complet. Fiecare etapă are livrabile clare și aprobare din partea ta.",
    category: "proces",
  },
  {
    id: 10,
    question: "Ce se întâmplă dacă vreau modificări după ce proiectul a început?",
    answer:
      "Modificările minore în timpul dezvoltării sunt incluse și binevenite — vrem să fii 100% mulțumit. Pentru modificări majore care schimbă scopul inițial al proiectului, emitem un Change Request cu estimare separată, pe care îl aprobi înainte de implementare. Această abordare menține proiectul pe drumul cel bun și bugetul sub control.",
    category: "proces",
  },
  {
    id: 11,
    question: "Cum gestionați termenele limită?",
    answer:
      "Planificarea riguroasă este cheia. La începutul proiectului primești un calendar detaliat cu fiecare milestone. Folosim metodologia Agile cu sprint-uri săptămânale și daily stand-ups interne. Dacă intervin întârzieri din partea ta (ex: feedback întârziat), ajustăm calendarul transparent și găsim soluții.",
    category: "proces",
  },
  // ── TEHNIC ──────────────────────────────────────────────
  {
    id: 12,
    question: "Ce tehnologii folosiți pentru dezvoltare?",
    answer:
      "Stack-ul nostru principal include: React/Next.js pentru frontend, Node.js/Python pentru backend, PostgreSQL/MongoDB pentru baze de date, AWS/Vercel pentru hosting. Pentru mobile folosim React Native sau Flutter. Suntem însă flexibili — alegem tehnologia optimă în funcție de cerințele specifice ale proiectului tău.",
    category: "tehnic",
  },
  {
    id: 13,
    question: "Site-ul va fi optimizat pentru Google (SEO)?",
    answer:
      "Da, toate proiectele noastre includ optimizare SEO on-page avansată: meta tag-uri dinamice, structured data (JSON-LD), sitemap.xml, robots.txt, optimizare Core Web Vitals, imagini optimizate și lazy loading. Pentru proiectele care necesită SEO avansat, oferim servicii dedicate de strategie SEO și link building.",
    category: "tehnic",
  },
  {
    id: 14,
    question: "Ce se întâmplă cu securitatea aplicației?",
    answer:
      "Securitatea este o prioritate, nu o opțiune. Implementăm HTTPS by default, CSP headers, protecție CSRF/XSS, rate limiting, input sanitization și autentificare securizată (OAuth2/JWT). Toate dependențele sunt scanate automat pentru vulnerabilități. La cerere, putem efectua penetration testing și audit de securitate complet.",
    category: "tehnic",
  },
  {
    id: 15,
    question: "Pot integra servicii terțe (CRM, plăți, email)?",
    answer:
      "Absolut. Avem experiență vastă cu integrări: Stripe/PayPal pentru plăți, Mailchimp/SendGrid pentru email, Salesforce/HubSpot pentru CRM, Zapier/Make pentru automatizări, Google Analytics/Facebook Pixel pentru tracking și multe altele. Dacă ai nevoie de o integrare specifică, o putem implementa.",
    category: "tehnic",
  },
];

const CATEGORY_CHIPS: CategoryChip[] = [
  { id: "toate", label: "Toate" },
  { id: "general", label: "Generale" },
  { id: "preturi", label: "Prețuri" },
  { id: "proces", label: "Proces" },
  { id: "tehnic", label: "Tehnic" },
];

const SECTION_HEADING = "Întrebări Frecvente";
const SECTION_SUBTITLE =
  "Răspunsuri clare la cele mai comune întrebări despre serviciile, procesul și tehnologiile noastre.";
const SEARCH_PLACEHOLDER = "Caută o întrebare...";
const NO_RESULTS = "Nicio întrebare găsită. Încearcă un alt termen de căutare.";
const NO_RESULTS_ICON = "fa-solid fa-magnifying-glass";
const ACCORDION_OPEN_ICON = "fa-solid fa-chevron-up";
const ACCORDION_CLOSED_ICON = "fa-solid fa-chevron-down";
const SEARCH_ICON = "fa-solid fa-magnifying-glass";
const CLEAR_ICON = "fa-solid fa-xmark";
const CATEGORY_ICON_MAP: Record<string, string> = {
  toate: "fa-solid fa-grid-2",
  general: "fa-solid fa-circle-question",
  preturi: "fa-solid fa-tag",
  proces: "fa-solid fa-diagram-project",
  tehnic: "fa-solid fa-gear",
};
const RESULT_COUNT_TEXT = "întrebări găsite";

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
      delay: 0.15,
      duration: 0.6,
      ease: [0.33, 1, 0.68, 1],
    },
  },
};

const searchVariants = {
  hidden: { opacity: 0, y: 15, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: 0.3,
      duration: 0.55,
      ease: [0.33, 1, 0.68, 1],
    },
  },
};

const chipsVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.4,
      duration: 0.5,
      ease: [0.33, 1, 0.68, 1],
    },
  },
};

const accordionContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.15,
      duration: 0.4,
    },
  },
};

const accordionItemVariants = {
  hidden: {
    opacity: 0,
    y: 24,
    scale: 0.96,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.55,
      ease: [0.34, 1.56, 0.64, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -12,
    scale: 0.94,
    transition: {
      duration: 0.3,
      ease: [0.33, 1, 0.68, 1],
    },
  },
};

const answerVariants = {
  collapsed: {
    height: 0,
    opacity: 0,
    transition: {
      height: { duration: 0.4, ease: [0.33, 1, 0.68, 1] },
      opacity: { duration: 0.25, ease: "easeIn" },
    },
  },
  expanded: {
    height: "auto",
    opacity: 1,
    transition: {
      height: { duration: 0.5, ease: [0.33, 1, 0.68, 1] },
      opacity: { duration: 0.35, delay: 0.1, ease: "easeOut" },
    },
  },
};

// ═══════════════════════════════════════════════════════════════
// FUNCȚII UTILITARE
// ═══════════════════════════════════════════════════════════════

/**
 * Evidențiază textul care se potrivește cu query-ul de căutare,
 * returnând un array de segmente { text, highlight }.
 */
function highlightMatch(text: string, query: string): { text: string; highlight: boolean }[] {
  if (!query.trim()) return [{ text, highlight: false }];

  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  const parts = text.split(regex);

  return parts.map((part) => ({
    text: part,
    highlight: regex.test(part),
  }));
}

// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENTĂ: FAQ ACCORDION ITEM
// ═══════════════════════════════════════════════════════════════

function FAQAccordionItem({
  item,
  isOpen,
  onToggle,
  searchQuery,
}: {
  item: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
  searchQuery: string;
  index?: number;
}) {
  const questionSegments = useMemo(
    () => highlightMatch(item.question, searchQuery),
    [item.question, searchQuery]
  );

  const answerSegments = useMemo(
    () => highlightMatch(item.answer, searchQuery),
    [item.answer, searchQuery]
  );

  return (
    <motion.div
      variants={accordionItemVariants}
      layout
      className="relative group/faq-item"
    >
      {/* ═══════════════════════════════════════════════════════
          CONTAINER PRINCIPAL AL ITEM-ULUI
          ═══════════════════════════════════════════════════ */}
      <div
        className={`
          relative
          rounded-2xl
          transition-all duration-500
          ${
            isOpen
              ? "bg-[rgba(245,158,11,0.06)] border border-[rgba(245,158,11,0.22)]"
              : "glass glass-hover border border-[rgba(255,255,255,0.06)]"
          }
        `}
        style={{
          boxShadow: isOpen
            ? `
              0 0 28px rgba(245, 158, 11, 0.2),
              0 0 64px rgba(245, 158, 11, 0.08),
              0 8px 32px rgba(0, 0, 0, 0.35)
            `
            : "var(--glass-shadow)",
        }}
      >
        {/* ── GLOW AURIU LA DESCHIDERE ─────────────────────── */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 rounded-2xl pointer-events-none z-0"
              aria-hidden="true"
              style={{
                background: `
                  radial-gradient(
                    ellipse 80% 60% at 50% 0%,
                    rgba(245, 158, 11, 0.12) 0%,
                    rgba(245, 158, 11, 0.04) 40%,
                    transparent 70%
                  )
                `,
              }}
            />
          )}
        </AnimatePresence>

        {/* ── INEL GLOW SUBȚIRE ────────────────────────────── */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.45, ease: [0.33, 1, 0.68, 1] }}
              className="absolute -inset-[2px] rounded-2xl pointer-events-none z-[-1]"
              aria-hidden="true"
              style={{
                background: `
                  linear-gradient(
                    135deg,
                    rgba(251, 191, 36, 0.25),
                    rgba(245, 158, 11, 0.1),
                    rgba(251, 191, 36, 0.25)
                  )
                `,
                filter: "blur(6px)",
              }}
            />
          )}
        </AnimatePresence>

        {/* ── HEADER (CLICKABLE) ───────────────────────────── */}
        <button
          type="button"
          onClick={onToggle}
          className="
            relative z-10
            w-full flex items-center gap-4
            px-5 sm:px-7 py-5 sm:py-6
            text-left
            cursor-pointer
            focus-visible:outline-2 focus-visible:outline-purple-500 focus-visible:outline-offset-2
            rounded-2xl
          "
          aria-expanded={isOpen}
          aria-controls={`faq-answer-${item.id}`}
        >
          {/* Iconiță categorie (stânga) */}
          <span
            className={`
              flex-shrink-0 w-10 h-10 sm:w-11 sm:h-11
              flex items-center justify-center
              rounded-xl
              text-sm sm:text-base
              transition-all duration-500
              ${
                isOpen
                  ? "bg-[rgba(245,158,11,0.18)] text-[#fbbf24]"
                  : "bg-[rgba(255,255,255,0.05)] text-[#9e9eb0] group-hover/faq-item:text-[#d0d0dd]"
              }
            `}
            style={{
              boxShadow: isOpen
                ? "0 0 12px rgba(245, 158, 11, 0.25)"
                : "none",
            }}
            aria-hidden="true"
          >
            <i className={CATEGORY_ICON_MAP[item.category] ?? "fa-solid fa-circle-question"} />
          </span>

          {/* Întrebare */}
          <span
            className="flex-1 text-base sm:text-lg font-medium leading-snug"
            style={{
              fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
              color: isOpen ? "rgba(255, 255, 255, 0.95)" : "rgba(255, 255, 255, 0.8)",
            }}
          >
            {questionSegments.map((seg, i) =>
              seg.highlight ? (
                <mark
                  key={i}
                  className="bg-[rgba(245,158,11,0.3)] text-[#fde68a] rounded-sm px-0.5"
                >
                  {seg.text}
                </mark>
              ) : (
                <span key={i}>{seg.text}</span>
              )
            )}
          </span>

          {/* Săgeată expand/collapse */}
          <motion.span
            className={`
              flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9
              flex items-center justify-center
              rounded-full
              text-xs sm:text-sm
              transition-colors duration-500
              ${
                isOpen
                  ? "bg-[rgba(245,158,11,0.2)] text-[#fbbf24]"
                  : "bg-[rgba(255,255,255,0.05)] text-[#9e9eb0] group-hover/faq-item:text-[#d0d0dd]"
              }
            `}
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.35, ease: [0.33, 1, 0.68, 1] }}
            aria-hidden="true"
          >
            <i className={isOpen ? ACCORDION_OPEN_ICON : ACCORDION_CLOSED_ICON} />
          </motion.span>
        </button>

        {/* ── RĂSPUNS (EXPANDABIL) ─────────────────────────── */}
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              id={`faq-answer-${item.id}`}
              variants={answerVariants}
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
              className="relative z-10 overflow-hidden"
              role="region"
              aria-labelledby={`faq-question-${item.id}`}
            >
              <div
                className="px-5 sm:px-7 pb-5 sm:pb-6 pt-1"
                style={{
                  fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
                }}
              >
                {/* Linie separatoare subtilă */}
                <div
                  className="mb-4 h-px w-full"
                  style={{
                    background: `
                      linear-gradient(
                        90deg,
                        transparent 0%,
                        rgba(245, 158, 11, 0.15) 20%,
                        rgba(245, 158, 11, 0.15) 80%,
                        transparent 100%
                      )
                    `,
                  }}
                />

                <p className="text-sm sm:text-base text-[#c5c5d5] leading-relaxed">
                  {answerSegments.map((seg, i) =>
                    seg.highlight ? (
                      <mark
                        key={i}
                        className="bg-[rgba(245,158,11,0.3)] text-[#fde68a] rounded-sm px-0.5"
                      >
                        {seg.text}
                      </mark>
                    ) : (
                      <span key={i}>{seg.text}</span>
                    )
                  )}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTA PRINCIPALĂ: FAQ
// ═══════════════════════════════════════════════════════════════

export default function FAQ() {
  const [openItemId, setOpenItemId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<FAQCategory | "toate">("toate");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { ref: sectionRef, isInView: sectionInView } = useInView({
    threshold: 0.05,
    once: true,
    rootMargin: "0px 0px -60px 0px",
  });

  // ── Filtrare FAQ-uri ──────────────────────────────────────
  const filteredFAQs = useMemo(() => {
    let items = FAQ_DATA;

    // Filtru categorie
    if (activeCategory !== "toate") {
      items = items.filter((item) => item.category === activeCategory);
    }

    // Filtru căutare
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      items = items.filter(
        (item) =>
          item.question.toLowerCase().includes(q) ||
          item.answer.toLowerCase().includes(q)
      );
    }

    return items;
  }, [activeCategory, searchQuery]);

  // ── Handler toggle accordion ──────────────────────────────
  const handleToggle = useCallback((id: number) => {
    setOpenItemId((prev) => (prev === id ? null : id));
  }, []);

  // ── Handler search ────────────────────────────────────────
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
      if (e.target.value.trim()) {
        setOpenItemId(null);
      }
    },
    []
  );

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
    setOpenItemId(null);
    searchInputRef.current?.focus();
  }, []);

  // ── Handler categorie ────────────────────────────────────
  const handleCategoryChange = useCallback((cat: FAQCategory | "toate") => {
    setActiveCategory(cat);
    setOpenItemId(null);
  }, []);

  // ── Număr rezultate ─────────────────────────────────────
  const resultCount = filteredFAQs.length;
  const hasActiveFilters = activeCategory !== "toate" || searchQuery.trim() !== "";

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════
  return (
    <section
      id="faq"
      ref={sectionRef}
      className="
        relative w-full
        py-24 sm:py-32 lg:py-40
        overflow-hidden
        bg-gradient-dark
      "
      aria-label="Întrebări frecvente"
    >
      {/* ═══════════════════════════════════════════════════════
          FUNDAL DECORATIV
          ═══════════════════════════════════════════════════ */}

      {/* Imagine fundal subtilă */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.06]"
        aria-hidden="true"
        style={{
          backgroundImage: "url('/images/faq-glow-bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />

      {/* Auroră decorativă aurie + purple */}
      <div
        className="absolute inset-0 pointer-events-none opacity-35"
        aria-hidden="true"
        style={{
          background: `
            radial-gradient(ellipse 45% 30% at 50% 15%, rgba(245,158,11,0.1) 0%, transparent 65%),
            radial-gradient(ellipse 40% 35% at 25% 75%, rgba(126,34,206,0.06) 0%, transparent 60%),
            radial-gradient(ellipse 35% 30% at 75% 65%, rgba(168,85,247,0.04) 0%, transparent 55%)
          `,
        }}
      />

      {/* Grilă subtilă */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.02]"
        aria-hidden="true"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
        }}
      />

      {/* Noise */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.015]"
        aria-hidden="true"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "200px 200px",
        }}
      />

      {/* ═══════════════════════════════════════════════════════
          CONȚINUT PRINCIPAL
          ═══════════════════════════════════════════════════ */}
      <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* ── HEADING ──────────────────────────────────────── */}
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          animate={sectionInView ? "visible" : "hidden"}
          className="text-center mb-12 sm:mb-16"
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
            <span className="text-gradient-gold">{SECTION_HEADING}</span>
          </motion.h2>

          <motion.p
            variants={subtitleVariants}
            className="
              max-w-xl mx-auto
              text-base sm:text-lg
              text-[#b0b0c0]
              leading-relaxed
            "
            style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}
          >
            {SECTION_SUBTITLE}
          </motion.p>

          {/* Linie decorativă aurie */}
          <motion.div
            variants={headingVariants}
            className="mt-5 mx-auto w-20 h-1 rounded-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-400"
          />
        </motion.div>

        {/* ── SEARCH BAR ───────────────────────────────────── */}
        <motion.div
          variants={searchVariants}
          initial="hidden"
          animate={sectionInView ? "visible" : "hidden"}
          className="mb-6 sm:mb-8"
        >
          <div className="relative">
            {/* Iconiță search */}
            <span
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9e9eb0] text-sm pointer-events-none z-10"
              aria-hidden="true"
            >
              <i className={SEARCH_ICON} />
            </span>

            {/* Input */}
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder={SEARCH_PLACEHOLDER}
              aria-label={SEARCH_PLACEHOLDER}
              className="
                w-full
                pl-11 pr-12
                py-4 sm:py-4.5
                rounded-2xl
                text-base sm:text-lg
                text-white
                placeholder-[#6e6e82]
                outline-none
                transition-all duration-300
              "
              style={{
                fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                boxShadow: searchQuery.trim()
                  ? "0 0 24px rgba(245, 158, 11, 0.12), 0 4px 16px rgba(0, 0, 0, 0.3)"
                  : "0 4px 16px rgba(0, 0, 0, 0.25)",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "rgba(245, 158, 11, 0.4)";
                e.currentTarget.style.boxShadow =
                  "0 0 28px rgba(245, 158, 11, 0.15), 0 4px 20px rgba(0, 0, 0, 0.35)";
              }}
              onBlur={(e) => {
                if (!searchQuery.trim()) {
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
                  e.currentTarget.style.boxShadow = "0 4px 16px rgba(0, 0, 0, 0.25)";
                }
              }}
            />

            {/* Buton clear */}
            <AnimatePresence>
              {searchQuery.trim() && (
                <motion.button
                  type="button"
                  onClick={handleClearSearch}
                  initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.5, rotate: 90 }}
                  transition={{ duration: 0.25, ease: [0.33, 1, 0.68, 1] }}
                  className="
                    absolute right-3 top-1/2 -translate-y-1/2
                    w-8 h-8
                    flex items-center justify-center
                    rounded-full
                    text-[#9e9eb0] hover:text-white
                    transition-colors duration-200
                  "
                  aria-label="Șterge căutarea"
                  style={{
                    background: "rgba(255, 255, 255, 0.06)",
                  }}
                >
                  <i className={`${CLEAR_ICON} text-xs`} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* ── CHIP-URI CATEGORII ────────────────────────────── */}
        <motion.div
          variants={chipsVariants}
          initial="hidden"
          animate={sectionInView ? "visible" : "hidden"}
          className="mb-10 sm:mb-12"
        >
          <div
            className="
              flex flex-wrap justify-center gap-2 sm:gap-2.5
            "
            role="tablist"
            aria-label="Categorii FAQ"
          >
            {CATEGORY_CHIPS.map((chip) => {
              const isActive = activeCategory === chip.id;
              return (
                <button
                  key={chip.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => handleCategoryChange(chip.id)}
                  className={`
                    inline-flex items-center gap-1.5
                    px-4 py-2 sm:px-5 sm:py-2.5
                    rounded-full
                    text-sm font-medium
                    transition-all duration-300 ease-out
                    focus-visible:outline-2 focus-visible:outline-purple-500
                    ${
                      isActive
                        ? "text-white shadow-lg"
                        : "text-[#a0a0b8] hover:text-white/85 border border-white/8 hover:bg-white/5"
                    }
                  `}
                  style={{
                    fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
                    ...(isActive
                      ? {
                          background:
                            "linear-gradient(135deg, rgba(245, 158, 11, 0.7) 0%, rgba(251, 191, 36, 0.85) 50%, rgba(245, 158, 11, 0.7) 100%)",
                          backgroundSize: "200% 100%",
                          boxShadow:
                            "0 4px 18px rgba(245, 158, 11, 0.35), 0 0 24px rgba(251, 191, 36, 0.1)",
                          border: "1px solid rgba(251, 191, 36, 0.3)",
                        }
                      : {}),
                  }}
                >
                  <i
                    className={`${CATEGORY_ICON_MAP[chip.id] ?? "fa-solid fa-circle"} text-xs`}
                    aria-hidden="true"
                  />
                  {chip.label}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* ── CONTOR REZULTATE ──────────────────────────────── */}
        {hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 text-center"
          >
            <span
              className="
                inline-flex items-center gap-2
                px-3.5 py-1.5
                rounded-full
                text-xs
                text-[#a0a0b8]
                border border-white/6
              "
              style={{
                fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace",
                background: "rgba(255, 255, 255, 0.025)",
              }}
            >
              <i className="fa-solid fa-list-check text-[10px]" aria-hidden="true" />
              {resultCount} {RESULT_COUNT_TEXT}
            </span>
          </motion.div>
        )}

        {/* ── ACORDEON ─────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {resultCount > 0 ? (
            <motion.div
              key={`${activeCategory}-${searchQuery}`}
              variants={accordionContainerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -10, transition: { duration: 0.25 } }}
              className="flex flex-col gap-3 sm:gap-4"
            >
              <AnimatePresence>
                {filteredFAQs.map((item, idx) => (
                  <FAQAccordionItem
                    key={item.id}
                    item={item}
                    isOpen={openItemId === item.id}
                    onToggle={() => handleToggle(item.id)}
                    searchQuery={searchQuery}
                    index={idx}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.33, 1, 0.68, 1] }}
              className="
                text-center py-16 sm:py-20
                glass
                rounded-2xl
              "
            >
              <motion.div
                animate={{
                  y: [0, -6, 0],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <i
                  className={`${NO_RESULTS_ICON} text-4xl text-[#6e6e82] mb-5 block`}
                  aria-hidden="true"
                />
              </motion.div>
              <p
                className="text-base sm:text-lg text-[#a0a0b8]"
                style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}
              >
                {NO_RESULTS}
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("toate");
                  setOpenItemId(null);
                }}
                className="
                  mt-4
                  inline-flex items-center gap-2
                  px-5 py-2.5
                  rounded-full
                  text-sm font-medium
                  text-white/90
                  transition-all duration-300
                  hover:scale-105
                "
                style={{
                  fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
                  background: "rgba(245, 158, 11, 0.15)",
                  border: "1px solid rgba(245, 158, 11, 0.25)",
                }}
              >
                <i className="fa-solid fa-rotate-left text-xs" aria-hidden="true" />
                Resetează filtrele
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ═══════════════════════════════════════════════════════
          VIGNETĂ COLTURI DECORATIVE
          ═══════════════════════════════════════════════════ */}
      <div className="absolute inset-0 pointer-events-none z-0" aria-hidden="true">
        {/* Top-right auriu */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-amber-600/6 via-amber-700/2 to-transparent rounded-bl-full" />
        {/* Bottom-left purple */}
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-purple-900/5 via-purple-800/1 to-transparent rounded-tr-full" />
        {/* Bottom-right auriu subtil */}
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-tl from-amber-800/3 via-transparent to-transparent rounded-tl-full" />
      </div>
    </section>
  );
}