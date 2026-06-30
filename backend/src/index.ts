import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';

// Încarcă variabilele de mediu înainte de orice
dotenv.config();

// Importă rutele
import authRoutes from './routes/auth';
import messagesRoutes from './routes/messages';
import settingsRoutes from './routes/settings';

// Importă middleware-ul global
import { generalLimiter } from './middleware/rateLimiter';
import { sanitizeBody } from './middleware/validation';

// Importă seed-ul și baza de date
import { isSeeded, runSeed } from './utils/seed';
import { closeDatabase } from './database';

// ── Configurare variabile de mediu ──────────────────────────────────────

const PORT = parseInt(process.env.PORT ?? '3001', 10);
const NODE_ENV = process.env.NODE_ENV ?? 'development';
const FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:3000';

const app = express();

// ── 1. Trust Proxy ──────────────────────────────────────────────────────

/**
 * Activează încrederea în proxy-ul invers (nginx, Cloudflare, etc.).
 *
 * Setat la `1` pentru că proxy-ul de obicei este primul hop.
 * Esențial pentru:
 *  - Citirea corectă a IP-ului real (`req.ip`) din `X-Forwarded-For`
 *  - Detectarea protocolului corect (HTTP / HTTPS) din `X-Forwarded-Proto`
 *  - Funcționarea corectă a rate limiter-elor care folosesc IP-ul
 */
app.set('trust proxy', 1);

// ── 2. Helmet cu Content Security Policy ────────────────────────────────

/**
 * Configurare CSP strictă pentru a preveni XSS, clickjacking,
 * code injection și alte atacuri bazate pe conținut.
 *
 * Resursele sunt permise doar din surse explicit enumerate.
 */
const cspDirectives: Record<string, string[] | null> = {
  // Fallback pentru directivele nespecificate
  'default-src': ["'self'"],

  // Script-uri: doar origine + unsafe-inline (necesar pentru bundlere)
  //   NOTĂ: unsafe-inline este necesar pentru script-uri generate de
  //   framework-uri precum Next.js / React. În producție se recomandă
  //   migrarea către nonce-uri sau hash-uri.
  'script-src': [
    "'self'",
    "'unsafe-inline'",
    FRONTEND_URL,
  ],

  // Stiluri: origine + inline + CDN-uri externe (Font Awesome, Google Fonts)
  'style-src': [
    "'self'",
    "'unsafe-inline'",
    'https://cdnjs.cloudflare.com',
    'https://fonts.googleapis.com',
  ],

  // Fonturi: origine + Google Fonts + CDN
  'font-src': [
    "'self'",
    'https://fonts.gstatic.com',
    'https://cdnjs.cloudflare.com',
  ],

  // Imagini: origine + data URI-uri + orice sursă HTTPS/HTTP
  //   Permite imagini dinamice (ex: imagini de la Pexels, upload-uri)
  'img-src': ["'self'", 'data:', 'https:', 'http:'],

  // Media: video / audio din surse externe (ex: Pexels video)
  'media-src': ["'self'", 'https:', 'http:'],

  // Conexiuni fetch / XHR / WebSocket: origine + frontend + API-uri externe
  'connect-src': [
    "'self'",
    FRONTEND_URL,
    'https://api.pexels.com',
    'https://images.pexels.com',
  ],

  // Frame-uri: doar aceeași origine
  'frame-src': ["'self'"],

  // Obiecte: none (previne Flash, Java, ActiveX)
  'object-src': ["'none'"],

  // Tag-ul <base>: doar aceeași origine
  'base-uri': ["'self'"],

  // Acțiuni formular: doar aceeași origine
  'form-action': ["'self'"],

  // Cine poate încadra această pagină într-un frame
  'frame-ancestors': ["'self'"],
};

