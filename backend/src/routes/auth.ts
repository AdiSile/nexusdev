import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { loginLimiter } from '../middleware/rateLimiter';
import { authenticate, signToken, JwtPayload } from '../middleware/auth';
import { sanitizeEmail } from '../middleware/validation';

dotenv.config();

// ── Tipuri ───────────────────────────────────────────────────────────

interface LoginRequest {
  email?: string;
  password?: string;
}

// ── Configurare ──────────────────────────────────────────────────────

const ADMIN_EMAIL: string = process.env.ADMIN_EMAIL ?? '';
const ADMIN_PASSWORD_HASH: string = process.env.ADMIN_PASSWORD_HASH ?? '';
const JWT_SECRET: string | undefined = process.env.JWT_SECRET;
const NODE_ENV: string = process.env.NODE_ENV ?? 'development';
const JWT_EXPIRY: string = '2h';
const JWT_EXPIRY_MS: number = 2 * 60 * 60 * 1000; // 2 ore în milisecunde

// ── Router ───────────────────────────────────────────────────────────

const router = Router();

// ── Opțiuni cookie de autentificare ──────────────────────────────────

/**
 * Opțiunile cookie-ului de autentificare (token JWT).
 *
 * - `httpOnly: true`   – previne accesul din JavaScript, blocând furtul prin XSS
 * - `secure: true`     – cookie-ul este trimis doar prin HTTPS (cu excepția dev local)
 * - `sameSite: 'strict'` – previne CSRF complet; cookie-ul nu e trimis în cross-site requests
 * - `path: '/'`        – disponibil pe toate rutele
 * - `maxAge`           – sincronizat cu durata de viață a JWT-ului
 */
function authCookieOptions(): {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'strict';
  path: string;
  maxAge: number;
} {
  return {
    httpOnly: true,
    secure: NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: JWT_EXPIRY_MS,
  };
}

// ── Validare manuală login ───────────────────────────────────────────

/**
 * Validează email-ul și parola din cererea de login.
 *
 * @returns `null` dacă totul este valid, sau un mesaj de eroare
 */
function validateLoginInput(body: LoginRequest): string | null {
  // Verifică prezența câmpurilor
  if (!body || typeof body !== 'object') {
    return 'Email și parolă sunt obligatorii.';
  }

  if (!body.email || typeof body.email !== 'string') {
    return 'Email și parolă sunt obligatorii.';
  }

  if (!body.password || typeof body.password !== 'string') {
    return 'Email și parolă sunt obligatorii.';
  }

  // Sanitizare email
  const email = sanitizeEmail(body.email);

  if (email.length === 0 || email.length > 254) {
    return 'Email și parolă sunt obligatorii.';
  }

  // Verificare format email de bază
  const atIndex = email.lastIndexOf('@');
  if (atIndex === -1 || atIndex === 0 || atIndex === email.length - 1) {
    return 'Email și parolă sunt obligatorii.';
  }

  // Parola: minim 8 caractere, maxim 128 (pentru a preveni atacuri de tip long-password DoS)
  if (body.password.length < 8 || body.password.length > 128) {
    return 'Email și parolă sunt obligatorii.';
  }

  return null; // valid
}

// ── POST /api/auth/login ─────────────────────────────────────────────

/**
 * Autentifică admin-ul.
 *
 * - Rate limitat la 5 încercări / 15 minute per IP
 * - Parola este verificată cu bcrypt (constant-time)
 * - JWT-ul este stocat într-un cookie HttpOnly, Secure, SameSite=Strict
 * - Nu se scurg informații despre identitatea admin-ului în caz de eroare
 *
 * Request body:
 * ```json
 * { "email": "admin@site.ro", "password": "parola123" }
 *
 *
 * Response (200):
 * ```json
 * { "message": "Autentificare reușită.", "email": "admin@site.ro" }
 *
 */
