// ═══════════════════════════════════════════════════════════════
// API CLIENT — Nexus Dev Studio
// Funcții fetch tipizate, error handling, tipuri TypeScript
// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
// CONFIGURARE
// ═══════════════════════════════════════════════════════════════

const BASE_URL: string =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

const DEFAULT_TIMEOUT_MS = 15_000;
const DEFAULT_RETRIES = 2;
const RETRY_DELAY_MS = 800;

const COOKIE_NAME = "admin_token";

// ═══════════════════════════════════════════════════════════════
// TIPURI GENERALE
//
// Re-exportate din @/types pentru centralizare.
// ═══════════════════════════════════════════════════════════════

export {
  ApiResponse,
  type FetchOptions,
  ApiError,
  type FetchMeta,
} from "@/types";

// ═══════════════════════════════════════════════════════════════
// TIPURI ENTITATI
//
// Toate tipurile sunt definite centralizat în @/types și
// re-exportate aici pentru compatibilitate.
// ═══════════════════════════════════════════════════════════════

export type {
  // Setări site
  SiteSettings,
  FooterLink,
  AppSettings,
  SEOSettings,
  HeroSettings,
  ContactSettings,
  FooterSettings,

  // Servicii
  ServiceCategory,
  ServiceItem,
  ServicePayload,

  // Proces
  ProcessStep,
  ProcessStepPayload,

  // FAQ
  FaqCategory,
  FaqItem,
  FaqItemPayload,

  // Portofoliu
  PortfolioProject,
  PortfolioProjectPayload,

  // Mesaje Contact
  ContactMessage,
  ContactMessagePayload,

  // Admin
  AdminUser,
  AdminLoginPayload,
  AdminLoginResponse,

  // Health
  HealthCheckResponse,
} from "@/types";

// ═══════════════════════════════════════════════════════════════
// UTILITARE
// ═══════════════════════════════════════════════════════════════

/**
 * Citeste JWT-ul din cookie.
 */
