import bcrypt from 'bcrypt';
import { upsertSetting, getSetting } from '../database';
import dotenv from 'dotenv';

dotenv.config();

// ── Constante ─────────────────────────────────────────────────────────

const BCRYPT_ROUNDS = 12;

const ADMIN_PASSWORD = '.salataverde123!';

// ── Tipuri pentru setări ─────────────────────────────────────────────

export interface ServiceItem {
  id: string;
  name: string;
  category: 'simple' | 'complex';
  normalPrice: number;
  discountedPrice: number;
  discountPercent: number;
  discountLabel: string;
  contextLabel: string;
  icon: string;
  description: string;
  active: boolean;
}

export interface ProcessStep {
  id: string;
  step: number;
  title: string;
  description: string;
  icon: string;
}

export interface DeliveryTerm {
  id: string;
  title: string;
  daysMin: number;
  daysMax: number;
  unit: 'zile' | 'saptamani';
  description: string;
  icon: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  order: number;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  image: string;
  url: string;
  technologies: string[];
}

export interface NavigationLink {
  label: string;
  href: string;
}

export interface DefaultSettings {
  hero: {
    title: string;
    subtitle: string;
    messages: string[];
    badge: string;
    backgroundVideo: string;
    showPortfolioButton: boolean;
  };
  about: {
    title: string;
    description: string;
    identity: string;
  };
  services: ServiceItem[];
  process: ProcessStep[];
  delivery: DeliveryTerm[];
  faq: FAQItem[];
  portfolio: PortfolioItem[];
  contact: {
    email: string;
    phone: string;
    address: string;
    workingHours: string;
  };
  seo: {
    title: string;
    description: string;
    keywords: string;
    ogTitle: string;
    ogDescription: string;
    ogImage: string;
    twitterCard: string;
    twitterTitle: string;
    twitterDescription: string;
    twitterImage: string;
    siteUrl: string;
    author: string;
    language: string;
  };
  footer: {
    copyright: string;
    facebook: string;
    tiktok: string;
    links: NavigationLink[];
  };
  navigation: NavigationLink[];
}

// ── Setări implicite ─────────────────────────────────────────────────

