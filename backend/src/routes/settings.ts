import { Router, Request, Response } from 'express';
import { getAllSettings, getSetting, upsertSetting } from '../database';
import { authenticate } from '../middleware/auth';
import { sanitize } from '../middleware/validation';

// ── Tipuri ───────────────────────────────────────────────────────────

/**
 * Structura așteptată pentru setările aplicației.
 *
 * Frontend-ul consumă un singur obiect JSON stocat sub cheia `settings`
 * în baza de date. Orice actualizare suprascrie integral acest obiect.
 */
interface SettingsPayload {
  hero?: {
    title?: string;
    subtitle?: string;
    messages?: string[];
    badge?: string;
    backgroundVideo?: string;
    showPortfolioButton?: boolean;
  };
  about?: {
    title?: string;
    description?: string;
    identity?: string;
  };
  services?: unknown[];
  process?: unknown[];
  delivery?: unknown[];
  faq?: unknown[];
  portfolio?: unknown[];
  contact?: {
    email?: string;
    phone?: string;
    address?: string;
    workingHours?: string;
  };
  seo?: {
    title?: string;
    description?: string;
    keywords?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    twitterCard?: string;
    twitterTitle?: string;
    twitterDescription?: string;
    twitterImage?: string;
    siteUrl?: string;
    author?: string;
    language?: string;
  };
  footer?: {
    copyright?: string;
    facebook?: string;
    tiktok?: string;
    links?: unknown[];
  };
  navigation?: unknown[];
  [key: string]: unknown;
}

/**
 * Cheia sub care sunt stocate setările în baza de date.
 */
const SETTINGS_KEY = 'settings';

// ── Router ───────────────────────────────────────────────────────────

const router = Router();

// ── GET /api/settings (public) ───────────────────────────────────────

/**
 * Returnează setările complete ale aplicației.
 *
 * Ruta este **publică** – nu necesită autentificare.
 * Frontend-ul consumă acest endpoint pentru a popula întregul conținut
 * dinamic al site-ului (hero, servicii, FAQ, portofoliu, SEO etc.).
 *
 * Response (200):
 * ```json
 * {
 *   "hero": { ... },
 *   "services": [ ... ],
 *   "process": [ ... ],
 *   "faq": [ ... ],
 *   ...
 * }
 *
 *
 * Response (404): dacă setările nu au fost încă inițializate
 */
router.get(
  '/',
  (_req: Request, res: Response): void => {
    try {
      const row = getSetting(SETTINGS_KEY);

      if (!row) {
        res.status(404).json({
          error:
            'Setările nu au fost încă inițializate. Rulează seed-ul bazei de date.',
        });
        return;
      }

      let settings: unknown;
      try {
        settings = JSON.parse(row.value);
      } catch {
        res.status(500).json({
          error: 'Setările sunt corupte în baza de date. Contactați administratorul.',
        });
        return;
      }

      res.status(200).json(settings);
    } catch (err: unknown) {
      console.error('[settings] Eroare la GET /api/settings:', err);
      res.status(500).json({
        error: 'Eroare internă. Contactați administratorul.',
      });
    }
  }
);

// ── PUT /api/settings (admin, validated) ─────────────────────────────

/**
 * Actualizează setările aplicației (admin only).
 *
 * **Necesită autentificare** (middleware `authenticate`).
 *
 * Body-ul trebuie să fie un obiect JSON valid, cu structura completă
 * a setărilor. Odată ce este acceptat, **suprascrie integral** setările
 * existente în baza de date.
 *
 * Validarea asigură că:
 * - Body-ul nu este gol
 * - Câmpurile obligatorii minimale sunt prezente
 * - String-urile sunt sanitizate împotriva HTML / caracterelor invizibile
 * - Lungimile nu depășesc limitele rezonabile
 *
 * Response (200):
 * ```json
 * {
 *   "message": "Setările au fost actualizate cu succes.",
 *   "settings": { ... }
 * }
 *
 *
 * Response (400): eroare de validare
 * Response (401): neautentificat
 * Response (403): rol insuficient
 */
