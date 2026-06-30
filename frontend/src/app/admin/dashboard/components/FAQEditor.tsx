"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  fetchFaq,
  createFaqItem,
  updateFaqItem,
  deleteFaqItem,
} from "@/lib/api";
import type { FaqItem, FaqItemPayload, FaqCategory } from "@/lib/api";

// ═══════════════════════════════════════════════════════════════
// ICONS
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
  ARROW_LEFT: "fa-solid fa-arrow-left",
  SEARCH: "fa-solid fa-magnifying-glass",
  QUESTION: "fa-solid fa-circle-question",
  LIST: "fa-solid fa-list-check",
  TAG: "fa-solid fa-tag",
  GRID: "fa-solid fa-grid-2",
  GENERAL: "fa-solid fa-circle-question",
  PRICES: "fa-solid fa-tag",
  PROCESS: "fa-solid fa-diagram-project",
  TECH: "fa-solid fa-gear",
  FILTER: "fa-solid fa-filter",
  EMPTY: "fa-solid fa-comments",
  BULB: "fa-solid fa-lightbulb",
  INFO: "fa-solid fa-circle-info",
};

// ═══════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════

const FAQ_CATEGORIES: FaqCategory[] = ["Generale", "Preturi", "Proces", "Tehnic"];

const CATEGORY_META: Record<
  FaqCategory,
  { icon: string; color: string; bgClass: string; badgeClass: string }
