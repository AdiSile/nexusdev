import { Router, Request, Response } from 'express';
import {
  insertMessage,
  getAllMessages,
  getUnreadMessages,
  getMessageById,
  markMessageRead,
  deleteMessage,
} from '../database';
import { authenticate } from '../middleware/auth';
import { createRateLimiter } from '../middleware/rateLimiter';
import { validate, sanitize } from '../middleware/validation';

// ── Tipuri ───────────────────────────────────────────────────────────

/**
 * Payload-ul așteptat la trimiterea unui mesaj de contact.
 */
interface ContactMessagePayload {
  name: string;
  email: string;
  phone?: string | null;
  message: string;
}

/**
 * DTO pentru răspunsul public al unui mesaj (fără date interne).
 */
interface MessagePublicResponse {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  created_at: string;
}

/**
 * DTO pentru răspunsul admin al unui mesaj (include `read`).
 */
interface MessageAdminResponse extends MessagePublicResponse {
  read: boolean;
}

// ── Router ───────────────────────────────────────────────────────────

const router = Router();

// ── Rate Limiter pentru mesaje contact ───────────────────────────────

/**
 * Rate limiter pentru ruta publică de contact.
 *
 * Maxim 3 mesaje per oră per IP. Previne spam-ul și abuzul
 * formularului de contact fără a bloca utilizatorii legitimi.
 */
const contactLimiter = createRateLimiter({
  maxAttempts: 3,
  windowMinutes: 60,
  message: 'Prea multe mesaje trimise. Maxim 3 mesaje pe oră. Încearcă din nou mai târziu.',
});

// ── Validare formular contact ───────────────────────────────────────

/**
 * Middleware de validare specific pentru formularul de contact.
 *
 * Validează: name (nume), email, phone (opțional), message (text, 10-5000).
 * Sanitizarea se face automat de middleware-ul `validate`.
 */
const validateMessage = validate([
  { field: 'name', type: 'name', label: 'Nume', min: 1, max: 128 },
  { field: 'email', type: 'email', label: 'Email' },
  { field: 'phone', type: 'phone', label: 'Telefon', required: false },
  { field: 'message', type: 'text', label: 'Mesaj', min: 10, max: 5000 },
]);

// ── POST /api/messages (public, rate limitat) ───────────────────────

/**
 * Trimite un mesaj de contact.
 *
 * Ruta este **publică** – oricine poate trimite un mesaj.
 * Este protejată prin rate limiting: maxim 3 mesaje / oră / IP.
 *
 * Toate câmpurile string sunt sanitizate automat de middleware-ul
 * de validare (HTML eliminat, caractere invizibile eliminate,
 * normalizare Unicode NFC).
 *
 * Request body:
 * ```json
 * {
 *   "name": "Ion Popescu",
 *   "email": "ion@example.com",
 *   "phone": "+40712345678",
 *   "message": "Salut, sunt interesat de un site de prezentare."
 * }
 *
 *
 * Response (201):
 * ```json
 * {
 *   "message": "Mesajul a fost trimis cu succes.",
 *   "data": {
 *     "id": 1,
 *     "name": "Ion Popescu",
 *     "email": "ion@example.com",
 *     "phone": "+40712345678",
 *     "message": "Salut, sunt interesat de un site de prezentare.",
 *     "created_at": "2026-01-15T10:30:00.000Z"
 *   }
 * }
 *
 *
 * Response (400): eroare de validare
 * Response (429): rate limit depășit
 */