router.put(
  '/',
  authenticate,
  (req: Request, res: Response): void => {
    try {
      const body = req.body;

      // 1. Verifică prezența body-ului
      if (!body || typeof body !== 'object' || Array.isArray(body)) {
        res.status(400).json({
          error: 'Body-ul trebuie să fie un obiect JSON valid.',
        });
        return;
      }

      // 2. Verifică cheile minimale așteptate
      const requiredKeys = ['hero', 'services', 'process', 'faq', 'portfolio', 'seo'];
      const missingKeys = requiredKeys.filter((k) => !(k in body));

      if (missingKeys.length > 0) {
        res.status(400).json({
          error: 'Setări incomplete.',
          details: `Câmpurile următoare lipsesc: ${missingKeys.join(', ')}.`,
        });
        return;
      }

      // 3. Verifică dimensiunea maximă a body-ului (prevenire DoS)
      const bodySize = JSON.stringify(body).length;
      const MAX_BODY_SIZE = 500_000; // 500 KB

      if (bodySize > MAX_BODY_SIZE) {
        res.status(400).json({
          error: `Dimensiunea datelor depășește limita maximă de ${MAX_BODY_SIZE / 1000} KB.`,
        });
        return;
      }

      // 4. Sanitizare recursivă a tuturor string-urilor
      const sanitized = deepSanitizeStrings(body) as SettingsPayload;

      // 5. Validare detaliată pe câmpuri cunoscute
      const validationError = validateSettingsPayload(sanitized);
      if (validationError) {
        res.status(400).json({ error: validationError });
        return;
      }

      // 6. Persistă setările
      const row = upsertSetting(SETTINGS_KEY, sanitized);

      // 7. Returnează obiectul salvat
      let savedSettings: unknown;
      try {
        savedSettings = JSON.parse(row.value);
      } catch {
        savedSettings = sanitized;
      }

      res.status(200).json({
        message: 'Setările au fost actualizate cu succes.',
        settings: savedSettings,
      });
    } catch (err: unknown) {
      console.error('[settings] Eroare la PUT /api/settings:', err);
      res.status(500).json({
        error: 'Eroare internă. Contactați administratorul.',
      });
    }
  }
);

// ── PATCH /api/settings (admin, partial update) ──────────────────────

/**
 * Actualizează **parțial** setările aplicației (admin only).
 *
 * **Necesită autentificare** (middleware `authenticate`).
 *
 * Spre deosebire de PUT, acest endpoint face un **merge profund**
 * între setările existente și body-ul trimis. Doar câmpurile
 * specificate sunt actualizate; restul rămân neschimbate.
 *
 * Array-urile din body **înlocuiesc integral** array-urile existente,
 * nu se face concatenare.
 *
 * Response (200):
 * ```json
 * {
 *   "message": "Setările au fost actualizate parțial cu succes.",
 *   "settings": { ... }
 * }
 *
 *
 * Response (404): dacă setările nu există încă (folosește PUT pentru inițializare)
 */
router.patch(
  '/',
  authenticate,
  (req: Request, res: Response): void => {
    try {
      const body = req.body;

      // 1. Verifică prezența body-ului
      if (!body || typeof body !== 'object' || Array.isArray(body)) {
        res.status(400).json({
          error: 'Body-ul trebuie să fie un obiect JSON valid.',
        });
        return;
      }

      // 2. Verifică existența setărilor curente
      const existingRow = getSetting(SETTINGS_KEY);
      if (!existingRow) {
        res.status(404).json({
          error:
            'Setările nu au fost încă inițializate. Folosește PUT pentru a crea setările complete.',
        });
        return;
      }

      let currentSettings: Record<string, unknown>;
      try {
        currentSettings = JSON.parse(existingRow.value);
      } catch {
        res.status(500).json({
          error: 'Setările sunt corupte în baza de date. Contactați administratorul.',
        });
        return;
      }

      // 3. Merge profund: suprascrie cheile din body peste cele existente
      const merged = deepMerge(currentSettings, body);

      // 4. Verifică dimensiunea maximă
      const bodySize = JSON.stringify(merged).length;
      const MAX_BODY_SIZE = 500_000;

      if (bodySize > MAX_BODY_SIZE) {
        res.status(400).json({
          error: `Dimensiunea datelor după actualizare depășește limita maximă de ${MAX_BODY_SIZE / 1000} KB.`,
        });
        return;
      }

      // 5. Sanitizare recursivă
      const sanitized = deepSanitizeStrings(merged) as SettingsPayload;

      // 6. Validare detaliată
      const validationError = validateSettingsPayload(sanitized);
      if (validationError) {
        res.status(400).json({ error: validationError });
        return;
      }

      // 7. Persistă
      const row = upsertSetting(SETTINGS_KEY, sanitized);

      let savedSettings: unknown;
      try {
        savedSettings = JSON.parse(row.value);
      } catch {
        savedSettings = sanitized;
      }

      res.status(200).json({
        message: 'Setările au fost actualizate parțial cu succes.',
        settings: savedSettings,
      });
    } catch (err: unknown) {
      console.error('[settings] Eroare la PATCH /api/settings:', err);
      res.status(500).json({
        error: 'Eroare internă. Contactați administratorul.',
      });
    }
  }
);

