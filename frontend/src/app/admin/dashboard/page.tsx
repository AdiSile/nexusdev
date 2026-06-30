"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  fetchSettings,
  updateSettings,
  fetchServices,
  createService,
  updateService,
  deleteService,
  fetchProcessSteps,
  createProcessStep,
  updateProcessStep,
  deleteProcessStep,
  fetchFaq,
  createFaqItem,
  updateFaqItem,
  deleteFaqItem,
  fetchPortfolio,
  createPortfolioProject,
  updatePortfolioProject,
  deletePortfolioProject,
  fetchMessages,
  markMessageRead,
  deleteMessage,
} from "@/lib/api";
import type {
  SiteSettings,
  ServiceItem,
  ServicePayload,
  ServiceCategory,
  ProcessStep,
  ProcessStepPayload,
  FaqItem,
  FaqItemPayload,
  FaqCategory,
  PortfolioProject,
  PortfolioProjectPayload,
  ContactMessage,
  FooterLink,
} from "@/lib/api";

// ═══════════════════════════════════════════════════════════════
// CONSTANTE
// ═══════════════════════════════════════════════════════════════

const ICONS = {
  SPINNER: "fa-solid fa-spinner",
  CHECK: "fa-solid fa-circle-check",
  TRIANGLE: "fa-solid fa-triangle-exclamation",
  XMARK: "fa-solid fa-xmark",
  PLUS: "fa-solid fa-plus",
  TRASH: "fa-solid fa-trash-can",
  PEN: "fa-solid fa-pen",
  SAVE: "fa-solid fa-floppy-disk",
  ARROW_UP: "fa-solid fa-chevron-up",
  ARROW_DOWN: "fa-solid fa-chevron-down",
  EYE: "fa-solid fa-eye",
  EYE_SLASH: "fa-solid fa-eye-slash",
  ENVELOPE: "fa-solid fa-envelope",
  PHONE: "fa-solid fa-phone",
  LOCATION: "fa-solid fa-location-dot",
  CLOCK: "fa-solid fa-clock",
  GLOBE: "fa-solid fa-globe",
  SEARCH: "fa-solid fa-magnifying-glass",
  HOME: "fa-solid fa-house",
  USER: "fa-solid fa-user",
  STAR: "fa-solid fa-star",
  FIRE: "fa-solid fa-fire",
  TAG: "fa-solid fa-tag",
  LINK: "fa-solid fa-link",
  GITHUB: "fa-brands fa-github",
  FACEBOOK: "fa-brands fa-facebook",
  TIKTOK: "fa-brands fa-tiktok",
  IMAGE: "fa-solid fa-image",
  PALETTE: "fa-solid fa-palette",
  GEAR: "fa-solid fa-gear",
  MESSAGE: "fa-solid fa-message",
  QUESTION: "fa-solid fa-circle-question",
  CUBES: "fa-solid fa-cubes",
  FOLDER: "fa-solid fa-folder-open",
  LAYER: "fa-solid fa-layer-group",
  LIST: "fa-solid fa-list-check",
  CHART: "fa-solid fa-chart-simple",
  GRID: "fa-solid fa-grid-2",
  ROCKET: "fa-solid fa-rocket",
  SHIELD: "fa-solid fa-shield-halved",
  CROWN: "fa-solid fa-crown",
  BOLT: "fa-solid fa-bolt",
  WAND: "fa-solid fa-wand-magic-sparkles",
  CODE: "fa-solid fa-code",
  MOBILE: "fa-solid fa-mobile-screen",
  DESKTOP: "fa-solid fa-desktop",
  DATABASE: "fa-solid fa-database",
  CLOUD: "fa-solid fa-cloud",
  LOCK: "fa-solid fa-lock",
  KEY: "fa-solid fa-key",
  BELL: "fa-solid fa-bell",
  COMMENTS: "fa-solid fa-comments",
  CIRCLE: "fa-solid fa-circle",
};

const SERVICE_ICONS: string[] = [
  "fa-solid fa-code",
  "fa-solid fa-mobile-screen",
  "fa-solid fa-desktop",
  "fa-solid fa-globe",
  "fa-solid fa-palette",
  "fa-solid fa-rocket",
  "fa-solid fa-database",
  "fa-solid fa-cloud",
  "fa-solid fa-shield-halved",
  "fa-solid fa-gears",
  "fa-solid fa-wand-magic-sparkles",
  "fa-solid fa-cubes",
  "fa-solid fa-layer-group",
  "fa-solid fa-chart-simple",
  "fa-solid fa-bolt",
  "fa-solid fa-crown",
  "fa-solid fa-fire",
  "fa-solid fa-star",
  "fa-solid fa-magnifying-glass-chart",
  "fa-solid fa-robot",
  "fa-solid fa-brain",
  "fa-solid fa-comments",
  "fa-solid fa-cart-shopping",
  "fa-solid fa-headset",
  "fa-solid fa-pen-ruler",
  "fa-solid fa-compass-drafting",
  "fa-solid fa-clapperboard",
];

const PROCESS_ICONS: string[] = [
  "fa-solid fa-lightbulb",
  "fa-solid fa-pencil",
  "fa-solid fa-code",
  "fa-solid fa-rocket",
  "fa-solid fa-gear",
  "fa-solid fa-magnifying-glass-chart",
  "fa-solid fa-comments",
  "fa-solid fa-layer-group",
  "fa-solid fa-wrench",
];

const SERVICE_CATEGORIES: ServiceCategory[] = ["web", "mobile", "design", "marketing", "consulting"];
const FAQ_CATEGORIES: FaqCategory[] = ["Generale", "Preturi", "Proces", "Tehnic"];

const TABS = [
  { id: "hero", label: "Hero & General", icon: ICONS.HOME },
  { id: "services", label: "Servicii", icon: ICONS.CUBES },
  { id: "process", label: "Cum lucrăm", icon: ICONS.LIST },
  { id: "faq", label: "FAQ", icon: ICONS.QUESTION },
  { id: "portfolio", label: "Portofoliu", icon: ICONS.FOLDER },
  { id: "contact", label: "Contact", icon: ICONS.ENVELOPE },
  { id: "seo", label: "SEO & Footer", icon: ICONS.CHART },
  { id: "messages", label: "Mesaje", icon: ICONS.MESSAGE },
];

// ═══════════════════════════════════════════════════════════════
// TIPURI LOCALE
// ═══════════════════════════════════════════════════════════════

interface Toast {
  id: number;
  message: string;
  type: "success" | "error";
}

// ═══════════════════════════════════════════════════════════════
// SETĂRI IMPLICITE
// ═══════════════════════════════════════════════════════════════

const DEFAULT_SETTINGS: SiteSettings = {
  heroTitle: "",
  heroSubtitle: "",
  heroBadge: "",
  heroVideoUrl: "",
  heroMorphingMessages: [],
  heroShowPortfolioButton: true,
  aboutTitle: "",
  aboutDescription: "",
  aboutIdentity: "",
  contactEmail: "",
  contactPhone: "",
  contactAddress: "",
  contactWorkingHours: "",
  seoTitle: "",
  seoDescription: "",
  seoKeywords: [],
  seoUrl: "",
  seoOgTitle: "",
  seoOgDescription: "",
  seoOgImage: "",
  seoTwitterCard: "summary_large_image",
  footerCopyright: "",
  footerFacebookUrl: "",
  footerTiktokUrl: "",
  footerLinks: [],
};

// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENTĂ: TOAST
// ═══════════════════════════════════════════════════════════════

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: number) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 80, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.95 }}
      transition={{ duration: 0.3, ease: [0.33, 1, 0.68, 1] }}
      className={`flex items-center gap-3 px-5 py-3.5 rounded-xl border backdrop-blur-xl shadow-2xl min-w-[320px] max-w-[420px] ${
        toast.type === "success"
          ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-300"
          : "bg-red-500/10 border-red-500/25 text-red-300"
      }`}
      style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}
    >
      <i
        className={`${toast.type === "success" ? ICONS.CHECK : ICONS.TRIANGLE} text-lg flex-shrink-0 ${
          toast.type === "success" ? "text-emerald-400" : "text-red-400"
        }`}
        aria-hidden="true"
      />
      <span className="text-sm font-medium flex-1">{toast.message}</span>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="w-7 h-7 rounded-lg flex items-center justify-center text-current/50 hover:text-current hover:bg-white/5 transition-all duration-200 flex-shrink-0"
        aria-label="Închide notificarea"
      >
        <i className={ICONS.XMARK} aria-hidden="true" />
      </button>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENTĂ: CONFIRM MODAL
// ═══════════════════════════════════════════════════════════════

