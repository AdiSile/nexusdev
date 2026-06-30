import rateLimit from 'express-rate-limit';

// ── Tipuri ───────────────────────────────────────────────────────────

export interface RateLimiterOptions {
  /** Numărul maxim de încercări permise în fereastra de timp */
  maxAttempts: number;
  /** Fereastra de timp în minute */
  windowMinutes: number;
  /** Mesajul returnat când limita este depășită */
  message?: string;
}

// ── Limiter implicit (general API) ───────────────────────────────────

/**
 * Rate limiter general pentru toate rutele API.
 * 100 de request-uri per 15 minute per IP.
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minute
  max: 100,
  standardHeaders: true,  // RateLimit-* headers
  legacyHeaders: false,   // dezactivează X-RateLimit-* headers
  message: {
    status: 429,
    error: 'Prea multe cereri. Încearcă din nou mai târziu.',
  },
});

// ── Limiter pentru login ─────────────────────────────────────────────

/**
 * Rate limiter pentru ruta de autentificare (login).
 * 5 încercări per 15 minute per IP.
 *
 * Utilizare:
 * ```ts
 * import { loginLimiter } from './middleware/rateLimiter';
 * router.post('/login', loginLimiter, authController.login);
 *
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minute
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    error: 'Prea multe încercări de autentificare. Încearcă din nou în 15 minute.',
  },
  // Cheia folosită pentru identificare: IP-ul clientului
  keyGenerator: (req) => {
    // Folosește X-Forwarded-For dacă aplicația e în spatele unui proxy
    const forwardedFor = req.headers['x-forwarded-for'];
    if (typeof forwardedFor === 'string') {
      return forwardedFor.split(',')[0]?.trim() ?? req.ip ?? 'unknown';
    }
    return req.ip ?? 'unknown';
  },
  // Nu se aplică după un login reușit (opțional: se poate folosi skipSuccessfulRequests)
  skipSuccessfulRequests: false,
});

// ── Factory pentru limiter-e custom ──────────────────────────────────

/**
 * Creează un rate limiter custom.
 *
 * @param options - Opțiunile de configurare
 * @returns middleware-ul Express de rate limiting
 *
 * @example
 * ```ts
 * const contactLimiter = createRateLimiter({ maxAttempts: 3, windowMinutes: 60 });
 * router.post('/contact', contactLimiter, contactController.send);
 *
 */
export function createRateLimiter(options: RateLimiterOptions) {
  return rateLimit({
    windowMs: options.windowMinutes * 60 * 1000,
    max: options.maxAttempts,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      status: 429,
      error:
        options.message ??
        `Prea multe cereri. Maxim ${options.maxAttempts} încercări per ${options.windowMinutes} minute.`,
    },
    keyGenerator: (req) => {
      const forwardedFor = req.headers['x-forwarded-for'];
      if (typeof forwardedFor === 'string') {
        return forwardedFor.split(',')[0]?.trim() ?? req.ip ?? 'unknown';
      }
      return req.ip ?? 'unknown';
    },
  });
}