// ── DELETE /api/settings (admin only, reset) ─────────────────────────

/**
 * Resetează setările aplicației la valorile implicite (admin only).
 *
 * **Necesită autentificare** (middleware `authenticate`).
 *
 * Șterge setările existente din baza de date. După ștergere,
 * endpoint-ul GET va returna 404 până când setările sunt re-inițializate.
 *
 * Alternativ, dacă se trimite un query parameter `?restore=true`,
 * se reinserțează valorile default (seed minim funcțional).
 *
 * Response (200):
 * ```json
 * {
 *   "message": "Setările au fost resetate cu succes."
 * }
 *
 */
router.delete(
  '/',
  authenticate,
  (req: Request, res: Response): void => {
    try {
      const shouldRestore = req.query.restore === 'true';

      if (shouldRestore) {
        // Restaurează setările default (seed minimal)
        const defaultSettings: SettingsPayload = {
          hero: {
            title: '',
            subtitle: '',
            messages: [],
            badge: '',
            backgroundVideo: '',
            showPortfolioButton: true,
          },
          about: {
            title: '',
            description: '',
            identity: '',
          },
          services: [],
          process: [],
          delivery: [],
          faq: [],
          portfolio: [],
          contact: {
            email: '',
            phone: '',
            address: '',
            workingHours: '',
          },
          seo: {
            title: '',
            description: '',
            keywords: '',
            ogTitle: '',
            ogDescription: '',
            ogImage: '',
            twitterCard: 'summary_large_image',
            twitterTitle: '',
            twitterDescription: '',
            twitterImage: '',
            siteUrl: '',
            author: '',
            language: 'ro',
          },
          footer: {
            copyright: '',
            facebook: '',
            tiktok: '',
            links: [],
          },
          navigation: [],
        };

        const row = upsertSetting(SETTINGS_KEY, defaultSettings);
        let savedSettings: unknown;
        try {
          savedSettings = JSON.parse(row.value);
        } catch {
          savedSettings = defaultSettings;
        }

        res.status(200).json({
          message: 'Setările au fost resetate la valorile implicite.',
          settings: savedSettings,
        });
        return;
      }

      // Ștergere simplă: suprascrie cu un obiect gol
      const emptySettings: Record<string, never> = {};
      upsertSetting(SETTINGS_KEY, emptySettings);

      res.status(200).json({
        message: 'Setările au fost șterse cu succes.',
      });
    } catch (err: unknown) {
      console.error('[settings] Eroare la DELETE /api/settings:', err);
      res.status(500).json({
        error: 'Eroare internă. Contactați administratorul.',
      });
    }
  }
);

// ── GET /api/settings/all (admin only, pentru depanare) ──────────────

/**
 * Returnează toate perechile cheie-valoare din tabela `settings` (admin only).
 *
 * Util pentru depanare și pentru a vedea toate setările individuale
 * care nu fac parte din obiectul principal `settings`.
 *
 * **Necesită autentificare.**
 */
