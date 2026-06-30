"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { adminLogin } from "@/lib/api";

// ═══════════════════════════════════════════════════════════════
// CONSTANTE
// ═══════════════════════════════════════════════════════════════

const COOKIE_MAX_AGE_DAYS = 1;
const REDIRECT_DELAY_MS = 800;
const INPUT_DEBOUNCE_MS = 300;

const ERROR_ICON = "fa-solid fa-circle-exclamation";
const SUCCESS_ICON = "fa-solid fa-circle-check";
const SPINNER_ICON = "fa-solid fa-spinner";
const EYE_ICON = "fa-solid fa-eye";
const EYE_SLASH_ICON = "fa-solid fa-eye-slash";
const LOCK_ICON = "fa-solid fa-lock";
const ENVELOPE_ICON = "fa-solid fa-envelope";
const KEY_ICON = "fa-solid fa-key";
const SHIELD_ICON = "fa-solid fa-shield-halved";
const TRIANGLE_ICON = "fa-solid fa-triangle-exclamation";
const SIGN_IN_ICON = "fa-solid fa-right-to-bracket";
const LOGO_ICON = "fa-solid fa-cubes";

// ═══════════════════════════════════════════════════════════════
// TIPURI
// ═══════════════════════════════════════════════════════════════

interface ValidationErrors {
  email: string | null;
  password: string | null;
}

interface TouchedFields {
  email: boolean;
  password: boolean;
}

// ═══════════════════════════════════════════════════════════════
// VALIDARE
// ═══════════════════════════════════════════════════════════════

function validateEmail(email: string): string | null {
  if (!email.trim()) return "Email-ul este obligatoriu.";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) return "Email invalid.";
  return null;
}

function validatePassword(password: string): string | null {
  if (!password) return "Parola este obligatorie.";
  if (password.length < 6) return "Parola trebuie să aibă minim 6 caractere.";
  if (password.length > 128) return "Parola este prea lungă.";
  return null;
}

// ═══════════════════════════════════════════════════════════════
// SETARE COOKIE JWT
// ═══════════════════════════════════════════════════════════════

function setJWTCookie(token: string): void {
  const maxAgeSec = COOKIE_MAX_AGE_DAYS * 24 * 60 * 60;
  const expires = new Date(Date.now() + maxAgeSec * 1000).toUTCString();

  document.cookie = [
    `admin_token=${encodeURIComponent(token)}`,
    "path=/",
    "SameSite=Strict",
    "Secure",
    `max-age=${maxAgeSec}`,
    `expires=${expires}`,
  ].join("; ");
}

// ═══════════════════════════════════════════════════════════════
// VARIANTE FRAMER-MOTION
// ═══════════════════════════════════════════════════════════════

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.33, 1, 0.68, 1] },
  },
};

