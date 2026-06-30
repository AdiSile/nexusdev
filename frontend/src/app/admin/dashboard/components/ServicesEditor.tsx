"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  fetchServices,
  createService,
  updateService,
  deleteService,
} from "@/lib/api";
import type { ServiceItem, ServicePayload, ServiceCategory } from "@/lib/api";

// ═══════════════════════════════════════════════════════════════
// ICON LIBRARY
// ═══════════════════════════════════════════════════════════════

const IC = {
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
  CUBES: "fa-solid fa-cubes",
  LIST: "fa-solid fa-list-check",
  FIRE: "fa-solid fa-fire",
  STAR: "fa-solid fa-star",
  TAG: "fa-solid fa-tag",
  SEARCH: "fa-solid fa-magnifying-glass",
  FILTER: "fa-solid fa-filter",
  ARROW_LEFT: "fa-solid fa-arrow-left",
  ARROW_RIGHT: "fa-solid fa-arrow-right",
  BOLT: "fa-solid fa-bolt",
  CROWN: "fa-solid fa-crown",
  WAND: "fa-solid fa-wand-magic-sparkles",
  GRID: "fa-solid fa-grid-2",
  ROWS: "fa-solid fa-bars",
};

// ═══════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════

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

const SERVICE_CATEGORIES: ServiceCategory[] = [
  "web",
  "mobile",
  "design",
  "marketing",
  "consulting",
];

const CATEGORY_LABELS: Record<ServiceCategory, string> = {
  web: "Web Development",
  mobile: "Mobile Apps",
  design: "Design",
  marketing: "Marketing",
  consulting: "Consulting",
};

const CATEGORY_COLORS: Record<ServiceCategory, string> = {
  web: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  mobile: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  design: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  marketing: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  consulting: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
};

const INITIAL_FORM: ServicePayload = {
  icon: "fa-solid fa-code",
  title: "",
  description: "",
  originalPrice: 0,
  reducedPrice: 0,
  discountPercent: 0,
  category: "web",
  popular: false,
};

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface ServicesEditorProps {
  addToast: (message: string, type: "success" | "error") => void;
}

type ViewMode = "list" | "form";

// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENT: CONFIRM MODAL
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
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onCancel}
          aria-hidden="true"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
          className="relative z-10 glass p-6 sm:p-8 mx-4 max-w-md w-full flex flex-col gap-5"
        >
          <h3
            className="text-xl font-bold text-white/90"
            style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif" }}
          >
            {title}
          </h3>
          <p
            className="text-sm text-foreground-muted leading-relaxed"
            style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}
          >
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
// SUB-COMPONENT: ICON PICKER
// ═══════════════════════════════════════════════════════════════

function IconPicker({
  selected,
  onChange,
}: {
  selected: string;
  onChange: (icon: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredIcons = SERVICE_ICONS.filter((icon) =>
    icon.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-2.5 rounded-lg text-sm text-white bg-white/5 border border-white/10 hover:border-white/20 focus:border-purple-500/50 transition-all duration-200 flex items-center gap-3"
        style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}
      >
        <span className="w-8 h-8 rounded-lg flex items-center justify-center bg-purple-500/10 text-purple-400 flex-shrink-0">
          <i className={selected} aria-hidden="true" />
        </span>
        <span className="flex-1 text-left text-foreground-muted text-xs truncate">
          {selected.replace("fa-solid fa-", "").replace(/-/g, " ")}
        </span>
        <i className={`${open ? IC.ARROW_UP : IC.ARROW_DOWN} text-foreground-dim text-xs`} aria-hidden="true" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.33, 1, 0.68, 1] }}
            className="absolute z-40 mt-2 w-[320px] p-4 rounded-xl bg-[#14141e] border border-white/10 shadow-2xl flex flex-col gap-3"
          >
            <div className="relative">
              <i className={`${IC.SEARCH} absolute left-3 top-1/2 -translate-y-1/2 text-foreground-dim text-xs`} aria-hidden="true" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Caută iconiță..."
                className="w-full pl-9 pr-4 py-2 rounded-lg text-xs text-white placeholder:text-foreground-dim/30 bg-white/5 border border-white/10 focus:border-purple-500/50 outline-none transition-all duration-200"
                style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}
                autoFocus
              />
            </div>
            <div className="grid grid-cols-7 gap-1.5 max-h-48 overflow-y-auto pr-1">
              {filteredIcons.length === 0 ? (
                <p className="col-span-7 text-xs text-foreground-dim text-center py-6" style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}>
                  Nicio iconiță găsită
                </p>
              ) : (
                filteredIcons.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => { onChange(icon); setOpen(false); setSearch(""); }}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm transition-all duration-150 ${
                      selected === icon
                        ? "bg-purple-600/30 text-purple-400 border border-purple-500/40"
                        : "text-foreground-muted hover:text-white hover:bg-white/5"
                    }`}
                    title={icon.replace("fa-solid fa-", "").replace(/-/g, " ")}
                  >
                    <i className={icon} aria-hidden="true" />
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {open && (
        <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} aria-hidden="true" />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENT: TOGGLE SWITCH
// ═══════════════════════════════════════════════════════════════

function ToggleSwitch({
  checked,
  onChange,
  label,
  icon,
  colorClass,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
  icon?: string;
  colorClass?: string;
}) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${checked ? (colorClass ?? "bg-purple-600") : "bg-white/10"}`}
      >
        <motion.span
          className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md"
          animate={{ x: checked ? 20 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </button>
      <span className="text-sm text-foreground-muted flex items-center gap-1.5" style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}>
        {icon && <i className={`${icon} ${checked ? "text-amber-400" : "text-foreground-dim"}`} aria-hidden="true" />}
        {label}
      </span>
    </label>
  );
}

// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENT: FORM FIELD
// ═══════════════════════════════════════════════════════════════

function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs uppercase tracking-wider text-foreground-dim font-medium" style={{ fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace" }}>
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </span>
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENT: SERVICE CARD (list item)
// ═══════════════════════════════════════════════════════════════

function ServiceCard({ service, onEdit, onDelete, index }: { service: ServiceItem; onEdit: () => void; onDelete: () => void; index: number }) {
  const catColor = CATEGORY_COLORS[service.category] ?? CATEGORY_COLORS.web;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04, ease: [0.33, 1, 0.68, 1] }}
      className="flex items-center gap-4 px-5 py-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all duration-200 group"
    >
      <span className="w-11 h-11 rounded-xl flex items-center justify-center text-base bg-purple-500/10 text-purple-400 flex-shrink-0 ring-1 ring-purple-500/10">
        <i className={service.icon} aria-hidden="true" />
      </span>
      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-white/90 truncate" style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}>
            {service.title}
          </p>
          {service.popular && (
            <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-[10px] font-bold text-amber-400 flex-shrink-0">
              <i className={`${IC.FIRE} text-[8px]`} aria-hidden="true" /> Popular
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${catColor}`} style={{ fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace" }}>
            {CATEGORY_LABELS[service.category] ?? service.category}
          </span>
          {service.discountPercent > 0 && (
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-md" style={{ fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace" }}>
              -{service.discountPercent}%
            </span>
          )}
        </div>
      </div>
      <div className="text-right flex-shrink-0 hidden sm:block">
        {service.discountPercent > 0 ? (
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-foreground-dim line-through">{service.originalPrice} RON</span>
            <span className="text-sm font-bold text-purple-400" style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}>{service.reducedPrice} RON</span>
          </div>
        ) : (
          <span className="text-sm font-bold text-white/80" style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}>{service.originalPrice || service.reducedPrice || "—"} RON</span>
        )}
      </div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0">
        <button type="button" onClick={onEdit} className="w-9 h-9 rounded-lg flex items-center justify-center text-foreground-dim hover:text-purple-400 hover:bg-purple-500/10 transition-all" aria-label={`Editează ${service.title}`}>
          <i className={IC.PEN} aria-hidden="true" />
        </button>
        <button type="button" onClick={onDelete} className="w-9 h-9 rounded-lg flex items-center justify-center text-foreground-dim hover:text-red-400 hover:bg-red-500/10 transition-all" aria-label={`Șterge ${service.title}`}>
          <i className={IC.TRASH} aria-hidden="true" />
        </button>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT: SERVICES EDITOR
// ═══════════════════════════════════════════════════════════════

export default function ServicesEditor({ addToast }: ServicesEditorProps) {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState<ViewMode>("list");
  const [editing, setEditing] = useState<ServiceItem | null>(null);
  const [form, setForm] = useState<ServicePayload>({ ...INITIAL_FORM });
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<ServiceCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const loadServices = useCallback(async () => {
    setLoading(true);
    const res = await fetchServices();
    if (res.data) setServices(res.data);
    else addToast(res.error || "Eroare la încărcarea serviciilor", "error");
    setLoading(false);
  }, [addToast]);

  useEffect(() => { loadServices(); }, [loadServices]);

  const resetForm = () => { setEditing(null); setForm({ ...INITIAL_FORM }); setView("list"); };

  const handleEdit = (service: ServiceItem) => {
    setEditing(service);
    setForm({ icon: service.icon, title: service.title, description: service.description, originalPrice: service.originalPrice, reducedPrice: service.reducedPrice, discountPercent: service.discountPercent, category: service.category, popular: service.popular });
    setView("form");
  };

  const handleNew = () => { setEditing(null); setForm({ ...INITIAL_FORM }); setView("form"); };

  const handlePriceChange = (field: "originalPrice" | "reducedPrice", val: string) => {
    const num = parseFloat(val) || 0;
    setForm((prev) => {
      const updated = { ...prev, [field]: num };
      updated.discountPercent = (updated.originalPrice > 0 && updated.reducedPrice > 0)
        ? Math.round(((updated.originalPrice - updated.reducedPrice) / updated.originalPrice) * 100)
        : 0;
      return updated;
    });
  };

  const handleSave = async () => {
    if (!form.title.trim()) { addToast("Titlul serviciului este obligatoriu", "error"); return; }
    setSaving(true);
    const res = editing ? await updateService(editing.id, form) : await createService(form);
    if (res.data) { addToast(editing ? "Serviciu actualizat cu succes" : "Serviciu creat cu succes", "success"); await loadServices(); resetForm(); }
    else addToast(res.error || "Eroare la salvare", "error");
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    const res = await deleteService(id);
    if (res.ok) { addToast("Serviciu șters", "success"); await loadServices(); }
    else addToast(res.error || "Eroare la ștergere", "error");
    setConfirmDelete(null);
  };

  const filteredServices = services.filter((s) => {
    const matchesCategory = categoryFilter === "all" || s.category === categoryFilter;
    const matchesSearch = !searchQuery.trim() || s.title.toLowerCase().includes(searchQuery.toLowerCase()) || s.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const popularCount = services.filter((s) => s.popular).length;
  const discountCount = services.filter((s) => s.discountPercent > 0).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-purple-500/20 flex items-center justify-center">
            <i className={`${IC.SPINNER} animate-spin text-purple-400 text-lg`} aria-hidden="true" />
          </div>
          <p className="text-xs text-foreground-dim tracking-wider" style={{ fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace" }}>Se încarcă serviciile...</p>
        </motion.div>
      </div>
    );
  }

  // ── FORM VIEW ──────────────────────────────────────────────
  if (view === "form") {
    return (
      <div className="flex flex-col gap-6">
        <button type="button" onClick={resetForm} className="flex items-center gap-2 text-sm text-foreground-dim hover:text-white transition-colors w-fit" style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}>
          <i className={IC.ARROW_LEFT} aria-hidden="true" /> Înapoi la lista de servicii
        </button>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: [0.33, 1, 0.68, 1] }} className="glass p-6 sm:p-8 flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl flex items-center justify-center bg-purple-500/10 text-purple-400 ring-1 ring-purple-500/10">
              <i className={editing ? IC.PEN : IC.PLUS} aria-hidden="true" />
            </span>
            <div>
              <h3 className="text-xl font-bold text-white/90" style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif" }}>{editing ? "Editează serviciul" : "Adaugă serviciu nou"}</h3>
              <p className="text-xs text-foreground-muted" style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}>Completează detaliile serviciului oferit</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField label="Iconiță" required>
              <IconPicker selected={form.icon} onChange={(icon) => setForm((p) => ({ ...p, icon }))} />
            </FormField>

            <FormField label="Titlu" required>
              <input type="text" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="Web Development"
                className="w-full px-4 py-2.5 rounded-lg text-sm text-white placeholder:text-foreground-dim/30 bg-white/5 border border-white/10 hover:border-white/20 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 outline-none transition-all duration-200"
                style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }} />
            </FormField>

            <div className="md:col-span-2">
              <FormField label="Descriere">
                <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Descrierea detaliată a serviciului..." rows={4}
                  className="w-full px-4 py-2.5 rounded-lg text-sm text-white placeholder:text-foreground-dim/30 bg-white/5 border border-white/10 hover:border-white/20 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 outline-none transition-all duration-200 resize-vertical"
                  style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }} />
              </FormField>
            </div>

            <FormField label="Categorie">
              <div className="flex flex-wrap gap-2">
                {SERVICE_CATEGORIES.map((cat) => (
                  <button key={cat} type="button" onClick={() => setForm((p) => ({ ...p, category: cat }))}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 border ${form.category === cat ? `${CATEGORY_COLORS[cat]} ring-1 ring-white/5` : "text-foreground-dim border-white/5 hover:border-white/10 hover:text-white"}`}
                    style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}>{CATEGORY_LABELS[cat]}</button>
                ))}
              </div>
            </FormField>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Preț original (RON)">
                <input type="number" value={form.originalPrice || ""} onChange={(e) => handlePriceChange("originalPrice", e.target.value)} placeholder="0" min="0" step="0.01"
                  className="w-full px-4 py-2.5 rounded-lg text-sm text-white placeholder:text-foreground-dim/30 bg-white/5 border border-white/10 hover:border-white/20 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 outline-none transition-all duration-200"
                  style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }} />
              </FormField>
              <FormField label="Preț redus (RON)">
                <input type="number" value={form.reducedPrice || ""} onChange={(e) => handlePriceChange("reducedPrice", e.target.value)} placeholder="0" min="0" step="0.01"
                  className="w-full px-4 py-2.5 rounded-lg text-sm text-white placeholder:text-foreground-dim/30 bg-white/5 border border-white/10 hover:border-white/20 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 outline-none transition-all duration-200"
                  style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }} />
              </FormField>
            </div>

            <div className="flex items-center gap-8">
              <div className="flex flex-col gap-1">
                <span className="text-xs uppercase tracking-wider text-foreground-dim font-medium" style={{ fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace" }}>Discount</span>
                <span className={`text-2xl font-bold ${form.discountPercent > 0 ? "text-emerald-400" : "text-foreground-dim"}`} style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}>{form.discountPercent}%</span>
                {form.discountPercent > 0 && <span className="text-[10px] text-foreground-dim" style={{ fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace" }}>Economisești {(form.originalPrice - form.reducedPrice).toFixed(2)} RON</span>}
              </div>
              <ToggleSwitch checked={form.popular} onChange={() => setForm((p) => ({ ...p, popular: !p.popular }))} label="Popular" icon={IC.FIRE} colorClass="bg-amber-500" />
            </div>
          </div>

          <div className="flex gap-3 pt-2 border-t border-white/5">
            <button type="button" onClick={handleSave} disabled={saving}
              className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-purple-700 to-purple-500 hover:from-purple-600 hover:to-purple-400 shadow-[0_4px_16px_rgba(126,34,206,0.3)] hover:shadow-[0_6px_24px_rgba(126,34,206,0.45)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
              style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}>
              {saving ? <><i className={`${IC.SPINNER} animate-spin`} aria-hidden="true" /> Se salvează...</> : <><i className={IC.SAVE} aria-hidden="true" /> {editing ? "Actualizează" : "Adaugă serviciul"}</>}
            </button>
            <button type="button" onClick={resetForm}
              className="px-5 py-2.5 rounded-lg text-sm font-medium text-foreground-muted hover:text-white border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 transition-all duration-200"
              style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}>Anulează</button>
          </div>
        </motion.div>

        <ConfirmModal open={!!confirmDelete} title="Șterge serviciul" message="Ești sigur că vrei să ștergi acest serviciu? Această acțiune este ireversibilă."
          onConfirm={() => confirmDelete && handleDelete(confirmDelete)} onCancel={() => setConfirmDelete(null)} />
      </div>
    );
  }

  // ── LIST VIEW ──────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: [0.33, 1, 0.68, 1] }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <h3 className="text-xl font-bold text-white/90 flex items-center gap-2" style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif" }}>
            <i className={`${IC.CUBES} text-purple-400`} aria-hidden="true" /> Servicii
            <span className="text-sm font-normal text-foreground-dim" style={{ fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace" }}>({services.length})</span>
          </h3>
        </div>
        <div className="flex items-center gap-3">
          {popularCount > 0 && <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20"><i className={`${IC.FIRE} text-[8px]`} aria-hidden="true" />{popularCount} populare</span>}
          {discountCount > 0 && <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><i className={`${IC.TAG} text-[8px]`} aria-hidden="true" />{discountCount} reduse</span>}
          <button type="button" onClick={handleNew}
            className="px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-purple-700 to-purple-500 hover:from-purple-600 hover:to-purple-400 shadow-[0_4px_16px_rgba(126,34,206,0.3)] hover:shadow-[0_6px_24px_rgba(126,34,206,0.45)] transition-all duration-200 flex items-center gap-2"
            style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}><i className={IC.PLUS} aria-hidden="true" /> Serviciu nou</button>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05, ease: [0.33, 1, 0.68, 1] }}
        className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <i className={`${IC.SEARCH} absolute left-3 top-1/2 -translate-y-1/2 text-foreground-dim text-xs`} aria-hidden="true" />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Caută servicii..."
            className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm text-white placeholder:text-foreground-dim/30 bg-white/5 border border-white/10 hover:border-white/20 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 outline-none transition-all duration-200"
            style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }} />
        </div>
        <div className="flex flex-wrap gap-1.5 items-center">
          <button type="button" onClick={() => setCategoryFilter("all")}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 border ${categoryFilter === "all" ? "bg-white/10 text-white border-white/20" : "text-foreground-dim border-white/5 hover:border-white/10 hover:text-white"}`}
            style={{ fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace" }}>Toate</button>
          {SERVICE_CATEGORIES.map((cat) => {
            const count = services.filter((s) => s.category === cat).length;
            return (
              <button key={cat} type="button" onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 border ${categoryFilter === cat ? CATEGORY_COLORS[cat] : "text-foreground-dim border-white/5 hover:border-white/10 hover:text-white"}`}
                style={{ fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace" }}>{CATEGORY_LABELS[cat]}{count > 0 && <span className="ml-1.5 opacity-60">({count})</span>}</button>
            );
          })}
        </div>
      </motion.div>

      {filteredServices.length === 0 ? (
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, delay: 0.1 }}
          className="glass p-12 flex flex-col items-center justify-center gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-white/[0.02] border border-white/5">
            <i className={`${IC.CUBES} text-2xl text-foreground-dim/30`} aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white/60 mb-1" style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}>{services.length === 0 ? "Niciun serviciu adăugat" : "Niciun rezultat găsit"}</p>
            <p className="text-xs text-foreground-dim max-w-xs" style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}>{services.length === 0 ? "Adaugă primul serviciu pentru a începe să construiești oferta." : "Încearcă să modifici filtrele sau termenii de căutare."}</p>
          </div>
          {services.length === 0 && (
            <button type="button" onClick={handleNew}
              className="mt-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-purple-700 to-purple-500 hover:from-purple-600 hover:to-purple-400 shadow-[0_4px_16px_rgba(126,34,206,0.3)] transition-all duration-200 flex items-center gap-2"
              style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}><i className={IC.PLUS} aria-hidden="true" /> Adaugă primul serviciu</button>
          )}
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: 0.1 }} className="glass p-5 sm:p-6 flex flex-col gap-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs uppercase tracking-wider text-foreground-dim" style={{ fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace" }}>
              {filteredServices.length} serviciu{filteredServices.length !== 1 ? "i" : ""}{searchQuery && <> pentru &quot;<span className="text-purple-400">{searchQuery}</span>&quot;</>}
            </span>
          </div>
          <AnimatePresence mode="wait">
            <div className="flex flex-col gap-2">
              {filteredServices.map((service, idx) => (
                <ServiceCard key={service.id} service={service} index={idx} onEdit={() => handleEdit(service)} onDelete={() => setConfirmDelete(service.id)} />
              ))}
            </div>
          </AnimatePresence>
        </motion.div>
      )}

      <ConfirmModal open={!!confirmDelete} title="Șterge serviciul" message="Ești sigur că vrei să ștergi acest serviciu? Această acțiune este ireversibilă."
        onConfirm={() => confirmDelete && handleDelete(confirmDelete)} onCancel={() => setConfirmDelete(null)} />
    </div>
  );
}