router.get(
  '/all',
  authenticate,
  (_req: Request, res: Response): void => {
    try {
      const rows = getAllSettings();
      res.status(200).json(rows);
    } catch (err: unknown) {
      console.error('[settings] Eroare la GET /api/settings/all:', err);
      res.status(500).json({
        error: 'Eroare internă. Contactați administratorul.',
      });
    }
  }
);

// ── Validare & Sanitizare ────────────────────────────────────────────

/**
 * Sanitizează recursiv toate string-urile dintr-un obiect sau array.
 *
 * Parcurge întreaga structură de date și aplică `sanitize()` pe fiecare
 * valoare de tip string, păstrând intacte celelalte tipuri (number, boolean).
 *
 * @param value - valoarea de sanitizat (obiect, array, string sau alt tip)
 * @returns o copie adâncă cu toate string-urile sanitizate
 */
function deepSanitizeStrings(value: unknown): unknown {
  if (typeof value === 'string') {
    return sanitize(value);
  }

  if (Array.isArray(value)) {
    return value.map((item) => deepSanitizeStrings(item));
  }

  if (value !== null && typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      result[key] = deepSanitizeStrings(val);
    }
    return result;
  }

  // number, boolean, null – se păstrează neschimbate
  return value;
}

/**
 * Face un merge profund între două obiecte.
 *
 * Obiectele sunt îmbinate recursiv: cheile din `source` suprascriu
 * cheile din `target`. Array-urile din `source` înlocuiesc integral
 * array-urile din `target`.
 *
 * @param target - obiectul de bază
 * @param source - obiectul cu actualizări
 * @returns un obiect nou, rezultatul merge-ului
 */
function deepMerge(
  target: Record<string, unknown>,
  source: Record<string, unknown>
): Record<string, unknown> {
  const result: Record<string, unknown> = { ...target };

  for (const key of Object.keys(source)) {
    const sourceVal = source[key];
    const targetVal = result[key];

    if (
      sourceVal !== null &&
      typeof sourceVal === 'object' &&
      !Array.isArray(sourceVal) &&
      targetVal !== null &&
      typeof targetVal === 'object' &&
      !Array.isArray(targetVal)
    ) {
      // Ambele sunt obiecte → merge recursiv
      result[key] = deepMerge(
        targetVal as Record<string, unknown>,
        sourceVal as Record<string, unknown>
      );
    } else {
      // Altfel suprascrie direct (inclusiv array-uri)
      result[key] = sourceVal;
    }
  }

  return result;
}

/**
 * Verifică dacă un string arată a fi un URL valid.
 *
 * Acceptă URL-uri HTTP(S), relative, și data URI-uri.
 *
 * @param value - string-ul de verificat
 * @returns `true` dacă string-ul este vid sau un URL valid
 */
