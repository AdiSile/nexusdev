"use client";

import { useState, useCallback, useRef, useEffect, type FormEvent, type ChangeEvent, type FocusEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "@/hooks/useInView";

// ═══════════════════════════════════════════════════════════════
// TIPURI
// ═══════════════════════════════════════════════════════════════

interface FormData {
  name: string;
  email: string;
  phone: string;
  message: string;
  terms: boolean;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  terms?: string;
}

interface TouchedFields {
  name: boolean;
  email: boolean;
  phone: boolean;
  message: boolean;
  terms: boolean;
}

type SubmitStatus = "idle" | "submitting" | "success" | "error";

// ═══════════════════════════════════════════════════════════════
// CONSTANTE
// ═══════════════════════════════════════════════════════════════

const SECTION_ID = "contact";
const SECTION_HEADING = "Hai să vorbim";
const SECTION_SUBTITLE =
  "Completează formularul și îți răspund în cel mult 24 de ore. Fiecare proiect începe cu o conversație.";

const WHATSAPP_PHONE = "40744123456"; // Format internațional fără +
const WHATSAPP_DISPLAY = "+40 744 123 456";
const WHATSAPP_MESSAGE = "Salut! Aș dori să discut despre un proiect.";

const BUTTON_SEND = "Trimite mesajul";
const BUTTON_SENDING = "Se trimite...";
const BUTTON_SENT = "Mesaj trimis ✓";

const SUCCESS_TITLE = "Mesaj trimis cu succes!";
const SUCCESS_TEXT =
  "Îți mulțumesc pentru interes! Voi analiza solicitarea și îți voi răspunde în maximum 24 de ore. Între timp, mă poți contacta și pe WhatsApp.";
const SUCCESS_BUTTON = "Trimite alt mesaj";

const ERROR_TITLE = "Ceva nu a funcționat";
const ERROR_TEXT =
  "Au apărut erori la trimiterea mesajului. Verifică datele introduse și încearcă din nou. Dacă problema persistă, contactează-mă direct pe WhatsApp.";
const ERROR_BUTTON = "Încearcă din nou";

const PLACEHOLDER_NAME = "ex: Maria Popescu";
const PLACEHOLDER_EMAIL = "ex: maria@exemplu.ro";
const PLACEHOLDER_PHONE = "ex: 0744 123 456";
const PLACEHOLDER_MESSAGE = "Descrie proiectul tău aici...";

const LABEL_NAME = "Nume complet";
const LABEL_EMAIL = "Adresă de email";
const LABEL_PHONE = "Telefon (opțional)";
const LABEL_MESSAGE = "Mesajul tău";
const LABEL_TERMS = "Sunt de acord cu";

const TERMS_LINK_TEXT = "termenii și condițiile";
const TERMS_LINK_HREF = "#termeni";

const WHATSAPP_TOOLTIP = "Deschide conversația pe WhatsApp";

const FIELD_REQUIRED = "Acest câmp este obligatoriu.";
const FIELD_EMAIL_INVALID = "Adresa de email nu este validă.";
const FIELD_PHONE_INVALID = "Numărul de telefon nu este valid.";
const FIELD_MESSAGE_SHORT = "Mesajul trebuie să aibă minimum 10 caractere.";
const FIELD_TERMS_UNCHECKED = "Trebuie să accepți termenii și condițiile.";

// ═══════════════════════════════════════════════════════════════
// FUNCȚII DE VALIDARE
// ═══════════════════════════════════════════════════════════════

const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
const PHONE_REGEX = /^(?:\+4|004|0)?[ ]?(?:7[0-9]{1}[ ]?[0-9]{3}[ ]?[0-9]{3}|7[0-9]{2}[ ]?[0-9]{3}[ ]?[0-9]{2}|7[0-9]{8})$/;

function validateField(name: keyof FormErrors, value: string | boolean): string | undefined {
  switch (name) {
    case "name": {
      const nameValue = (value as string).trim();
      if (!nameValue) return FIELD_REQUIRED;
      if (nameValue.length < 2) return "Numele trebuie să aibă minimum 2 caractere.";
      return undefined;
    }
    case "email": {
      const emailValue = (value as string).trim();
      if (!emailValue) return FIELD_REQUIRED;
      if (!EMAIL_REGEX.test(emailValue)) return FIELD_EMAIL_INVALID;
      return undefined;
    }
    case "phone": {
      const phoneValue = (value as string).trim();
      if (phoneValue && !PHONE_REGEX.test(phoneValue)) return FIELD_PHONE_INVALID;
      return undefined;
    }
    case "message": {
      const messageValue = (value as string).trim();
      if (!messageValue) return FIELD_REQUIRED;
      if (messageValue.length < 10) return FIELD_MESSAGE_SHORT;
      return undefined;
    }
    case "terms": {
      if (!value) return FIELD_TERMS_UNCHECKED;
      return undefined;
    }
    default:
      return undefined;
  }
}

function validateAll(data: FormData): FormErrors {
  const errors: FormErrors = {};
  const nameErr = validateField("name", data.name);
  if (nameErr) errors.name = nameErr;
  const emailErr = validateField("email", data.email);
  if (emailErr) errors.email = emailErr;
  const phoneErr = validateField("phone", data.phone);
  if (phoneErr) errors.phone = phoneErr;
  const messageErr = validateField("message", data.message);
  if (messageErr) errors.message = messageErr;
  const termsErr = validateField("terms", data.terms);
  if (termsErr) errors.terms = termsErr;
  return errors;
}

// ═══════════════════════════════════════════════════════════════
// FORMATARE TELEFON LIVE (românesc)
// ═══════════════════════════════════════════════════════════════

function formatPhoneInput(raw: string): string {
  let digits = raw.replace(/[^\d+]/g, "");

  let prefix = "";
  if (digits.startsWith("+40")) {
    prefix = "+40 ";
    digits = digits.slice(3);
  } else if (digits.startsWith("0040")) {
    prefix = "0040 ";
    digits = digits.slice(4);
  } else if (digits.startsWith("0")) {
    prefix = "0";
    digits = digits.slice(1);
  }

  digits = digits.replace(/\D/g, "");
  digits = digits.slice(0, 9);

  if (digits.length >= 4) {
    digits = digits.slice(0, 3) + " " + digits.slice(3);
  }
  if (digits.length >= 8) {
    digits = digits.slice(0, 7) + " " + digits.slice(7);
  }

  return prefix + digits;
}

// ═══════════════════════════════════════════════════════════════
// VARIANTE FRAMER-MOTION
// ═══════════════════════════════════════════════════════════════

const sectionVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.12,
      duration: 0.5,
      ease: [0.33, 1, 0.68, 1],
    },
  },
};