const defaultSettings: DefaultSettings = {
  hero: {
    title: 'Nexus Dev Studio',
    subtitle: 'Dezvoltare Web si Mobila cu AI',
    messages: [
      'Transforma-ti ideea in realitate',
      'Solutii digitale complete cu Nexus Core Neural',
      'Lansare 2026 - Preturi promotionale',
    ],
    badge: 'Oferta de lansare 2026',
    backgroundVideo: '',
    showPortfolioButton: true,
  },
  about: {
    title: 'Despre Nexus Dev Studio',
    description:
      'Sunt un freelancer full-stack specializat in dezvoltare web si mobila, folosind tehnologii de ultima generatie si inteligenta artificiala (Nexus Core Neural) pentru a livra solutii digitale complete. Fiecare proiect beneficiaza de atentie personalizata si cele mai bune practici din industrie.',
    identity: 'Freelancer Full-Stack',
  },
  services: [
    {
      id: 'svc-001',
      name: 'Portal Complex',
      category: 'complex',
      normalPrice: 2500,
      discountedPrice: 2000,
      discountPercent: 20,
      discountLabel: 'Reducere 20%',
      contextLabel: 'Reducere 20% pana la finalul lui 2026',
      icon: 'fa-solid fa-building-columns',
      description:
        'Portal web complex cu autentificare, dashboard, gestionare utilizatori si rapoarte avansate.',
      active: true,
    },
    {
      id: 'svc-002',
      name: 'Magazin Avansat',
      category: 'complex',
      normalPrice: 4000,
      discountedPrice: 3200,
      discountPercent: 20,
      discountLabel: 'Reducere 20%',
      contextLabel: 'Reducere 20% pana la finalul lui 2026',
      icon: 'fa-solid fa-cart-shopping',
      description:
        'Magazin online avansat cu integrare plati, gestionare stocuri, dashboard vanzari si optimizare SEO.',
      active: true,
    },
    {
      id: 'svc-003',
      name: 'Aplicatie Web Complexa',
      category: 'complex',
      normalPrice: 8000,
      discountedPrice: 6400,
      discountPercent: 20,
      discountLabel: 'Reducere 20%',
      contextLabel: 'Reducere 20% pana la finalul lui 2026',
      icon: 'fa-solid fa-laptop-code',
      description:
        'Aplicatie web complexa cu functionalitati avansate, integrari API multiple si arhitectura scalabila.',
      active: true,
    },
    {
      id: 'svc-004',
      name: 'Aplicatie Mobila',
      category: 'complex',
      normalPrice: 12000,
      discountedPrice: 9600,
      discountPercent: 20,
      discountLabel: 'Reducere 20%',
      contextLabel: 'Reducere 20% pana la finalul lui 2026',
      icon: 'fa-solid fa-mobile-screen',
      description:
        'Aplicatie mobila nativa sau cross-platform completa, de la design la publicare in magazinele de aplicatii.',
      active: true,
    },
    {
      id: 'svc-005',
      name: 'Integrare API',
      category: 'complex',
      normalPrice: 1200,
      discountedPrice: 960,
      discountPercent: 20,
      discountLabel: 'Reducere 20%',
      contextLabel: 'Reducere 20% pana la finalul lui 2026',
      icon: 'fa-solid fa-plug',
      description:
        'Integrare API-uri terte (plati, email, SMS, CRM, social media) in aplicatia ta existenta.',
      active: true,
    },
    {
      id: 'svc-006',
      name: 'Site Basic',
      category: 'simple',
      normalPrice: 450,
      discountedPrice: 270,
      discountPercent: 40,
      discountLabel: 'Reducere 40%',
      contextLabel: 'Reducere 40% pana la finalul lui 2026',
      icon: 'fa-solid fa-globe',
      description:
        'Site de prezentare basic cu pana la 5 pagini, design responsive si optimizare SEO de baza.',
      active: true,
    },
    {
      id: 'svc-007',
      name: 'Site Premium',
      category: 'simple',
      normalPrice: 850,
      discountedPrice: 510,
      discountPercent: 40,
      discountLabel: 'Reducere 40%',
      contextLabel: 'Reducere 40% pana la finalul lui 2026',
      icon: 'fa-solid fa-star',
      description:
        'Site de prezentare premium cu design personalizat, animatii, blog integrat si SEO avansat.',
      active: true,
    },
    {
      id: 'svc-008',
      name: 'Landing Page',
      category: 'simple',
      normalPrice: 350,
      discountedPrice: 210,
      discountPercent: 40,
      discountLabel: 'Reducere 40%',
      contextLabel: 'Reducere 40% pana la finalul lui 2026',
      icon: 'fa-solid fa-rocket',
      description:
        'Landing page optimizata pentru conversii, design imersiv si integrare formulare de contact.',
      active: true,
    },
    {
      id: 'svc-009',
      name: 'Magazin Basic',
      category: 'simple',
      normalPrice: 1200,
      discountedPrice: 720,
      discountPercent: 40,
      discountLabel: 'Reducere 40%',
      contextLabel: 'Reducere 40% pana la finalul lui 2026',
      icon: 'fa-solid fa-store',
      description:
        'Magazin online basic cu pana la 50 de produse, cos de cumparaturi si plata prin transfer bancar.',
      active: true,
    },
    {
      id: 'svc-010',
      name: 'Aplicatie Web Basic',
      category: 'simple',
      normalPrice: 2500,
      discountedPrice: 1500,
      discountPercent: 40,
      discountLabel: 'Reducere 40%',
      contextLabel: 'Reducere 40% pana la finalul lui 2026',
      icon: 'fa-solid fa-code',
      description:
        'Aplicatie web basic cu functionalitati CRUD, autentificare si baza de date integrata.',
      active: true,
    },
    {
      id: 'svc-011',
      name: 'MVP Mobil',
      category: 'simple',
      normalPrice: 4000,
      discountedPrice: 2400,
      discountPercent: 40,
      discountLabel: 'Reducere 40%',
      contextLabel: 'Reducere 40% pana la finalul lui 2026',
      icon: 'fa-solid fa-mobile-button',
      description:
        'MVP (Minimum Viable Product) pentru aplicatia ta mobila, functionalitati esentiale gata de testare pe piata.',
      active: true,
    },
    {
      id: 'svc-012',
      name: 'Audit Tehnic',
      category: 'simple',
      normalPrice: 300,
      discountedPrice: 180,
      discountPercent: 40,
      discountLabel: 'Reducere 40%',
      contextLabel: 'Reducere 40% pana la finalul lui 2026',
      icon: 'fa-solid fa-magnifying-glass',
      description:
        'Audit tehnic complet al site-ului sau aplicatiei tale cu raport detaliat si recomandari de imbunatatire.',
      active: true,
    },
    {
      id: 'svc-013',
      name: 'Consultanta Arhitectura',
      category: 'simple',
      normalPrice: 500,
      discountedPrice: 300,
      discountPercent: 40,
      discountLabel: 'Reducere 40%',
      contextLabel: 'Reducere 40% pana la finalul lui 2026',
      icon: 'fa-solid fa-sitemap',
      description:
        'Consultanta pentru arhitectura aplicatiei tale: alegerea tehnologiilor, structura bazei de date si scalabilitate.',
      active: true,
    },
    {
      id: 'svc-014',
      name: 'Prototip Web',
      category: 'simple',
      normalPrice: 1500,
      discountedPrice: 900,
      discountPercent: 40,
      discountLabel: 'Reducere 40%',
      contextLabel: 'Reducere 40% pana la finalul lui 2026',
      icon: 'fa-solid fa-pen-ruler',
      description:
        'Prototip web interactiv pentru validarea conceptului inaintea dezvoltarii complete.',
      active: true,
    },
    {
      id: 'svc-015',
      name: 'Mentenanta Lunara',
      category: 'simple',
      normalPrice: 100,
      discountedPrice: 60,
      discountPercent: 40,
      discountLabel: 'Reducere 40%',
      contextLabel: 'Reducere 40% pana la finalul lui 2026',
      icon: 'fa-solid fa-wrench',
      description:
        'Mentenanta lunara de baza: actualizari de securitate, backup-uri si suport email.',
      active: true,
    },
    {
      id: 'svc-016',
      name: 'Mentenanta Premium',
      category: 'simple',
      normalPrice: 250,
      discountedPrice: 150,
      discountPercent: 40,
      discountLabel: 'Reducere 40%',
      contextLabel: 'Reducere 40% pana la finalul lui 2026',
      icon: 'fa-solid fa-gears',
      description:
        'Mentenanta premium lunara: actualizari continue, optimizari performanta, suport prioritar si modificari minore.',
      active: true,
    },
    {
      id: 'svc-017',
      name: 'Consultanta Digitala',
      category: 'simple',
      normalPrice: 200,
      discountedPrice: 120,
      discountPercent: 40,
      discountLabel: 'Reducere 40%',
      contextLabel: 'Reducere 40% pana la finalul lui 2026',
      icon: 'fa-solid fa-comments',
      description:
        'Sedinta de consultanta digitala de o ora pentru strategia online a afacerii tale.',
      active: true,
    },
    {
      id: 'svc-018',
      name: 'Optimizare Performanta',
      category: 'simple',
      normalPrice: 500,
      discountedPrice: 300,
      discountPercent: 40,
      discountLabel: 'Reducere 40%',
      contextLabel: 'Reducere 40% pana la finalul lui 2026',
      icon: 'fa-solid fa-gauge-high',
      description:
        'Optimizare completa a performantei site-ului: viteza de incarcare, Core Web Vitals si optimizare server.',
      active: true,
    },
    {
      id: 'svc-019',
      name: 'Audit Securitate',
      category: 'simple',
      normalPrice: 400,
      discountedPrice: 240,
      discountPercent: 40,
      discountLabel: 'Reducere 40%',
      contextLabel: 'Reducere 40% pana la finalul lui 2026',
      icon: 'fa-solid fa-shield-halved',
      description:
        'Audit de securitate complet cu scanare vulnerabilitati, analiza configurarii si raport de remediere.',
      active: true,
    },
    {
      id: 'svc-020',
      name: 'Audit SEO',
      category: 'simple',
      normalPrice: 300,
      discountedPrice: 180,
      discountPercent: 40,
      discountLabel: 'Reducere 40%',
      contextLabel: 'Reducere 40% pana la finalul lui 2026',
      icon: 'fa-solid fa-magnifying-glass-chart',
      description:
        'Audit SEO complet cu analiza on-page, off-page, tehnica si raport cu recomandari prioritizate.',
      active: true,
    },
    {
      id: 'svc-021',
      name: 'Documentatie Tehnica',
      category: 'simple',
      normalPrice: 600,
      discountedPrice: 360,
      discountPercent: 40,
      discountLabel: 'Reducere 40%',
      contextLabel: 'Reducere 40% pana la finalul lui 2026',
      icon: 'fa-solid fa-file-lines',
      description:
        'Documentatie tehnica completa pentru proiectul tau: API docs, manual de utilizare si ghid de dezvoltare.',
      active: true,
    },
  ],
  process: [
    {
      id: 'proc-001',
      step: 1,
      title: 'Contact initial',
      description:
        'Discutam despre proiectul tau prin email, telefon sau WhatsApp. Inteleg nevoile tale si iti ofer o estimare initiala gratuita in cel mult 24 de ore.',
      icon: 'fa-solid fa-envelope',
    },
    {
      id: 'proc-002',
      step: 2,
      title: 'Demo gratuit 72h',
      description:
        'In maxim 72 de ore iti livrez un demo functional gratuit al solutiei propuse. Poti vedea exact cum va arata si functiona proiectul final inainte de angajament.',
      icon: 'fa-solid fa-laptop',
    },
    {
      id: 'proc-003',
      step: 3,
      title: '50% avans si Dezvoltare',
      description:
        'Dupa aprobarea demo-ului, achiti 50% avans si incep dezvoltarea completa. Vei primi actualizari constante pe parcursul proiectului.',
      icon: 'fa-solid fa-code',
    },
    {
      id: 'proc-004',
      step: 4,
      title: 'Livrare si Plata restului',
      description:
        'La finalizare, testezi produsul complet. Dupa aprobarea ta si plata diferentei de 50%, livrez codul sursa si ofer suport post-lansare gratuit 30 de zile.',
      icon: 'fa-solid fa-rocket',
    },
  ],
  delivery: [
    {
      id: 'del-001',
      title: 'Simplu',
      daysMin: 3,
      daysMax: 5,
      unit: 'zile',
      description:
        'Site-uri de prezentare, landing page-uri si proiecte basic sunt livrate in 3-5 zile lucratoare.',
      icon: 'fa-solid fa-bolt',
    },
    {
      id: 'del-002',
      title: 'Standard',
      daysMin: 7,
      daysMax: 14,
      unit: 'zile',
      description:
        'Aplicatii web, magazine online si proiecte de complexitate medie sunt livrate in 7-14 zile lucratoare.',
      icon: 'fa-solid fa-clock',
    },
    {
      id: 'del-003',
      title: 'Complex',
      daysMin: 4,
      daysMax: 8,
      unit: 'saptamani',
      description:
        'Portaluri complexe, aplicatii mobile si proiecte enterprise sunt livrate in 4-8 saptamani.',
      icon: 'fa-solid fa-gem',
    },
  ],
  faq: [
    {
      id: 'faq-001',
      question: 'Ce tehnologii folosesti pentru dezvoltare?',
      answer:
        'Folosesc tehnologii moderne: React, Next.js, Node.js, TypeScript, SQLite/PostgreSQL pentru backend, si React Native/Flutter pentru aplicatii mobile. Integrez si capabilitati AI prin Nexus Core Neural pentru solutii inteligente.',
      order: 1,
    },
    {
      id: 'faq-002',
      question: 'Cat dureaza un proiect tipic?',
      answer:
        'Depinde de complexitate. Un site de prezentare dureaza 3-5 zile, o aplicatie web 7-14 zile, iar un portal complex sau o aplicatie mobila 4-8 saptamani. Pentru fiecare proiect ofer un termen exact dupa consultarea initiala.',
      order: 2,
    },
    {
      id: 'faq-003',
      question: 'Oferi suport dupa finalizarea proiectului?',
      answer:
        'Da, ofer 30 de zile de suport gratuit post-lansare pentru toate proiectele. Dupa aceasta perioada, poti opta pentru mentenanta lunara (60 EUR/luna basic sau 150 EUR/luna premium).',
      order: 3,
    },
    {
      id: 'faq-004',
      question: 'Cum functioneaza demo-ul gratuit de 72h?',
      answer:
        'Dupa ce discutam despre proiect, iti creez un prototip functional in maxim 72 de ore. Este complet gratuit si fara niciun angajament. Poti vedea si testa solutia inainte de a decide.',
      order: 4,
    },
    {
      id: 'faq-005',
      question: 'Care este modalitatea de plata?',
      answer:
        'Plata se face in 2 transe: 50% avans la inceperea proiectului si 50% la finalizare. Accept plata prin transfer bancar. Toate preturile sunt in EUR.',
      order: 5,
    },
    {
      id: 'faq-006',
      question: 'Pastrez drepturile asupra codului sursa?',
      answer:
        'Absolut. La finalizarea proiectului si plata integrala, primesti toate drepturile asupra codului sursa, care iti este livrat complet. Tu esti proprietarul deplin al solutiei.',
      order: 6,
    },
    {
      id: 'faq-007',
      question: 'Lucrezi si cu clienti din afara Romaniei?',
      answer:
        'Da, lucrez cu clienti din toata lumea. Comunicarea se poate face in romana sau engleza, iar colaborarea la distanta este complet sustinuta prin apeluri video si actualizari online constante.',
      order: 7,
    },
    {
      id: 'faq-008',
      question: 'Ce este Nexus Core Neural?',
      answer:
        'Nexus Core Neural este sistemul meu proprietar de inteligenta artificiala care ma ajuta sa optimizez fluxurile de dezvoltare, sa generez cod mai curat si sa ofer solutii mai inteligente pentru proiectele clientilor mei. Este un asistent AI antrenat special pentru dezvoltare software.',
      order: 8,
    },
  ],
  portfolio: [
    {
      id: 'port-001',
      title: 'Platforma E-learning',
      description:
        'Platforma educationala completa cu cursuri video, quiz-uri interactive, sistem de certificare si dashboard pentru profesori si studenti.',
      image: '',
      url: '',
      technologies: ['React', 'Node.js', 'PostgreSQL', 'AWS S3'],
    },
    {
      id: 'port-002',
      title: 'Aplicatie de Booking',
      description:
        'Sistem de rezervari online pentru o clinica medicala cu gestionare programari, notificari SMS/email si integrare Google Calendar.',
      image: '',
      url: '',
      technologies: ['Next.js', 'Express', 'SQLite', 'Twilio'],
    },
    {
      id: 'port-003',
      title: 'Magazin Online Artizanat',
      description:
        'Magazin online pentru produse artizanale cu sistem de plati integrat, gestionare stocuri, discount-uri si integrare curier.',
      image: '',
      url: '',
      technologies: ['Next.js', 'Node.js', 'Stripe', 'MongoDB'],
    },
  ],
  contact: {
    email: 'contact@nexusdevstudio.ro',
    phone: '0765611662',
    address: 'Romania',
    workingHours: 'Luni - Vineri: 09:00 - 18:00',
  },
  seo: {
    title: 'Nexus Dev Studio | Dezvoltare Web si Mobila cu AI',
    description:
      'Freelancer Full-Stack specializat in dezvoltare web si mobila. Solutii digitale complete cu AI (Nexus Core Neural). Lansare 2026 cu preturi promotionale.',
    keywords:
      'dezvoltare web, freelancer, aplicatii mobile, next.js, react, node.js, typescript, nexus dev studio, nexus core neural, AI, inteligenta artificiala, magazin online, site prezentare',
    ogTitle: 'Nexus Dev Studio | Dezvoltare Web si Mobila',
    ogDescription:
      'Freelancer Full-Stack. Solutii digitale complete cu AI. Lansare 2026.',
    ogImage: '/images/og-image.jpg',
    twitterCard: 'summary_large_image',
    twitterTitle: 'Nexus Dev Studio | Dezvoltare Web si Mobila',
    twitterDescription:
      'Freelancer Full-Stack. Solutii digitale complete cu AI. Lansare 2026.',
    twitterImage: '/images/og-image.jpg',
    siteUrl: 'https://nexusdevstudio.ro',
    author: 'Nexus Dev Studio',
    language: 'ro',
  },
  footer: {
    copyright: '2026 NexusDevStudio.ro',
    facebook: '#',
    tiktok: '#',
    links: [
      { label: 'Servicii', href: '#services' },
      { label: 'Cum lucram', href: '#process' },
      { label: 'FAQ', href: '#faq' },
      { label: 'Portofoliu', href: '#portfolio' },
      { label: 'Contact', href: '#contact' },
    ],
  },
  navigation: [
    { label: 'Servicii', href: '#services' },
    { label: 'Cum lucram', href: '#process' },
    { label: 'FAQ', href: '#faq' },
    { label: 'Portofoliu', href: '#portfolio' },
    { label: 'Contact', href: '#contact' },
  ],
};

