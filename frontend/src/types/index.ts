// ═══════════════════════════════════════════════════════════════
// TIPURI CENTRALIZATE — Nexus Dev Studio
//
// Acest fișier conține toate definițiile de tipuri TypeScript
// folosite în proiect: setări site, servicii, proces, FAQ,
// portofoliu, mesaje contact, admin și API.
//
// Convenții:
//  • Interface pentru obiecte (forme de date)
//  • Type pentru uniuni, primitive, alias-uri
//  • Sufixul "Payload" pentru datele trimise la API (fără id,
//    createdAt etc.)
//  • Sufixul "Item" / "Project" / "Message" pentru entități
//    complete (primite de la API)
// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
// 1. SETĂRI SITE (PUBLIC)
// ═══════════════════════════════════════════════════════════════

/** Setări SEO complete */
export interface SEOSettings {
  /** Titlul paginii (title tag) */
  title?: string;
  /** Meta description */
  description?: string;
  /** Cuvinte cheie, separate prin virgulă */
  keywords?: string;
  /** Titlu Open Graph */
  ogTitle?: string;
  /** Descriere Open Graph */
  ogDescription?: string;
  /** URL imagine Open Graph */
  ogImage?: string;
  /** Tip Twitter Card */
  twitterCard?: string;
  /** Titlu Twitter */
  twitterTitle?: string;
  /** Descriere Twitter */
  twitterDescription?: string;
  /** URL imagine Twitter */
  twitterImage?: string;
  /** URL canonic al site-ului */
  siteUrl?: string;
  /** Autor */
  author?: string;
  /** Cod limbă (ex: "ro", "en") */
  language?: string;
}

/** Setări secțiune Hero (public) */
export interface HeroSettings {
  /** Titlu principal */
  title?: string;
  /** Subtitlu */
  subtitle?: string;
}

/** Setări secțiune Contact (public) */
export interface ContactSettings {
  /** Email de contact */
  email?: string;
  /** Telefon */
  phone?: string;
  /** Adresă fizică */
  address?: string;
}

/** Setări Footer (public) */
export interface FooterSettings {
  /** Text copyright */
  copyright?: string;
  /** URL Facebook */
  facebook?: string;
  /** URL TikTok */
  tiktok?: string;
}

/**
 * Setări complete ale aplicației (structură publică, nested).
 * Folosit de layout.tsx și page.tsx pentru randarea frontend-ului public.
 */
export interface AppSettings {
  /** Setări SEO */
  seo?: SEOSettings;
  /** Setări Hero */
  hero?: HeroSettings;
  /** Setări Contact */
  contact?: ContactSettings;
  /** Setări Footer */
  footer?: FooterSettings;
}

// ═══════════════════════════════════════════════════════════════
// 2. SETĂRI SITE (ADMIN — STRUCTURĂ FLAT)
// ═══════════════════════════════════════════════════════════════

/** Link din footer (dinamic, gestionat din admin) */
export interface FooterLink {
  /** Textul afișat */
  label: string;
  /** URL-ul link-ului */
  href: string;
}

/**
 * Setări complete ale site-ului (structură flat, pentru admin).
 * Folosit de dashboard-ul admin și API-ul PUT /api/settings.
 */
export interface SiteSettings {
  // ── Hero & General ──────────────────────────────────────
  heroTitle: string;
  heroSubtitle: string;
  heroBadge: string;
  heroVideoUrl: string;
  heroMorphingMessages: string[];
  heroShowPortfolioButton: boolean;

  // ── Despre ──────────────────────────────────────────────
  aboutTitle: string;
  aboutDescription: string;
  aboutIdentity: string;

  // ── Contact ─────────────────────────────────────────────
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  contactWorkingHours: string;

  // ── SEO ─────────────────────────────────────────────────
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
  seoUrl: string;
  seoOgTitle: string;
  seoOgDescription: string;
  seoOgImage: string;
  seoTwitterCard: string;

  // ── Footer ──────────────────────────────────────────────
  footerCopyright: string;
  footerFacebookUrl: string;
  footerTiktokUrl: string;
  footerLinks: FooterLink[];
}

// ═══════════════════════════════════════════════════════════════
// 3. SERVICII
// ═══════════════════════════════════════════════════════════════

/** Categoriile de servicii disponibile */
export type ServiceCategory =
  | "web"
  | "mobile"
  | "design"
  | "marketing"
  | "consulting";