router.post(
  '/',
  contactLimiter,
  validateMessage,
  (req: Request, res: Response): void => {
    try {
      const { name, email, phone, message } = req.body as ContactMessagePayload;

      // Sanitizare suplimentară best-effort pentru orice edge case
      const sanitizedName = sanitize(name);
      const sanitizedEmail = sanitize(email).toLowerCase().replace(/\s+/g, '');
      const sanitizedPhone = phone ? sanitize(phone).replace(/[^\d\s\-+().]/g, '') : null;
      const sanitizedMessage = sanitize(message);

      // Verificare finală că după sanitizare câmpurile nu sunt goale
      if (sanitizedName.length === 0 || sanitizedEmail.length === 0 || sanitizedMessage.length < 10) {
        res.status(400).json({
          error: 'Datele introduse sunt invalide. Verifică câmpurile și încearcă din nou.',
        });
        return;
      }

      // Inserează mesajul în baza de date
      const row = insertMessage({
        name: sanitizedName,
        email: sanitizedEmail,
        phone: sanitizedPhone,
        message: sanitizedMessage,
      });

      // Construiește răspunsul public (fără câmpul `read`)
      const response: MessagePublicResponse = {
        id: row.id,
        name: row.name,
        email: row.email,
        phone: row.phone,
        message: row.message,
        created_at: row.created_at,
      };

      res.status(201).json({
        message: 'Mesajul a fost trimis cu succes.',
        data: response,
      });
    } catch (err: unknown) {
      console.error('[messages] Eroare la POST /api/messages:', err);
      res.status(500).json({
        error: 'Eroare internă. Contactați administratorul.',
      });
    }
  }
);

// ── GET /api/messages (admin) ───────────────────────────────────────

/**
 * Returnează toate mesajele de contact (admin only).
 *
 * **Necesită autentificare** (middleware `authenticate`).
 *
 * Suportă query parameter opțional:
 * - `?unread=true` – returnează doar mesajele necitite
 *
 * Mesajele sunt ordonate descrescător după data creării
 * (cele mai recente primele).
 *
 * Response (200):
 * ```json
 * {
 *   "data": [
 *     {
 *       "id": 1,
 *       "name": "Ion Popescu",
 *       "email": "ion@example.com",
 *       "phone": "+40712345678",
 *       "message": "Salut, sunt interesat...",
 *       "created_at": "2026-01-15T10:30:00.000Z",
 *       "read": false
 *     }
 *   ],
 *   "total": 1,
 *   "unread": 1
 * }
 *
 *
 * Response (401): neautentificat
 * Response (403): rol insuficient
 */
router.get(
  '/',
  authenticate,
  (req: Request, res: Response): void => {
    try {
      const unreadOnly = req.query.unread === 'true';

      // Obține mesajele filtrate
      const rows = unreadOnly ? getUnreadMessages() : getAllMessages();

      // Numără totalul și necititele (din toate mesajele, nu doar filtrate)
      const allMessages = getAllMessages();
      const totalCount = allMessages.length;
      const unreadCount = allMessages.filter((m) => m.read === 0).length;

      // Mapează la DTO-ul admin (cu `read` ca boolean)
      const data: MessageAdminResponse[] = rows.map((row) => ({
        id: row.id,
        name: row.name,
        email: row.email,
        phone: row.phone,
        message: row.message,
        created_at: row.created_at,
        read: row.read === 1,
      }));

      res.status(200).json({
        data,
        total: totalCount,
        unread: unreadCount,
      });
    } catch (err: unknown) {
      console.error('[messages] Eroare la GET /api/messages:', err);
      res.status(500).json({
        error: 'Eroare internă. Contactați administratorul.',
      });
    }
  }
);

// ── GET /api/messages/:id (admin) ───────────────────────────────────

/**
 * Returnează un singur mesaj după ID (admin only).
 *
 * **Necesită autentificare** (middleware `authenticate`).
 *
 * Response (200):
 * ```json
 * {
 *   "data": {
 *     "id": 1,
 *     "name": "Ion Popescu",
 *     "email": "ion@example.com",
 *     "phone": "+40712345678",
 *     "message": "Salut, sunt interesat...",
 *     "created_at": "2026-01-15T10:30:00.000Z",
 *     "read": false
 *   }
 * }
 *
 *
 * Response (404): mesajul nu există
 * Response (401): neautentificat
 */