function ConfirmModal({
  open,
  title,
  message,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} aria-hidden="true" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
          className="relative z-10 glass-lg p-6 sm:p-8 mx-4 max-w-md w-full flex flex-col gap-5"
        >
          <h3 className="text-xl font-bold text-white/90" style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif" }}>
            {title}
          </h3>
          <p className="text-sm text-foreground-muted leading-relaxed" style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}>
            {message}
          </p>
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 rounded-lg text-sm font-medium text-foreground-muted hover:text-white border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 transition-all duration-200"
              style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}
            >
              Anulează
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 shadow-[0_4px_16px_rgba(239,68,68,0.3)] transition-all duration-200"
              style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}
            >
              Confirmă
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENTĂ: INPUT FIELD
// ═══════════════════════════════════════════════════════════════

function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  disabled,
  required,
  rows,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
  required?: boolean;
  rows?: number;
}) {
  const inputClasses =
    "w-full px-4 py-2.5 rounded-lg text-sm text-white placeholder:text-foreground-dim/30 bg-white/5 border border-white/10 hover:border-white/20 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 outline-none transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed";

  return (
    <label className="flex flex-col gap-1.5">
      <span
        className="text-xs uppercase tracking-wider text-foreground-dim font-medium"
        style={{ fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace" }}
      >
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </span>
      {rows ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          rows={rows}
          className={inputClasses}
          style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif", resize: "vertical" }}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={inputClasses}
          style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}
        />
      )}
    </label>
  );
}

// ═══════════════════════════════════════════════════════════════
// TAB 1: HERO & GENERAL
// ═══════════════════════════════════════════════════════════════

