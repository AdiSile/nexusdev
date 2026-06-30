import { Request, Response, NextFunction } from 'express';

// ── Tipuri ───────────────────────────────────────────────────────────

export interface ValidationRules {
  /** Numele câmpului din req.body */
  field: string;
  /** Tipul de validare */
  type: 'name' | 'email' | 'url' | 'phone' | 'text' | 'custom';
  /** Etichetă prietenoasă pentru mesaje de eroare */
  label?: string;
  /** Dacă este true, câmpul este obligatoriu (default: true) */
  required?: boolean;
  /** Lungimea minimă (pentru string-uri) */
  min?: number;
  /** Lungimea maximă (pentru string-uri) */
  max?: number;
  /** Regex custom (doar când type = 'custom') */
  pattern?: RegExp;
  /** Mesaj de eroare custom pentru pattern */
  patternMessage?: string;
  /** Funcție de sanitizare custom (rulează după validare) */
  sanitize?: (value: string) => string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  value?: string;
}

// ── Constante de configurare ─────────────────────────────────────────

/** Lungime maximă implicită pentru câmpurile text */
const DEFAULT_TEXT_MAX = 5000;

/** Lungime maximă pentru nume */
const NAME_MAX = 128;

/** Lungime maximă pentru email */
const EMAIL_MAX = 254; // RFC 5321

/** Lungime maximă pentru URL */
const URL_MAX = 2048;

/** Lungime maximă pentru telefon */
const PHONE_MAX = 30;

// ── Whitelist-uri (regex-uri stricte) ────────────────────────────────

/**
 * Validare nume: doar litere (inclusiv diacritice), spații, cratimă, apostrof, punct.
 *
 * Blochează: cifre, simboluri, tag-uri HTML, caractere de control.
 */