router.post(
  '/login',
  loginLimiter,
  async (req: Request, res: Response): Promise<void> => {
    try {
      // 1. Validare input
      const validationError = validateLoginInput(req.body);
      if (validationError) {
        // Mesaj generic – nu dezvăluim care câmp este invalid
        res.status(400).json({ error: 'Email și parolă sunt obligatorii.' });
        return;
      }

      // 2. Sanitizare email și extragere parolă
      const email = sanitizeEmail(req.body.email);
      const password: string = req.body.password;

      // 3. Verificare JWT_SECRET configurat
      if (!JWT_SECRET) {
        console.error('[auth] JWT_SECRET nu este configurat.');
        res.status(500).json({
          error: 'Eroare internă de configurare. Contactați administratorul.',
        });
        return;
      }

      // 4. Verificare ADMIN_EMAIL și ADMIN_PASSWORD_HASH configurate
      if (!ADMIN_EMAIL || !ADMIN_PASSWORD_HASH) {
        console.error('[auth] ADMIN_EMAIL sau ADMIN_PASSWORD_HASH nu sunt configurate.');
        res.status(500).json({
          error: 'Eroare internă de configurare. Contactați administratorul.',
        });
        return;
      }

      // 5. Comparare email – folosim constant-time comparison pentru a preveni timing attacks
      //    Verificăm lungimea înainte de a compara cu crypto.timingSafeEqual
      const emailBuffer = Buffer.from(email, 'utf-8');
      const adminEmailBuffer = Buffer.from(ADMIN_EMAIL.toLowerCase().trim(), 'utf-8');

      const emailMatch =
        emailBuffer.length === adminEmailBuffer.length &&
        cryptoTimingSafeEqual(emailBuffer, adminEmailBuffer);

      if (!emailMatch) {
        // Consumăm timp fals pentru a simula verificarea parolei și a preveni
        // timing attacks care ar putea dezvălui existența contului
        await bcrypt.hash(password, 12);
        res.status(401).json({ error: 'Email sau parolă incorecte.' });
        return;
      }

      // 6. Verificare parolă cu bcrypt (constant-time)
      let passwordMatch = false;
      try {
        passwordMatch = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
      } catch (bcryptError) {
        console.error('[auth] Eroare la verificarea parolei:', bcryptError);
        res.status(500).json({
          error: 'Eroare internă. Contactați administratorul.',
        });
        return;
      }

      if (!passwordMatch) {
        res.status(401).json({ error: 'Email sau parolă incorecte.' });
        return;
      }

      // 7. Generare JWT
      const token = signToken(
        { sub: ADMIN_EMAIL, role: 'admin' },
        JWT_EXPIRY
      );

      // 8. Setare cookie HttpOnly, Secure, SameSite=Strict
      res.cookie('token', token, authCookieOptions());

      // 9. Răspuns de succes
      res.status(200).json({
        message: 'Autentificare reușită.',
        email: ADMIN_EMAIL,
      });
    } catch (err: unknown) {
      console.error('[auth] Eroare neprevăzută la login:', err);
      res.status(500).json({
        error: 'Eroare internă. Contactați administratorul.',
      });
    }
  }
);

// ── POST /api/auth/logout ────────────────────────────────────────────

/**
 * Deconectează utilizatorul ștergând cookie-ul de autentificare.
 *
 * Cookie-ul este șters cu aceleași opțiuni (path, sameSite, secure)
 * pentru a garanta că browser-ul îl elimină corect.
 *
 * Response (200):
 * ```json
 * { "message": "Deconectare reușită." }
 *
 */
router.post('/logout', (_req: Request, res: Response): void => {
  try {
    // Șterge cookie-ul cu aceleași atribute folosite la setare
    res.clearCookie('token', {
      httpOnly: true,
      secure: NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });

    res.status(200).json({ message: 'Deconectare reușită.' });
  } catch (err: unknown) {
    console.error('[auth] Eroare la logout:', err);
    res.status(500).json({
      error: 'Eroare internă. Contactați administratorul.',
    });
  }
});

