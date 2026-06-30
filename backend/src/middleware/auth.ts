import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

// ── Tipuri ───────────────────────────────────────────────────────────

export interface JwtPayload {
  /** Subiectul token-ului (email-ul admin-ului) */
  sub: string;
  /** Rolul asociat token-ului */
  role: 'admin';
  /** Data emiterii (setat automat de jwt.sign) */
  iat?: number;
  /** Data expirării (setat automat de jwt.sign) */
  exp?: number;
  /** ID unic al token-ului, util pentru blacklist / revocare */
  jti?: string;
}

// Extindem interfața Express Request pentru a atașa payload-ul JWT
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      /** Payload-ul JWT decodificat, disponibil după middleware-ul `authenticate` */
      user?: JwtPayload;
    }
  }
}

// ── Configurare ──────────────────────────────────────────────────────

const JWT_SECRET: string | undefined = process.env.JWT_SECRET;

/** Algoritmul folosit pentru semnare / verificare. Forțat explicit pentru a preveni atacuri de tip "algorithm confusion". */
const JWT_ALGORITHM: jwt.Algorithm = 'HS256';

/**
 * Toleranță pentru diferențe de ceas între server și client (clock skew),
 * exprimată în secunde. Evită respingerea unui token perfect valid din
 * cauza unui ceas ușor desincronizat.
 */
const CLOCK_TOLERANCE_SECONDS = 30;

// ── Helpers ──────────────────────────────────────────────────────────

/**
 * Extrage token-ul JWT din:
 *  1. Cookie-ul HttpOnly `token`  (metoda principală, recomandată)
 *  2. Header-ul `Authorization: Bearer <token>`  (fallback dev / testare)
 */
function extractToken(req: Request): string | null {
  // 1. Cookie HttpOnly – vector principal
  if (req.cookies?.token && typeof req.cookies.token === 'string') {
    return req.cookies.token;
  }

  // 2. Authorization header – fallback pentru tooling / testare manuală
  const authHeader = req.headers.authorization;
  if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  return null;
}

// ── Middleware: autentificare obligatorie ────────────────────────────

/**
 * Verifică token-ul JWT și încarcă payload-ul pe `req.user`.
 *
 * **Trebuie** montat înaintea rutelor protejate. Respinge cu:
 *  - `401` dacă token-ul lipsește, e invalid sau expirat
 *  - `403` dacă rolul din token nu este `admin`
 *  - `500` dacă secretul JWT nu este configurat pe server
 *
 * @example
 * ```ts
 * import { authenticate } from './middleware/auth';
 * router.get('/admin/settings', authenticate, settingsController.getAll);
 *
 */
export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Fără JWT_SECRET serverul nu poate verifica niciun token
  if (!JWT_SECRET) {
    res.status(500).json({
      error: 'Eroare internă de configurare. Contactați administratorul.',
    });
    return;
  }

  const token = extractToken(req);

  if (!token) {
    res.status(401).json({ error: 'Autentificare necesară.' });
    return;
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET, {
      algorithms: [JWT_ALGORITHM],
      clockTolerance: CLOCK_TOLERANCE_SECONDS,
      // Opțional: se poate adăuga `issuer`, `audience` dacă sunt folosite
    }) as JwtPayload;

    // Validare structurală a payload-ului
    if (!payload.sub || !payload.role) {
      res.status(401).json({ error: 'Token invalid.' });
      return;
    }

    if (payload.role !== 'admin') {
      res.status(403).json({ error: 'Acces interzis.' });
      return;
    }

    // Atașăm payload-ul pentru middleware-urile / handler-ele următoare
    req.user = payload;
    next();
  } catch (err: unknown) {
    // Răspunsuri diferențiate fără a scurge detalii interne
    if (err instanceof jwt.TokenExpiredError) {
      res
        .status(401)
        .json({ error: 'Sesiunea a expirat. Autentifică-te din nou.' });
      return;
    }

    if (err instanceof jwt.NotBeforeError) {
      res
        .status(401)
        .json({ error: 'Tokenul nu este încă activ.' });
      return;
    }

    if (err instanceof jwt.JsonWebTokenError) {
      // Acoperă: invalid signature, malformed, wrong algorithm etc.
      res.status(401).json({ error: 'Token invalid sau expirat.' });
      return;
    }

    // Eroare neprevăzută – log intern, mesaj generic către client
    console.error('JWT verification error:', err);
    res.status(500).json({ error: 'Eroare la verificarea autentificării.' });
  }
}