const NAME_PATTERN = /^[\p{L}\p{M}'\-.\s]+$/u;

/**
 * Validare email strictă:
 * - Partea locală: litere, cifre, ., _, %, +, -
 * - Domeniu: litere, cifre, cratimă, punct
 * - TLD: minim 2 litere
 * - Blochează: spații, ghilimele, paranteze, caractere de control
 */
const EMAIL_PATTERN =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;

/**
 * Validare URL: doar http și https.
 * Blochează: javascript:, data:, vbscript:, file:, ftp:, etc.
 */
const URL_PATTERN = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;

/**
 * Validare telefon (internațional): + optional, apoi cifre, spații, cratimă, paranteze.
 */
const PHONE_PATTERN = /^\+?[\d\s\-().]{6,30}$/;

/**
 * Verifică dacă URL-ul are un protocol periculos (javascript, data, vbscript etc.)
 */
const DANGEROUS_PROTOCOLS =
  /^(javascript|data|vbscript|file|ftp|mailto|tel):/i;

// ── Funcții de sanitizare ────────────────────────────────────────────

/**
 * Elimină caracterele de control invizibile (zero-width, direction markers etc.)
 * care pot fi folosite în atacuri homoglyph sau bypass.
 */
const INVISIBLE_CHARS =
  /[\u200B-\u200F\u2028-\u202F\uFEFF\u00AD\u2060\u2061\u2062\u2063\u2064\uFFF0-\uFFFF]/g;

/**
 * Elimină tag-urile HTML și comentariile.
 * Folosește o abordare cu regex dublu pentru robustețe.
 */
const HTML_TAG_PATTERN = /<[^>]*>/g;
const HTML_COMMENT_PATTERN = /<!--[\s\S]*?-->/g;
const HTML_ENTITY_ENCODED_TAG = /&lt;[^&]*&gt;/gi;

/**
 * Elimină secvențele de event handlers inline (onerror, onload etc.)
 */
const EVENT_HANDLER_PATTERN =
  /\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi;

/**
 * Elimină caracterele de control ASCII (0x00-0x1F, mai puțin \t, \n, \r).
 */
const CONTROL_CHARS = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;

/**
 * Sanitizează un string: elimină HTML, caractere invizibile, caractere de control,
 * normalizează unicode (NFC), trim.
 */
export function sanitize(value: string): string {
  if (typeof value !== 'string') {
    return '';
  }

  let cleaned = value;

  // 1. Normalizare Unicode NFC (compun caracterele diacritice)
  cleaned = cleaned.normalize('NFC');

  // 2. Elimină caractere invizibile / zero-width
  cleaned = cleaned.replace(INVISIBLE_CHARS, '');

  // 3. Elimină caractere de control ASCII (păstrează tab, newline, carriage return)
  cleaned = cleaned.replace(CONTROL_CHARS, '');

  // 4. Elimină comentarii HTML
  cleaned = cleaned.replace(HTML_COMMENT_PATTERN, '');

  // 5. Elimină tag-uri HTML
  cleaned = cleaned.replace(HTML_TAG_PATTERN, '');

  // 6. Elimină entități HTML codificate care ascund tag-uri
  cleaned = cleaned.replace(HTML_ENTITY_ENCODED_TAG, '');

  // 7. Elimină inline event handlers (ca măsură suplimentară)
  cleaned = cleaned.replace(EVENT_HANDLER_PATTERN, '');

  // 8. Trim whitespace
  cleaned = cleaned.trim();

  return cleaned;
}

/**
 * Sanitizează strict pentru nume: elimină orice nu este literă, spațiu,
 * cratimă, apostrof sau punct.
 */
export function sanitizeName(value: string): string {
  const cleaned = sanitize(value);

  // Păstrează doar caracterele permise explicit (whitelist)
  return cleaned.replace(/[^\p{L}\p{M}'\-.\s]/gu, '').trim();
}

/**
 * Sanitizează un email: lowercase, elimină spații, normalizează.
 */
export function sanitizeEmail(value: string): string {
  const cleaned = sanitize(value);

  // Email: lowercase, elimină spații
  return cleaned.toLowerCase().replace(/\s+/g, '').trim();
}

/**
 * Sanitizează un URL: elimină spații, verifică protocol.
 */
export function sanitizeUrl(value: string): string {
  const cleaned = sanitize(value);

  // Elimină spații
  return cleaned.replace(/\s+/g, '').trim();
}

/**
 * Sanitizează un număr de telefon: păstrează doar +, cifre, spații, cratimă, paranteze, punct.
 */
export function sanitizePhone(value: string): string {
  const cleaned = sanitize(value);

  return cleaned.replace(/[^\d\s\-+().]/g, '').trim();
}

// ── Funcții de validare atomică ──────────────────────────────────────

/**
 * Validează un nume de persoană.
 *
 * Reguli:
 * - Doar litere (inclusiv diacritice), spații, cratimă, apostrof, punct
 * - Lungime: 1-128 caractere
 * - Cel puțin o literă
 */
export function validateName(value: unknown): string | null {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return 'Numele este obligatoriu.';
  }

  if (value.length > NAME_MAX) {
    return `Numele nu poate depăși ${NAME_MAX} de caractere.`;
  }

  // Verificare whitelist
  if (!NAME_PATTERN.test(value)) {
    return 'Numele conține caractere nepermise. Sunt acceptate doar litere, spații, cratimă și apostrof.';
  }

  // Cel puțin o literă
  if (!/\p{L}/u.test(value)) {
    return 'Numele trebuie să conțină cel puțin o literă.';
  }

  return null; // valid
}

/**
 * Validează o adresă de email.
 *
 * Reguli:
 * - Format RFC 5322 (simplificat)
 * - Lungime totală maximă 254 caractere
 * - Partea locală maxim 64 caractere
 * - Domeniu valid (cel puțin un punct, TLD minim 2 litere)
 * - Fără caractere de control sau spații
 */
export function validateEmail(value: unknown): string | null {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return 'Adresa de email este obligatorie.';
  }

  if (value.length > EMAIL_MAX) {
    return `Adresa de email nu poate depăși ${EMAIL_MAX} de caractere.`;
  }

  // Lowercase pentru consistență
  const normalized = value.toLowerCase().trim();

  if (!EMAIL_PATTERN.test(normalized)) {
    return 'Adresa de email nu este validă.';
  }

  // Verificare parte locală (max 64 caractere)
  const atIndex = normalized.lastIndexOf('@');
  if (atIndex === -1) {
    return 'Adresa de email nu este validă.';
  }

  const localPart = normalized.substring(0, atIndex);
  if (localPart.length > 64) {
    return 'Adresa de email nu este validă (partea locală prea lungă).';
  }

  // Verificare domeniu: fiecare segment max 63 caractere
  const domain = normalized.substring(atIndex + 1);
  const domainSegments = domain.split('.');
  if (domainSegments.some((seg) => seg.length > 63)) {
    return 'Adresa de email nu este validă (segment domeniu prea lung).';
  }

  // TLD-ul trebuie să aibă cel puțin 2 litere
  const tld = domainSegments[domainSegments.length - 1];
  if (!tld || tld.length < 2 || !/^[a-zA-Z]{2,}$/.test(tld)) {
    return 'Adresa de email nu este validă (TLD invalid).';
  }

  return null; // valid
}

/**
 * Validează un URL.
 *
 * Reguli:
 * - Doar http și https
 * - Format valid de URL
 * - Fără caractere de control
 * - Blochează protocoalele periculoase (javascript:, data:, etc.)
 * - Lungime maximă 2048
 */
export function validateUrl(value: unknown): string | null {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return 'URL-ul este obligatoriu.';
  }

  if (value.length > URL_MAX) {
    return `URL-ul nu poate depăși ${URL_MAX} de caractere.`;
  }

  const trimmed = value.trim();

  // Blochează protocoalele periculoase (verificare case-insensitive)
  if (DANGEROUS_PROTOCOLS.test(trimmed)) {
    return 'URL-ul conține un protocol nepermis. Sunt acceptate doar http și https.';
  }

  // Verificare pattern http/https
  if (!URL_PATTERN.test(trimmed)) {
    return 'URL-ul nu este valid. Trebuie să înceapă cu http:// sau https://.';
  }

  // Verificare suplimentară: cel puțin un punct după protocol
  // (blochează URL-uri precum http://localhost fără context adecvat - dar le permitem)
  const afterProtocol = trimmed.replace(/^https?:\/\//i, '');
  if (afterProtocol.length === 0) {
    return 'URL-ul nu este valid.';
  }

  return null; // valid
}

/**
 * Validează un număr de telefon.
 *
 * Reguli:
 * - Opțional +
 * - Cifre, spații, cratimă, paranteze, punct
 * - Lungime 6-30 caractere
 * - Minim 6 cifre
 */
export function validatePhone(value: unknown): string | null {
  if (value === null || value === undefined || value === '') {
    return null; // telefonul este opțional
  }

  if (typeof value !== 'string') {
    return 'Numărul de telefon nu este valid.';
  }

  if (value.length > PHONE_MAX) {
    return `Numărul de telefon nu poate depăși ${PHONE_MAX} de caractere.`;
  }

  if (!PHONE_PATTERN.test(value)) {
    return 'Numărul de telefon conține caractere nepermise.';
  }

  // Minim 6 cifre
  const digitCount = (value.match(/\d/g) || []).length;
  if (digitCount < 6) {
    return 'Numărul de telefon trebuie să conțină cel puțin 6 cifre.';
  }

  return null; // valid
}

/**
 * Validează un câmp text liber (mesaj, descriere etc.).
 *
 * Reguli:
 * - Lungime minimă și maximă configurabilă
 * - Fără HTML periculos (se face sanitizare, nu respingere)
 */
export function validateText(
  value: unknown,
  min = 1,
  max = DEFAULT_TEXT_MAX
): string | null {
  if (typeof value !== 'string') {
    return 'Câmpul text este obligatoriu.';
  }

  const trimmed = value.trim();

  if (min > 0 && trimmed.length === 0) {
    return 'Câmpul text este obligatoriu.';
  }

  if (trimmed.length < min) {
    return `Textul trebuie să aibă cel puțin ${min} caractere.`;
  }

  if (trimmed.length > max) {
    return `Textul nu poate depăși ${max} de caractere.`;
  }

  return null; // valid
}

// ── Middleware-uri Express ────────────────────────────────────────────

/**
 * Middleware de validare generic.
 *
 * Primește o listă de reguli și validează `req.body`. Dacă există erori,
 * răspunde cu `400 Bad Request` și un array de erori.
 *
 * @param rules - Lista de reguli de validare
 *
 * @example
 * ```ts
 * import { validate } from './middleware/validation';
 *
 * router.post('/contact',
 *   validate([
 *     { field: 'name', type: 'name', label: 'Nume' },
 *     { field: 'email', type: 'email', label: 'Email' },
 *     { field: 'message', type: 'text', label: 'Mesaj', min: 10, max: 2000 },
 *   ]),
 *   contactController.send
 * );
 *
 */
export function validate(rules: ValidationRules[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: ValidationError[] = [];

    for (const rule of rules) {
      const rawValue = req.body?.[rule.field];
      const label = rule.label ?? rule.field;
      const isRequired = rule.required !== false; // default: true

      // null / undefined handling
      if (rawValue === undefined || rawValue === null) {
        if (isRequired) {
          errors.push({
            field: rule.field,
            message: `${label} este obligatoriu.`,
          });
        }
        continue;
      }

      // Conversie la string pentru validare
      let stringValue: string;
      if (typeof rawValue === 'string') {
        stringValue = rawValue;
      } else if (typeof rawValue === 'number' || typeof rawValue === 'boolean') {
        stringValue = String(rawValue);
      } else {
        errors.push({
          field: rule.field,
          message: `${label} nu are un format valid.`,
          value: JSON.stringify(rawValue).substring(0, 100),
        });
        continue;
      }

      // Verificare lungime
      if (rule.min !== undefined && stringValue.trim().length < rule.min) {
        errors.push({
          field: rule.field,
          message: `${label} trebuie să aibă cel puțin ${rule.min} caractere.`,
        });
        continue;
      }

      if (rule.max !== undefined && stringValue.length > rule.max) {
        errors.push({
          field: rule.field,
          message: `${label} nu poate depăși ${rule.max} de caractere.`,
        });
        continue;
      }

      // Validare specifică tipului
      let validationError: string | null = null;

      switch (rule.type) {
        case 'name':
          validationError = validateName(stringValue);
          break;
        case 'email':
          validationError = validateEmail(stringValue);
          break;
        case 'url':
          validationError = validateUrl(stringValue);
          break;
        case 'phone':
          validationError = validatePhone(stringValue);
          break;
        case 'text':
          validationError = validateText(
            stringValue,
            rule.min ?? 1,
            rule.max ?? DEFAULT_TEXT_MAX
          );
          break;
        case 'custom':
          if (rule.pattern && !rule.pattern.test(stringValue)) {
            validationError =
              rule.patternMessage ?? `${label} nu are un format valid.`;
          }
          break;
      }

      if (validationError) {
        errors.push({
          field: rule.field,
          message: validationError,
          value:
            rule.type === 'email' || rule.type === 'phone'
              ? undefined // Nu returnăm email/phone pentru privacy
              : stringValue.length > 100
                ? stringValue.substring(0, 100) + '...'
                : stringValue,
        });
      }

      // Sanitizare (chiar dacă validarea a trecut)
      if (!validationError && req.body[rule.field] !== undefined) {
        let sanitized: string;

        if (rule.sanitize) {
          sanitized = rule.sanitize(stringValue);
        } else {
          switch (rule.type) {
            case 'name':
              sanitized = sanitizeName(stringValue);
              break;
            case 'email':
              sanitized = sanitizeEmail(stringValue);
              break;
            case 'url':
              sanitized = sanitizeUrl(stringValue);
              break;
            case 'phone':
              sanitized = sanitizePhone(stringValue);
              break;
            case 'text':
            case 'custom':
            default:
              sanitized = sanitize(stringValue);
              break;
          }
        }

        req.body[rule.field] = sanitized;
      }
    }

    if (errors.length > 0) {
      res.status(400).json({
        error: 'Validare eșuată.',
        details: errors,
      });
      return;
    }

    next();
  };
}

/**
 * Middleware de validare pentru formularul de contact.
 *
 * Validează: name, email, phone (opțional), message.
 *
 * @example
 * ```ts
 * import { validateContact } from './middleware/validation';
 * router.post('/contact', validateContact, contactController.send);
 *
 */
export function validateContact(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const rules: ValidationRules[] = [
    { field: 'name', type: 'name', label: 'Nume', min: 1, max: 128 },
    { field: 'email', type: 'email', label: 'Email' },
    { field: 'phone', type: 'phone', label: 'Telefon', required: false },
    { field: 'message', type: 'text', label: 'Mesaj', min: 10, max: 5000 },
  ];

  const validator = validate(rules);
  validator(req, res, next);
}

/**
 * Middleware care doar sanitizează toate string-urile din req.body,
 * fără a respinge cererea (best-effort sanitization).
 */
export function sanitizeBody(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  if (req.body && typeof req.body === 'object') {
    for (const key of Object.keys(req.body)) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitize(req.body[key]);
      }
    }
  }
  next();
}