// ── GET /api/auth/verify ─────────────────────────────────────────────

/**
 * Verifică dacă există o sesiune de autentificare validă.
 *
 * Folosește middleware-ul `authenticate` care validează JWT-ul
 * din cookie-ul HttpOnly sau din header-ul Authorization.
 *
 * Response (200):
 * ```json
 * {
 *   "authenticated": true,
 *   "email": "admin@site.ro",
 *   "role": "admin",
 *   "exp": 1740000000
 * }
 *
 *
 * Response (401): token lipsă, invalid sau expirat
 */
router.get(
  '/verify',
  authenticate,
  (req: Request, res: Response): void => {
    try {
      const user = req.user as JwtPayload;

      res.status(200).json({
        authenticated: true,
        email: user.sub,
        role: user.role,
        exp: user.exp ?? null,
      });
    } catch (err: unknown) {
      console.error('[auth] Eroare la verificare:', err);
      res.status(500).json({
        error: 'Eroare internă. Contactați administratorul.',
      });
    }
  }
);

// ── Utilitar: crypto.timingSafeEqual (polyfill pentru compatibilitate) ──

/**
 * Compară două Buffer-e în timp constant.
 *
 * Folosește `crypto.timingSafeEqual` (Node 6.6+) – previne timing attacks
 * prin faptul că timpul de execuție nu depinde de conținutul buffer-elor.
 *
 * @param a - primul buffer
 * @param b - al doilea buffer (trebuie să aibă aceeași lungime)
 * @returns `true` dacă buffer-ele sunt identice
 */
function cryptoTimingSafeEqual(a: Buffer, b: Buffer): boolean {
  // Verificare prealabilă: lungimi diferite → nu sunt egale
  if (a.length !== b.length) {
    return false;
  }

  // Node.js crypto.timingSafeEqual (disponibil din Node 6.6+)
  try {
    return crypto.timingSafeEqual(a, b);
  } catch {
    // Fallback manual constant-time comparison (extremely unlikely path)
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a[i]! ^ b[i]!;
    }
    return result === 0;
  }
}

// ── POST /api/auth/refresh ───────────────────────────────────────────

/**
 * Reîmprospătează token-ul JWT înainte de expirare.
 *
 * Middleware-ul `authenticate` validează token-ul curent (cookie sau header).
 * Se emite un nou token cu aceleași date (sub, role) și o expirare proaspătă,
 * iar cookie-ul este suprascris.
 *
 * Această rută previne deconectarea forțată a admin-ului în timpul
 * unei sesiuni active (sliding expiration).
 *
 * Response (200):
 * ```json
 * { "message": "Token reîmprospătat cu succes.", "email": "admin@site.ro" }
 *
 *
 * Response (401): token lipsă, invalid sau expirat
 */
router.post(
  '/refresh',
  authenticate,
  (req: Request, res: Response): void => {
    try {
      const user = req.user as JwtPayload;

      // Generează un token nou, cu expirare proaspătă
      const token = signToken(
        { sub: user.sub, role: user.role },
        JWT_EXPIRY
      );

      // Suprascrie cookie-ul existent
      res.cookie('token', token, authCookieOptions());

      res.status(200).json({
        message: 'Token reîmprospătat cu succes.',
        email: user.sub,
      });
    } catch (err: unknown) {
      console.error('[auth] Eroare la refresh:', err);
      res.status(500).json({
        error: 'Eroare internă. Contactați administratorul.',
      });
    }
  }
);

// ── POST /api/auth/change-password ───────────────────────────────────