router.get(
  '/:id',
  authenticate,
  (req: Request, res: Response): void => {
    try {
      const id = parseInt(req.params.id, 10);

      if (isNaN(id) || id < 1) {
        res.status(400).json({ error: 'ID-ul mesajului nu este valid.' });
        return;
      }

      const row = getMessageById(id);

      if (!row) {
        res.status(404).json({ error: 'Mesajul nu a fost găsit.' });
        return;
      }

      const data: MessageAdminResponse = {
        id: row.id,
        name: row.name,
        email: row.email,
        phone: row.phone,
        message: row.message,
        created_at: row.created_at,
        read: row.read === 1,
      };

      res.status(200).json({ data });
    } catch (err: unknown) {
      console.error('[messages] Eroare la GET /api/messages/:id:', err);
      res.status(500).json({
        error: 'Eroare internă. Contactați administratorul.',
      });
    }
  }
);

// ── PATCH /api/messages/:id/read (admin) ────────────────────────────

/**
 * Marchează un mesaj ca citit (admin only).
 *
 * **Necesită autentificare** (middleware `authenticate`).
 *
 * Operația este idempotentă: dacă mesajul este deja citit,
 * se returnează succes fără eroare.
 *
 * Response (200):
 * ```json
 * {
 *   "message": "Mesajul a fost marcat ca citit.",
 *   "data": {
 *     "id": 1,
 *     "read": true
 *   }
 * }
 *
 *
 * Response (404): mesajul nu există
 * Response (401): neautentificat
 */
router.patch(
  '/:id/read',
  authenticate,
  (req: Request, res: Response): void => {
    try {
      const id = parseInt(req.params.id, 10);

      if (isNaN(id) || id < 1) {
        res.status(400).json({ error: 'ID-ul mesajului nu este valid.' });
        return;
      }

      // Verifică existența mesajului
      const existing = getMessageById(id);
      if (!existing) {
        res.status(404).json({ error: 'Mesajul nu a fost găsit.' });
        return;
      }

      // Marchează ca citit (idempotent)
      markMessageRead(id);

      res.status(200).json({
        message: 'Mesajul a fost marcat ca citit.',
        data: {
          id,
          read: true,
        },
      });
    } catch (err: unknown) {
      console.error('[messages] Eroare la PATCH /api/messages/:id/read:', err);
      res.status(500).json({
        error: 'Eroare internă. Contactați administratorul.',
      });
    }
  }
);

// ── DELETE /api/messages/:id (admin) ────────────────────────────────

/**
 * Șterge un mesaj de contact (admin only).
 *
 * **Necesită autentificare** (middleware `authenticate`).
 *
 * Ștergerea este definitivă. Nu există coș de gunoi sau soft-delete.
 *
 * Response (200):
 * ```json
 * {
 *   "message": "Mesajul a fost șters cu succes.",
 *   "data": { "id": 1 }
 * }
 *
 *
 * Response (404): mesajul nu există
 * Response (401): neautentificat
 */
router.delete(
  '/:id',
  authenticate,
  (req: Request, res: Response): void => {
    try {
      const id = parseInt(req.params.id, 10);

      if (isNaN(id) || id < 1) {
        res.status(400).json({ error: 'ID-ul mesajului nu este valid.' });
        return;
      }

      const deleted = deleteMessage(id);

      if (!deleted) {
        res.status(404).json({ error: 'Mesajul nu a fost găsit.' });
        return;
      }

      res.status(200).json({
        message: 'Mesajul a fost șters cu succes.',
        data: { id },
      });
    } catch (err: unknown) {
      console.error('[messages] Eroare la DELETE /api/messages/:id:', err);
      res.status(500).json({
        error: 'Eroare internă. Contactați administratorul.',
      });
    }
  }
);

// ── Export ───────────────────────────────────────────────────────────

export default router;