// ── Validare manuală (fără middleware) ───────────────────────────────

/**
 * Validează un obiect întreg și returnează rezultatul.
 * Util pentru validare în afara contextului Express (ex: teste, servicii).
 *
 * @param data - Obiectul de validat
 * @param rules - Regulile de validare
 * @returns ValidationResult
 */
export function validateData(
  data: Record<string, unknown>,
  rules: ValidationRules[]
): ValidationResult {
  const errors: ValidationError[] = [];

  for (const rule of rules) {
    const rawValue = data[rule.field];
    const label = rule.label ?? rule.field;
    const isRequired = rule.required !== false;

    if (rawValue === undefined || rawValue === null) {
      if (isRequired) {
        errors.push({
          field: rule.field,
          message: `${label} este obligatoriu.`,
        });
      }
      continue;
    }

    if (typeof rawValue !== 'string') {
      errors.push({
        field: rule.field,
        message: `${label} nu are un format valid.`,
      });
      continue;
    }

    let validationError: string | null = null;

    switch (rule.type) {
      case 'name':
        validationError = validateName(rawValue);
        break;
      case 'email':
        validationError = validateEmail(rawValue);
        break;
      case 'url':
        validationError = validateUrl(rawValue);
        break;
      case 'phone':
        validationError = validatePhone(rawValue);
        break;
      case 'text':
        validationError = validateText(
          rawValue,
          rule.min ?? 1,
          rule.max ?? DEFAULT_TEXT_MAX
        );
        break;
      case 'custom':
        if (rule.pattern && !rule.pattern.test(rawValue)) {
          validationError =
            rule.patternMessage ?? `${label} nu are un format valid.`;
        }
        break;
    }

    if (validationError) {
      errors.push({
        field: rule.field,
        message: validationError,
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ── Re-export pentru conveniență ─────────────────────────────────────

export default {
  validate,
  validateContact,
  sanitizeBody,
  validateData,
  sanitize,
  sanitizeName,
  sanitizeEmail,
  sanitizeUrl,
  sanitizePhone,
  validateName,
  validateEmail,
  validateUrl,
  validatePhone,
  validateText,
};