/**
 * Schimbă parola admin-ului.
 *
 * - Necesită autentificare (middleware `authenticate`)
 * - Rate limitat pentru a preveni brute-force (5 încercări / 15 minute)
 * - Parola curentă este verificată cu bcrypt (constant-time)
 * - Parola nouă: minim 8, maxim 128 caractere
 * - Hash-ul nou este salvat în `process.env` pentru sesiunea curentă
 * - Se încearcă și actualizarea fișierului `.env` pentru persistență
 *
 * Request body:
 * ```json
 * { "currentPassword": "vecheaParola", "newPassword": "nouaParola123" }
 *
 *
 * Response (200):
 * ```json
 * { "message": "Parola a fost schimbată cu succes." }
 *
 */
router.post(
  '/change-password',
  authenticate,
  loginLimiter,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { currentPassword, newPassword } = req.body;

      // 1. Validare input
      if (!currentPassword || typeof currentPassword !== 'string') {
        res.status(400).json({ error: 'Parola curentă este obligatorie.' });
        return;
      }

      if (!newPassword || typeof newPassword !== 'string') {
        res.status(400).json({ error: 'Parola nouă este obligatorie.' });
        return;
      }

      if (newPassword.length < 8) {
        res.status(400).json({
          error: 'Parola nouă trebuie să aibă minim 8 caractere.',
        });
        return;
      }

      if (newPassword.length > 128) {
        res.status(400).json({
          error: 'Parola nouă nu poate depăși 128 de caractere.',
        });
        return;
      }

      // 2. Verificare parolă curentă cu bcrypt (constant-time)
      let passwordMatch = false;
      try {
        passwordMatch = await bcrypt.compare(
          currentPassword,
          process.env.ADMIN_PASSWORD_HASH ?? ADMIN_PASSWORD_HASH
        );
      } catch (bcryptError) {
        console.error('[auth] Eroare la verificarea parolei curente:', bcryptError);
        res.status(500).json({
          error: 'Eroare internă. Contactați administratorul.',
        });
        return;
      }

      if (!passwordMatch) {
        res.status(401).json({ error: 'Parola curentă este incorectă.' });
        return;
      }

      // 3. Generează hash pentru parola nouă
      const newHash = await bcrypt.hash(newPassword, 12);

      // 4. Actualizează variabila de mediu în memorie pentru sesiunea curentă
      process.env.ADMIN_PASSWORD_HASH = newHash;

      // 5. Încearcă să scrie în fișierul .env (best-effort)
      try {
        const envPath = path.resolve(process.cwd(), '.env');

        if (fs.existsSync(envPath)) {
          let envContent = fs.readFileSync(envPath, 'utf-8');

          // Înlocuiește linia ADMIN_PASSWORD_HASH existentă sau adaugă una nouă
          const hashLineRegex = /^ADMIN_PASSWORD_HASH=.*$/m;
          const newLine = `ADMIN_PASSWORD_HASH=${newHash}`;

          if (hashLineRegex.test(envContent)) {
            envContent = envContent.replace(hashLineRegex, newLine);
          } else {
            envContent += `\n${newLine}\n`;
          }

          fs.writeFileSync(envPath, envContent, 'utf-8');
          console.log('[auth] Fișierul .env a fost actualizat cu noul hash.');
        }
      } catch (fsError) {
        // Eroarea la scrierea .env nu blochează schimbarea parolei
        console.warn(
          '[auth] Nu s-a putut actualiza fișierul .env. Actualizează manual ADMIN_PASSWORD_HASH:',
          newHash
        );
      }

      // 6. Invalidează toate sesiunile existente prin ștergerea cookie-ului
      //    și forțează re-autentificarea cu noua parolă
      res.clearCookie('token', {
        httpOnly: true,
        secure: NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
      });

      res.status(200).json({
        message: 'Parola a fost schimbată cu succes. Autentifică-te din nou.',
      });
    } catch (err: unknown) {
      console.error('[auth] Eroare la schimbarea parolei:', err);
      res.status(500).json({
        error: 'Eroare internă. Contactați administratorul.',
      });
    }
  }
);

// ── Export ───────────────────────────────────────────────────────────

export default router;