function getAuthToken(): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${COOKIE_NAME}=`);
  if (parts.length === 2) {
    const raw = parts.pop()?.split(";").shift();
    return raw ? decodeURIComponent(raw) : null;
  }
  return null;
}

/**
 * Intarziere asincrona (pentru retry).
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Serializeaza body-ul pentru fetch.
 */
function serializeBody(
  body: BodyInit | Record<string, unknown> | null | undefined
): BodyInit | null {
  if (body === null || body === undefined) return null;
  if (
    typeof body === "string" ||
    body instanceof FormData ||
    body instanceof Blob
  ) {
    return body;
  }
  return JSON.stringify(body);
}

// ═══════════════════════════════════════════════════════════════
// FETCH WRAPPER CENTRAL
// ═══════════════════════════════════════════════════════════════

/**
 * Functia centrala de fetch cu:
 *  - timeout
 *  - retry automat (exponential backoff)
 *  - header Authorization automat
 *  - parsing JSON unificat
 *  - ApiError structurat
 */
export async function apiFetch<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<ApiResponse<T>> {
  const {
    timeout = DEFAULT_TIMEOUT_MS,
    retries = DEFAULT_RETRIES,
    auth = false,
    headers: extraHeaders,
    body,
    ...restOptions
  } = options;

  const url = endpoint.startsWith("http")
    ? endpoint
    : `${BASE_URL}${endpoint}`;
  const method = restOptions.method ?? "GET";
  const start = performance.now();
  let lastError: ApiError | null = null;
  let retriesUsed = 0;

  // Construim headers o singura data (nu se schimba intre retry-uri)
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(extraHeaders as Record<string, string>),
  };

  // Content-Type automat pentru JSON (nu pentru FormData)
  if (!(body instanceof FormData) && body !== null && body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  // Authorization header
  if (auth) {
    const token = getAuthToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const serializedBody = serializeBody(body);

  // Bucla retry
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...restOptions,
        method,
        headers,
        body: serializedBody,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const durationMs = Math.round(performance.now() - start);

      // Parseaza JSON (chiar si pentru erori, serverul poate returna detalii)
      let json: unknown = null;
      const contentType = response.headers.get("content-type") ?? "";
      if (contentType.includes("application/json")) {
        try {
          json = await response.json();
        } catch {
          // Raspuns non-JSON in ciuda content-type
        }
      }

      if (!response.ok) {
        const errorMessage =
          (json as Record<string, unknown>)?.message as string | undefined ??
          (json as Record<string, unknown>)?.error as string | undefined ??
          `Eroare server (${response.status})`;

        const errorCode =
          (json as Record<string, unknown>)?.code as string | undefined ??
          `HTTP_${response.status}`;

        const meta: FetchMeta = {
          url,
          method,
          status: response.status,
          durationMs,
          retriesUsed: attempt,
          timestamp: new Date().toISOString(),
        };

        if (process.env.NODE_ENV === "development") {
          console.error("[ApiError]", errorCode, meta);
        }

        return {
          data: null,
          error: errorMessage,
          status: response.status,
          ok: false,
        };
      }

      // Succes
      return {
        data: json as T,
        error: null,
        status: response.status,
        ok: true,
      };
    } catch (err: unknown) {
      retriesUsed = attempt;

      if (err instanceof DOMException && err.name === "AbortError") {
        lastError = new ApiError(
          `Timeout: cererea a depasit ${timeout}ms`,
          408,
          "TIMEOUT"
        );
      } else if (err instanceof TypeError) {
        // Network error (CORS, no internet, etc.)
        lastError = new ApiError(
          "Eroare de retea. Verifica conexiunea la internet.",
          0,
          "NETWORK_ERROR",
          err
        );
      } else if (err instanceof ApiError) {
        lastError = err;
      } else {
        lastError = new ApiError(
          err instanceof Error ? err.message : "Eroare necunoscuta",
          0,
          "UNKNOWN_ERROR",
          err
        );
      }

      // Nu retry la erori 4xx (client errors)
      if (lastError.status >= 400 && lastError.status < 500) {
        break;
      }

      // Ultima incercare — nu mai asteptam
      if (attempt < retries) {
        const backoffMs = RETRY_DELAY_MS * Math.pow(2, attempt);
        await delay(backoffMs);
      }
    }
  }

  // Toate retry-urile au esuat
  const durationMs = Math.round(performance.now() - start);
  const meta: FetchMeta = {
    url,
    method,
    status: lastError?.status ?? 0,
    durationMs,
    retriesUsed,
    timestamp: new Date().toISOString(),
  };

  if (process.env.NODE_ENV === "development") {
    console.error("[ApiError - final]", lastError?.toString(), meta);
  }

  return {
    data: null,
    error: lastError?.message ?? "Eroare necunoscuta",
    status: lastError?.status ?? 0,
    ok: false,
  };
}

// ═══════════════════════════════════════════════════════════════
// ENDPOINT-URI: SETARI SITE
// ═══════════════════════════════════════════════════════════════

/**
 * Obtine setarile complete ale site-ului.
 * GET /api/settings
 */
export async function fetchSettings(): Promise<ApiResponse<SiteSettings>> {
  return apiFetch<SiteSettings>("/api/settings", {
    method: "GET",
    timeout: 10_000,
    retries: 1,
  });
}

/**
 * Salveaza setarile site-ului (necesita auth).
 * PUT /api/settings
 */
export async function updateSettings(
  payload: Partial<SiteSettings>
): Promise<ApiResponse<SiteSettings>> {
  return apiFetch<SiteSettings>("/api/settings", {
    method: "PUT",
    body: payload,
    auth: true,
    timeout: 20_000,
  });
}

// ═══════════════════════════════════════════════════════════════
// ENDPOINT-URI: SERVICII
// ═══════════════════════════════════════════════════════════════

/**
 * Obtine lista completa de servicii.
 * GET /api/services
 */
export async function fetchServices(): Promise<ApiResponse<ServiceItem[]>> {
  return apiFetch<ServiceItem[]>("/api/services", {
    method: "GET",
    timeout: 10_000,
    retries: 1,
  });
}

/**
 * Obtine un serviciu dupa ID.
 * GET /api/services/:id
 */
export async function fetchServiceById(
  id: string
): Promise<ApiResponse<ServiceItem>> {
  return apiFetch<ServiceItem>(`/api/services/${encodeURIComponent(id)}`, {
    method: "GET",
    timeout: 10_000,
  });
}

/**
 * Creeaza un serviciu nou (necesita auth).
 * POST /api/services
 */
export async function createService(
  payload: ServicePayload
): Promise<ApiResponse<ServiceItem>> {
  return apiFetch<ServiceItem>("/api/services", {
    method: "POST",
    body: payload,
    auth: true,
    timeout: 15_000,
  });
}

/**
 * Actualizeaza un serviciu existent (necesita auth).
 * PUT /api/services/:id
 */
export async function updateService(
  id: string,
  payload: Partial<ServicePayload>
): Promise<ApiResponse<ServiceItem>> {
  return apiFetch<ServiceItem>(`/api/services/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: payload,
    auth: true,
    timeout: 15_000,
  });
}

/**
 * Sterge un serviciu (necesita auth).
 * DELETE /api/services/:id
 */