/**
 * Entitate completă Serviciu (primite de la API).
 * Conține toate câmpurile, inclusiv id și metadate.
 */
export interface Service {
  /** Identificator unic */
  id: string;
  /** Iconiță Font Awesome (ex: "fa-solid fa-code") */
  icon: string;
  /** Titlu serviciu */
  title: string;
  /** Descriere */
  description: string;
  /** Preț original (fără reducere) */
  originalPrice: number;
  /** Preț redus */
  reducedPrice: number;
  /** Procent discount calculat automat */
  discountPercent: number;
  /** Categorie */
  category: ServiceCategory;
  /** Marcaj "Popular" */
  popular: boolean;
  /** Data creării (ISO 8601) */
  createdAt?: string;
  /** Data ultimei actualizări (ISO 8601) */
  updatedAt?: string;
}

/**
 * Payload pentru crearea/actualizarea unui serviciu.
 * Fără id, createdAt, updatedAt — acestea sunt gestionate de backend.
 */
export interface ServicePayload {
  icon: string;
  title: string;
  description: string;
  originalPrice: number;
  reducedPrice: number;
  discountPercent: number;
  category: ServiceCategory;
  popular: boolean;
}

// ═══════════════════════════════════════════════════════════════
// 4. PROCES (CUM LUCRĂM)
// ═══════════════════════════════════════════════════════════════

/**
 * Entitate completă Pas de Proces (primite de la API).
 */
export interface ProcessStep {
  /** Identificator unic */
  id: string;
  /** Etichetă scurtă (ex: "Pasul 1") */
  label: string;
  /** Titlu pas */
  title: string;
  /** Descriere detaliată */
  description: string;
  /** Iconiță Font Awesome */
  icon: string;
  /** Gradient CSS pentru elementele decorative */
  gradient: string;
  /** Listă de puncte cheie (highlights) */
  highlights: string[];
  /** Ordine de sortare */
  order: number;
  /** Data creării (ISO 8601) */
  createdAt?: string;
  /** Data ultimei actualizări (ISO 8601) */
  updatedAt?: string;
}

/**
 * Payload pentru crearea/actualizarea unui pas de proces.
 */
export interface ProcessStepPayload {
  label: string;
  title: string;
  description: string;
  icon: string;
  gradient: string;
  highlights: string[];
  order: number;
}

// ═══════════════════════════════════════════════════════════════
// 5. FAQ (ÎNTREBĂRI FRECVENTE)
// ═══════════════════════════════════════════════════════════════

/** Categoriile de FAQ */
export type FaqCategory = "Generale" | "Preturi" | "Proces" | "Tehnic";

/**
 * Entitate completă FAQ (primite de la API).
 */
export interface FaqItem {
  /** Identificator unic */
  id: string;
  /** Întrebarea */
  question: string;
  /** Răspunsul */
  answer: string;
  /** Categorie */
  category: FaqCategory;
  /** Ordine de sortare */
  order: number;
  /** Data creării (ISO 8601) */
  createdAt?: string;
  /** Data ultimei actualizări (ISO 8601) */
  updatedAt?: string;
}

/**
 * Payload pentru crearea/actualizarea unui item FAQ.
 */
export interface FaqItemPayload {
  question: string;
  answer: string;
  category: FaqCategory;
  order: number;
}

// ═══════════════════════════════════════════════════════════════
// 6. PORTOFOLIU
// ═══════════════════════════════════════════════════════════════

/**
 * Entitate completă Proiect Portofoliu (primite de la API).
 */
export interface PortfolioItem {
  /** Identificator unic */
  id: string;
  /** Titlu proiect */
  title: string;
  /** Categorie (ex: "Web Development", "Mobile App") */
  category: string;
  /** Descriere */
  description: string;
  /** URL imagine */
  imageUrl: string;
  /** Text alternativ imagine */
  imageAlt: string;
  /** URL demo live */
  demoUrl: string;
  /** URL repository GitHub */
  githubUrl: string;
  /** Tag-uri tehnologii */
  techTags: string[];
  /** Marcaj "Featured" (proiect evidențiat) */
  featured: boolean;
  /** Data creării (ISO 8601) */
  createdAt?: string;
  /** Data ultimei actualizări (ISO 8601) */
  updatedAt?: string;
}

/**
 * Payload pentru crearea/actualizarea unui proiect în portofoliu.
 */