function HeroTab({
  settings,
  setSettings,
  saving,
  onSave,
}: {
  settings: SiteSettings;
  setSettings: React.Dispatch<React.SetStateAction<SiteSettings>>;
  saving: boolean;
  onSave: () => void;
}) {
  const [newMorphMessage, setNewMorphMessage] = useState("");

  const addMorphMessage = () => {
    const trimmed = newMorphMessage.trim();
    if (!trimmed) return;
    setSettings((prev) => ({
      ...prev,
      heroMorphingMessages: [...prev.heroMorphingMessages, trimmed],
    }));
    setNewMorphMessage("");
  };

  const removeMorphMessage = (index: number) => {
    setSettings((prev) => ({
      ...prev,
      heroMorphingMessages: prev.heroMorphingMessages.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Hero Section */}
      <div className="glass p-6 flex flex-col gap-5">
        <h3
          className="text-lg font-bold text-white/90 flex items-center gap-2"
          style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif" }}
        >
          <i className={`${ICONS.HOME} text-purple-400`} aria-hidden="true" />
          Secțiunea Hero
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField label="Titlu Hero" value={settings.heroTitle} onChange={(v) => setSettings((p) => ({ ...p, heroTitle: v }))} placeholder="Nexus Dev Studio" />
          <InputField label="Subtitlu" value={settings.heroSubtitle} onChange={(v) => setSettings((p) => ({ ...p, heroSubtitle: v }))} placeholder="Transformăm idei în realitate digitală" />
          <InputField label="Badge ofertă" value={settings.heroBadge} onChange={(v) => setSettings((p) => ({ ...p, heroBadge: v }))} placeholder="🔥 Ofertă limitată -20%" />
          <InputField label="URL Video fundal" value={settings.heroVideoUrl} onChange={(v) => setSettings((p) => ({ ...p, heroVideoUrl: v }))} placeholder="https://... .mp4" />
        </div>

        {/* Morphing Messages */}
        <div className="flex flex-col gap-3">
          <span
            className="text-xs uppercase tracking-wider text-foreground-dim font-medium"
            style={{ fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace" }}
          >
            Mesaje morphing
          </span>
          <div className="flex gap-2">
            <input
              type="text"
              value={newMorphMessage}
              onChange={(e) => setNewMorphMessage(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") addMorphMessage(); }}
              placeholder="Scrie un mesaj..."
              className="flex-1 px-4 py-2.5 rounded-lg text-sm text-white placeholder:text-foreground-dim/30 bg-white/5 border border-white/10 hover:border-white/20 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 outline-none transition-all duration-200"
              style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}
            />
            <button
              type="button"
              onClick={addMorphMessage}
              className="px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-purple-600 hover:bg-purple-500 transition-all duration-200 flex items-center gap-1.5"
              style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}
            >
              <i className={ICONS.PLUS} aria-hidden="true" /> Adaugă
            </button>
          </div>
          {settings.heroMorphingMessages.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {settings.heroMorphingMessages.map((msg, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-white/80 bg-purple-500/15 border border-purple-500/20"
                  style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}
                >
                  {msg}
                  <button
                    type="button"
                    onClick={() => removeMorphMessage(i)}
                    className="w-4 h-4 rounded-full flex items-center justify-center text-purple-400/60 hover:text-red-400 transition-colors"
                    aria-label={`Șterge mesajul: ${msg}`}
                  >
                    <i className={`${ICONS.XMARK} text-[10px]`} aria-hidden="true" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Toggle Portfolio Button */}
        <label className="flex items-center gap-3 cursor-pointer">
          <button
            type="button"
            role="switch"
            aria-checked={settings.heroShowPortfolioButton}
            onClick={() => setSettings((p) => ({ ...p, heroShowPortfolioButton: !p.heroShowPortfolioButton }))}
            className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
              settings.heroShowPortfolioButton ? "bg-purple-600" : "bg-white/10"
            }`}
          >
            <motion.span
              className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md"
              animate={{ x: settings.heroShowPortfolioButton ? 20 : 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </button>
          <span className="text-sm text-foreground-muted" style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}>
            Afișează butonul Portofoliu în Hero
          </span>
        </label>
      </div>

      {/* About Section */}
      <div className="glass p-6 flex flex-col gap-5">
        <h3
          className="text-lg font-bold text-white/90 flex items-center gap-2"
          style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif" }}
        >
          <i className={`${ICONS.USER} text-purple-400`} aria-hidden="true" />
          Secțiunea Despre
        </h3>
        <InputField label="Titlu Despre" value={settings.aboutTitle} onChange={(v) => setSettings((p) => ({ ...p, aboutTitle: v }))} placeholder="Despre Nexus Dev Studio" />
        <InputField label="Descriere Despre" value={settings.aboutDescription} onChange={(v) => setSettings((p) => ({ ...p, aboutDescription: v }))} placeholder="Suntem o echipă pasionată..." rows={4} />
        <InputField label="Identitate" value={settings.aboutIdentity} onChange={(v) => setSettings((p) => ({ ...p, aboutIdentity: v }))} placeholder="Nexus Dev Studio — agenție de dezvoltare digitală" />
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="px-6 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-purple-700 via-purple-500 to-purple-700 bg-[length:200%_100%] shadow-[0_4px_20px_rgba(126,34,206,0.35)] hover:shadow-[0_6px_28px_rgba(126,34,206,0.5)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
          style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}
        >
          {saving ? (
            <>
              <i className={`${ICONS.SPINNER} animate-spin`} aria-hidden="true" /> Se salvează...
            </>
          ) : (
            <>
              <i className={ICONS.SAVE} aria-hidden="true" /> Salvează Hero & Despre
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TAB 2: SERVICII
// ═══════════════════════════════════════════════════════════════

function ServicesTab({ addToast }: { addToast: (msg: string, type: "success" | "error") => void }) {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ServiceItem | null>(null);
  const [form, setForm] = useState<ServicePayload>({
    icon: "fa-solid fa-code",
    title: "",
    description: "",
    originalPrice: 0,
    reducedPrice: 0,
    discountPercent: 0,
    category: "web",
    popular: false,
  });
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const loadServices = useCallback(async () => {
    setLoading(true);
    const res = await fetchServices();
    if (res.data) setServices(res.data);
    else addToast(res.error || "Eroare la încărcarea serviciilor", "error");
    setLoading(false);
  }, [addToast]);

  useEffect(() => { loadServices(); }, [loadServices]);

  const resetForm = () => {
    setEditing(null);
    setForm({ icon: "fa-solid fa-code", title: "", description: "", originalPrice: 0, reducedPrice: 0, discountPercent: 0, category: "web", popular: false });
    setShowIconPicker(false);
  };

  const handleEdit = (s: ServiceItem) => {
    setEditing(s);
    setForm({ icon: s.icon, title: s.title, description: s.description, originalPrice: s.originalPrice, reducedPrice: s.reducedPrice, discountPercent: s.discountPercent, category: s.category, popular: s.popular });
  };

  const handlePriceChange = (field: "originalPrice" | "reducedPrice", val: string) => {
    const num = parseFloat(val) || 0;
    setForm((prev) => {
      const updated = { ...prev, [field]: num };
      if (updated.originalPrice > 0 && updated.reducedPrice > 0) {
        updated.discountPercent = Math.round(((updated.originalPrice - updated.reducedPrice) / updated.originalPrice) * 100);
      } else {
        updated.discountPercent = 0;
      }
      return updated;
    });
  };

  const handleSave = async () => {
    if (!form.title.trim()) { addToast("Titlul serviciului este obligatoriu", "error"); return; }
    setSaving(true);
    if (editing) {
      const res = await updateService(editing.id, form);
      if (res.data) { addToast("Serviciu actualizat cu succes", "success"); loadServices(); resetForm(); }
      else addToast(res.error || "Eroare la actualizare", "error");
    } else {
      const res = await createService(form);
      if (res.data) { addToast("Serviciu creat cu succes", "success"); loadServices(); resetForm(); }
      else addToast(res.error || "Eroare la creare", "error");
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    const res = await deleteService(id);
    if (res.ok) { addToast("Serviciu șters", "success"); loadServices(); }
    else addToast(res.error || "Eroare la ștergere", "error");
    setConfirmDelete(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <i className={`${ICONS.SPINNER} animate-spin text-2xl text-purple-400`} aria-hidden="true" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Form */}
      <div className="glass p-6 flex flex-col gap-5">
        <h3 className="text-lg font-bold text-white/90 flex items-center gap-2" style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif" }}>
          <i className={`${ICONS.CUBES} text-purple-400`} aria-hidden="true" />
          {editing ? "Editează serviciul" : "Adaugă serviciu nou"}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Icon Picker */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs uppercase tracking-wider text-foreground-dim font-medium" style={{ fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace" }}>
              Iconiță
            </span>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowIconPicker(!showIconPicker)}
                className="w-full px-4 py-2.5 rounded-lg text-sm text-white bg-white/5 border border-white/10 hover:border-white/20 focus:border-purple-500/50 transition-all duration-200 flex items-center gap-3"
                style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}
              >
                <i className={`${form.icon} text-purple-400`} aria-hidden="true" />
                <span className="flex-1 text-left text-foreground-muted">{form.icon}</span>
                <i className={`${showIconPicker ? ICONS.ARROW_UP : ICONS.ARROW_DOWN} text-foreground-dim`} aria-hidden="true" />
              </button>
              <AnimatePresence>
                {showIconPicker && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute z-30 mt-1 p-3 rounded-xl bg-[#1a1a25] border border-white/10 shadow-2xl grid grid-cols-9 gap-1.5 max-h-56 overflow-y-auto"
                  >
                    {SERVICE_ICONS.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => { setForm((p) => ({ ...p, icon })); setShowIconPicker(false); }}
                        className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm transition-all duration-150 ${
                          form.icon === icon ? "bg-purple-600/30 text-purple-400 border border-purple-500/40" : "text-foreground-muted hover:text-white hover:bg-white/5"
                        }`}
                      >
                        <i className={icon} aria-hidden="true" />
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <InputField label="Titlu" value={form.title} onChange={(v) => setForm((p) => ({ ...p, title: v }))} placeholder="Web Development" required />

          <div className="md:col-span-2">
            <InputField label="Descriere" value={form.description} onChange={(v) => setForm((p) => ({ ...p, description: v }))} placeholder="Descrierea serviciului..." rows={3} />
          </div>

          {/* Category */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs uppercase tracking-wider text-foreground-dim font-medium" style={{ fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace" }}>
              Categorie
            </span>
            <select
              value={form.category}
              onChange={(e) => setForm((p) => ({ ...p, category: e.target.value as ServiceCategory }))}
              className="px-4 py-2.5 rounded-lg text-sm text-white bg-white/5 border border-white/10 hover:border-white/20 focus:border-purple-500/50 outline-none transition-all duration-200"
              style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}
            >
              {SERVICE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="bg-[#1a1a25]">
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Prices */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <span className="text-xs uppercase tracking-wider text-foreground-dim font-medium" style={{ fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace" }}>
                Preț original (RON)
              </span>
              <input
                type="number"
                value={form.originalPrice || ""}
                onChange={(e) => handlePriceChange("originalPrice", e.target.value)}
                placeholder="0"
                min="0"
                className="px-4 py-2.5 rounded-lg text-sm text-white placeholder:text-foreground-dim/30 bg-white/5 border border-white/10 hover:border-white/20 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 outline-none transition-all duration-200"
                style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-xs uppercase tracking-wider text-foreground-dim font-medium" style={{ fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace" }}>
                Preț redus (RON)
              </span>
              <input
                type="number"
                value={form.reducedPrice || ""}
                onChange={(e) => handlePriceChange("reducedPrice", e.target.value)}
                placeholder="0"
                min="0"
                className="px-4 py-2.5 rounded-lg text-sm text-white placeholder:text-foreground-dim/30 bg-white/5 border border-white/10 hover:border-white/20 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 outline-none transition-all duration-200"
                style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}
              />
            </div>
          </div>

          {/* Discount & Popular */}
          <div className="flex items-center gap-6">
            <div className="flex flex-col gap-1.5">
              <span className="text-xs uppercase tracking-wider text-foreground-dim font-medium" style={{ fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace" }}>
                Discount
              </span>
              <span className="text-lg font-bold text-purple-400" style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}>
                {form.discountPercent}%
              </span>
            </div>
            <label className="flex items-center gap-3 cursor-pointer mt-5">
              <button
                type="button"
                role="switch"
                aria-checked={form.popular}
                onClick={() => setForm((p) => ({ ...p, popular: !p.popular }))}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${form.popular ? "bg-amber-500" : "bg-white/10"}`}
              >
                <motion.span
                  className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md"
                  animate={{ x: form.popular ? 20 : 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </button>
              <span className="text-sm text-foreground-muted flex items-center gap-1.5" style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}>
                <i className={`${ICONS.FIRE} text-amber-400`} aria-hidden="true" /> Popular
              </span>
            </label>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-purple-700 to-purple-500 hover:from-purple-600 hover:to-purple-400 disabled:opacity-50 transition-all duration-200 flex items-center gap-1.5"
            style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}
          >
            {saving ? <><i className={`${ICONS.SPINNER} animate-spin`} aria-hidden="true" /> Se salvează...</> : <><i className={ICONS.SAVE} aria-hidden="true" /> {editing ? "Actualizează" : "Adaugă"}</>}
          </button>
          {editing && (
            <button
              type="button"
              onClick={resetForm}
              className="px-5 py-2.5 rounded-lg text-sm font-medium text-foreground-muted hover:text-white border border-white/10 hover:border-white/20 transition-all duration-200"
              style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}
            >
              Anulează
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="glass p-6 flex flex-col gap-4">
        <h3 className="text-lg font-bold text-white/90 flex items-center gap-2" style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif" }}>
          <i className={`${ICONS.LIST} text-purple-400`} aria-hidden="true" />
          Servicii ({services.length})
        </h3>
        {services.length === 0 ? (
          <p className="text-sm text-foreground-muted text-center py-8" style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}>
            Niciun serviciu adăugat.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {services.map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all duration-200 group"
              >
                <span className="w-9 h-9 rounded-lg flex items-center justify-center text-sm bg-purple-500/10 text-purple-400 flex-shrink-0">
                  <i className={s.icon} aria-hidden="true" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white/90 truncate" style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}>
                    {s.title}
                    {s.popular && <i className={`${ICONS.FIRE} ml-1.5 text-amber-400 text-xs`} aria-label="Popular" />}
                  </p>
                  <p className="text-xs text-foreground-dim truncate">{s.category} {s.discountPercent > 0 && `• -${s.discountPercent}%`}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  {s.discountPercent > 0 ? (
                    <>
                      <span className="text-xs text-foreground-dim line-through">{s.originalPrice} RON</span>
                      <span className="text-sm font-bold text-purple-400 ml-1.5">{s.reducedPrice} RON</span>
                    </>
                  ) : (
                    <span className="text-sm font-bold text-white/80">{s.originalPrice || s.reducedPrice} RON</span>
                  )}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    type="button"
                    onClick={() => handleEdit(s)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-foreground-dim hover:text-purple-400 hover:bg-purple-500/10 transition-all"
                    aria-label={`Editează ${s.title}`}
                  >
                    <i className={ICONS.PEN} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(s.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-foreground-dim hover:text-red-400 hover:bg-red-500/10 transition-all"
                    aria-label={`Șterge ${s.title}`}
                  >
                    <i className={ICONS.TRASH} aria-hidden="true" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        open={!!confirmDelete}
        title="Șterge serviciul"
        message="Ești sigur că vrei să ștergi acest serviciu? Acțiunea este ireversibilă."
        onConfirm={() => confirmDelete && handleDelete(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TAB 3: PROCES (CUM LUCRĂM)
// ═══════════════════════════════════════════════════════════════

function ProcessTab({ addToast }: { addToast: (msg: string, type: "success" | "error") => void }) {
  const [steps, setSteps] = useState<ProcessStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ProcessStep | null>(null);
  const [form, setForm] = useState<ProcessStepPayload>({
    label: "",
    title: "",
    description: "",
    icon: "fa-solid fa-lightbulb",
    gradient: "linear-gradient(135deg, #7e22ce, #a855f7)",
    highlights: [],
    order: 0,
  });
  const [newHighlight, setNewHighlight] = useState("");
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const loadSteps = useCallback(async () => {
    setLoading(true);
    const res = await fetchProcessSteps();
    if (res.data) setSteps(res.data);
    else addToast(res.error || "Eroare la încărcare", "error");
    setLoading(false);
  }, [addToast]);

  useEffect(() => { loadSteps(); }, [loadSteps]);

  const resetForm = () => {
    setEditing(null);
    setForm({ label: "", title: "", description: "", icon: "fa-solid fa-lightbulb", gradient: "linear-gradient(135deg, #7e22ce, #a855f7)", highlights: [], order: 0 });
    setNewHighlight("");
    setShowIconPicker(false);
  };

  const handleEdit = (s: ProcessStep) => {
    setEditing(s);
    setForm({ label: s.label, title: s.title, description: s.description, icon: s.icon, gradient: s.gradient, highlights: [...s.highlights], order: s.order });
  };

  const addHighlight = () => {
    const t = newHighlight.trim();
    if (!t) return;
    setForm((p) => ({ ...p, highlights: [...p.highlights, t] }));
    setNewHighlight("");
  };

  const removeHighlight = (i: number) => {
    setForm((p) => ({ ...p, highlights: p.highlights.filter((_, idx) => idx !== i) }));
  };

  const handleSave = async () => {
    if (!form.title.trim()) { addToast("Titlul este obligatoriu", "error"); return; }
    setSaving(true);
    if (editing) {
      const res = await updateProcessStep(editing.id, form);
      if (res.data) { addToast("Pas actualizat", "success"); loadSteps(); resetForm(); }
      else addToast(res.error || "Eroare", "error");
    } else {
      const res = await createProcessStep({ ...form, order: steps.length });
      if (res.data) { addToast("Pas creat", "success"); loadSteps(); resetForm(); }
      else addToast(res.error || "Eroare", "error");
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    const res = await deleteProcessStep(id);
    if (res.ok) { addToast("Pas șters", "success"); loadSteps(); }
    else addToast(res.error || "Eroare", "error");
    setConfirmDelete(null);
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    setSteps((prev) => {
      const arr = [...prev];
      [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
      return arr;
    });
  };

  const moveDown = (index: number) => {
    if (index === steps.length - 1) return;
    setSteps((prev) => {
      const arr = [...prev];
      [arr[index], arr[index + 1]] = [arr[index + 1], arr[index]];
      return arr;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <i className={`${ICONS.SPINNER} animate-spin text-2xl text-purple-400`} aria-hidden="true" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Form */}
      <div className="glass p-6 flex flex-col gap-5">
        <h3 className="text-lg font-bold text-white/90 flex items-center gap-2" style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif" }}>
          <i className={`${ICONS.LIST} text-purple-400`} aria-hidden="true" />
          {editing ? "Editează pasul" : "Adaugă pas nou"}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField label="Etichetă" value={form.label} onChange={(v) => setForm((p) => ({ ...p, label: v }))} placeholder="Pasul 1" />
          <InputField label="Titlu" value={form.title} onChange={(v) => setForm((p) => ({ ...p, title: v }))} placeholder="Descoperire & Strategie" required />

          <div className="md:col-span-2">
            <InputField label="Descriere" value={form.description} onChange={(v) => setForm((p) => ({ ...p, description: v }))} placeholder="Detalii despre acest pas..." rows={3} />
          </div>

          {/* Icon Picker */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs uppercase tracking-wider text-foreground-dim font-medium" style={{ fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace" }}>Iconiță</span>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowIconPicker(!showIconPicker)}
                className="w-full px-4 py-2.5 rounded-lg text-sm text-white bg-white/5 border border-white/10 hover:border-white/20 focus:border-purple-500/50 transition-all duration-200 flex items-center gap-3"
                style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}
              >
                <i className={`${form.icon} text-purple-400`} aria-hidden="true" />
                <span className="flex-1 text-left text-foreground-muted">{form.icon}</span>
                <i className={`${showIconPicker ? ICONS.ARROW_UP : ICONS.ARROW_DOWN} text-foreground-dim`} aria-hidden="true" />
              </button>
              <AnimatePresence>
                {showIconPicker && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute z-30 mt-1 p-3 rounded-xl bg-[#1a1a25] border border-white/10 shadow-2xl grid grid-cols-3 gap-1.5 max-h-48 overflow-y-auto"
                  >
                    {PROCESS_ICONS.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => { setForm((p) => ({ ...p, icon })); setShowIconPicker(false); }}
                        className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm transition-all duration-150 ${
                          form.icon === icon ? "bg-purple-600/30 text-purple-400 border border-purple-500/40" : "text-foreground-muted hover:text-white hover:bg-white/5"
                        }`}
                      >
                        <i className={icon} aria-hidden="true" />
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <InputField label="Gradient CSS" value={form.gradient} onChange={(v) => setForm((p) => ({ ...p, gradient: v }))} placeholder="linear-gradient(135deg, #7e22ce, #a855f7)" />
        </div>

        {/* Highlights */}
        <div className="flex flex-col gap-3">
          <span className="text-xs uppercase tracking-wider text-foreground-dim font-medium" style={{ fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace" }}>
            Highlights
          </span>
          <div className="flex gap-2">
            <input
              type="text"
              value={newHighlight}
              onChange={(e) => setNewHighlight(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") addHighlight(); }}
              placeholder="Punct cheie..."
              className="flex-1 px-4 py-2.5 rounded-lg text-sm text-white placeholder:text-foreground-dim/30 bg-white/5 border border-white/10 hover:border-white/20 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 outline-none transition-all duration-200"
              style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}
            />
            <button
              type="button"
              onClick={addHighlight}
              className="px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-purple-600 hover:bg-purple-500 transition-all duration-200 flex items-center gap-1.5"
              style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}
            >
              <i className={ICONS.PLUS} aria-hidden="true" /> Adaugă
            </button>
          </div>
          {form.highlights.length > 0 && (
            <div className="flex flex-col gap-1.5">
              {form.highlights.map((h, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.02] border border-white/5">
                  <span className="text-xs text-purple-400">•</span>
                  <span className="flex-1 text-sm text-foreground-muted" style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}>{h}</span>
                  <button type="button" onClick={() => removeHighlight(i)} className="w-6 h-6 rounded flex items-center justify-center text-foreground-dim hover:text-red-400 transition-colors" aria-label="Șterge highlight">
                    <i className={`${ICONS.XMARK} text-xs`} aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={handleSave} disabled={saving}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-purple-700 to-purple-500 hover:from-purple-600 hover:to-purple-400 disabled:opacity-50 transition-all duration-200 flex items-center gap-1.5"
            style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}
          >
            {saving ? <><i className={`${ICONS.SPINNER} animate-spin`} aria-hidden="true" /> Se salvează...</> : <><i className={ICONS.SAVE} aria-hidden="true" /> {editing ? "Actualizează" : "Adaugă"}</>}
          </button>
          {editing && (
            <button type="button" onClick={resetForm} className="px-5 py-2.5 rounded-lg text-sm font-medium text-foreground-muted hover:text-white border border-white/10 hover:border-white/20 transition-all duration-200"
              style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}>
              Anulează
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="glass p-6 flex flex-col gap-4">
        <h3 className="text-lg font-bold text-white/90 flex items-center gap-2" style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif" }}>
          <i className={`${ICONS.LAYER} text-purple-400`} aria-hidden="true" />
          Pași proces ({steps.length})
        </h3>
        {steps.length === 0 ? (
          <p className="text-sm text-foreground-muted text-center py-8" style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}>Niciun pas adăugat.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {steps.map((s, idx) => (
              <div key={s.id} className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all duration-200 group">
                <div className="flex flex-col gap-0.5">
                  <button type="button" onClick={() => moveUp(idx)} disabled={idx === 0} className="w-6 h-5 rounded flex items-center justify-center text-foreground-dim hover:text-white disabled:opacity-20 transition-colors" aria-label="Mută sus">
                    <i className={`${ICONS.ARROW_UP} text-[10px]`} aria-hidden="true" />
                  </button>
                  <button type="button" onClick={() => moveDown(idx)} disabled={idx === steps.length - 1} className="w-6 h-5 rounded flex items-center justify-center text-foreground-dim hover:text-white disabled:opacity-20 transition-colors" aria-label="Mută jos">
                    <i className={`${ICONS.ARROW_DOWN} text-[10px]`} aria-hidden="true" />
                  </button>
                </div>
                <span className="w-9 h-9 rounded-lg flex items-center justify-center text-sm bg-purple-500/10 text-purple-400 flex-shrink-0">
                  <i className={s.icon} aria-hidden="true" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white/90" style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}>
                    {s.label && <span className="text-purple-400/80 mr-1.5">{s.label}</span>}
                    {s.title}
                  </p>
                  <p className="text-xs text-foreground-dim truncate">{s.description}</p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button type="button" onClick={() => handleEdit(s)} className="w-8 h-8 rounded-lg flex items-center justify-center text-foreground-dim hover:text-purple-400 hover:bg-purple-500/10 transition-all" aria-label={`Editează ${s.title}`}>
                    <i className={ICONS.PEN} aria-hidden="true" />
                  </button>
                  <button type="button" onClick={() => setConfirmDelete(s.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-foreground-dim hover:text-red-400 hover:bg-red-500/10 transition-all" aria-label={`Șterge ${s.title}`}>
                    <i className={ICONS.TRASH} aria-hidden="true" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmModal open={!!confirmDelete} title="Șterge pasul" message="Ești sigur că vrei să ștergi acest pas?" onConfirm={() => confirmDelete && handleDelete(confirmDelete)} onCancel={() => setConfirmDelete(null)} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TAB 4: FAQ
// ═══════════════════════════════════════════════════════════════

function FaqTab({ addToast }: { addToast: (msg: string, type: "success" | "error") => void }) {
  const [items, setItems] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<FaqItem | null>(null);
  const [form, setForm] = useState<FaqItemPayload>({ question: "", answer: "", category: "Generale", order: 0 });
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const loadItems = useCallback(async () => {
    setLoading(true);
    const res = await fetchFaq();
    if (res.data) setItems(res.data);
    else addToast(res.error || "Eroare", "error");
    setLoading(false);
  }, [addToast]);

  useEffect(() => { loadItems(); }, [loadItems]);

  const resetForm = () => {
    setEditing(null);
    setForm({ question: "", answer: "", category: "Generale", order: 0 });
  };

  const handleEdit = (item: FaqItem) => {
    setEditing(item);
    setForm({ question: item.question, answer: item.answer, category: item.category, order: item.order });
  };

  const handleSave = async () => {
    if (!form.question.trim() || !form.answer.trim()) { addToast("Întrebarea și răspunsul sunt obligatorii", "error"); return; }
    setSaving(true);
    if (editing) {
      const res = await updateFaqItem(editing.id, form);
      if (res.data) { addToast("FAQ actualizat", "success"); loadItems(); resetForm(); }
      else addToast(res.error || "Eroare", "error");
    } else {
      const res = await createFaqItem({ ...form, order: items.length });
      if (res.data) { addToast("FAQ creat", "success"); loadItems(); resetForm(); }
      else addToast(res.error || "Eroare", "error");
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    const res = await deleteFaqItem(id);
    if (res.ok) { addToast("FAQ șters", "success"); loadItems(); }
    else addToast(res.error || "Eroare", "error");
    setConfirmDelete(null);
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><i className={`${ICONS.SPINNER} animate-spin text-2xl text-purple-400`} aria-hidden="true" /></div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="glass p-6 flex flex-col gap-5">
        <h3 className="text-lg font-bold text-white/90 flex items-center gap-2" style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif" }}>
          <i className={`${ICONS.QUESTION} text-purple-400`} aria-hidden="true" />
          {editing ? "Editează întrebarea" : "Adaugă întrebare nouă"}
        </h3>
        <div className="grid grid-cols-1 gap-4">
          <InputField label="Întrebare" value={form.question} onChange={(v) => setForm((p) => ({ ...p, question: v }))} placeholder="Care este timpul de livrare?" required />
          <InputField label="Răspuns" value={form.answer} onChange={(v) => setForm((p) => ({ ...p, answer: v }))} placeholder="Răspunsul detaliat..." rows={3} required />
          <div className="flex flex-col gap-1.5">
            <span className="text-xs uppercase tracking-wider text-foreground-dim font-medium" style={{ fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace" }}>Categorie</span>
            <select
              value={form.category}
              onChange={(e) => setForm((p) => ({ ...p, category: e.target.value as FaqCategory }))}
              className="px-4 py-2.5 rounded-lg text-sm text-white bg-white/5 border border-white/10 hover:border-white/20 focus:border-purple-500/50 outline-none transition-all duration-200"
              style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}
            >
              {FAQ_CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="bg-[#1a1a25]">{cat}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={handleSave} disabled={saving}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-purple-700 to-purple-500 hover:from-purple-600 hover:to-purple-400 disabled:opacity-50 transition-all duration-200 flex items-center gap-1.5"
            style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}
          >
            {saving ? <><i className={`${ICONS.SPINNER} animate-spin`} aria-hidden="true" /> Se salvează...</> : <><i className={ICONS.SAVE} aria-hidden="true" /> {editing ? "Actualizează" : "Adaugă"}</>}
          </button>
          {editing && (
            <button type="button" onClick={resetForm} className="px-5 py-2.5 rounded-lg text-sm font-medium text-foreground-muted hover:text-white border border-white/10 hover:border-white/20 transition-all duration-200"
              style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}>Anulează</button>
          )}
        </div>
      </div>

      <div className="glass p-6 flex flex-col gap-4">
        <h3 className="text-lg font-bold text-white/90 flex items-center gap-2" style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif" }}>
          <i className={`${ICONS.LIST} text-purple-400`} aria-hidden="true" /> Întrebări frecvente ({items.length})
        </h3>
        {items.length === 0 ? (
          <p className="text-sm text-foreground-muted text-center py-8" style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}>Nicio întrebare adăugată.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {items.map((item) => (
              <div key={item.id} className="flex items-start gap-3 px-4 py-3 rounded-lg bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all duration-200 group">
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-purple-500/10 text-purple-400 flex-shrink-0 mt-0.5" style={{ fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace" }}>
                  {item.category}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white/90" style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}>{item.question}</p>
                  <p className="text-xs text-foreground-dim mt-0.5 line-clamp-2" style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}>{item.answer}</p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0">
                  <button type="button" onClick={() => handleEdit(item)} className="w-8 h-8 rounded-lg flex items-center justify-center text-foreground-dim hover:text-purple-400 hover:bg-purple-500/10 transition-all" aria-label="Editează">
                    <i className={ICONS.PEN} aria-hidden="true" />
                  </button>
                  <button type="button" onClick={() => setConfirmDelete(item.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-foreground-dim hover:text-red-400 hover:bg-red-500/10 transition-all" aria-label="Șterge">
                    <i className={ICONS.TRASH} aria-hidden="true" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmModal open={!!confirmDelete} title="Șterge FAQ" message="Ești sigur?" onConfirm={() => confirmDelete && handleDelete(confirmDelete)} onCancel={() => setConfirmDelete(null)} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TAB 5: PORTOFOLIU
// ═══════════════════════════════════════════════════════════════

function PortfolioTab({ addToast }: { addToast: (msg: string, type: "success" | "error") => void }) {
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<PortfolioProject | null>(null);
  const [form, setForm] = useState<PortfolioProjectPayload>({
    title: "", category: "", description: "", imageUrl: "", imageAlt: "", demoUrl: "", githubUrl: "", techTags: [], featured: false,
  });
  const [newTag, setNewTag] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    const res = await fetchPortfolio();
    if (res.data) setProjects(res.data);
    else addToast(res.error || "Eroare", "error");
    setLoading(false);
  }, [addToast]);

  useEffect(() => { loadProjects(); }, [loadProjects]);

  const resetForm = () => {
    setEditing(null);
    setForm({ title: "", category: "", description: "", imageUrl: "", imageAlt: "", demoUrl: "", githubUrl: "", techTags: [], featured: false });
    setNewTag("");
  };

  const handleEdit = (p: PortfolioProject) => {
    setEditing(p);
    setForm({ title: p.title, category: p.category, description: p.description, imageUrl: p.imageUrl, imageAlt: p.imageAlt, demoUrl: p.demoUrl, githubUrl: p.githubUrl, techTags: [...p.techTags], featured: p.featured });
  };

  const addTag = () => {
    const t = newTag.trim();
    if (!t || form.techTags.includes(t)) return;
    setForm((p) => ({ ...p, techTags: [...p.techTags, t] }));
    setNewTag("");
  };

  const removeTag = (i: number) => {
    setForm((p) => ({ ...p, techTags: p.techTags.filter((_, idx) => idx !== i) }));
  };

  const handleSave = async () => {
    if (!form.title.trim()) { addToast("Titlul este obligatoriu", "error"); return; }
    setSaving(true);
    if (editing) {
      const res = await updatePortfolioProject(editing.id, form);
      if (res.data) { addToast("Proiect actualizat", "success"); loadProjects(); resetForm(); }
      else addToast(res.error || "Eroare", "error");
    } else {
      const res = await createPortfolioProject(form);
      if (res.data) { addToast("Proiect creat", "success"); loadProjects(); resetForm(); }
      else addToast(res.error || "Eroare", "error");
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    const res = await deletePortfolioProject(id);
    if (res.ok) { addToast("Proiect șters", "success"); loadProjects(); }
    else addToast(res.error || "Eroare", "error");
    setConfirmDelete(null);
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><i className={`${ICONS.SPINNER} animate-spin text-2xl text-purple-400`} aria-hidden="true" /></div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="glass p-6 flex flex-col gap-5">
        <h3 className="text-lg font-bold text-white/90 flex items-center gap-2" style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif" }}>
          <i className={`${ICONS.FOLDER} text-purple-400`} aria-hidden="true" />
          {editing ? "Editează proiectul" : "Adaugă proiect nou"}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField label="Titlu" value={form.title} onChange={(v) => setForm((p) => ({ ...p, title: v }))} placeholder="My Project" required />
          <InputField label="Categorie" value={form.category} onChange={(v) => setForm((p) => ({ ...p, category: v }))} placeholder="Web Development" />
          <div className="md:col-span-2">
            <InputField label="Descriere" value={form.description} onChange={(v) => setForm((p) => ({ ...p, description: v }))} placeholder="Descrierea proiectului..." rows={3} />
          </div>
          <InputField label="URL Imagine" value={form.imageUrl} onChange={(v) => setForm((p) => ({ ...p, imageUrl: v }))} placeholder="https://... .jpg" />
          <InputField label="Text alternativ imagine" value={form.imageAlt} onChange={(v) => setForm((p) => ({ ...p, imageAlt: v }))} placeholder="Captură ecran proiect" />
          <InputField label="URL Demo" value={form.demoUrl} onChange={(v) => setForm((p) => ({ ...p, demoUrl: v }))} placeholder="https://..." />
          <InputField label="URL GitHub" value={form.githubUrl} onChange={(v) => setForm((p) => ({ ...p, githubUrl: v }))} placeholder="https://github.com/..." />
        </div>

        {/* Tech Tags */}
        <div className="flex flex-col gap-3">
          <span className="text-xs uppercase tracking-wider text-foreground-dim font-medium" style={{ fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace" }}>Tag-uri tehnologii</span>
          <div className="flex gap-2">
            <input type="text" value={newTag} onChange={(e) => setNewTag(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") addTag(); }}
              placeholder="React, TypeScript..."
              className="flex-1 px-4 py-2.5 rounded-lg text-sm text-white placeholder:text-foreground-dim/30 bg-white/5 border border-white/10 hover:border-white/20 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 outline-none transition-all duration-200"
              style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}
            />
            <button type="button" onClick={addTag} className="px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-purple-600 hover:bg-purple-500 transition-all duration-200 flex items-center gap-1.5"
              style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}><i className={ICONS.PLUS} aria-hidden="true" /> Adaugă</button>
          </div>
          {form.techTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {form.techTags.map((tag, i) => (
                <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-white/80 bg-purple-500/15 border border-purple-500/20"
                  style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}>
                  {tag}
                  <button type="button" onClick={() => removeTag(i)} className="w-4 h-4 rounded-full flex items-center justify-center text-purple-400/60 hover:text-red-400 transition-colors" aria-label={`Șterge ${tag}`}>
                    <i className={`${ICONS.XMARK} text-[10px]`} aria-hidden="true" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Featured Toggle */}
        <label className="flex items-center gap-3 cursor-pointer">
          <button type="button" role="switch" aria-checked={form.featured}
            onClick={() => setForm((p) => ({ ...p, featured: !p.featured }))}
            className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${form.featured ? "bg-amber-500" : "bg-white/10"}`}
          >
            <motion.span className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md"
              animate={{ x: form.featured ? 20 : 0 }} transition={{ type: "spring", stiffness: 500, damping: 30 }} />
          </button>
          <span className="text-sm text-foreground-muted flex items-center gap-1.5" style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}>
            <i className={`${ICONS.STAR} text-amber-400`} aria-hidden="true" /> Featured
          </span>
        </label>

        <div className="flex gap-3">
          <button type="button" onClick={handleSave} disabled={saving}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-purple-700 to-purple-500 hover:from-purple-600 hover:to-purple-400 disabled:opacity-50 transition-all duration-200 flex items-center gap-1.5"
            style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}
          >
            {saving ? <><i className={`${ICONS.SPINNER} animate-spin`} aria-hidden="true" /> Se salvează...</> : <><i className={ICONS.SAVE} aria-hidden="true" /> {editing ? "Actualizează" : "Adaugă"}</>}
          </button>
          {editing && (
            <button type="button" onClick={resetForm} className="px-5 py-2.5 rounded-lg text-sm font-medium text-foreground-muted hover:text-white border border-white/10 hover:border-white/20 transition-all duration-200"
              style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}>Anulează</button>
          )}
        </div>
      </div>

      <div className="glass p-6 flex flex-col gap-4">
        <h3 className="text-lg font-bold text-white/90 flex items-center gap-2" style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif" }}>
          <i className={`${ICONS.LIST} text-purple-400`} aria-hidden="true" /> Proiecte ({projects.length})
        </h3>
        {projects.length === 0 ? (
          <p className="text-sm text-foreground-muted text-center py-8" style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}>Niciun proiect.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {projects.map((p) => (
              <div key={p.id} className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all duration-200 group">
                <div className="w-12 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-white/5 border border-white/5">
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.imageAlt || p.title} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-foreground-dim"><i className={ICONS.IMAGE} aria-hidden="true" /></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white/90 flex items-center gap-1.5" style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}>
                    {p.title}
                    {p.featured && <i className={`${ICONS.STAR} text-amber-400 text-xs`} aria-label="Featured" />}
                  </p>
                  <p className="text-xs text-foreground-dim truncate">{p.category} {p.techTags.length > 0 && `• ${p.techTags.slice(0, 3).join(", ")}`}</p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button type="button" onClick={() => handleEdit(p)} className="w-8 h-8 rounded-lg flex items-center justify-center text-foreground-dim hover:text-purple-400 hover:bg-purple-500/10 transition-all" aria-label="Editează">
                    <i className={ICONS.PEN} aria-hidden="true" />
                  </button>
                  <button type="button" onClick={() => setConfirmDelete(p.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-foreground-dim hover:text-red-400 hover:bg-red-500/10 transition-all" aria-label="Șterge">
                    <i className={ICONS.TRASH} aria-hidden="true" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmModal open={!!confirmDelete} title="Șterge proiectul" message="Ești sigur?" onConfirm={() => confirmDelete && handleDelete(confirmDelete)} onCancel={() => setConfirmDelete(null)} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TAB 6: CONTACT
// ═══════════════════════════════════════════════════════════════

function ContactTab({
  settings,
  setSettings,
  saving,
  onSave,
}: {
  settings: SiteSettings;
  setSettings: React.Dispatch<React.SetStateAction<SiteSettings>>;
  saving: boolean;
  onSave: () => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="glass p-6 flex flex-col gap-5">
        <h3 className="text-lg font-bold text-white/90 flex items-center gap-2" style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif" }}>
          <i className={`${ICONS.ENVELOPE} text-purple-400`} aria-hidden="true" />
          Informații de contact
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField label="Email" value={settings.contactEmail} onChange={(v) => setSettings((p) => ({ ...p, contactEmail: v }))} placeholder="contact@nexusdevstudio.ro" type="email" />
          <InputField label="Telefon" value={settings.contactPhone} onChange={(v) => setSettings((p) => ({ ...p, contactPhone: v }))} placeholder="+40 712 345 678" />
          <div className="md:col-span-2">
            <InputField label="Adresă" value={settings.contactAddress} onChange={(v) => setSettings((p) => ({ ...p, contactAddress: v }))} placeholder="Strada Exemplu, București" />
          </div>
          <InputField label="Program de lucru" value={settings.contactWorkingHours} onChange={(v) => setSettings((p) => ({ ...p, contactWorkingHours: v }))} placeholder="Luni - Vineri: 09:00 - 18:00" />
        </div>
        <div className="flex justify-end">
          <button type="button" onClick={onSave} disabled={saving}
            className="px-6 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-purple-700 via-purple-500 to-purple-700 bg-[length:200%_100%] shadow-[0_4px_20px_rgba(126,34,206,0.35)] hover:shadow-[0_6px_28px_rgba(126,34,206,0.5)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
            style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}
          >
            {saving ? <><i className={`${ICONS.SPINNER} animate-spin`} aria-hidden="true" /> Se salvează...</> : <><i className={ICONS.SAVE} aria-hidden="true" /> Salvează Contact</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TAB 7: SEO & FOOTER
// ═══════════════════════════════════════════════════════════════

function SeoTab({
  settings,
  setSettings,
  saving,
  onSave,
}: {
  settings: SiteSettings;
  setSettings: React.Dispatch<React.SetStateAction<SiteSettings>>;
  saving: boolean;
  onSave: () => void;
}) {
  const [newFooterLink, setNewFooterLink] = useState<FooterLink>({ label: "", href: "" });
  const [keywordsInput, setKeywordsInput] = useState(settings.seoKeywords.join(", "));

  useEffect(() => {
    setKeywordsInput(settings.seoKeywords.join(", "));
  }, [settings.seoKeywords]);

  const syncKeywords = (input: string) => {
    setKeywordsInput(input);
    const arr = input.split(",").map((k) => k.trim()).filter(Boolean);
    setSettings((p) => ({ ...p, seoKeywords: arr }));
  };

  const addFooterLink = () => {
    if (!newFooterLink.label.trim() || !newFooterLink.href.trim()) return;
    setSettings((p) => ({ ...p, footerLinks: [...p.footerLinks, { ...newFooterLink }] }));
    setNewFooterLink({ label: "", href: "" });
  };

  const removeFooterLink = (i: number) => {
    setSettings((p) => ({ ...p, footerLinks: p.footerLinks.filter((_, idx) => idx !== i) }));
  };

  return (
    <div className="flex flex-col gap-6">
      {/* SEO */}
      <div className="glass p-6 flex flex-col gap-5">
        <h3 className="text-lg font-bold text-white/90 flex items-center gap-2" style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif" }}>
          <i className={`${ICONS.CHART} text-purple-400`} aria-hidden="true" />
          Setări SEO
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField label="Titlu SEO" value={settings.seoTitle} onChange={(v) => setSettings((p) => ({ ...p, seoTitle: v }))} placeholder="Nexus Dev Studio" />
          <InputField label="URL Site" value={settings.seoUrl} onChange={(v) => setSettings((p) => ({ ...p, seoUrl: v }))} placeholder="https://nexusdevstudio.ro" />
          <div className="md:col-span-2">
            <InputField label="Descriere SEO" value={settings.seoDescription} onChange={(v) => setSettings((p) => ({ ...p, seoDescription: v }))} placeholder="Meta description..." rows={3} />
          </div>
          <div className="md:col-span-2 flex flex-col gap-1.5">
            <span className="text-xs uppercase tracking-wider text-foreground-dim font-medium" style={{ fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace" }}>Cuvinte cheie (separate prin virgulă)</span>
            <input type="text" value={keywordsInput} onChange={(e) => syncKeywords(e.target.value)}
              placeholder="web development, design, mobile apps"
              className="px-4 py-2.5 rounded-lg text-sm text-white placeholder:text-foreground-dim/30 bg-white/5 border border-white/10 hover:border-white/20 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 outline-none transition-all duration-200"
              style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}
            />
          </div>
        </div>

        <h4 className="text-base font-bold text-white/80 mt-2" style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif" }}>Open Graph</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField label="OG Title" value={settings.seoOgTitle} onChange={(v) => setSettings((p) => ({ ...p, seoOgTitle: v }))} />
          <InputField label="OG Image URL" value={settings.seoOgImage} onChange={(v) => setSettings((p) => ({ ...p, seoOgImage: v }))} placeholder="https://... .jpg" />
          <div className="md:col-span-2">
            <InputField label="OG Description" value={settings.seoOgDescription} onChange={(v) => setSettings((p) => ({ ...p, seoOgDescription: v }))} rows={2} />
          </div>
        </div>

        <h4 className="text-base font-bold text-white/80 mt-2" style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif" }}>Twitter Card</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs uppercase tracking-wider text-foreground-dim font-medium" style={{ fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace" }}>Tip Card</span>
            <select
              value={settings.seoTwitterCard}
              onChange={(e) => setSettings((p) => ({ ...p, seoTwitterCard: e.target.value }))}
              className="px-4 py-2.5 rounded-lg text-sm text-white bg-white/5 border border-white/10 hover:border-white/20 focus:border-purple-500/50 outline-none transition-all duration-200"
              style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}
            >
              <option value="summary" className="bg-[#1a1a25]">Summary</option>
              <option value="summary_large_image" className="bg-[#1a1a25]">Summary Large Image</option>
              <option value="app" className="bg-[#1a1a25]">App</option>
              <option value="player" className="bg-[#1a1a25]">Player</option>
            </select>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="glass p-6 flex flex-col gap-5">
        <h3 className="text-lg font-bold text-white/90 flex items-center gap-2" style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif" }}>
          <i className={`${ICONS.LINK} text-purple-400`} aria-hidden="true" />
          Setări Footer
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField label="Copyright" value={settings.footerCopyright} onChange={(v) => setSettings((p) => ({ ...p, footerCopyright: v }))} placeholder={`© ${new Date().getFullYear()} Nexus Dev Studio`} />
          <InputField label="Facebook URL" value={settings.footerFacebookUrl} onChange={(v) => setSettings((p) => ({ ...p, footerFacebookUrl: v }))} placeholder="https://facebook.com/..." />
          <InputField label="TikTok URL" value={settings.footerTiktokUrl} onChange={(v) => setSettings((p) => ({ ...p, footerTiktokUrl: v }))} placeholder="https://tiktok.com/..." />
        </div>

        {/* Footer Links */}
        <div className="flex flex-col gap-3">
          <span className="text-xs uppercase tracking-wider text-foreground-dim font-medium" style={{ fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace" }}>Link-uri footer</span>
          <div className="flex gap-2 flex-wrap">
            <input type="text" value={newFooterLink.label} onChange={(e) => setNewFooterLink((p) => ({ ...p, label: e.target.value }))}
              placeholder="Etichetă" onKeyDown={(e) => { if (e.key === "Enter") addFooterLink(); }}
              className="flex-1 min-w-[120px] px-4 py-2.5 rounded-lg text-sm text-white placeholder:text-foreground-dim/30 bg-white/5 border border-white/10 hover:border-white/20 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 outline-none transition-all duration-200"
              style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}
            />
            <input type="text" value={newFooterLink.href} onChange={(e) => setNewFooterLink((p) => ({ ...p, href: e.target.value }))}
              placeholder="URL" onKeyDown={(e) => { if (e.key === "Enter") addFooterLink(); }}
              className="flex-1 min-w-[160px] px-4 py-2.5 rounded-lg text-sm text-white placeholder:text-foreground-dim/30 bg-white/5 border border-white/10 hover:border-white/20 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 outline-none transition-all duration-200"
              style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}
            />
            <button type="button" onClick={addFooterLink}
              className="px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-purple-600 hover:bg-purple-500 transition-all duration-200 flex items-center gap-1.5"
              style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}><i className={ICONS.PLUS} aria-hidden="true" /> Adaugă</button>
          </div>
          {settings.footerLinks.length > 0 && (
            <div className="flex flex-col gap-1.5">
              {settings.footerLinks.map((link, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.02] border border-white/5">
                  <span className="flex-1 text-sm text-foreground-muted" style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}>
                    {link.label} <span className="text-foreground-dim">→ {link.href}</span>
                  </span>
                  <button type="button" onClick={() => removeFooterLink(i)} className="w-6 h-6 rounded flex items-center justify-center text-foreground-dim hover:text-red-400 transition-colors" aria-label="Șterge link">
                    <i className={`${ICONS.XMARK} text-xs`} aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button type="button" onClick={onSave} disabled={saving}
            className="px-6 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-purple-700 via-purple-500 to-purple-700 bg-[length:200%_100%] shadow-[0_4px_20px_rgba(126,34,206,0.35)] hover:shadow-[0_6px_28px_rgba(126,34,206,0.5)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
            style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}
          >
            {saving ? <><i className={`${ICONS.SPINNER} animate-spin`} aria-hidden="true" /> Se salvează...</> : <><i className={ICONS.SAVE} aria-hidden="true" /> Salvează SEO & Footer</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TAB 8: MESAJE
// ═══════════════════════════════════════════════════════════════

function MessagesTab({ addToast }: { addToast: (msg: string, type: "success" | "error") => void }) {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const loadMessages = useCallback(async () => {
    setLoading(true);
    const res = await fetchMessages();
    if (res.data) setMessages(res.data);
    else addToast(res.error || "Eroare la încărcarea mesajelor", "error");
    setLoading(false);
  }, [addToast]);

  useEffect(() => { loadMessages(); }, [loadMessages]);

  const handleMarkRead = async (id: string) => {
    const res = await markMessageRead(id);
    if (res.ok) {
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, read: true } : m)));
      if (selected?.id === id) setSelected((prev) => (prev ? { ...prev, read: true } : null));
      addToast("Mesaj marcat ca citit", "success");
    } else {
      addToast(res.error || "Eroare", "error");
    }
  };

  const handleDelete = async (id: string) => {
    const res = await deleteMessage(id);
    if (res.ok) {
      setMessages((prev) => prev.filter((m) => m.id !== id));
      if (selected?.id === id) setSelected(null);
      addToast("Mesaj șters", "success");
    } else {
      addToast(res.error || "Eroare", "error");
    }
    setConfirmDelete(null);
  };

  const unreadCount = messages.filter((m) => !m.read).length;

  if (loading) {
    return <div className="flex items-center justify-center py-20"><i className={`${ICONS.SPINNER} animate-spin text-2xl text-purple-400`} aria-hidden="true" /></div>;
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* List */}
      <div className="flex-1 glass p-6 flex flex-col gap-4 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white/90 flex items-center gap-2" style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif" }}>
            <i className={`${ICONS.MESSAGE} text-purple-400`} aria-hidden="true" />
            Mesaje ({messages.length})
          </h3>
          {unreadCount > 0 && (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
              style={{ fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace" }}>
              {unreadCount} necitite
            </span>
          )}
        </div>

        {messages.length === 0 ? (
          <p className="text-sm text-foreground-muted text-center py-12" style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}>Niciun mesaj.</p>
        ) : (
          <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto">
            {messages.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelected(m)}
                className={`text-left px-4 py-3 rounded-lg transition-all duration-200 border ${
                  selected?.id === m.id
                    ? "bg-purple-500/10 border-purple-500/25"
                    : m.read
                    ? "bg-white/[0.01] border-white/5 hover:border-white/10"
                    : "bg-white/[0.03] border-emerald-500/10 hover:border-emerald-500/20"
                }`}
              >
                <div className="flex items-center gap-2">
                  {!m.read && <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" aria-label="Necitit" />}
                  <span className="text-sm font-semibold text-white/90 truncate" style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}>{m.name}</span>
                  <span className="text-xs text-foreground-dim ml-auto flex-shrink-0" style={{ fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace" }}>
                    {new Date(m.createdAt).toLocaleDateString("ro-RO")}
                  </span>
                </div>
                <p className="text-xs text-foreground-dim mt-1 truncate">{m.email}</p>
                <p className="text-xs text-foreground-muted mt-1 line-clamp-1">{m.message}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Detail */}
      <div className="flex-1 glass p-6 flex flex-col gap-5 min-w-0">
        {selected ? (
          <>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white/90 flex items-center gap-2" style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif" }}>
                <i className={`${ICONS.ENVELOPE} text-purple-400`} aria-hidden="true" />
                Detaliu mesaj
              </h3>
              <div className="flex gap-1.5">
                {!selected.read && (
                  <button type="button" onClick={() => handleMarkRead(selected.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/20 transition-all duration-200 flex items-center gap-1"
                    style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}>
                    <i className={ICONS.EYE} aria-hidden="true" /> Marchează citit
                  </button>
                )}
                <button type="button" onClick={() => setConfirmDelete(selected.id)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/15 border border-red-500/20 transition-all duration-200 flex items-center gap-1"
                  style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}>
                  <i className={ICONS.TRASH} aria-hidden="true" /> Șterge
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 text-sm flex-shrink-0">
                  <i className={ICONS.USER} aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white/90" style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}>{selected.name}</p>
                  <p className="text-xs text-foreground-dim">{selected.email} {selected.phone && `• ${selected.phone}`}</p>
                </div>
                <span className={`ml-auto px-2 py-0.5 rounded text-[10px] font-semibold ${selected.read ? "bg-white/5 text-foreground-dim" : "bg-emerald-500/10 text-emerald-400"}`}
                  style={{ fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace" }}>
                  {selected.read ? "Citit" : "Necitit"}
                </span>
              </div>

              <p className="text-xs text-foreground-dim" style={{ fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace" }}>
                {new Date(selected.createdAt).toLocaleString("ro-RO")}
              </p>

              <div className="p-4 rounded-lg bg-white/[0.02] border border-white/5">
                <p className="text-sm text-foreground-muted leading-relaxed whitespace-pre-wrap" style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}>
                  {selected.message}
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-foreground-dim">
            <i className={`${ICONS.ENVELOPE} text-4xl opacity-20`} aria-hidden="true" />
            <p className="text-sm" style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}>Selectează un mesaj pentru a vedea detaliile</p>
          </div>
        )}
      </div>

      <ConfirmModal open={!!confirmDelete} title="Șterge mesajul" message="Ești sigur?" onConfirm={() => confirmDelete && handleDelete(confirmDelete)} onCancel={() => setConfirmDelete(null)} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTA PRINCIPALĂ: DASHBOARD PAGE
// ═══════════════════════════════════════════════════════════════

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("hero");
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(0);

  // ── Toast management ─────────────────────────────────────
  const addToast = useCallback((message: string, type: "success" | "error") => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ── Load settings ────────────────────────────────────────
  useEffect(() => {
    (async () => {
      setSettingsLoading(true);
      const res = await fetchSettings();
      if (res.data) {
        setSettings(res.data);
      } else {
        addToast(res.error || "Eroare la încărcarea setărilor", "error");
      }
      setSettingsLoading(false);
    })();
  }, [addToast]);

  // ── Save settings ────────────────────────────────────────
  const saveSettings = useCallback(async () => {
    setSettingsSaving(true);
    const res = await updateSettings(settings);
    if (res.ok) {
      addToast("Setări salvate cu succes", "success");
    } else {
      addToast(res.error || "Eroare la salvarea setărilor", "error");
    }
    setSettingsSaving(false);
  }, [settings, addToast]);

  // ── Loading state ────────────────────────────────────────
  if (settingsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-5"
        >
          <div className="w-12 h-12 rounded-full border-2 border-purple-500/20 flex items-center justify-center">
            <i className={`${ICONS.SPINNER} text-purple-400 animate-spin text-xl`} aria-hidden="true" />
          </div>
          <p className="text-sm text-foreground-dim tracking-wider" style={{ fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace" }}>
            Se încarcă setările...
          </p>
        </motion.div>
      </div>
    );
  }

  // ── Main ─────────────────────────────────────────────────
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.33, 1, 0.68, 1] }}
        className="mb-8"
      >
        <h1
          className="text-3xl sm:text-4xl font-bold tracking-tight"
          style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif" }}
        >
          <span className="text-gradient-purple">Dashboard</span>
        </h1>
        <p
          className="text-sm text-foreground-muted mt-1.5"
          style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}
        >
          Gestionează conținutul site-ului, serviciile, proiectele și mesajele.
        </p>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: [0.33, 1, 0.68, 1] }}
        className="flex flex-wrap gap-1.5 mb-6 p-1 rounded-xl bg-white/[0.02] border border-white/5"
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`relative flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? "text-white"
                : "text-foreground-dim hover:text-white hover:bg-white/5"
            }`}
            style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="active-tab-bg"
                className="absolute inset-0 rounded-lg bg-purple-600/20 border border-purple-500/25"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative z-10"><i className={`${tab.icon} ${activeTab === tab.id ? "text-purple-400" : ""}`} aria-hidden="true" /></span>
            <span className="relative z-10 hidden sm:inline">{tab.label}</span>
            {tab.id === "messages" && (
              <span className="relative z-10 ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400" style={{ fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace" }}>
                <i className={ICONS.BELL} aria-hidden="true" />
              </span>
            )}
          </button>
        ))}
      </motion.div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: [0.33, 1, 0.68, 1] }}
        >
          {activeTab === "hero" && (
            <HeroTab settings={settings} setSettings={setSettings} saving={settingsSaving} onSave={saveSettings} />
          )}
          {activeTab === "services" && (
            <ServicesTab addToast={addToast} />
          )}
          {activeTab === "process" && (
            <ProcessTab addToast={addToast} />
          )}
          {activeTab === "faq" && (
            <FaqTab addToast={addToast} />
          )}
          {activeTab === "portfolio" && (
            <PortfolioTab addToast={addToast} />
          )}
          {activeTab === "contact" && (
            <ContactTab settings={settings} setSettings={setSettings} saving={settingsSaving} onSave={saveSettings} />
          )}
          {activeTab === "seo" && (
            <SeoTab settings={settings} setSettings={setSettings} saving={settingsSaving} onSave={saveSettings} />
          )}
          {activeTab === "messages" && (
            <MessagesTab addToast={addToast} />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Toast container */}
      <div className="fixed bottom-6 right-6 z-[700] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <div key={toast.id} className="pointer-events-auto">
              <ToastItem toast={toast} onDismiss={dismissToast} />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