export async function deleteService(
  id: string
): Promise<ApiResponse<{ deleted: boolean }>> {
  return apiFetch<{ deleted: boolean }>(
    `/api/services/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      auth: true,
      timeout: 10_000,
    }
  );
}

// ═══════════════════════════════════════════════════════════════
// ENDPOINT-URI: PROCES (CUM LUCRAM)
// ═══════════════════════════════════════════════════════════════

/**
 * Obtine lista pasilor de proces.
 * GET /api/process
 */
export async function fetchProcessSteps(): Promise<
  ApiResponse<ProcessStep[]>
> {
  return apiFetch<ProcessStep[]>("/api/process", {
    method: "GET",
    timeout: 10_000,
    retries: 1,
  });
}

/**
 * Creeaza un pas de proces (necesita auth).
 * POST /api/process
 */
export async function createProcessStep(
  payload: ProcessStepPayload
): Promise<ApiResponse<ProcessStep>> {
  return apiFetch<ProcessStep>("/api/process", {
    method: "POST",
    body: payload,
    auth: true,
    timeout: 15_000,
  });
}

/**
 * Actualizeaza un pas de proces (necesita auth).
 * PUT /api/process/:id
 */
export async function updateProcessStep(
  id: string,
  payload: Partial<ProcessStepPayload>
): Promise<ApiResponse<ProcessStep>> {
  return apiFetch<ProcessStep>(`/api/process/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: payload,
    auth: true,
    timeout: 15_000,
  });
}

/**
 * Sterge un pas de proces (necesita auth).
 * DELETE /api/process/:id
 */
export async function deleteProcessStep(
  id: string
): Promise<ApiResponse<{ deleted: boolean }>> {
  return apiFetch<{ deleted: boolean }>(
    `/api/process/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      auth: true,
      timeout: 10_000,
    }
  );
}

/**
 * Reordoneaza pasii de proces (necesita auth).
 * PUT /api/process/reorder
 */
export async function reorderProcessSteps(
  orderedIds: string[]
): Promise<ApiResponse<ProcessStep[]>> {
  return apiFetch<ProcessStep[]>("/api/process/reorder", {
    method: "PUT",
    body: { orderedIds },
    auth: true,
    timeout: 15_000,
  });
}

// ═══════════════════════════════════════════════════════════════
// ENDPOINT-URI: FAQ
// ═══════════════════════════════════════════════════════════════

/**
 * Obtine lista de FAQ-uri.
 * GET /api/faq
 */
export async function fetchFaq(): Promise<ApiResponse<FaqItem[]>> {
  return apiFetch<FaqItem[]>("/api/faq", {
    method: "GET",
    timeout: 10_000,
    retries: 1,
  });
}

/**
 * Creeaza o intrebare FAQ (necesita auth).
 * POST /api/faq
 */
export async function createFaqItem(
  payload: FaqItemPayload
): Promise<ApiResponse<FaqItem>> {
  return apiFetch<FaqItem>("/api/faq", {
    method: "POST",
    body: payload,
    auth: true,
    timeout: 15_000,
  });
}

/**
 * Actualizeaza o intrebare FAQ (necesita auth).
 * PUT /api/faq/:id
 */
export async function updateFaqItem(
  id: string,
  payload: Partial<FaqItemPayload>
): Promise<ApiResponse<FaqItem>> {
  return apiFetch<FaqItem>(`/api/faq/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: payload,
    auth: true,
    timeout: 15_000,
  });
}

/**
 * Sterge o intrebare FAQ (necesita auth).
 * DELETE /api/faq/:id
 */
export async function deleteFaqItem(
  id: string
): Promise<ApiResponse<{ deleted: boolean }>> {
  return apiFetch<{ deleted: boolean }>(
    `/api/faq/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      auth: true,
      timeout: 10_000,
    }
  );
}

// ═══════════════════════════════════════════════════════════════
// ENDPOINT-URI: PORTOFOLIU
// ═══════════════════════════════════════════════════════════════

/**
 * Obtine lista proiectelor din portofoliu.
 * GET /api/portfolio
 */
export async function fetchPortfolio(): Promise<
  ApiResponse<PortfolioProject[]>
> {
  return apiFetch<PortfolioProject[]>("/api/portfolio", {
    method: "GET",
    timeout: 10_000,
    retries: 1,
  });
}

/**
 * Obtine un proiect dupa ID.
 * GET /api/portfolio/:id
 */
export async function fetchPortfolioProjectById(
  id: string
): Promise<ApiResponse<PortfolioProject>> {
  return apiFetch<PortfolioProject>(
    `/api/portfolio/${encodeURIComponent(id)}`,
    {
      method: "GET",
      timeout: 10_000,
    }
  );
}

/**
 * Creeaza un proiect in portofoliu (necesita auth).
 * POST /api/portfolio
 */
export async function createPortfolioProject(
  payload: PortfolioProjectPayload
): Promise<ApiResponse<PortfolioProject>> {
  return apiFetch<PortfolioProject>("/api/portfolio", {
    method: "POST",
    body: payload,
    auth: true,
    timeout: 15_000,
  });
}

/**
 * Actualizeaza un proiect existent (necesita auth).
 * PUT /api/portfolio/:id
 */
export async function updatePortfolioProject(
  id: string,
  payload: Partial<PortfolioProjectPayload>
): Promise<ApiResponse<PortfolioProject>> {
  return apiFetch<PortfolioProject>(
    `/api/portfolio/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      body: payload,
      auth: true,
      timeout: 15_000,
    }
  );
}