// ── Middleware: admin only (complementar) ────────────────────────────

/**
 * Verifică **doar** că utilizatorul are rolul `admin`.
 *
 * Se folosește de obicei **după** `authenticate`, dar poate fi montat și
 * singur dacă autentificarea e garantată de un alt mecanism.
 *
 * @example
 * ```ts
 * router.delete('/admin/messages/:id', authenticate, requireAdmin, messagesController.remove);
 *
 */
export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    res.status(401).json({ error: 'Autentificare necesară.' });
    return;
  }

  if (req.user.role !== 'admin') {
    res.status(403).json({ error: 'Acces interzis. Rol de administrator necesar.' });
    return;
  }

  next();
}

// ── Middleware: autentificare opțională ──────────────────────────────

/**
 * Încearcă să autentifice utilizatorul, dar **nu** respinge cererea
 * dacă token-ul lipsește sau este invalid. Util pentru rute care
 * își adaptează răspunsul în funcție de prezența unui utilizator.
 *
 * Dacă token-ul este valid, `req.user` va fi populat; altfel rămâne
 * `undefined`, iar cererea continuă normal.
 */
export function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!JWT_SECRET) {
    next();
    return;
  }

  const token = extractToken(req);
  if (!token) {
    next();
    return;
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET, {
      algorithms: [JWT_ALGORITHM],
      clockTolerance: CLOCK_TOLERANCE_SECONDS,
    }) as JwtPayload;

    if (payload.sub && payload.role) {
      req.user = payload;
    }
  } catch {
    // Ignorăm erorile – utilizatorul rămâne neautentificat
  }

  next();
}

// ── Utilitar: generare token ─────────────────────────────────────────

/**
 * Semnează un JWT cu payload-ul primit.
 *
 * @param payload  - datele de inclus (sub, role, opțional jti)
 * @param expiresIn - durata de viață (default: `'2h'`)
 * @returns token-ul JWT semnat
 *
 * @throws {Error} dacă `JWT_SECRET` nu este configurat
 *
 * @example
 * ```ts
 * const token = signToken({ sub: 'admin@site.ro', role: 'admin' }, '1h');
 * res.cookie('token', token, getAuthCookieOptions());
 *
 */
export function signToken(
  payload: Omit<JwtPayload, 'iat' | 'exp'>,
  expiresIn: string | number = '2h'
): string {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET nu este configurat. Verifică variabilele de mediu.');
  }

  return jwt.sign(payload, JWT_SECRET, {
    algorithm: JWT_ALGORITHM,
    expiresIn,
    jwtid: crypto.randomUUID(),
  });
}

// ── Utilitar: opțiuni cookie de autentificare ────────────────────────

/**
 * Returnează opțiunile recomandate pentru cookie-ul care transportă JWT-ul.
 *
 * - `httpOnly: true`   – previne accesul din JavaScript (XSS)
 * - `secure: auto`     – `true` în producție (HTTPS), `false` în dev
 * - `sameSite: 'lax'`  – protecție CSRF, dar permite navigare normală
 * - `path: '/'`        – disponibil pe toate rutele
 *
 * @param maxAgeMs - durata de viață a cookie-ului în milisecunde (default 2 ore)
 */
export function getAuthCookieOptions(maxAgeMs = 2 * 60 * 60 * 1000) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: maxAgeMs,
  };
}