export interface PortfolioItemPayload {
  title: string;
  category: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  demoUrl: string;
  githubUrl: string;
  techTags: string[];
  featured: boolean;
}

// ═══════════════════════════════════════════════════════════════
// 7. MESAJE CONTACT
// ═══════════════════════════════════════════════════════════════

/**
 * Entitate completă Mesaj de Contact (primite de la API).
 */
export interface ContactMessage {
  /** Identificator unic */
  id: string;
  /** Nume expeditor */
  name: string;
  /** Email expeditor */
  email: string;
  /** Telefon (opțional) */
  phone: string | null;
  /** Conținut mesaj */
  message: string;
  /** Status citit */
  read: boolean;
  /** Data trimiterii (ISO 8601) */
  createdAt: string;
  /** Data ultimei actualizări (ISO 8601) */
  updatedAt?: string;
}

/**
 * Payload pentru trimiterea unui mesaj de contact (public).
 */
export interface ContactMessagePayload {
  /** Nume expeditor */
  name: string;
  /** Email expeditor */
  email: string;
  /** Telefon (opțional) */
  phone?: string | null;
  /** Conținut mesaj */
  message: string;
}

// ═══════════════════════════════════════════════════════════════
// 8. ADMIN
// ═══════════════════════════════════════════════════════════════

/** Utilizator admin */
export interface AdminUser {
  /** Identificator unic */
  id: string;
  /** Email */
  email: string;
  /** Nume */
  name: string;
  /** Rol */
  role: string;
}

/** Payload autentificare admin */
export interface AdminLoginPayload {
  email: string;
  password: string;
}

/** Răspuns autentificare admin */
export interface AdminLoginResponse {
  /** Token JWT */
  token: string;
  /** Date admin */
  admin: AdminUser;
}

// ═══════════════════════════════════════════════════════════════
// 9. API — TIPURI GENERICE
// ═══════════════════════════════════════════════════════════════

/**
 * Răspuns unificat de la server.
 * Toate endpoint-urile returnează această structură.
 */
export interface ApiResponse<T> {
  /** Datele răspunsului (null la eroare) */
  data: T | null;
  /** Mesaj de eroare (null la succes) */
  error: string | null;
  /** Status HTTP */
  status: number;
  /** true dacă răspunsul e 2xx */
  ok: boolean;
}

/**
 * Opțiuni extinse pentru fetch.
 */
export interface FetchOptions extends Omit<RequestInit, "body"> {
  /** Body-ul cererii */
  body?: BodyInit | Record<string, unknown> | null;
  /** Timeout în ms (default: 15000) */
  timeout?: number;
  /** Număr maxim de reîncercări (default: 2) */
  retries?: number;
  /** Dacă true, adaugă header Authorization cu JWT din cookie */
  auth?: boolean;
}

/**
 * Eroare structurată de API.
 */
export class ApiError extends Error {
  /** Status HTTP */
  public status: number;
  /** Cod eroare */
  public code: string;
  /** Detalii adiționale */
  public details: unknown;