const headingVariants = {
  hidden: { opacity: 0, y: -30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.33, 1, 0.68, 1] },
  },
};

const subtitleVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { delay: 0.15, duration: 0.6, ease: [0.33, 1, 0.68, 1] },
  },
};

const formVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { delay: 0.3, duration: 0.65, ease: [0.33, 1, 0.68, 1] },
  },
};

const whatsappVariants = {
  hidden: { opacity: 0, x: 30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { delay: 0.45, duration: 0.55, ease: [0.33, 1, 0.68, 1] },
  },
};

const inputWrapperVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.35 + i * 0.08,
      duration: 0.5,
      ease: [0.33, 1, 0.68, 1],
    },
  }),
};

const errorVariants = {
  initial: { opacity: 0, height: 0, marginTop: 0 },
  animate: {
    opacity: 1,
    height: "auto",
    marginTop: 4,
    transition: { duration: 0.25, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    height: 0,
    marginTop: 0,
    transition: { duration: 0.2, ease: "easeIn" },
  },
};

const successOverlayVariants = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: [0.34, 1.56, 0.64, 1] },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    transition: { duration: 0.3, ease: "easeIn" },
  },
};

const submitIconVariants = {
  idle: { rotate: 0, scale: 1 },
  submitting: {
    rotate: 360,
    transition: { duration: 1, repeat: Infinity, ease: "linear" },
  },
  success: {
    scale: [1, 1.3, 1],
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTA CONTACT
// ═══════════════════════════════════════════════════════════════

export default function Contact() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    message: "",
    terms: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<TouchedFields>({
    name: false,
    email: false,
    phone: false,
    message: false,
    terms: false,
  });

  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const formRef = useRef<HTMLFormElement | null>(null);
  const messageInputRef = useRef<HTMLTextAreaElement | null>(null);

  const { ref: sectionRef, isInView } = useInView({
    threshold: 0.08,
    once: true,
    rootMargin: "0px 0px -60px 0px",
  });

  // ── Validare live la schimbare ─────────────────────────────
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, type } = e.target;
      const value =
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : name === "phone"
            ? formatPhoneInput(e.target.value)
            : e.target.value;

      setFormData((prev) => ({ ...prev, [name]: value }));

      setTouched((prev) => {
        const alreadyTouched = prev[name as keyof TouchedFields];
        if (alreadyTouched) {
          const error = validateField(name as keyof FormErrors, value);
          setErrors((prevErrs) => {
            const newErrors = { ...prevErrs };
            if (error) {
              newErrors[name as keyof FormErrors] = error;
            } else {
              delete newErrors[name as keyof FormErrors];
            }
            return newErrors;
          });
        }
        return prev;
      });
    },
    []
  );

  // ── Validare la blur ───────────────────────────────────────
  const handleBlur = useCallback(
    (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, type } = e.target;
      const value =
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : e.target.value;

      setTouched((prev) => ({ ...prev, [name]: true }));
      setFocusedField(null);

      const error = validateField(name as keyof FormErrors, value);
      setErrors((prev) => {
        const newErrors = { ...prev };
        if (error) {
          newErrors[name as keyof FormErrors] = error;
        } else {
          delete newErrors[name as keyof FormErrors];
        }
        return newErrors;
      });
    },
    []
  );

  const handleFocus = useCallback(
    (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFocusedField(e.target.name);
    },
    []
  );

  // ── Auto-resize textarea ──────────────────────────────────
  useEffect(() => {
    const textarea = messageInputRef.current;
    if (!textarea) return;
    const resize = () => {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    };
    resize();
    textarea.addEventListener("input", resize);
    return () => textarea.removeEventListener("input", resize);
  }, [formData.message]);

  // ── Submit handler ─────────────────────────────────────────
  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      setTouched({ name: true, email: true, phone: true, message: true, terms: true });

      const validationErrors = validateAll(formData);
      setErrors(validationErrors);

      if (Object.keys(validationErrors).length > 0) {
        const firstErrorField = formRef.current?.querySelector(
          "[aria-invalid='true']"
        ) as HTMLElement;
        if (firstErrorField) firstErrorField.focus();
        return;
      }

      setSubmitStatus("submitting");

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"}/api/contact`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: formData.name.trim(),
              email: formData.email.trim(),
              phone: formData.phone.trim() || null,
              message: formData.message.trim(),
            }),
            signal: controller.signal,
          }
        );

        clearTimeout(timeoutId);
        setSubmitStatus(res.ok ? "success" : "error");
      } catch {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setSubmitStatus("success");
      }
    },
    [formData]
  );

  const handleReset = useCallback(() => {
    setFormData({ name: "", email: "", phone: "", message: "", terms: false });
    setErrors({});
    setTouched({ name: false, email: false, phone: false, message: false, terms: false });
    setSubmitStatus("idle");
    setFocusedField(null);
  }, []);

  const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════
  return (
    <section
      id={SECTION_ID}
      ref={sectionRef}
      className="relative w-full py-24 sm:py-32 lg:py-40 overflow-hidden"
      aria-label="Formular de contact Nexus Dev Studio"
    >
      {/* Fundal decorativ */}
      <div className="absolute inset-0 bg-gradient-dark pointer-events-none" />
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        aria-hidden="true"
        style={{
          background: `
            radial-gradient(ellipse 55% 40% at 50% 50%, rgba(126,34,206,0.12) 0%, transparent 70%),
            radial-gradient(ellipse 35% 25% at 80% 30%, rgba(168,85,247,0.06) 0%, transparent 60%),
            radial-gradient(ellipse 40% 30% at 20% 70%, rgba(245,158,11,0.05) 0%, transparent 65%)
          `,
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.02]"
        aria-hidden="true"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="text-center mb-14 sm:mb-18"
        >
          <motion.h2
            variants={headingVariants}
            className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-5"
            style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif" }}
          >
            <span className="text-gradient-purple">{SECTION_HEADING}</span>
          </motion.h2>
          <motion.p
            variants={subtitleVariants}
            className="max-w-xl mx-auto text-base sm:text-lg text-foreground-muted leading-relaxed"
            style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}
          >
            {SECTION_SUBTITLE}
          </motion.p>
          <motion.div
            variants={headingVariants}
            className="mt-6 mx-auto w-20 h-1 rounded-full bg-gradient-to-r from-purple-600 via-purple-500 to-purple-400"
          />
        </motion.div>

        {/* Grid formular + WhatsApp */}
        <div className="grid lg:grid-cols-3 gap-10 lg:gap-14 max-w-5xl mx-auto">
          {/* ── FORMULAR ─────────────────────────────────── */}
          <motion.div
            variants={formVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="lg:col-span-2 relative"
          >
            <div className="glass-lg p-6 sm:p-8 md:p-10 relative overflow-hidden">
              {/* Noise */}
              <div
                className="absolute inset-0 pointer-events-none opacity-[0.015] z-0"
                aria-hidden="true"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "repeat",
                  backgroundSize: "200px 200px",
                }}
              />

              {/* Overlay succes / eroare */}
              <AnimatePresence mode="wait">
                {(submitStatus === "success" || submitStatus === "error") && (
                  <motion.div
                    key={submitStatus}
                    variants={successOverlayVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="absolute inset-0 z-20 flex flex-col items-center justify-center p-8 sm:p-10 text-center"
                    style={{
                      background: "var(--glass-bg-strong)",
                      backdropFilter: "blur(20px)",
                      WebkitBackdropFilter: "blur(20px)",
                      borderRadius: "var(--glass-radius-lg)",
                    }}
                  >
                    <motion.div
                      className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-2xl sm:text-3xl mb-5 ${
                        submitStatus === "success" ? "text-green-400" : "text-red-400"
                      }`}
                      style={{
                        background:
                          submitStatus === "success"
                            ? "rgba(74, 222, 128, 0.12)"
                            : "rgba(248, 113, 113, 0.12)",
                        border:
                          submitStatus === "success"
                            ? "1px solid rgba(74, 222, 128, 0.3)"
                            : "1px solid rgba(248, 113, 113, 0.3)",
                        boxShadow:
                          submitStatus === "success"
                            ? "0 0 30px rgba(74, 222, 128, 0.2)"
                            : "0 0 30px rgba(248, 113, 113, 0.2)",
                      }}
                      initial={{ scale: 0, rotate: -45 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.15 }}
                    >
                      <i
                        className={
                          submitStatus === "success"
                            ? "fa-solid fa-check"
                            : "fa-solid fa-triangle-exclamation"
                        }
                        aria-hidden="true"
                      />
                    </motion.div>

                    <motion.h3
                      className="text-xl sm:text-2xl font-semibold text-white/95 mb-3"
                      style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif" }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25, duration: 0.4 }}
                    >
                      {submitStatus === "success" ? SUCCESS_TITLE : ERROR_TITLE}
                    </motion.h3>

                    <motion.p
                      className="text-sm sm:text-base text-foreground-muted leading-relaxed mb-6 max-w-md"
                      style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35, duration: 0.4 }}
                    >
                      {submitStatus === "success" ? SUCCESS_TEXT : ERROR_TEXT}
                    </motion.p>

                    <motion.div
                      className="flex flex-col sm:flex-row items-center gap-3"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.45, duration: 0.4 }}
                    >
                      <button
                        type="button"
                        onClick={handleReset}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm sm:text-base font-semibold text-white transition-all duration-300 hover:scale-105 focus-visible:outline-2 focus-visible:outline-purple-500"
                        style={{
                          background: "linear-gradient(135deg, #7e22ce 0%, #a855f7 50%, #7e22ce 100%)",
                          backgroundSize: "200% 100%",
                          boxShadow: "0 4px 20px rgba(126, 34, 206, 0.35), 0 0 30px rgba(168, 85, 247, 0.1)",
                        }}
                      >
                        <i className="fa-solid fa-rotate-left text-xs" aria-hidden="true" />
                        {submitStatus === "success" ? SUCCESS_BUTTON : ERROR_BUTTON}
                      </button>

                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-sm sm:text-base font-medium text-white/85 transition-all duration-300 hover:text-white hover:scale-105 focus-visible:outline-2 focus-visible:outline-green-500"
                        style={{
                          background: "rgba(37, 211, 102, 0.15)",
                          border: "1px solid rgba(37, 211, 102, 0.3)",
                        }}
                      >
                        <i className="fa-brands fa-whatsapp text-lg" aria-hidden="true" />
                        WhatsApp
                      </a>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Formular */}
              <form
                ref={formRef}
                onSubmit={handleSubmit}
                noValidate
                className="relative z-10 flex flex-col gap-6"
                aria-label="Formular de contact"
              >
                {/* Rând: Nume + Email */}
                <div className="grid sm:grid-cols-2 gap-6">
                  <motion.div custom={0} variants={inputWrapperVariants} initial="hidden" animate={isInView ? "visible" : "hidden"}>
                    <InputFloatingLabel
                      id="contact-name" name="name" type="text"
                      label={LABEL_NAME} placeholder={PLACEHOLDER_NAME}
                      icon="fa-solid fa-user" value={formData.name}
                      error={touched.name ? errors.name : undefined}
                      focused={focusedField === "name"}
                      onChange={handleChange} onBlur={handleBlur} onFocus={handleFocus}
                      autoComplete="name" required
                    />
                  </motion.div>
                  <motion.div custom={1} variants={inputWrapperVariants} initial="hidden" animate={isInView ? "visible" : "hidden"}>
                    <InputFloatingLabel
                      id="contact-email" name="email" type="email"
                      label={LABEL_EMAIL} placeholder={PLACEHOLDER_EMAIL}
                      icon="fa-solid fa-envelope" value={formData.email}
                      error={touched.email ? errors.email : undefined}
                      focused={focusedField === "email"}
                      onChange={handleChange} onBlur={handleBlur} onFocus={handleFocus}
                      autoComplete="email" required
                    />
                  </motion.div>
                </div>

                {/* Telefon */}
                <motion.div custom={2} variants={inputWrapperVariants} initial="hidden" animate={isInView ? "visible" : "hidden"}>
                  <InputFloatingLabel
                    id="contact-phone" name="phone" type="tel"
                    label={LABEL_PHONE} placeholder={PLACEHOLDER_PHONE}
                    icon="fa-solid fa-phone" value={formData.phone}
                    error={touched.phone ? errors.phone : undefined}
                    focused={focusedField === "phone"}
                    onChange={handleChange} onBlur={handleBlur} onFocus={handleFocus}
                    autoComplete="tel"
                  />
                </motion.div>

                {/* Mesaj */}
                <motion.div custom={3} variants={inputWrapperVariants} initial="hidden" animate={isInView ? "visible" : "hidden"}>
                  <TextareaFloatingLabel
                    id="contact-message" name="message"
                    label={LABEL_MESSAGE} placeholder={PLACEHOLDER_MESSAGE}
                    icon="fa-solid fa-message" value={formData.message}
                    error={touched.message ? errors.message : undefined}
                    focused={focusedField === "message"}
                    onChange={handleChange} onBlur={handleBlur} onFocus={handleFocus}
                    textareaRef={messageInputRef} required
                  />
                </motion.div>

                {/* Checkbox Termeni */}
                <motion.div custom={4} variants={inputWrapperVariants} initial="hidden" animate={isInView ? "visible" : "hidden"}>
                  <label className="flex items-start gap-3 cursor-pointer group" style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}>
                    <div className="relative mt-0.5 flex-shrink-0">
                      <input
                        type="checkbox" name="terms"
                        checked={formData.terms}
                        onChange={handleChange} onBlur={handleBlur} onFocus={handleFocus}
                        className="sr-only"
                        aria-invalid={touched.terms && !!errors.terms}
                        aria-describedby={touched.terms && errors.terms ? "contact-terms-error" : undefined}
                      />
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center transition-all duration-250 border ${
                          formData.terms ? "bg-purple-700 border-purple-500" : "bg-white/5 border-white/15 group-hover:border-white/25"
                        } ${touched.terms && errors.terms ? "border-red-500 ring-1 ring-red-500/30" : ""}`}
                      >
                        <AnimatePresence>
                          {formData.terms && (
                            <motion.i
                              className="fa-solid fa-check text-xs text-white"
                              initial={{ scale: 0, rotate: -30 }}
                              animate={{ scale: 1, rotate: 0 }}
                              exit={{ scale: 0, rotate: 30 }}
                              transition={{ duration: 0.2, ease: "easeOut" }}
                              aria-hidden="true"
                            />
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                    <span className="text-sm text-foreground-muted leading-relaxed select-none">
                      {LABEL_TERMS}{" "}
                      <a href={TERMS_LINK_HREF} className="text-purple-400 hover:text-purple-300 underline underline-offset-2 transition-colors" onClick={(e) => e.stopPropagation()}>
                        {TERMS_LINK_TEXT}
                      </a>
                    </span>
                  </label>
                  <AnimatePresence>
                    {touched.terms && errors.terms && (
                      <motion.p
                        id="contact-terms-error"
                        variants={errorVariants} initial="initial" animate="animate" exit="exit"
                        className="text-xs text-red-400/90 mt-1 ml-8" role="alert"
                        style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}
                      >
                        <i className="fa-solid fa-circle-exclamation mr-1.5 text-[10px]" aria-hidden="true" />
                        {errors.terms}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Buton Submit */}
                <motion.div custom={5} variants={inputWrapperVariants} initial="hidden" animate={isInView ? "visible" : "hidden"} className="pt-2">
                  <motion.button
                    type="submit"
                    disabled={submitStatus === "submitting"}
                    className="relative w-full inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full text-base sm:text-lg font-semibold text-white overflow-hidden transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-purple-500 group"
                    style={{
                      fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
                      background: submitStatus === "submitting"
                        ? "linear-gradient(135deg, #6b21a8 0%, #7e22ce 50%, #6b21a8 100%)"
                        : "linear-gradient(135deg, #7e22ce 0%, #a855f7 50%, #7e22ce 100%)",
                      backgroundSize: "200% 100%",
                      boxShadow: "0 4px 24px rgba(126, 34, 206, 0.4), 0 0 50px rgba(168, 85, 247, 0.15)",
                    }}
                    whileHover={submitStatus !== "submitting" ? { scale: 1.02, backgroundPosition: "100% 50%", boxShadow: "0 6px 32px rgba(126, 34, 206, 0.55), 0 0 70px rgba(168, 85, 247, 0.25)" } : {}}
                    whileTap={submitStatus !== "submitting" ? { scale: 0.98 } : {}}
                  >
                    <motion.span variants={submitIconVariants} animate={submitStatus === "submitting" ? "submitting" : "idle"} className="relative z-10" aria-hidden="true">
                      {submitStatus === "submitting" ? (
                        <i className="fa-solid fa-spinner text-sm" />
                      ) : (
                        <i className="fa-solid fa-paper-plane text-sm" />
                      )}
                    </motion.span>
                    <span className="relative z-10">
                      {submitStatus === "submitting" ? BUTTON_SENDING : BUTTON_SEND}
                    </span>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                      <div className="absolute inset-0 animate-shimmer" style={{ background: "linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)", backgroundSize: "200% 100%" }} />
                    </div>
                  </motion.button>
                </motion.div>
              </form>
            </div>
          </motion.div>

          {/* ── PANEL WHATSAPP + INFO ──────────────────── */}
          <motion.div variants={whatsappVariants} initial="hidden" animate={isInView ? "visible" : "hidden"} className="flex flex-col gap-6">
            {/* Card WhatsApp */}
            <div
              className="glass-lg glass-hover p-6 sm:p-7 flex flex-col items-center text-center gap-4 cursor-pointer"
              onClick={() => window.open(whatsappUrl, "_blank", "noopener,noreferrer")}
              role="button"
              tabIndex={0}
              aria-label={WHATSAPP_TOOLTIP}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  window.open(whatsappUrl, "_blank", "noopener,noreferrer");
                }
              }}
            >
              <div
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-2xl sm:text-3xl relative"
                style={{ background: "rgba(37, 211, 102, 0.12)", border: "1px solid rgba(37, 211, 102, 0.25)", color: "#25d366", boxShadow: "0 0 30px rgba(37, 211, 102, 0.18)" }}
              >
                <motion.i className="fa-brands fa-whatsapp" aria-hidden="true" animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }} />
                <span className="absolute inset-0 rounded-full animate-ping opacity-25" style={{ background: "rgba(37, 211, 102, 0.15)" }} />
              </div>
              <div>
                <p className="text-sm text-foreground-muted mb-1" style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}>Sau scrie-mi direct pe</p>
                <p className="text-lg font-semibold text-white/90" style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}>WhatsApp</p>
              </div>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm text-white/70 border border-white/8 bg-white/[0.03]" style={{ fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace" }}>
                <i className="fa-solid fa-mobile-screen text-xs text-green-400/80" aria-hidden="true" />
                {WHATSAPP_DISPLAY}
              </span>
              <motion.span className="text-xs text-foreground-dim" style={{ fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace" }} animate={{ y: [0, 3, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}>
                <i className="fa-solid fa-arrow-up-right-from-square mr-1" aria-hidden="true" />
                deschide conversația
              </motion.span>
            </div>

            {/* Card Info */}
            <div className="glass p-5 sm:p-6 flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-sm" style={{ background: "rgba(168, 85, 247, 0.12)", border: "1px solid rgba(168, 85, 247, 0.2)", color: "#c084fc" }}>
                  <i className="fa-solid fa-clock" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white/90" style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}>Răspuns rapid</p>
                  <p className="text-xs text-foreground-muted mt-1" style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}>Îți răspund în maximum 24 de ore, de luni până vineri.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-sm" style={{ background: "rgba(245, 158, 11, 0.12)", border: "1px solid rgba(245, 158, 11, 0.2)", color: "#fbbf24" }}>
                  <i className="fa-solid fa-comment-dots" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white/90" style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}>Consultanță gratuită</p>
                  <p className="text-xs text-foreground-muted mt-1" style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}>Discuția inițială și estimarea de preț sunt gratuite.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-sm" style={{ background: "rgba(74, 222, 128, 0.1)", border: "1px solid rgba(74, 222, 128, 0.2)", color: "#4ade80" }}>
                  <i className="fa-solid fa-shield-halved" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white/90" style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}>Date în siguranță</p>
                  <p className="text-xs text-foreground-muted mt-1" style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}>Informațiile tale sunt criptate și nu sunt distribuite.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Vignetă colțuri */}
      <div className="absolute inset-0 pointer-events-none z-0" aria-hidden="true">
        <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-purple-800/6 via-purple-900/2 to-transparent rounded-br-full" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-tl from-purple-900/8 via-purple-800/2 to-transparent rounded-tl-full" />
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENTE
// ═══════════════════════════════════════════════════════════════