app.use(
  helmet({
    // ── Content Security Policy ──────────────────────────────────────
    contentSecurityPolicy: {
      directives: cspDirectives,
    },

    // ── X-Frame-Options ──────────────────────────────────────────────
    // DENY = pagina nu poate fi afișată într-un frame deloc
    frameguard: { action: 'deny' },

    // ── X-Content-Type-Options ───────────────────────────────────────
    // Previne MIME type sniffing
    noSniff: true,

    // ── X-XSS-Protection ─────────────────────────────────────────────
    // Activează filtrul XSS al browser-ului (pentru browsere vechi)
    xssFilter: true,

    // ── Referrer-Policy ──────────────────────────────────────────────
    // Trimite referrer doar pentru aceeași origine; cross-origin trimite
    // doar originea (nu path-ul)
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },

    // ── Strict-Transport-Security (doar producție) ───────────────────
    ...(NODE_ENV === 'production'
      ? {
          hsts: {
            maxAge: 31536000, // 1 an
            includeSubDomains: true,
            preload: true,
          },
        }
      : {}),

    // ── Permissions-Policy ───────────────────────────────────────────
    // Restricționează API-urile browser-ului
    permissionsPolicy: {
      features: {
        camera: ["'none'"],
        microphone: ["'none'"],
        geolocation: ["'none'"],
        payment: ["'self'"],
        usb: ["'none'"],
        fullscreen: ["'self'"],
      },
    },
  })
);

// ── 3. CORS ─────────────────────────────────────────────────────────────

/**
 * Configurare CORS strictă:
 *  - Permite doar originile explicit listate
 *  - Permite credențiale (cookie-uri, Authorization header)
 *  - Expune headerele de rate limiting
 *  - Cache-uiește preflight pentru 24 de ore
 */
app.use(
  cors({
    origin: (origin, callback) => {
      // Permite cereri fără origin (curl, Postman, aplicații mobile, server-to-server)
      if (!origin) {
        return callback(null, true);
      }

      // Lista albă de origini permise
      const allowedOrigins = [
        FRONTEND_URL,
        'http://localhost:3000',
        'http://localhost:3001',
      ];

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`[cors] Origine blocată: ${origin}`);
        callback(new Error('Origine nepermisă de CORS.'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
    ],
    exposedHeaders: [
      'RateLimit-Limit',
      'RateLimit-Remaining',
      'RateLimit-Reset',
    ],
    maxAge: 86400, // 24 ore cache preflight
  })
);

// ── 4. Cookie Parser ────────────────────────────────────────────────────

/**
 * Parsează cookie-urile din header-ul `Cookie`.
 *
 * Esențial pentru middleware-ul de autentificare care citește
 * token-ul JWT din cookie-ul HttpOnly `token`.
 */
app.use(cookieParser());

// ── Parsare Body ────────────────────────────────────────────────────────

/**
 * Parsează body-ul cererilor JSON și URL-encoded.
 *
 * Limitat la 1 MB pentru a preveni atacuri de tip DoS
 * prin trimiterea unor payload-uri extrem de mari.
 */
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ── Sanitizare Globală Body ─────────────────────────────────────────────

/**
 * Sanitizează toate string-urile din req.body (best-effort).
 *
 * Elimină HTML, caractere invizibile, caractere de control.
 * Nu respinge cererea – doar curăță datele.
 */
app.use(sanitizeBody);

// ── Rate Limiter Global ─────────────────────────────────────────────────

/**
 * Aplică rate limiting pe toate rutele `/api`.
 *
 * 100 de request-uri per 15 minute per IP.
 * Rutele de autentificare au limitări suplimentare mai stricte
 * (5 încercări / 15 minute) prin middleware-ul `loginLimiter`.
 */
app.use('/api', generalLimiter);

// ── Rute API ────────────────────────────────────────────────────────────

app.use('/api/auth', authRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/settings', settingsRoutes);

// ── Health Check ────────────────────────────────────────────────────────

/**
 * Endpoint de health check pentru monitorizare.
 *
 * Returnează statusul serverului, timestamp-ul, mediul și uptime-ul.
 * Util pentru:
 *  - Load balancers (verificare dacă serverul este alive)
 *  - Monitorizare (UptimeRobot, Datadog etc.)
 *  - Depanare rapidă
 */
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    uptime: process.uptime(),
  });
});

// ── Servire Fișiere Statice (Frontend în producție) ─────────────────────

/**
 * În producție, servește frontend-ul compilat din directorul `frontend/dist`.
 *
 * Orice rută care nu începe cu `/api/` este tratată ca rută SPA
 * și returnează `index.html` (fallback pentru client-side routing).
 */
if (NODE_ENV === 'production') {
  const frontendPath = path.resolve(__dirname, '..', '..', 'frontend', 'dist');

  app.use(express.static(frontendPath));

  // SPA fallback
  app.get(/^\/(?!api\/).*/, (_req: Request, res: Response) => {
    res.sendFile(path.join(frontendPath, 'index.html'), (err) => {
      if (err) {
        res.status(404).json({ error: 'Pagina nu a fost găsită.' });
      }
    });
  });
}