  constructor(
    message: string,
    status: number = 500,
    code: string = "UNKNOWN_ERROR",
    details: unknown = null
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  /** Reprezentare umană */
  toString(): string {
    return `[ApiError ${this.status} ${this.code}] ${this.message}`;
  }
}

/** Metadate pentru debugging apeluri API */
export interface FetchMeta {
  /** URL complet */
  url: string;
  /** Metoda HTTP */
  method: string;
  /** Status HTTP */
  status: number;
  /** Durată în ms */
  durationMs: number;
  /** Număr retry-uri folosite */
  retriesUsed: number;
  /** Timestamp ISO 8601 */
  timestamp: string;
}

// ═══════════════════════════════════════════════════════════════
// 10. HEALTH CHECK
// ═══════════════════════════════════════════════════════════════

/** Răspuns health check server */
export interface HealthCheckResponse {
  status: string;
  timestamp: string;
  uptime: number;
  version: string;
}

// ═══════════════════════════════════════════════════════════════
// 11. TIPURI AUXILIARE PENTRU COMPONENTE
// ═══════════════════════════════════════════════════════════════

/**
 * Mesaj morphing pentru Hero.
 * Folosit de componenta Hero pentru textul animat.
 */
export interface MorphMessage {
  /** Identificator unic */
  id: number;
  /** Text afișat */
  text: string;
  /** Gradient CSS aplicat textului */
  gradient: string;
}

/**
 * Categorie FAQ (frontend — pentru filtrare).
 * Diferă de FaqCategory (backend) prin adăugarea "toate".
 */
export type FaqFilterCategory = "toate" | "general" | "preturi" | "proces" | "tehnic";

/**
 * Chip de categorie pentru FAQ (frontend).
 */
export interface FaqCategoryChip {
  /** Identificator categorie */
  id: FaqFilterCategory;
  /** Etichetă afișată */
  label: string;
}

/**
 * Erori de validare pentru formulare.
 */
export interface ValidationErrors {
  /** Eroare email (null = valid) */
  email: string | null;
  /** Eroare parolă (null = valid) */
  password: string | null;
}

/**
 * Câmpuri atinse (dirty) într-un formular.
 */
export interface TouchedFields {
  /** Email a fost atins */
  email: boolean;
  /** Parolă a fost atinsă */
  password: boolean;
}

// ═══════════════════════════════════════════════════════════════
// 12. RE-EXPORTURI PENTRU COMPATIBILITATE
// ═══════════════════════════════════════════════════════════════

/**
 * Alias pentru Service (compatibilitate cu denumirea ServiceItem
 * folosită în api.ts și dashboard).
 */
export type ServiceItem = Service;

/**
 * Alias pentru PortfolioItem (compatibilitate cu denumirea
 * PortfolioProject folosită în api.ts și dashboard).
 */
export type PortfolioProject = PortfolioItem;

/**
 * Alias pentru PortfolioItemPayload.
 */
export type PortfolioProjectPayload = PortfolioItemPayload;

// ═══════════════════════════════════════════════════════════════
// 13. TERMENE DE LIVRARE (DELIVERY TERMS)
// ═══════════════════════════════════════════════════════════════

/** Accentul vizual al unui card de termen */
export type TermAccent = "purple" | "gold" | "mixed";

/**
 * Entitate Termen de Livrare.
 * Folosit în secțiunea DeliveryTerms (counter-e animate, progress bar).
 */
export interface DeliveryTermItem {
  /** Identificator unic */
  id: number;
  /** Iconiță Font Awesome */
  icon: string;
  /** Titlu termen */
  title: string;
  /** Descriere */
  description: string;
  /** Valoarea țintă pentru counter-ul animat */
  counterTarget: number;
  /** Sufixul counter-ului (ex: "zile", "revizii", "+") */
  counterSuffix: string;
  /** Procentul țintă pentru progress bar-ul circular (0-100) */
  progressPercent: number;
  /** Accent color pentru card */
  accent: TermAccent;
  /** Etichetă plasată sub counter */
  counterLabel: string;
}

// ═══════════════════════════════════════════════════════════════
// 14. TIPURI FILTRARE (GENERICE)
// ═══════════════════════════════════════════════════════════════

/**
 * Tab / chip de filtrare generic.
 * Folosit de secțiunile Services, Portfolio, FAQ pentru
 * filtrarea după categorie.
 *
 * @template T - Tipul identificatorului categoriei (string literal union)
 */
export interface FilterTab<T extends string = string> {
  /** Identificator unic al filtrului */
  id: T;
  /** Etichetă afișată */
  label: string;
  /** Iconiță Font Awesome (opțional) */
  icon?: string;
}

// ═══════════════════════════════════════════════════════════════
// 15. PORTOFOLIU — TIPURI EXTINSE
// ═══════════════════════════════════════════════════════════════

/** Categoriile de proiecte din portofoliu (frontend) */
export type ProjectCategory =
  | "web"
  | "mobile"
  | "ecommerce"
  | "design"
  | "dashboard";

/**
 * Entitate proiect portofoliu (frontend, hardcodat).
 * Diferă de PortfolioItem (API) prin id numeric și câmpuri
 * specifice UI-ului (tags, demoUrl opțional, featured).
 */
export interface ProjectItem {
  /** Identificator unic (numeric, local) */
  id: number;
  /** Titlu proiect */
  title: string;
  /** Descriere */
  description: string;
  /** Categorie proiect */
  category: ProjectCategory;
  /** Cale imagine */
  image: string;
  /** Text alternativ imagine */
  imageAlt: string;
  /** Tag-uri tehnologii */
  tags: string[];
  /** URL demo live (opțional) */
  demoUrl?: string;
  /** URL repository GitHub (opțional) */
  githubUrl?: string;
  /** Marcaj "Featured" */
  featured?: boolean;
}

/**
 * Culorile asociate fiecărei categorii de proiect (badge + glow).
 */
export interface ProjectCategoryColors {
  /** Background badge */
  bg: string;
  /** Culoare text */
  text: string;
  /** Culoare glow */
  glow: string;
}

/** Mapare categorie → culori */
export type ProjectCategoryColorMap = Record<ProjectCategory, ProjectCategoryColors>;

// ═══════════════════════════════════════════════════════════════
// 16. TIPURI FORMULAR CONTACT
// ═══════════════════════════════════════════════════════════════

/** Datele formularului de contact */
export interface ContactFormData {
  /** Nume complet */
  name: string;
  /** Adresă email */
  email: string;
  /** Telefon (opțional) */
  phone: string;
  /** Conținut mesaj */
  message: string;
  /** Acord termeni și condiții */
  terms: boolean;
}

/** Erori de validare per câmp */
export interface ContactFormErrors {
  /** Eroare nume */
  name?: string;
  /** Eroare email */
  email?: string;
  /** Eroare telefon */
  phone?: string;
  /** Eroare mesaj */
  message?: string;
  /** Eroare acord termeni */
  terms?: string;
}

/** Statusul trimiterii formularului de contact */
export type SubmitStatus = "idle" | "submitting" | "success" | "error";

// ═══════════════════════════════════════════════════════════════
// 17. TIPURI NAVIGARE
// ═══════════════════════════════════════════════════════════════

/** Link din navbar */
export interface NavLink {
  /** Etichetă afișată */
  label: string;
  /** URL / hash anchor */
  href: string;
}

/** Link rapid din footer */
export interface QuickLink {
  /** Etichetă afișată */
  label: string;
  /** URL / hash anchor */
  href: string;
}

/** Link rețea socială */
export interface SocialLink {
  /** Nume rețea */
  label: string;
  /** URL profil */
  href: string;
  /** Iconiță Font Awesome */
  icon: string;
  /** Text accesibil pentru screen readere */
  ariaLabel: string;
}

// ═══════════════════════════════════════════════════════════════
// 18. TIPURI AUXILIARE SUPLIMENTARE
// ═══════════════════════════════════════════════════════════════

/**
 * Props pentru componenta Hero.
 */
export interface HeroProps {
  /** Activează / dezactivează videoclipul de fundal */
  video?: boolean;
  /** Poster static pentru video (fallback) */
  poster?: string;
  /** Cale către logo-ul pentru Hero (fundal închis) */
  logo?: string;
  /** Alt text pentru logo */
  logoAlt?: string;
}

/**
 * Props pentru componenta Process.
 */
export interface ProcessProps {
  /** Imagine de fundal pentru secțiune */
  backgroundImage?: string;
}

/**
 * Tip pentru o pereche segment evidențiat / normal
 * (folosit la highlight în căutare).
 */
export interface HighlightSegment {
  /** Textul segmentului */
  text: string;
  /** true dacă segmentul trebuie evidențiat */
  highlight: boolean;
}

// ═══════════════════════════════════════════════════════════════
// NOTE DE MIGRARE
//
// 1. api.ts folosește ServiceItem și PortfolioProject.
//    Acestea sunt alias-uri păstrate pentru compatibilitate.
//    Pe viitor se recomandă migrarea la Service și PortfolioItem.
//
// 2. layout.tsx definește local AppSettings și SEOSettings.
//    Acestea sunt acum exportate centralizat de aici.
//
// 3. page.tsx importă AppSettings din @/lib/api, dar acesta
//    nu era exportat acolo. Importul corect este din acest fișier
//    sau din @/lib/api după ce acesta re-exportă din types.
//
// 4. Componentele (Hero, FAQ, Process) au propriile interfețe
//    locale pentru date hardcodate. La migrarea către date
//    dinamice din API, se vor folosi tipurile de aici.
//
// 5. Secțiunile 13-18 adaugă tipuri pentru componentele care
//    încă folosesc date hardcodate (DeliveryTerms, Portfolio,
//    Contact, Navbar, Footer). La migrarea la API, o parte din
//    aceste tipuri vor fi înlocuite cu cele din secțiunile 3-8.
// ═══════════════════════════════════════════════════════════════