> = {
  Generale: {
    icon: IC.GENERAL,
    color: "#818cf8",
    bgClass: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    badgeClass: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  },
  Preturi: {
    icon: IC.PRICES,
    color: "#fbbf24",
    bgClass: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
  Proces: {
    icon: IC.PROCESS,
    color: "#34d399",
    bgClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  Tehnic: {
    icon: IC.TECH,
    color: "#f472b6",
    bgClass: "bg-pink-500/10 text-pink-400 border-pink-500/20",
    badgeClass: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  },
};

const INITIAL_FORM: FaqItemPayload = {
  question: "",
  answer: "",
  category: "Generale",
  order: 0,
};

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface FAQEditorProps {
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
            style={{
              fontFamily: "var(--font-playfair), 'Playfair Display', serif",
            }}
          >
            {title}
          </h3>
          <p
            className="text-sm text-foreground-muted leading-relaxed"
            style={{
              fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
            }}
          >
            {message}
          </p>
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 rounded-lg text-sm font-medium text-foreground-muted hover:text-white border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 transition-all duration-200"
              style={{
                fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
              }}
            >
              Anulează
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 shadow-[0_4px_16px_rgba(239,68,68,0.3)] transition-all duration-200"
              style={{
                fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
              }}
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
// SUB-COMPONENT: FAQ CARD (list item)
// ═══════════════════════════════════════════════════════════════

function FaqCard({
  item,
  onEdit,
  onDelete,
  index,
}: {
  item: FaqItem;
  onEdit: () => void;
  onDelete: () => void;
  index: number;
}) {
  const meta = CATEGORY_META[item.category] ?? CATEGORY_META.Generale;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        delay: index * 0.04,
        ease: [0.33, 1, 0.68, 1],
      }}
      className="flex items-start gap-4 px-5 py-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all duration-200 group"
    >
      <span
        className={`w-11 h-11 rounded-xl flex items-center justify-center text-base flex-shrink-0 ring-1 ring-white/5 ${meta.bgClass}`}
      >
        <i className={meta.icon} aria-hidden="true" />
      </span>

      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <p
            className="text-sm font-semibold text-white/90 line-clamp-1"
            style={{
              fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
            }}
          >
            {item.question}
          </p>
        </div>
        <p
          className="text-xs text-foreground-muted line-clamp-2 mt-0.5"
          style={{
            fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
          }}
        >
          {item.answer}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span
            className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${meta.badgeClass}`}
            style={{
              fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace",
            }}
          >
            {item.category}
          </span>
          <span
            className="text-[10px] text-foreground-dim"
            style={{
              fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace",
            }}
          >
            Ordine: {item.order}
          </span>
        </div>
      </div>

      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0">
        <button
          type="button"
          onClick={onEdit}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-foreground-dim hover:text-purple-400 hover:bg-purple-500/10 transition-all"
          aria-label={`Editează ${item.question}`}
        >
          <i className={IC.PEN} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-foreground-dim hover:text-red-400 hover:bg-red-500/10 transition-all"
          aria-label={`Șterge ${item.question}`}
        >
          <i className={IC.TRASH} aria-hidden="true" />
        </button>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENT: FORM FIELD
// ═══════════════════════════════════════════════════════════════

function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span
        className="text-xs uppercase tracking-wider text-foreground-dim font-medium"
        style={{
          fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace",
        }}
      >
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </span>
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT: FAQ EDITOR
// ═══════════════════════════════════════════════════════════════

export default function FAQEditor({ addToast }: FAQEditorProps) {
  const [items, setItems] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState<ViewMode>("list");
  const [editing, setEditing] = useState<FaqItem | null>(null);
  const [form, setForm] = useState<FaqItemPayload>({ ...INITIAL_FORM });
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<FaqCategory | "toate">(
    "toate"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // ── Load items ────────────────────────────────────────────
  const loadItems = useCallback(async () => {
    setLoading(true);
    const res = await fetchFaq();
    if (res.data) {
      setItems(res.data);
    } else {
      addToast(res.error || "Eroare la încărcarea FAQ-urilor", "error");
    }
    setLoading(false);
  }, [addToast]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  // ── Form helpers ─────────────────────────────────────────
  const resetForm = () => {
    setEditing(null);
    setForm({ ...INITIAL_FORM });
    setView("list");
  };

  const handleEdit = (item: FaqItem) => {
    setEditing(item);
    setForm({
      question: item.question,
      answer: item.answer,
      category: item.category,
      order: item.order,
    });
    setView("form");
  };

  const handleNew = () => {
    setEditing(null);
    setForm({ ...INITIAL_FORM, order: items.length });
    setView("form");
  };

  // ── Save ─────────────────────────────────────────────────
  const handleSave = async () => {
    // Validation
    if (!form.question.trim()) {
      addToast("Întrebarea este obligatorie", "error");
      return;
    }
    if (!form.answer.trim()) {
      addToast("Răspunsul este obligatoriu", "error");
      return;
    }

    setSaving(true);

    if (editing) {
      const res = await updateFaqItem(editing.id, form);
      if (res.data) {
        addToast("FAQ actualizat cu succes", "success");
        await loadItems();
        resetForm();
      } else {
        addToast(res.error || "Eroare la actualizare", "error");
      }
    } else {
      const res = await createFaqItem(form);
      if (res.data) {
        addToast("FAQ creat cu succes", "success");
        await loadItems();
        resetForm();
      } else {
        addToast(res.error || "Eroare la creare", "error");
      }
    }

    setSaving(false);
  };

  // ── Delete ───────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    const res = await deleteFaqItem(id);
    if (res.ok) {
      addToast("FAQ șters", "success");
      await loadItems();
      if (expandedId === id) setExpandedId(null);
    } else {
      addToast(res.error || "Eroare la ștergere", "error");
    }
    setConfirmDelete(null);
  };

  // ── Filtering & search ───────────────────────────────────
  const filteredItems = useMemo(() => {
    let result = [...items];

    if (categoryFilter !== "toate") {
      result = result.filter((item) => item.category === categoryFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.question.toLowerCase().includes(q) ||
          item.answer.toLowerCase().includes(q)
      );
    }

    // Sort by order, then by question
    result.sort(
      (a, b) => a.order - b.order || a.question.localeCompare(b.question)
    );

    return result;
  }, [items, categoryFilter, searchQuery]);

  // ── Category counts ──────────────────────────────────────
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { toate: items.length };
    FAQ_CATEGORIES.forEach((cat) => {
      counts[cat] = items.filter((item) => item.category === cat).length;
    });
    return counts;
  }, [items]);

  // ── Toggle expand card ───────────────────────────────────
  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  // ═══════════════════════════════════════════════════════════
  // LOADING STATE
  // ═══════════════════════════════════════════════════════════
  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-10 h-10 rounded-full border-2 border-purple-500/20 flex items-center justify-center">
            <i
              className={`${IC.SPINNER} animate-spin text-purple-400 text-lg`}
              aria-hidden="true"
            />
          </div>
          <p
            className="text-xs text-foreground-dim tracking-wider"
            style={{
              fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace",
            }}
          >
            Se încarcă întrebările frecvente...
          </p>
        </motion.div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // FORM VIEW
  // ═══════════════════════════════════════════════════════════
  if (view === "form") {
    return (
      <div className="flex flex-col gap-6">
        {/* Back button */}
        <button
          type="button"
          onClick={resetForm}
          className="flex items-center gap-2 text-sm text-foreground-dim hover:text-white transition-colors w-fit"
          style={{
            fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
          }}
        >
          <i className={IC.ARROW_LEFT} aria-hidden="true" /> Înapoi la lista de
          FAQ
        </button>

        {/* Form card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.33, 1, 0.68, 1] }}
          className="glass p-6 sm:p-8 flex flex-col gap-6"
        >
          {/* Header */}
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl flex items-center justify-center bg-purple-500/10 text-purple-400 ring-1 ring-purple-500/10">
              <i className={editing ? IC.PEN : IC.PLUS} aria-hidden="true" />
            </span>
            <div>
              <h3
                className="text-xl font-bold text-white/90"
                style={{
                  fontFamily:
                    "var(--font-playfair), 'Playfair Display', serif",
                }}
              >
                {editing ? "Editează întrebarea" : "Adaugă întrebare nouă"}
              </h3>
              <p
                className="text-xs text-foreground-muted"
                style={{
                  fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
                }}
              >
                Completează întrebarea, răspunsul și categoria pentru secțiunea
                FAQ
              </p>
            </div>
          </div>

          {/* Form fields */}
          <div className="grid grid-cols-1 gap-5">
            {/* Întrebare */}
            <FormField label="Întrebare" required>
              <input
                type="text"
                value={form.question}
                onChange={(e) =>
                  setForm((p) => ({ ...p, question: e.target.value }))
                }
                placeholder="Ex: Care este timpul de livrare pentru un proiect?"
                className="w-full px-4 py-2.5 rounded-lg text-sm text-white placeholder:text-foreground-dim/30 bg-white/5 border border-white/10 hover:border-white/20 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 outline-none transition-all duration-200"
                style={{
                  fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
                }}
              />
            </FormField>

            {/* Răspuns */}
            <FormField label="Răspuns" required>
              <textarea
                value={form.answer}
                onChange={(e) =>
                  setForm((p) => ({ ...p, answer: e.target.value }))
                }
                placeholder="Scrie răspunsul detaliat aici..."
                rows={5}
                className="w-full px-4 py-2.5 rounded-lg text-sm text-white placeholder:text-foreground-dim/30 bg-white/5 border border-white/10 hover:border-white/20 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 outline-none transition-all duration-200 resize-vertical"
                style={{
                  fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
                }}
              />
            </FormField>

            {/* Categorie + Ordine */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <FormField label="Categorie">
                <div className="flex flex-wrap gap-2">
                  {FAQ_CATEGORIES.map((cat) => {
                    const meta = CATEGORY_META[cat];
                    const isActive = form.category === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() =>
                          setForm((p) => ({ ...p, category: cat }))
                        }
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 border ${
                          isActive
                            ? `${meta.badgeClass} ring-1 ring-white/5`
                            : "text-foreground-dim border-white/5 hover:border-white/10 hover:text-white"
                        }`}
                        style={{
                          fontFamily:
                            "var(--font-poppins), 'Poppins', sans-serif",
                        }}
                      >
                        <i
                          className={`${meta.icon} text-[10px]`}
                          aria-hidden="true"
                        />
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </FormField>

              <FormField label="Ordine de sortare">
                <input
                  type="number"
                  value={form.order}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      order: parseInt(e.target.value) || 0,
                    }))
                  }
                  min="0"
                  placeholder="0"
                  className="w-full px-4 py-2.5 rounded-lg text-sm text-white placeholder:text-foreground-dim/30 bg-white/5 border border-white/10 hover:border-white/20 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 outline-none transition-all duration-200"
                  style={{
                    fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
                  }}
                />
                <p
                  className="text-[10px] text-foreground-dim mt-1"
                  style={{
                    fontFamily:
                      "var(--font-jetbrains), 'JetBrains Mono', monospace",
                  }}
                >
                  Numărul mai mic = apare primul în listă
                </p>
              </FormField>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-2 border-t border-white/5">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-purple-700 to-purple-500 hover:from-purple-600 hover:to-purple-400 shadow-[0_4px_16px_rgba(126,34,206,0.3)] hover:shadow-[0_6px_24px_rgba(126,34,206,0.45)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
              style={{
                fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
              }}
            >
              {saving ? (
                <>
                  <i
                    className={`${IC.SPINNER} animate-spin`}
                    aria-hidden="true"
                  />{" "}
                  Se salvează...
                </>
              ) : (
                <>
                  <i className={IC.SAVE} aria-hidden="true" />{" "}
                  {editing ? "Actualizează FAQ" : "Adaugă FAQ"}
                </>
              )}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-5 py-2.5 rounded-lg text-sm font-medium text-foreground-muted hover:text-white border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 transition-all duration-200"
              style={{
                fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
              }}
            >
              Anulează
            </button>
          </div>
        </motion.div>

        <ConfirmModal
          open={!!confirmDelete}
          title="Șterge FAQ"
          message="Ești sigur că vrei să ștergi această întrebare? Acțiunea este ireversibilă."
          onConfirm={() => confirmDelete && handleDelete(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // LIST VIEW
  // ═══════════════════════════════════════════════════════════
  return (
    <div className="flex flex-col gap-6">
      {/* ── HEADER ──────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.33, 1, 0.68, 1] }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <h3
            className="text-xl font-bold text-white/90 flex items-center gap-2"
            style={{
              fontFamily: "var(--font-playfair), 'Playfair Display', serif",
            }}
          >
            <i className={`${IC.QUESTION} text-purple-400`} aria-hidden="true" />{" "}
            Întrebări Frecvente
            <span
              className="text-sm font-normal text-foreground-dim"
              style={{
                fontFamily:
                  "var(--font-jetbrains), 'JetBrains Mono', monospace",
              }}
            >
              ({items.length})
            </span>
          </h3>
        </div>
        <div className="flex items-center gap-3">
          {/* Category stats badges */}
          {FAQ_CATEGORIES.map((cat) => {
            const count = categoryCounts[cat] ?? 0;
            if (count === 0) return null;
            const meta = CATEGORY_META[cat];
            return (
              <span
                key={cat}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${meta.badgeClass}`}
              >
                <i
                  className={`${meta.icon} text-[8px]`}
                  aria-hidden="true"
                />
                {count}
              </span>
            );
          })}
          <button
            type="button"
            onClick={handleNew}
            className="px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-purple-700 to-purple-500 hover:from-purple-600 hover:to-purple-400 shadow-[0_4px_16px_rgba(126,34,206,0.3)] hover:shadow-[0_6px_24px_rgba(126,34,206,0.45)] transition-all duration-200 flex items-center gap-2"
            style={{
              fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
            }}
          >
            <i className={IC.PLUS} aria-hidden="true" /> FAQ nou
          </button>
        </div>
      </motion.div>

      {/* ── SEARCH & FILTERS ────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.3,
          delay: 0.05,
          ease: [0.33, 1, 0.68, 1],
        }}
        className="flex flex-col sm:flex-row gap-3"
      >
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <i
            className={`${IC.SEARCH} absolute left-3 top-1/2 -translate-y-1/2 text-foreground-dim text-xs`}
            aria-hidden="true"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Caută întrebări sau răspunsuri..."
            className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm text-white placeholder:text-foreground-dim/30 bg-white/5 border border-white/10 hover:border-white/20 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 outline-none transition-all duration-200"
            style={{
              fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
            }}
          />
          {searchQuery.trim() && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-foreground-dim hover:text-white transition-colors"
              aria-label="Șterge căutarea"
            >
              <i className={`${IC.XMARK} text-xs`} aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Category chips */}
        <div className="flex flex-wrap gap-1.5 items-center">
          <button
            type="button"
            onClick={() => setCategoryFilter("toate")}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 border ${
              categoryFilter === "toate"
                ? "bg-white/10 text-white border-white/20"
                : "text-foreground-dim border-white/5 hover:border-white/10 hover:text-white"
            }`}
            style={{
              fontFamily:
                "var(--font-jetbrains), 'JetBrains Mono', monospace",
            }}
          >
            <i
              className={`${IC.GRID} mr-1 text-[10px]`}
              aria-hidden="true"
            />
            Toate ({items.length})
          </button>
          {FAQ_CATEGORIES.map((cat) => {
            const count = categoryCounts[cat] ?? 0;
            const meta = CATEGORY_META[cat];
            const isActive = categoryFilter === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() =>
                  setCategoryFilter((prev) =>
                    prev === cat ? "toate" : cat
                  )
                }
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 border ${
                  isActive
                    ? meta.badgeClass
                    : "text-foreground-dim border-white/5 hover:border-white/10 hover:text-white"
                }`}
                style={{
                  fontFamily:
                    "var(--font-jetbrains), 'JetBrains Mono', monospace",
                }}
              >
                <i
                  className={`${meta.icon} mr-1 text-[10px]`}
                  aria-hidden="true"
                />
                {cat}
                {count > 0 && (
                  <span className="ml-1.5 opacity-60">({count})</span>
                )}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* ── CONTENT ─────────────────────────────────────────── */}
      {filteredItems.length === 0 ? (
        /* Empty state */
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="glass p-12 flex flex-col items-center justify-center gap-4 text-center"
        >
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-white/[0.02] border border-white/5">
            <i
              className={`${IC.EMPTY} text-2xl text-foreground-dim/30`}
              aria-hidden="true"
            />
          </div>
          <div>
            <p
              className="text-sm font-semibold text-white/60 mb-1"
              style={{
                fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
              }}
            >
              {items.length === 0
                ? "Nicio întrebare adăugată"
                : "Niciun rezultat găsit"}
            </p>
            <p
              className="text-xs text-foreground-dim max-w-xs"
              style={{
                fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
              }}
            >
              {items.length === 0
                ? "Adaugă prima întrebare pentru secțiunea FAQ a site-ului."
                : "Încearcă să modifici filtrele sau termenii de căutare."}
            </p>
          </div>
          {items.length === 0 && (
            <button
              type="button"
              onClick={handleNew}
              className="mt-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-purple-700 to-purple-500 hover:from-purple-600 hover:to-purple-400 shadow-[0_4px_16px_rgba(126,34,206,0.3)] transition-all duration-200 flex items-center gap-2"
              style={{
                fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
              }}
            >
              <i className={IC.PLUS} aria-hidden="true" /> Adaugă primul FAQ
            </button>
          )}
          {items.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setCategoryFilter("toate");
              }}
              className="mt-2 px-4 py-2 rounded-lg text-xs font-medium text-foreground-muted hover:text-white border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 transition-all duration-200 flex items-center gap-1.5"
              style={{
                fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
              }}
            >
              <i
                className="fa-solid fa-rotate-left text-[10px]"
                aria-hidden="true"
              />
              Resetează filtrele
            </button>
          )}
        </motion.div>
      ) : (
        /* Cards list */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="glass p-5 sm:p-6 flex flex-col gap-3"
        >
          {/* Count info */}
          <div className="flex items-center justify-between mb-1">
            <span
              className="text-xs uppercase tracking-wider text-foreground-dim"
              style={{
                fontFamily:
                  "var(--font-jetbrains), 'JetBrains Mono', monospace",
              }}
            >
              {filteredItems.length} întrebare
              {filteredItems.length !== 1 ? "i" : ""}
              {searchQuery && (
                <>
                  {" "}
                  pentru &quot;
                  <span className="text-purple-400">{searchQuery}</span>
                  &quot;
                </>
              )}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <AnimatePresence mode="wait">
              {filteredItems.map((item, idx) => (
                <div key={item.id}>
                  <FaqCard
                    item={item}
                    index={idx}
                    onEdit={() => handleEdit(item)}
                    onDelete={() => setConfirmDelete(item.id)}
                  />
                </div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* ── CONFIRM MODAL ───────────────────────────────────── */}
      <ConfirmModal
        open={!!confirmDelete}
        title="Șterge FAQ"
        message="Ești sigur că vrei să ștergi această întrebare frecventă? Acțiunea este ireversibilă."
        onConfirm={() => confirmDelete && handleDelete(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}