/**
 * Sterge un proiect (necesita auth).
 * DELETE /api/portfolio/:id
 */
export async function deletePortfolioProject(
  id: string
): Promise<ApiResponse<{ deleted: boolean }>> {
  return apiFetch<{ deleted: boolean }>(
    `/api/portfolio/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      auth: true,
      timeout: 10_000,
    }
  );
}

// ═══════════════════════════════════════════════════════════════
// ENDPOINT-URI: MESAJE CONTACT
// ═══════════════════════════════════════════════════════════════

/**
 * Trimite un mesaj de contact (public).
 * POST /api/contact
 */
export async function sendContactMessage(
  payload: ContactMessagePayload
): Promise<ApiResponse<{ sent: boolean; id?: string }>> {
  return apiFetch<{ sent: boolean; id?: string }>("/api/contact", {
    method: "POST",
    body: payload,
    timeout: 15_000,
  });
}

/**
 * Obtine toate mesajele de contact (necesita auth).
 * GET /api/messages
 */
export async function fetchMessages(): Promise<
  ApiResponse<ContactMessage[]>
> {
  return apiFetch<ContactMessage[]>("/api/messages", {
    method: "GET",
    auth: true,
    timeout: 15_000,
    retries: 1,
  });
}

/**
 * Obtine un mesaj dupa ID (necesita auth).
 * GET /api/messages/:id
 */
export async function fetchMessageById(
  id: string
): Promise<ApiResponse<ContactMessage>> {
  return apiFetch<ContactMessage>(
    `/api/messages/${encodeURIComponent(id)}`,
    {
      method: "GET",
      auth: true,
      timeout: 10_000,
    }
  );
}

/**
 * Marcheaza un mesaj ca citit (necesita auth).
 * PATCH /api/messages/:id/read
 */
export async function markMessageRead(
  id: string
): Promise<ApiResponse<ContactMessage>> {
  return apiFetch<ContactMessage>(
    `/api/messages/${encodeURIComponent(id)}/read`,
    {
      method: "PATCH",
      auth: true,
      timeout: 10_000,
    }
  );
}

/**
 * Sterge un mesaj (necesita auth).
 * DELETE /api/messages/:id
 */
export async function deleteMessage(
  id: string
): Promise<ApiResponse<{ deleted: boolean }>> {
  return apiFetch<{ deleted: boolean }>(
    `/api/messages/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      auth: true,
      timeout: 10_000,
    }
  );
}

// ═══════════════════════════════════════════════════════════════
// ENDPOINT-URI: ADMIN AUTH
// ═══════════════════════════════════════════════════════════════

/**
 * Autentificare admin — returneaza token JWT.
 * POST /api/admin/login
 */
export async function adminLogin(
  payload: AdminLoginPayload
): Promise<ApiResponse<AdminLoginResponse>> {
  return apiFetch<AdminLoginResponse>("/api/admin/login", {
    method: "POST",
    body: JSON.stringify(payload),
    timeout: 10_000,
  });
}

// ═══════════════════════════════════════════════════════════════
// ENDPOINT-URI: HEALTH
// ═══════════════════════════════════════════════════════════════

/**
 * Verifica starea serverului.
 * GET /api/health
 */
export async function fetchHealth(): Promise<
  ApiResponse<HealthCheckResponse>
> {
  return apiFetch<HealthCheckResponse>("/api/health", {
    method: "GET",
    timeout: 5_000,
    retries: 0,
  });
}

// ═══════════════════════════════════════════════════════════════
// EXPORT DEFAULT — OBIECT CENTRALIZAT
// ═══════════════════════════════════════════════════════════════

const api = {
  // Core
  fetch: apiFetch,

  // Settings
  fetchSettings,
  updateSettings,

  // Services
  fetchServices,
  fetchServiceById,
  createService,
  updateService,
  deleteService,

  // Process
  fetchProcessSteps,
  createProcessStep,
  updateProcessStep,
  deleteProcessStep,
  reorderProcessSteps,

  // FAQ
  fetchFaq,
  createFaqItem,
  updateFaqItem,
  deleteFaqItem,

  // Portfolio
  fetchPortfolio,
  fetchPortfolioProjectById,
  createPortfolioProject,
  updatePortfolioProject,
  deletePortfolioProject,

  // Contact / Messages
  sendContactMessage,
  fetchMessages,
  fetchMessageById,
  markMessageRead,
  deleteMessage,

  // Admin
  adminLogin,

  // Health
  fetchHealth,
};

export default api;