const errorVariants = {
  hidden: { opacity: 0, y: -8, height: 0 },
  visible: {
    opacity: 1,
    y: 0,
    height: "auto",
    transition: { duration: 0.25, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    y: -8,
    height: 0,
    transition: { duration: 0.2, ease: "easeIn" },
  },
};

const floatingParticleVariants = {
  animate: (i: number) => ({
    y: [0, -30, 0, 20, 0],
    x: [0, 15, -10, 8, 0],
    opacity: [0.15, 0.5, 0.15, 0.35, 0.15],
    transition: {
      duration: 5 + i * 0.7,
      repeat: Infinity,
      delay: i * 0.3,
      ease: "easeInOut",
    },
  }),
};

// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENTĂ: FLOATING PARTICLES
// ═══════════════════════════════════════════════════════════════

function FloatingParticles() {
  const particles = Array.from({ length: 12 });

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {particles.map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: 2 + Math.random() * 3,
            height: 2 + Math.random() * 3,
            backgroundColor:
              i % 3 === 0
                ? "#c084fc"
                : i % 3 === 1
                ? "#fbbf24"
                : "#a855f7",
            left: `${5 + Math.random() * 90}%`,
            top: `${5 + Math.random() * 90}%`,
          }}
          variants={floatingParticleVariants}
          custom={i}
          animate="animate"
        />
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENTĂ: GLOW ORBS DECORATIVE
// ═══════════════════════════════════════════════════════════════

function GlowOrbs() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {/* Orb 1 – purple top-right */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full opacity-[0.06]"
        style={{
          background:
            "radial-gradient(circle, rgba(168,85,247,0.9) 0%, transparent 70%)",
          top: "-15%",
          right: "-10%",
          filter: "blur(60px)",
        }}
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.04, 0.08, 0.04],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Orb 2 – gold bottom-left */}
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full opacity-[0.05]"
        style={{
          background:
            "radial-gradient(circle, rgba(251,191,36,0.8) 0%, transparent 70%)",
          bottom: "-10%",
          left: "-8%",
          filter: "blur(50px)",
        }}
        animate={{
          scale: [1.1, 1, 1.1],
          opacity: [0.03, 0.07, 0.03],
        }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Orb 3 – purple center accent */}
      <motion.div
        className="absolute w-[300px] h-[300px] rounded-full opacity-[0.04]"
        style={{
          background:
            "radial-gradient(circle, rgba(126,34,206,0.8) 0%, transparent 70%)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          filter: "blur(80px)",
        }}
        animate={{
          scale: [1, 1.25, 1],
          opacity: [0.02, 0.06, 0.02],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENTĂ: LOGO HEADER
// ═══════════════════════════════════════════════════════════════

function LogoHeader() {
  return (
    <motion.div
      variants={itemVariants}
      className="flex flex-col items-center gap-4"
    >
      {/* Logo image cu fundal negru */}
      <motion.div
        className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden glow-purple"
        style={{
          background: "#000000",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <img
          src="/images/logo-black-bg.png"
          alt="Nexus Dev Studio"
          className="w-full h-full object-contain p-3"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = "none";
            const parent = target.parentElement;
            if (parent) {
              parent.innerHTML = `<span class="flex items-center justify-center w-full h-full text-3xl text-purple-400"><i class="${LOGO_ICON}"></i></span>`;
            }
          }}
        />
      </motion.div>

      {/* Brand text */}
      <div className="text-center">
        <h1
          className="text-2xl sm:text-3xl font-bold tracking-tight"
          style={{
            fontFamily: "var(--font-playfair), 'Playfair Display', serif",
          }}
        >
          <span className="text-gradient-purple">Nexus</span>
          <span className="text-white/70 ml-1.5 font-light italic text-xl sm:text-2xl">
            Dev
          </span>
        </h1>
        <p
          className="text-xs sm:text-sm text-foreground-muted mt-1 tracking-wider uppercase"
          style={{
            fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace",
          }}
        >
          <i className={`${SHIELD_ICON} text-[10px] mr-1.5 text-purple-500/60`} aria-hidden="true" />
          Admin Panel
        </p>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENTĂ: FORMULAR LOGIN
// ═══════════════════════════════════════════════════════════════

function LoginForm() {
  const router = useRouter();

  // ── State ────────────────────────────────────────────────
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState<TouchedFields>({
    email: false,
    password: false,
  });
  const [errors, setErrors] = useState<ValidationErrors>({
    email: null,
    password: null,
  });
  const [serverError, setServerError] = useState<string | null>(null);
  const [serverSuccess, setServerSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState<"email" | "password" | null>(
    null
  );

  const emailInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Validare live (debounced) ────────────────────────────
  useEffect(() => {
    if (!touched.email) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      setErrors((prev) => ({
        ...prev,
        email: validateEmail(email),
      }));
    }, INPUT_DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [email, touched.email]);

  useEffect(() => {
    if (!touched.password) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      setErrors((prev) => ({
        ...prev,
        password: validatePassword(password),
      }));
    }, INPUT_DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [password, touched.password]);

  // ── Handlers ─────────────────────────────────────────────
  const handleEmailChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setEmail(e.target.value);
      setServerError(null);
      setServerSuccess(null);
      if (!touched.email) setTouched((prev) => ({ ...prev, email: true }));
    },
    [touched.email]
  );

  const handlePasswordChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPassword(e.target.value);
      setServerError(null);
      setServerSuccess(null);
      if (!touched.password)
        setTouched((prev) => ({ ...prev, password: true }));
    },
    [touched.password]
  );

  const handleBlur = useCallback((field: "email" | "password") => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setFocusedField(null);
  }, []);

  const handleFocus = useCallback((field: "email" | "password") => {
    setFocusedField(field);
  }, []);

  // ── Submit ───────────────────────────────────────────────
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const emailErr = validateEmail(email);
      const passErr = validatePassword(password);

      setTouched({ email: true, password: true });
      setErrors({ email: emailErr, password: passErr });
      setServerError(null);
      setServerSuccess(null);

      if (emailErr || passErr) {
        if (emailErr) {
          emailInputRef.current?.focus();
        }
        return;
      }

      setSubmitting(true);

      try {
        const result = await adminLogin({ email: email.trim(), password });

        if (result.error || !result.data) {
          setServerError(
            result.error ||
              "Autentificare eșuată. Verifică credențialele și încearcă din nou."
          );
          setSubmitting(false);
          return;
        }

        const { token } = result.data;

        setJWTCookie(token);
        setServerSuccess("Autentificare reușită! Redirecționare...");

        setTimeout(() => {
          router.push("/admin/dashboard");
        }, REDIRECT_DELAY_MS);
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : "Eroare neașteptată. Încearcă din nou.";
        setServerError(message);
        setSubmitting(false);
      }
    },
    [email, password, router]
  );

  const isFormValid =
    email.trim().length > 0 &&
    password.length > 0 &&
    !errors.email &&
    !errors.password;

  return (
    <motion.form
      variants={itemVariants}
      onSubmit={handleSubmit}
      noValidate
      className="w-full max-w-md mx-auto flex flex-col gap-5"
    >
      {/* Server Error Banner */}
      <AnimatePresence mode="wait">
        {serverError && (
          <motion.div
            key="server-error"
            variants={errorVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="alert"
            className="flex items-start gap-3 px-4 py-3.5 rounded-xl text-sm bg-red-500/10 border border-red-500/25 text-red-300"
            style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}
          >
            <i className={`${TRIANGLE_ICON} mt-0.5 text-red-400 flex-shrink-0`} aria-hidden="true" />
            <span className="leading-relaxed">{serverError}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Server Success Banner */}
      <AnimatePresence mode="wait">
        {serverSuccess && (
          <motion.div
            key="server-success"
            variants={errorVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="status"
            className="flex items-start gap-3 px-4 py-3.5 rounded-xl text-sm bg-emerald-500/10 border border-emerald-500/25 text-emerald-300"
            style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}
          >
            <i className={`${SUCCESS_ICON} mt-0.5 text-emerald-400 flex-shrink-0`} aria-hidden="true" />
            <span className="leading-relaxed">{serverSuccess}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Email Input */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="admin-email"
          className="text-xs uppercase tracking-wider text-foreground-dim font-medium"
          style={{ fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace" }}
        >
          <i className={`${ENVELOPE_ICON} mr-1.5 text-purple-500/60 text-[10px]`} aria-hidden="true" />
          Email
        </label>

        <motion.div
          className="relative"
          animate={focusedField === "email" ? { scale: 1.01 } : { scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground-dim/50 text-sm pointer-events-none">
            <i className={ENVELOPE_ICON} aria-hidden="true" />
          </span>

          <input
            ref={emailInputRef}
            id="admin-email"
            type="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={handleEmailChange}
            onFocus={() => handleFocus("email")}
            onBlur={() => handleBlur("email")}
            placeholder="admin@nexusdevstudio.ro"
            disabled={submitting || !!serverSuccess}
            aria-invalid={touched.email && !!errors.email}
            aria-describedby={touched.email && errors.email ? "email-error" : undefined}
            className={`w-full pl-11 pr-4 py-3.5 rounded-xl text-sm text-white placeholder:text-foreground-dim/30 transition-all duration-200 outline-none ${
              touched.email && errors.email
                ? "bg-red-500/5 border border-red-500/40 focus:border-red-400 focus:ring-1 focus:ring-red-500/30"
                : focusedField === "email"
                ? "bg-white/5 border border-purple-500/50 focus:border-purple-400 focus:ring-1 focus:ring-purple-500/30"
                : "bg-white/5 border border-white/10 hover:border-white/20 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20"
            }`}
            style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}
          />

          {focusedField === "email" && !errors.email && (
            <motion.div
              layoutId="field-indicator"
              className="absolute bottom-0 left-4 right-4 h-[2px] rounded-full bg-gradient-to-r from-purple-600 via-purple-400 to-purple-600"
              transition={{ duration: 0.3 }}
            />
          )}
        </motion.div>

        <AnimatePresence mode="wait">
          {touched.email && errors.email && (
            <motion.p
              id="email-error"
              variants={errorVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              role="alert"
              className="flex items-center gap-1.5 text-xs text-red-400 pl-1"
              style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}
            >
              <i className={`${ERROR_ICON} text-[10px]`} aria-hidden="true" />
              {errors.email}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Password Input */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="admin-password"
          className="text-xs uppercase tracking-wider text-foreground-dim font-medium"
          style={{ fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace" }}
        >
          <i className={`${LOCK_ICON} mr-1.5 text-purple-500/60 text-[10px]`} aria-hidden="true" />
          Parolă
        </label>

        <motion.div
          className="relative"
          animate={focusedField === "password" ? { scale: 1.01 } : { scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground-dim/50 text-sm pointer-events-none">
            <i className={KEY_ICON} aria-hidden="true" />
          </span>

          <input
            id="admin-password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={handlePasswordChange}
            onFocus={() => handleFocus("password")}
            onBlur={() => handleBlur("password")}
            placeholder="••••••••"
            disabled={submitting || !!serverSuccess}
            aria-invalid={touched.password && !!errors.password}
            aria-describedby={touched.password && errors.password ? "password-error" : undefined}
            className={`w-full pl-11 pr-12 py-3.5 rounded-xl text-sm text-white placeholder:text-foreground-dim/30 transition-all duration-200 outline-none ${
              touched.password && errors.password
                ? "bg-red-500/5 border border-red-500/40 focus:border-red-400 focus:ring-1 focus:ring-red-500/30"
                : focusedField === "password"
                ? "bg-white/5 border border-purple-500/50 focus:border-purple-400 focus:ring-1 focus:ring-purple-500/30"
                : "bg-white/5 border border-white/10 hover:border-white/20 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20"
            }`}
            style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}
          />

          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            disabled={submitting || !!serverSuccess}
            tabIndex={-1}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg text-foreground-dim/50 hover:text-foreground-muted transition-colors duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label={showPassword ? "Ascunde parola" : "Arată parola"}
          >
            <i className={showPassword ? EYE_SLASH_ICON : EYE_ICON} aria-hidden="true" />
          </button>

          {focusedField === "password" && !errors.password && (
            <motion.div
              layoutId="field-indicator"
              className="absolute bottom-0 left-4 right-12 h-[2px] rounded-full bg-gradient-to-r from-purple-600 via-purple-400 to-purple-600"
              transition={{ duration: 0.3 }}
            />
          )}
        </motion.div>

        <AnimatePresence mode="wait">
          {touched.password && errors.password && (
            <motion.p
              id="password-error"
              variants={errorVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              role="alert"
              className="flex items-center gap-1.5 text-xs text-red-400 pl-1"
              style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}
            >
              <i className={`${ERROR_ICON} text-[10px]`} aria-hidden="true" />
              {errors.password}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Submit Button */}
      <motion.button
        type="submit"
        disabled={submitting || !!serverSuccess || (!isFormValid && (touched.email || touched.password))}
        className="relative w-full py-3.5 rounded-xl text-base font-semibold text-white overflow-hidden transition-all duration-300"
        style={{
          fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
          background: "linear-gradient(135deg, #7e22ce 0%, #a855f7 50%, #7e22ce 100%)",
          backgroundSize: "200% 100%",
          boxShadow: "0 4px 24px rgba(126, 34, 206, 0.4), 0 0 50px rgba(168, 85, 247, 0.15)",
          opacity: submitting || !!serverSuccess ? 0.7 : 1,
          cursor: submitting || !!serverSuccess ? "not-allowed" : "pointer",
        }}
        whileHover={
          !submitting && !serverSuccess
            ? { scale: 1.03, backgroundPosition: "100% 50%", boxShadow: "0 6px 32px rgba(126, 34, 206, 0.55), 0 0 70px rgba(168, 85, 247, 0.25)" }
            : {}
        }
        whileTap={!submitting && !serverSuccess ? { scale: 0.98 } : {}}
      >
        <span className="relative z-10 flex items-center justify-center gap-2.5">
          {submitting ? (
            <>
              <i className={`${SPINNER_ICON} animate-spin`} aria-hidden="true" />
              Autentificare...
            </>
          ) : serverSuccess ? (
            <>
              <i className={SUCCESS_ICON} aria-hidden="true" />
              {serverSuccess}
            </>
          ) : (
            <>
              <i className={SIGN_IN_ICON} aria-hidden="true" />
              Conectează-te
            </>
          )}
        </span>
        {!submitting && !serverSuccess && (
          <div className="absolute inset-0 pointer-events-none">
            <div
              className="absolute inset-0 animate-shimmer"
              style={{
                background: "linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.08) 50%, transparent 70%)",
                backgroundSize: "200% 100%",
              }}
            />
          </div>
        )}
      </motion.button>

      {/* Hint Info */}
      <motion.p
        variants={itemVariants}
        className="text-center text-xs text-foreground-dim/50 mt-1"
        style={{ fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace" }}
      >
        <i className={`${SHIELD_ICON} text-[10px] mr-1 text-purple-500/30`} aria-hidden="true" />
        Acces restricționat — Doar pentru administratori
      </motion.p>
    </motion.form>
  );
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTA PRINCIPALĂ: ADMIN LOGIN PAGE
// ═══════════════════════════════════════════════════════════════

export default function AdminLoginPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0a0a0f]">
      {/* Imagine fundal */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/admin-bg.jpg"
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover opacity-25"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
      </div>

      {/* Gradient overlay */}
      <div
        className="absolute inset-0 z-[1]"
        aria-hidden="true"
        style={{
          background: `
            linear-gradient(180deg, rgba(10,10,15,0.3) 0%, rgba(10,10,15,0.7) 40%, rgba(10,10,15,0.95) 100%),
            radial-gradient(ellipse 50% 40% at 50% 35%, rgba(126,34,206,0.12) 0%, transparent 60%),
            radial-gradient(ellipse 35% 30% at 30% 65%, rgba(245,158,11,0.06) 0%, transparent 55%)
          `,
        }}
      />

      {/* Noise textură */}
      <div className="absolute inset-0 z-[2] opacity-[0.025] pointer-events-none" aria-hidden="true">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
            backgroundSize: "256px 256px",
          }}
        />
      </div>

      <GlowOrbs />
      <FloatingParticles />

      {/* Card Login Central (Glassmorphism) */}
      <motion.div
        className="relative z-10 w-full max-w-lg mx-4"
        variants={containerVariants}
        initial="hidden"
        animate={mounted ? "visible" : "hidden"}
      >
        <div className="glass-lg p-8 sm:p-10 flex flex-col items-center gap-8 relative overflow-hidden">
          {/* Border gradient subtil */}
          <div
            className="absolute inset-0 rounded-[var(--glass-radius-lg)] pointer-events-none"
            aria-hidden="true"
            style={{
              padding: "1px",
              background: "linear-gradient(135deg, rgba(168,85,247,0.3) 0%, transparent 40%, transparent 60%, rgba(251,191,36,0.2) 100%)",
              mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              maskComposite: "exclude",
              WebkitMaskComposite: "xor",
            }}
          />

          {/* Line decorativă sus */}
          <motion.div
            className="absolute top-0 left-8 right-8 h-[1px] pointer-events-none"
            aria-hidden="true"
            style={{ background: "linear-gradient(90deg, transparent, rgba(168,85,247,0.6), rgba(251,191,36,0.3), transparent)" }}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />

          <LogoHeader />
          <div className="w-16 h-[1px] rounded-full bg-gradient-to-r from-transparent via-white/15 to-transparent" />
          <LoginForm />
        </div>
      </motion.div>

      {/* Indicator versiune */}
      <motion.div
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-10"
        initial={{ opacity: 0 }}
        animate={mounted ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: 1.2, duration: 0.6 }}
      >
        <p
          className="text-[11px] text-foreground-dim/40 tracking-widest uppercase"
          style={{ fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace" }}
        >
          Nexus Dev Studio &copy; {new Date().getFullYear()} — Admin v1.0
        </p>
      </motion.div>
    </div>
  );
}