function isValidURL(value: string): boolean {
  if (value.length === 0) return true; // gol e permis

  // Permite URL-uri relative (încep cu /)
  if (value.startsWith('/')) return true;

  // Permite data URI-uri
  if (value.startsWith('data:')) return true;

  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Validează structura payload-ului de setări.
 *
 * Verifică tipurile de bază și lungimile maxime pentru câmpurile
 * cunoscute. Nu respinge câmpuri suplimentare necunoscute (extensibilitate).
 *
 * @param payload - obiectul de setări de validat
 * @returns `null` dacă totul este valid, sau un mesaj de eroare
 */
function validateSettingsPayload(payload: SettingsPayload): string | null {
  const MAX_STRING_LENGTH = 5000;
  const MAX_ARRAY_LENGTH = 200;
  const MAX_URL_LENGTH = 2048;

  // ── Hero ────────────────────────────────────────────────────────
  if (payload.hero) {
    if (
      typeof payload.hero.title === 'string' &&
      payload.hero.title.length > 300
    ) {
      return 'Titlul hero nu poate depăși 300 de caractere.';
    }
    if (
      typeof payload.hero.subtitle === 'string' &&
      payload.hero.subtitle.length > 500
    ) {
      return 'Subtitlul hero nu poate depăși 500 de caractere.';
    }
    if (
      typeof payload.hero.badge === 'string' &&
      payload.hero.badge.length > 200
    ) {
      return 'Badge-ul hero nu poate depăși 200 de caractere.';
    }
    if (
      typeof payload.hero.backgroundVideo === 'string' &&
      payload.hero.backgroundVideo.length > MAX_URL_LENGTH
    ) {
      return `URL-ul videoclipului de fundal nu poate depăși ${MAX_URL_LENGTH} de caractere.`;
    }
    if (
      typeof payload.hero.backgroundVideo === 'string' &&
      !isValidURL(payload.hero.backgroundVideo)
    ) {
      return 'URL-ul videoclipului de fundal nu este valid.';
    }
    if (
      Array.isArray(payload.hero.messages) &&
      payload.hero.messages.length > 20
    ) {
      return 'Numărul maxim de mesaje hero este 20.';
    }
    // Validare mesaje individuale
    if (Array.isArray(payload.hero.messages)) {
      for (let i = 0; i < payload.hero.messages.length; i++) {
        const msg = payload.hero.messages[i];
        if (typeof msg === 'string' && msg.length > 500) {
          return `Mesajul hero de la indexul ${i} nu poate depăși 500 de caractere.`;
        }
      }
    }
    // Validare showPortfolioButton (boolean)
    if (
      payload.hero.showPortfolioButton !== undefined &&
      typeof payload.hero.showPortfolioButton !== 'boolean'
    ) {
      return 'Câmpul showPortfolioButton trebuie să fie boolean (true/false).';
    }
  }

  // ── About ───────────────────────────────────────────────────────
  if (payload.about) {
    if (
      typeof payload.about.title === 'string' &&
      payload.about.title.length > 300
    ) {
      return 'Titlul About nu poate depăși 300 de caractere.';
    }
    if (
      typeof payload.about.description === 'string' &&
      payload.about.description.length > MAX_STRING_LENGTH
    ) {
      return `Descrierea About nu poate depăși ${MAX_STRING_LENGTH} de caractere.`;
    }
    if (
      typeof payload.about.identity === 'string' &&
      payload.about.identity.length > 500
    ) {
      return 'Identitatea (identity) nu poate depăși 500 de caractere.';
    }
  }

  // ── Services ────────────────────────────────────────────────────
  if (Array.isArray(payload.services)) {
    if (payload.services.length > MAX_ARRAY_LENGTH) {
      return `Numărul maxim de servicii este ${MAX_ARRAY_LENGTH}.`;
    }
    for (let i = 0; i < payload.services.length; i++) {
      const svc = payload.services[i] as Record<string, unknown> | undefined;
      if (!svc || typeof svc !== 'object') {
        return `Serviciul de la indexul ${i} nu este un obiect valid.`;
      }
      if (typeof svc.id !== 'string' || svc.id.length === 0) {
        return `Serviciul de la indexul ${i} nu are un id valid.`;
      }
      if (typeof svc.id === 'string' && svc.id.length > 128) {
        return `ID-ul serviciului de la indexul ${i} nu poate depăși 128 de caractere.`;
      }
      if (typeof svc.title === 'string' && svc.title.length > 300) {
        return `Titlul serviciului de la indexul ${i} nu poate depăși 300 de caractere.`;
      }
      if (typeof svc.description === 'string' && svc.description.length > MAX_STRING_LENGTH) {
        return `Descrierea serviciului de la indexul ${i} nu poate depăși ${MAX_STRING_LENGTH} de caractere.`;
      }
      if (typeof svc.icon === 'string' && svc.icon.length > 100) {
        return `Iconița serviciului de la indexul ${i} nu poate depăși 100 de caractere.`;
      }
    }
  }

  // ── Process ─────────────────────────────────────────────────────
  if (Array.isArray(payload.process)) {
    if (payload.process.length > 50) {
      return 'Numărul maxim de pași este 50.';
    }
    for (let i = 0; i < payload.process.length; i++) {
      const step = payload.process[i] as Record<string, unknown> | undefined;
      if (!step || typeof step !== 'object') {
        return `Pasul de la indexul ${i} nu este un obiect valid.`;
      }
      if (typeof step.title === 'string' && step.title.length > 300) {
        return `Titlul pasului de la indexul ${i} nu poate depăși 300 de caractere.`;
      }
      if (typeof step.description === 'string' && step.description.length > MAX_STRING_LENGTH) {
        return `Descrierea pasului de la indexul ${i} nu poate depăși ${MAX_STRING_LENGTH} de caractere.`;
      }
      if (typeof step.icon === 'string' && step.icon.length > 100) {
        return `Iconița pasului de la indexul ${i} nu poate depăși 100 de caractere.`;
      }
    }
  }

  // ── Delivery ────────────────────────────────────────────────────
  if (Array.isArray(payload.delivery)) {
    if (payload.delivery.length > 30) {
      return 'Numărul maxim de termene de livrare este 30.';
    }
    for (let i = 0; i < payload.delivery.length; i++) {
      const item = payload.delivery[i] as Record<string, unknown> | undefined;
      if (!item || typeof item !== 'object') {
        return `Elementul delivery de la indexul ${i} nu este un obiect valid.`;
      }
      if (typeof item.title === 'string' && item.title.length > 300) {
        return `Titlul delivery de la indexul ${i} nu poate depăși 300 de caractere.`;
      }
      if (typeof item.description === 'string' && item.description.length > MAX_STRING_LENGTH) {
        return `Descrierea delivery de la indexul ${i} nu poate depăși ${MAX_STRING_LENGTH} de caractere.`;
      }
      if (typeof item.timeframe === 'string' && item.timeframe.length > 100) {
        return `Timeframe-ul delivery de la indexul ${i} nu poate depăși 100 de caractere.`;
      }
    }
  }

  // ── FAQ ─────────────────────────────────────────────────────────
  if (Array.isArray(payload.faq)) {
    if (payload.faq.length > MAX_ARRAY_LENGTH) {
      return `Numărul maxim de întrebări FAQ este ${MAX_ARRAY_LENGTH}.`;
    }
    for (let i = 0; i < payload.faq.length; i++) {
      const item = payload.faq[i] as Record<string, unknown> | undefined;
      if (!item || typeof item !== 'object') {
        return `Întrebarea FAQ de la indexul ${i} nu este un obiect valid.`;
      }
      if (typeof item.question === 'string' && item.question.length > 500) {
        return `Întrebarea FAQ de la indexul ${i} nu poate depăși 500 de caractere.`;
      }
      if (typeof item.answer === 'string' && item.answer.length > MAX_STRING_LENGTH) {
        return `Răspunsul FAQ de la indexul ${i} nu poate depăși ${MAX_STRING_LENGTH} de caractere.`;
      }
    }
  }

  // ── Portfolio ───────────────────────────────────────────────────
  if (Array.isArray(payload.portfolio)) {
    if (payload.portfolio.length > MAX_ARRAY_LENGTH) {
      return `Numărul maxim de elemente portofoliu este ${MAX_ARRAY_LENGTH}.`;
    }
    for (let i = 0; i < payload.portfolio.length; i++) {
      const item = payload.portfolio[i] as Record<string, unknown> | undefined;
      if (!item || typeof item !== 'object') {
        return `Elementul portofoliu de la indexul ${i} nu este un obiect valid.`;
      }
      if (typeof item.id === 'string' && item.id.length > 128) {
        return `ID-ul portofoliului de la indexul ${i} nu poate depăși 128 de caractere.`;
      }
      if (typeof item.title === 'string' && item.title.length > 300) {
        return `Titlul portofoliului de la indexul ${i} nu poate depăși 300 de caractere.`;
      }
      if (typeof item.description === 'string' && item.description.length > MAX_STRING_LENGTH) {
        return `Descrierea portofoliului de la indexul ${i} nu poate depăși ${MAX_STRING_LENGTH} de caractere.`;
      }
      if (typeof item.image === 'string' && item.image.length > MAX_URL_LENGTH) {
        return `URL-ul imaginii portofoliului de la indexul ${i} nu poate depăși ${MAX_URL_LENGTH} de caractere.`;
      }
      if (typeof item.image === 'string' && !isValidURL(item.image)) {
        return `URL-ul imaginii portofoliului de la indexul ${i} nu este valid.`;
      }
      if (typeof item.category === 'string' && item.category.length > 100) {
        return `Categoria portofoliului de la indexul ${i} nu poate depăși 100 de caractere.`;
      }
    }
  }

  // ── Contact ─────────────────────────────────────────────────────
  if (payload.contact) {
    if (
      typeof payload.contact.email === 'string' &&
      payload.contact.email.length > 320
    ) {
      return 'Email-ul de contact nu poate depăși 320 de caractere.';
    }
    if (
      typeof payload.contact.email === 'string' &&
      payload.contact.email.length > 0 &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.contact.email)
    ) {
      return 'Email-ul de contact nu este valid.';
    }
    if (
      typeof payload.contact.phone === 'string' &&
      payload.contact.phone.length > 30
    ) {
      return 'Telefonul de contact nu poate depăși 30 de caractere.';
    }
    if (
      typeof payload.contact.address === 'string' &&
      payload.contact.address.length > 500
    ) {
      return 'Adresa nu poate depăși 500 de caractere.';
    }
    if (
      typeof payload.contact.workingHours === 'string' &&
      payload.contact.workingHours.length > 300
    ) {
      return 'Programul de lucru nu poate depăși 300 de caractere.';
    }
  }

  // ── SEO ─────────────────────────────────────────────────────────
  if (payload.seo) {
    if (
      typeof payload.seo.title === 'string' &&
      payload.seo.title.length > 120
    ) {
      return 'Titlul SEO nu poate depăși 120 de caractere.';
    }
    if (
      typeof payload.seo.description === 'string' &&
      payload.seo.description.length > 320
    ) {
      return 'Descrierea SEO nu poate depăși 320 de caractere.';
    }
    if (
      typeof payload.seo.keywords === 'string' &&
      payload.seo.keywords.length > 500
    ) {
      return 'Cuvintele cheie SEO nu pot depăși 500 de caractere.';
    }
    if (
      typeof payload.seo.ogTitle === 'string' &&
      payload.seo.ogTitle.length > 120
    ) {
      return 'Titlul Open Graph nu poate depăși 120 de caractere.';
    }
    if (
      typeof payload.seo.ogDescription === 'string' &&
      payload.seo.ogDescription.length > 320
    ) {
      return 'Descrierea Open Graph nu poate depăși 320 de caractere.';
    }
    if (
      typeof payload.seo.ogImage === 'string' &&
      payload.seo.ogImage.length > MAX_URL_LENGTH
    ) {
      return `URL-ul imaginii Open Graph nu poate depăși ${MAX_URL_LENGTH} de caractere.`;
    }
    if (
      typeof payload.seo.ogImage === 'string' &&
      !isValidURL(payload.seo.ogImage)
    ) {
      return 'URL-ul imaginii Open Graph nu este valid.';
    }
    if (
      typeof payload.seo.twitterCard === 'string' &&
      !['summary', 'summary_large_image', 'app', 'player', ''].includes(payload.seo.twitterCard)
    ) {
      return 'Twitter Card trebuie să fie una dintre: summary, summary_large_image, app, player.';
    }
    if (
      typeof payload.seo.twitterTitle === 'string' &&
      payload.seo.twitterTitle.length > 120
    ) {
      return 'Titlul Twitter nu poate depăși 120 de caractere.';
    }
    if (
      typeof payload.seo.twitterDescription === 'string' &&
      payload.seo.twitterDescription.length > 320
    ) {
      return 'Descrierea Twitter nu poate depăși 320 de caractere.';
    }
    if (
      typeof payload.seo.twitterImage === 'string' &&
      payload.seo.twitterImage.length > MAX_URL_LENGTH
    ) {
      return `URL-ul imaginii Twitter nu poate depăși ${MAX_URL_LENGTH} de caractere.`;
    }
    if (
      typeof payload.seo.twitterImage === 'string' &&
      !isValidURL(payload.seo.twitterImage)
    ) {
      return 'URL-ul imaginii Twitter nu este valid.';
    }
    if (
      typeof payload.seo.siteUrl === 'string' &&
      payload.seo.siteUrl.length > MAX_URL_LENGTH
    ) {
      return `URL-ul site-ului nu poate depăși ${MAX_URL_LENGTH} de caractere.`;
    }
    if (
      typeof payload.seo.siteUrl === 'string' &&
      !isValidURL(payload.seo.siteUrl)
    ) {
      return 'URL-ul site-ului nu este valid.';
    }
    if (
      typeof payload.seo.author === 'string' &&
      payload.seo.author.length > 200
    ) {
      return 'Autorul SEO nu poate depăși 200 de caractere.';
    }
    if (
      typeof payload.seo.language === 'string' &&
      payload.seo.language.length > 10
    ) {
      return 'Codul de limbă SEO nu poate depăși 10 caractere.';
    }
  }

  // ── Footer ──────────────────────────────────────────────────────
  if (payload.footer) {
    if (
      typeof payload.footer.copyright === 'string' &&
      payload.footer.copyright.length > 300
    ) {
      return 'Copyright-ul nu poate depăși 300 de caractere.';
    }
    if (
      typeof payload.footer.facebook === 'string' &&
      payload.footer.facebook.length > MAX_URL_LENGTH
    ) {
      return `URL-ul Facebook nu poate depăși ${MAX_URL_LENGTH} de caractere.`;
    }
    if (
      typeof payload.footer.facebook === 'string' &&
      !isValidURL(payload.footer.facebook)
    ) {
      return 'URL-ul Facebook nu este valid.';
    }
    if (
      typeof payload.footer.tiktok === 'string' &&
      payload.footer.tiktok.length > MAX_URL_LENGTH
    ) {
      return `URL-ul TikTok nu poate depăși ${MAX_URL_LENGTH} de caractere.`;
    }
    if (
      typeof payload.footer.tiktok === 'string' &&
      !isValidURL(payload.footer.tiktok)
    ) {
      return 'URL-ul TikTok nu este valid.';
    }
    if (Array.isArray(payload.footer.links)) {
      if (payload.footer.links.length > 50) {
        return 'Numărul maxim de link-uri în footer este 50.';
      }
      for (let i = 0; i < payload.footer.links.length; i++) {
        const link = payload.footer.links[i] as Record<string, unknown> | undefined;
        if (!link || typeof link !== 'object') {
          return `Link-ul din footer de la indexul ${i} nu este un obiect valid.`;
        }
        if (typeof link.label === 'string' && link.label.length > 200) {
          return `Eticheta link-ului din footer de la indexul ${i} nu poate depăși 200 de caractere.`;
        }
        if (typeof link.url === 'string' && link.url.length > MAX_URL_LENGTH) {
          return `URL-ul link-ului din footer de la indexul ${i} nu poate depăși ${MAX_URL_LENGTH} de caractere.`;
        }
        if (typeof link.url === 'string' && !isValidURL(link.url)) {
          return `URL-ul link-ului din footer de la indexul ${i} nu este valid.`;
        }
      }
    }
  }

  // ── Navigation ──────────────────────────────────────────────────
  if (Array.isArray(payload.navigation)) {
    if (payload.navigation.length > 50) {
      return 'Numărul maxim de link-uri de navigare este 50.';
    }
    for (let i = 0; i < payload.navigation.length; i++) {
      const link = payload.navigation[i] as Record<string, unknown> | undefined;
      if (!link || typeof link !== 'object') {
        return `Link-ul de navigare de la indexul ${i} nu este un obiect valid.`;
      }
      if (typeof link.label === 'string' && link.label.length > 200) {
        return `Eticheta link-ului de navigare de la indexul ${i} nu poate depăși 200 de caractere.`;
      }
      if (typeof link.url === 'string' && link.url.length > MAX_URL_LENGTH) {
        return `URL-ul link-ului de navigare de la indexul ${i} nu poate depăși ${MAX_URL_LENGTH} de caractere.`;
      }
      if (typeof link.url === 'string' && !isValidURL(link.url)) {
        return `URL-ul link-ului de navigare de la indexul ${i} nu este valid.`;
      }
    }
  }

  return null; // valid
}

// ── Export ───────────────────────────────────────────────────────────

export default router;