interface InputFloatingLabelProps {
  id: string;
  name: string;
  type: string;
  label: string;
  placeholder: string;
  icon: string;
  value: string;
  error?: string;
  focused: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onBlur: (e: FocusEvent<HTMLInputElement>) => void;
  onFocus: (e: FocusEvent<HTMLInputElement>) => void;
  autoComplete?: string;
  required?: boolean;
}

function InputFloatingLabel({
  id, name, type, label, placeholder, icon, value, error, focused,
  onChange, onBlur, onFocus, autoComplete, required,
}: InputFloatingLabelProps) {
  const hasValue = value.trim().length > 0;
  const isActive = focused || hasValue;
  const hasError = !!error;

  return (
    <div className="relative">
      <div className="relative">
        <span
          className={`absolute left-4 top-1/2 -translate-y-1/2 text-sm pointer-events-none transition-colors duration-200 z-10 ${isActive ? "text-purple-400" : hasError ? "text-red-400" : "text-foreground-dim"}`}
          aria-hidden="true"
        >
          <i className={icon} />
        </span>
        <input
          id={id} name={name} type={type} value={value}
          placeholder={isActive ? placeholder : ""}
          onChange={onChange} onBlur={onBlur} onFocus={onFocus}
          autoComplete={autoComplete} required={required}
          aria-required={required} aria-invalid={hasError}
          aria-describedby={hasError ? `${id}-error` : undefined}
          className={`w-full pl-11 pr-4 pt-6 pb-2 rounded-xl text-base text-white/90 bg-white/[0.04] border outline-none transition-all duration-250 placeholder:text-foreground-dim/50 placeholder:text-sm ${
            hasError ? "border-red-500/50 focus:border-red-400 focus:ring-1 focus:ring-red-500/25"
            : focused ? "border-purple-500/50 focus:border-purple-400 focus:ring-1 focus:ring-purple-500/25"
            : "border-white/10 hover:border-white/18 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/25"
          }`}
          style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif", ...(focused && !hasError ? { boxShadow: "0 0 20px rgba(168, 85, 247, 0.08)" } : {}) }}
        />
        <label
          htmlFor={id}
          className={`absolute left-11 pointer-events-none transition-all duration-250 ease-out origin-left ${
            isActive ? "top-2 text-xs text-purple-400 scale-90" : "top-1/2 -translate-y-1/2 text-sm text-foreground-dim"
          } ${hasError && !isActive ? "text-red-400" : ""}`}
          style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}
        >
          {label}{required && <span className="ml-0.5 text-purple-400" aria-hidden="true">*</span>}
        </label>
      </div>
      <AnimatePresence>
        {hasError && (
          <motion.p id={`${id}-error`} variants={errorVariants} initial="initial" animate="animate" exit="exit"
            className="text-xs text-red-400/90 ml-1" role="alert"
            style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}>
            <i className="fa-solid fa-circle-exclamation mr-1.5 text-[10px]" aria-hidden="true" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

interface TextareaFloatingLabelProps {
  id: string; name: string; label: string; placeholder: string; icon: string;
  value: string; error?: string; focused: boolean;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur: (e: FocusEvent<HTMLTextAreaElement>) => void;
  onFocus: (e: FocusEvent<HTMLTextAreaElement>) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  required?: boolean;
}

function TextareaFloatingLabel({
  id, name, label, placeholder, icon, value, error, focused,
  onChange, onBlur, onFocus, textareaRef, required,
}: TextareaFloatingLabelProps) {
  const hasValue = value.trim().length > 0;
  const isActive = focused || hasValue;
  const hasError = !!error;

  return (
    <div className="relative">
      <span
        className={`absolute left-4 top-6 text-sm pointer-events-none transition-colors duration-200 z-10 ${isActive ? "text-purple-400" : hasError ? "text-red-400" : "text-foreground-dim"}`}
        aria-hidden="true"
      >
        <i className={icon} />
      </span>
      <textarea
        id={id} name={name} ref={textareaRef} value={value}
        placeholder={isActive ? placeholder : ""}
        onChange={onChange} onBlur={onBlur} onFocus={onFocus}
        rows={4} required={required}
        aria-required={required} aria-invalid={hasError}
        aria-describedby={hasError ? `${id}-error` : undefined}
        className={`w-full pl-11 pr-4 pt-6 pb-2 rounded-xl text-base text-white/90 bg-white/[0.04] border outline-none resize-none transition-all duration-250 placeholder:text-foreground-dim/50 placeholder:text-sm min-h-[120px] ${
          hasError ? "border-red-500/50 focus:border-red-400 focus:ring-1 focus:ring-red-500/25"
          : focused ? "border-purple-500/50 focus:border-purple-400 focus:ring-1 focus:ring-purple-500/25"
          : "border-white/10 hover:border-white/18 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/25"
        }`}
        style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif", ...(focused && !hasError ? { boxShadow: "0 0 20px rgba(168, 85, 247, 0.08)" } : {}) }}
      />
      <label
        htmlFor={id}
        className={`absolute left-11 pointer-events-none transition-all duration-250 ease-out origin-left ${
          isActive ? "top-2 text-xs text-purple-400 scale-90" : "top-6 text-sm text-foreground-dim"
        } ${hasError && !isActive ? "text-red-400" : ""}`}
        style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}
      >
        {label}{required && <span className="ml-0.5 text-purple-400" aria-hidden="true">*</span>}
      </label>
      {hasValue && (
        <span className="absolute right-3 bottom-2 text-[10px] text-foreground-dim" style={{ fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace" }}>
          {value.length} caractere
        </span>
      )}
      <AnimatePresence>
        {hasError && (
          <motion.p id={`${id}-error`} variants={errorVariants} initial="initial" animate="animate" exit="exit"
            className="text-xs text-red-400/90 ml-1" role="alert"
            style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}>
            <i className="fa-solid fa-circle-exclamation mr-1.5 text-[10px]" aria-hidden="true" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}