// ── Funcția principală de seed ───────────────────────────────────────

/**
 * Inserează sau actualizează setările implicite în baza de date.
 *
 * Setările sunt stocate într-o singură cheie `settings` care conține
 * întregul obiect JSON. Aceasta este abordarea principală pentru
 * frontend-ul care încarcă tot conținutul din `GET /api/settings`.
 *
 * În plus, se generează și afișează hash-ul bcrypt al parolei de admin
 * pentru a fi salvat în variabila de mediu `ADMIN_PASSWORD_HASH`.
 */
export function seedDefaultSettings(): void {
  console.log('[seed] Inserare setari implicite...');

  // Inserează setările complete
  upsertSetting('settings', defaultSettings);

  console.log('[seed] Setarile implicite au fost inserate cu succes.');
  console.log(`[seed] Servicii: ${defaultSettings.services.length}`);
  console.log(`[seed] Pasi proces: ${defaultSettings.process.length}`);
  console.log(`[seed] Intrebari FAQ: ${defaultSettings.faq.length}`);
  console.log(`[seed] Elemente portofoliu: ${defaultSettings.portfolio.length}`);
  console.log(`[seed] Termene de livrare: ${defaultSettings.delivery.length}`);
}

/**
 * Generează și afișează hash-ul parolei de admin folosind bcrypt cu 12 runde.
 *
 * Hash-ul rezultat trebuie salvat în variabila de mediu `ADMIN_PASSWORD_HASH`
 * din fișierul `.env`. Această funcție este utilă pentru:
 *  - Generarea inițială a hash-ului
 *  - Schimbarea parolei de admin
 *  - Verificarea manuală a parolei
 *
 * @returns Promise ce se rezolvă cu hash-ul generat
 */