// ── 404 Handler ─────────────────────────────────────────────────────────

/**
 * Prinde orice cerere care nu a fost rutată de handler-ele anterioare.
 */
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Ruta nu a fost găsită.' });
});

// ── 5. Error Handling Generic ───────────────────────────────────────────

/**
 * Interfață extinsă pentru erori cu proprietăți suplimentare.
 */
interface AppError extends Error {
  status?: number;
  code?: string;
  details?: unknown;
}

/**
 * Handler global de erori Express (4 parametri = error handler).
 *
 * Prinde orice eroare aruncată sau propagată din middleware-uri / rute.
 *
 * În producție: mesaj generic, fără stack trace sau detalii interne.
 * În dezvoltare: mesaj complet + stack trace pentru depanare.
 */
app.use(
  (
    err: AppError,
    _req: Request,
    res: Response,
    _next: NextFunction
  ): void => {
    // Log intern complet pentru depanare
    console.error('[error]', {
      message: err.message,
      stack: err.stack,
      status: err.status,
      code: err.code,
      timestamp: new Date().toISOString(),
    });

    const status = err.status ?? 500;

    const message =
      NODE_ENV === 'production'
        ? 'Eroare internă a serverului. Contactați administratorul.'
        : err.message || 'Eroare internă a serverului.';

    res.status(status).json({
      error: message,
      ...(NODE_ENV !== 'production' && {
        stack: err.stack,
        code: err.code,
      }),
    });
  }
);

// ── 6. Pornire Server ───────────────────────────────────────────────────

/**
 * Pornește serverul Express.
 *
 * La prima pornire, dacă baza de date nu conține setările implicite,
 * rulează automat seed-ul (inserare setări + generare hash parolă admin).
 */
async function startServer(): Promise<void> {
  try {
    // Inițializare bază de date (seed) dacă este necesar
    if (!isSeeded()) {
      console.log('[server] Baza de date nu este inițializată. Rulez seed-ul...');
      await runSeed();
    } else {
      console.log('[server] Baza de date este deja inițializată.');
    }

    app.listen(PORT, () => {
      console.log('═══════════════════════════════════════════');
      console.log('  Nexus Dev Studio — API Server');
      console.log(`  Port:      ${PORT}`);
      console.log(`  Mediu:     ${NODE_ENV}`);
      console.log(`  Frontend:  ${FRONTEND_URL}`);
      console.log(`  Health:    http://localhost:${PORT}/api/health`);
      console.log('═══════════════════════════════════════════');
    });
  } catch (err: unknown) {
    console.error('[server] Eroare critică la pornirea serverului:', err);
    process.exit(1);
  }
}

// ── Graceful Shutdown ───────────────────────────────────────────────────

/**
 * Închide resursele și oprește serverul într-un mod controlat.
 *
 * Se execută la primirea semnalelor:
 *  - SIGINT  (Ctrl+C)
 *  - SIGTERM (kill / container stop)
 */
function gracefulShutdown(signal: string): void {
  console.log(`\n[server] Primit ${signal}. Închidere grațioasă...`);

  try {
    closeDatabase();
    console.log('[server] Baza de date a fost închisă.');
  } catch (err: unknown) {
    console.error('[server] Eroare la închiderea bazei de date:', err);
  }

  console.log('[server] Server oprit.');
  process.exit(0);
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// ── Erori Globale Neprevăzute ───────────────────────────────────────────

/**
 * Prinde excepțiile sincrone nearse (bugs grave).
 *
 * Închide baza de date și oprește procesul pentru a evita
 * stări inconsistente.
 */
process.on('uncaughtException', (err: Error) => {
  console.error('[server] Uncaught Exception:', err);
  try {
    closeDatabase();
  } catch {
    // ignoră
  }
  process.exit(1);
});

/**
 * Prinde Promise rejections fără handler.
 *
 * Loghează eroarea, dar nu oprește serverul — aceste erori
 * pot fi tranzitorii (ex: o cerere către un API extern a eșuat).
 */
process.on('unhandledRejection', (reason: unknown) => {
  console.error('[server] Unhandled Rejection:', reason);
});

// ── Pornire ─────────────────────────────────────────────────────────────

startServer();

export default app;