export async function generateAdminHash(): Promise<string> {
  console.log('[seed] Generare hash parola admin (bcrypt, 12 rounds)...');

  const hash = await bcrypt.hash(ADMIN_PASSWORD, BCRYPT_ROUNDS);

  console.log('[seed] Hash generat cu succes.');
  console.log(`[seed] Parola: ${ADMIN_PASSWORD}`);
  console.log(`[seed] Hash:   ${hash}`);
  console.log('[seed] Salveaza acest hash in .env la ADMIN_PASSWORD_HASH');

  return hash;
}

/**
 * Verifică dacă setările implicite sunt deja prezente în baza de date.
 *
 * @returns `true` dacă setările există deja, `false` altfel
 */
export function isSeeded(): boolean {
  const existing = getSetting('settings');
  if (!existing) {
    return false;
  }
  try {
    const parsed = JSON.parse(existing.value);
    return (
      typeof parsed === 'object' &&
      parsed !== null &&
      Array.isArray(parsed.services) &&
      parsed.services.length > 0
    );
  } catch {
    return false;
  }
}

/**
 * Rulează seed-ul complet: inserează setările implicite și generează hash-ul
 * parolei de admin.
 *
 * Aceasta este funcția principală care trebuie apelată la prima pornire
 * a serverului sau când se dorește resetarea setărilor.
 *
 * @param force - Dacă `true`, forțează reinserarea setărilor chiar dacă există deja
 */
export async function runSeed(force = false): Promise<void> {
  if (!force && isSeeded()) {
    console.log('[seed] Setarile exista deja in baza de date. Skip.');
    console.log('[seed] Foloseste runSeed(true) pentru a forța reinserarea.');
    return;
  }

  console.log('[seed] ========================================');
  console.log('[seed]  Nexus Dev Studio - Seed Initializare');
  console.log('[seed] ========================================');

  // Generează hash-ul parolei de admin
  await generateAdminHash();

  // Inserează setările implicite
  seedDefaultSettings();

  console.log('[seed] ========================================');
  console.log('[seed]  Seed complet!');
  console.log('[seed] ========================================');
}

// ── Auto-seed dacă fișierul este rulat direct ────────────────────────

// Detectează dacă fișierul este rulat direct (node dist/utils/seed.js)
// sau importat ca modul. Dacă este rulat direct, execută seed-ul automat.
if (require.main === module) {
  runSeed()
    .then(() => {
      console.log('[seed] Initializare completa.');
      process.exit(0);
    })
    .catch((error: unknown) => {
      console.error('[seed] Eroare la initializare:', error);
      process.exit(1);
    });
}

export default {
  runSeed,
  seedDefaultSettings,
  generateAdminHash,
  isSeeded,
  defaultSettings,
};