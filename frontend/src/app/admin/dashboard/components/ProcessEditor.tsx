"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  fetchProcessSteps,
  createProcessStep,
  updateProcessStep,
  deleteProcessStep,
  reorderProcessSteps,
} from "@/lib/api";
import type { ProcessStep, ProcessStepPayload } from "@/lib/api";

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
  ARROW_LEFT: "fa-solid fa-arrow-left",
  ARROW_RIGHT: "fa-solid fa-arrow-right",
  LIST: "fa-solid fa-list-check",
  LAYER: "fa-solid fa-layer-group",
  GRIP: "fa-solid fa-grip-vertical",
  SEARCH: "fa-solid fa-magnifying-glass",
  WAND: "fa-solid fa-wand-magic-sparkles",
  PALETTE: "fa-solid fa-palette",
};

// ═══════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════

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
  "fa-solid fa-pen-ruler",
  "fa-solid fa-compass-drafting",
  "fa-solid fa-clapperboard",
  "fa-solid fa-brain",
  "fa-solid fa-shield-halved",
  "fa-solid fa-wand-magic-sparkles",
  "fa-solid fa-bolt",
  "fa-solid fa-star",
  "fa-solid fa-fire",
  "fa-solid fa-crown",
  "fa-solid fa-globe",
  "fa-solid fa-database",
  "fa-solid fa-cloud",
  "fa-solid fa-mobile-screen",
  "fa-solid fa-desktop",
  "fa-solid fa-chart-simple",
  "fa-solid fa-cubes",
  "fa-solid fa-robot",
  "fa-solid fa-headset",
];

const GRADIENT_PRESETS = [
  {
    label: "Purple",
    value: "linear-gradient(135deg, #7e22ce 0%, #a855f7 50%, #c084fc 100%)",
  },
  {
    label: "Amber",
    value: "linear-gradient(135deg, #b45309 0%, #f59e0b 50%, #fbbf24 100%)",
  },
  {
    label: "Deep Purple",
    value: "linear-gradient(135deg, #6b21a8 0%, #9333ea 50%, #a855f7 100%)",
  },
  {
    label: "Purple → Gold",
    value: "linear-gradient(135deg, #7e22ce 0%, #c084fc 40%, #fbbf24 100%)",
  },
  {
    label: "Emerald",
    value: "linear-gradient(135deg, #065f46 0%, #10b981 50%, #34d399 100%)",
  },
  {
    label: "Rose",
    value: "linear-gradient(135deg, #9f1239 0%, #f43f5e 50%, #fda4af 100%)",
  },
  {
    label: "Cyan",
    value: "linear-gradient(135deg, #164e63 0%, #06b6d4 50%, #67e8f9 100%)",
  },
  {
    label: "Indigo",
    value: "linear-gradient(135deg, #312e81 0%, #6366f1 50%, #a5b4fc 100%)",
  },
];

const INITIAL_FORM: ProcessStepPayload = {
  label: "",
  title: "",
  description: "",
  icon: "fa-solid fa-lightbulb",
  gradient: "linear-gradient(135deg, #7e22ce 0%, #a855f7 50%, #c084fc 100%)",
  highlights: [],
  order: 0,
};

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface ProcessEditorProps {
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

  const filteredIcons = PROCESS_ICONS.filter((icon) =>
    icon.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-2.5 rounded-lg text-sm text-white bg-white/5 border border-white/10 hover:border-white/20 focus:border-purple-500/50 transition-all duration-200 flex items-center gap-3"
        style={{
          fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
        }}
      >
        <span className="w-8 h-8 rounded-lg flex items-center justify-center bg-purple-500/10 text-purple-400 flex-shrink-0">
          <i className={selected} aria-hidden="true" />
        </span>
        <span className="flex-1 text-left text-foreground-muted text-xs truncate">
          {selected.replace("fa-solid fa-", "").replace(/-/g, " ")}
        </span>
        <i
          className={`${open ? IC.ARROW_UP : IC.ARROW_DOWN} text-foreground-dim text-xs`}
          aria-hidden="true"
        />
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
              <i
                className={`${IC.SEARCH} absolute left-3 top-1/2 -translate-y-1/2 text-foreground-dim text-xs`}
                aria-hidden="true"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Caută iconiță..."
                className="w-full pl-9 pr-4 py-2 rounded-lg text-xs text-white placeholder:text-foreground-dim/30 bg-white/5 border border-white/10 focus:border-purple-500/50 outline-none transition-all duration-200"
                style={{
                  fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
                }}
                autoFocus
              />
            </div>
            <div className="grid grid-cols-7 gap-1.5 max-h-48 overflow-y-auto pr-1">
              {filteredIcons.length === 0 ? (
                <p
                  className="col-span-7 text-xs text-foreground-dim text-center py-6"
                  style={{
                    fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
                  }}
                >
                  Nicio iconiță găsită
                </p>
              ) : (
                filteredIcons.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => {
                      onChange(icon);
                      setOpen(false);
                      setSearch("");
                    }}
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
        <div
          className="fixed inset-0 z-30"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENT: GRADIENT PICKER
// ═══════════════════════════════════════════════════════════════

function GradientPicker({
  selected,
  onChange,
}: {
  selected: string;
  onChange: (gradient: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState(selected);

  const handlePreset = (preset: (typeof GRADIENT_PRESETS)[number]) => {
    onChange(preset.value);
    setCustom(preset.value);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-2.5 rounded-lg text-sm text-white bg-white/5 border border-white/10 hover:border-white/20 focus:border-purple-500/50 transition-all duration-200 flex items-center gap-3"
        style={{
          fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
        }}
      >
        <span
          className="w-8 h-8 rounded-lg flex-shrink-0 ring-1 ring-white/10"
          style={{ background: selected }}
        />
        <span className="flex-1 text-left text-foreground-muted text-xs truncate">
          {GRADIENT_PRESETS.find((p) => p.value === selected)?.label ??
            "Personalizat"}
        </span>
        <i
          className={`${open ? IC.ARROW_UP : IC.ARROW_DOWN} text-foreground-dim text-xs`}
          aria-hidden="true"
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.33, 1, 0.68, 1] }}
            className="absolute z-40 mt-2 w-[340px] p-4 rounded-xl bg-[#14141e] border border-white/10 shadow-2xl flex flex-col gap-3"
          >
            <div className="flex flex-col gap-2">
              <span
                className="text-[10px] uppercase tracking-wider text-foreground-dim"
                style={{
                  fontFamily:
                    "var(--font-jetbrains), 'JetBrains Mono', monospace",
                }}
              >
                Presetări
              </span>
              <div className="grid grid-cols-4 gap-1.5">
                {GRADIENT_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handlePreset(preset)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-150 ${
                      selected === preset.value
                        ? "bg-white/10 ring-1 ring-purple-500/30"
                        : "hover:bg-white/5"
                    }`}
                    title={preset.label}
                  >
                    <span
                      className="w-10 h-6 rounded-md"
                      style={{ background: preset.value }}
                    />
                    <span
                      className="text-[9px] text-foreground-dim leading-none"
                      style={{
                        fontFamily:
                          "var(--font-jetbrains), 'JetBrains Mono', monospace",
                      }}
                    >
                      {preset.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-white/5 pt-3 flex flex-col gap-1.5">
              <span
                className="text-[10px] uppercase tracking-wider text-foreground-dim"
                style={{
                  fontFamily:
                    "var(--font-jetbrains), 'JetBrains Mono', monospace",
                }}
              >
                Personalizat
              </span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={custom}
                  onChange={(e) => setCustom(e.target.value)}
                  placeholder="linear-gradient(...)"
                  className="flex-1 px-3 py-2 rounded-lg text-xs text-white placeholder:text-foreground-dim/30 bg-white/5 border border-white/10 focus:border-purple-500/50 outline-none transition-all duration-200"
                  style={{
                    fontFamily:
                      "var(--font-jetbrains), 'JetBrains Mono', monospace",
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    onChange(custom);
                    setOpen(false);
                  }}
                  className="px-3 py-2 rounded-lg text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 transition-all duration-200"
                  style={{
                    fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
                  }}
                >
                  Set
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {open && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
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
// SUB-COMPONENT: PROCESS CARD (list item)
// ═══════════════════════════════════════════════════════════════

function ProcessCard({
  step,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  index,
}: {
  step: ProcessStep;
  onEdit: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        delay: index * 0.04,
        ease: [0.33, 1, 0.68, 1],
      }}
      className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all duration-200 group"
    >
      {/* Săgeți reordonare */}
      <div className="flex flex-col gap-0.5 flex-shrink-0">
        <button
          type="button"
          onClick={onMoveUp}
          disabled={isFirst}
          className="w-6 h-5 rounded flex items-center justify-center text-foreground-dim hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
          aria-label="Mută sus"
        >
          <i className={`${IC.ARROW_UP} text-[10px]`} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={onMoveDown}
          disabled={isLast}
          className="w-6 h-5 rounded flex items-center justify-center text-foreground-dim hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
          aria-label="Mută jos"
        >
          <i className={`${IC.ARROW_DOWN} text-[10px]`} aria-hidden="true" />
        </button>
      </div>

      {/* Bulină gradient */}
      <span
        className="w-9 h-9 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
        style={{ background: step.gradient }}
      >
        <i className={`${step.icon} text-white text-xs`} aria-hidden="true" />
      </span>

      {/* Conținut */}
      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        <div className="flex items-center gap-2">
          {step.label && (
            <span
              className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 flex-shrink-0"
              style={{
                fontFamily:
                  "var(--font-jetbrains), 'JetBrains Mono', monospace",
              }}
            >
              {step.label}
            </span>
          )}
          <p
            className="text-sm font-semibold text-white/90 truncate"
            style={{
              fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
            }}
          >
            {step.title}
          </p>
        </div>
        <p
          className="text-xs text-foreground-dim truncate"
          style={{
            fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
          }}
        >
          {step.description || "Fără descriere"}
        </p>
        {step.highlights.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-0.5">
            {step.highlights.slice(0, 3).map((h, i) => (
              <span
                key={i}
                className="px-1.5 py-0.5 rounded-md text-[9px] text-foreground-dim bg-white/[0.03] border border-white/[0.04]"
                style={{
                  fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
                }}
              >
                {h}
              </span>
            ))}
            {step.highlights.length > 3 && (
              <span
                className="px-1.5 py-0.5 rounded-md text-[9px] text-foreground-dim"
                style={{
                  fontFamily:
                    "var(--font-jetbrains), 'JetBrains Mono', monospace",
                }}
              >
                +{step.highlights.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Acțiuni */}
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0">
        <button
          type="button"
          onClick={onEdit}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-foreground-dim hover:text-purple-400 hover:bg-purple-500/10 transition-all"
          aria-label={`Editează ${step.title}`}
        >
          <i className={IC.PEN} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-foreground-dim hover:text-red-400 hover:bg-red-500/10 transition-all"
          aria-label={`Șterge ${step.title}`}
        >
          <i className={IC.TRASH} aria-hidden="true" />
        </button>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENT: GRADIENT PREVIEW CARD
// ═══════════════════════════════════════════════════════════════

function GradientPreviewCard({ gradient }: { gradient: string }) {
  if (!gradient) return null;
  return (
    <div
      className="w-full h-16 rounded-xl ring-1 ring-white/5 relative overflow-hidden"
      style={{ background: gradient }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className="text-white/80 text-xs font-semibold drop-shadow-md"
          style={{
            fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace",
          }}
        >
          Previzualizare gradient
        </span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT: PROCESS EDITOR
// ═══════════════════════════════════════════════════════════════

export default function ProcessEditor({ addToast }: ProcessEditorProps) {
  const [steps, setSteps] = useState<ProcessStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState<ViewMode>("list");
  const [editing, setEditing] = useState<ProcessStep | null>(null);
  const [form, setForm] = useState<ProcessStepPayload>({ ...INITIAL_FORM });
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [newHighlight, setNewHighlight] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [reordering, setReordering] = useState(false);

  // ── Load steps ────────────────────────────────────────────
  const loadSteps = useCallback(async () => {
    setLoading(true);
    const res = await fetchProcessSteps();
    if (res.data) setSteps(res.data);
    else addToast(res.error || "Eroare la încărcarea pașilor", "error");
    setLoading(false);
  }, [addToast]);

  useEffect(() => {
    loadSteps();
  }, [loadSteps]);

  // ── Reset form ────────────────────────────────────────────
  const resetForm = () => {
    setEditing(null);
    setForm({ ...INITIAL_FORM });
    setNewHighlight("");
    setView("list");
  };

  // ── Edit ──────────────────────────────────────────────────
  const handleEdit = (step: ProcessStep) => {
    setEditing(step);
    setForm({
      label: step.label,
      title: step.title,
      description: step.description,
      icon: step.icon,
      gradient: step.gradient,
      highlights: [...step.highlights],
      order: step.order,
    });
    setView("form");
  };

  // ── New ───────────────────────────────────────────────────
  const handleNew = () => {
    setEditing(null);
    setForm({ ...INITIAL_FORM });
    setView("form");
  };

  // ── Highlight management ──────────────────────────────────
  const addHighlight = () => {
    const trimmed = newHighlight.trim();
    if (!trimmed) return;
    setForm((prev) => ({ ...prev, highlights: [...prev.highlights, trimmed] }));
    setNewHighlight("");
  };

  const removeHighlight = (index: number) => {
    setForm((prev) => ({
      ...prev,
      highlights: prev.highlights.filter((_, i) => i !== index),
    }));
  };

  // ── Save ──────────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.title.trim()) {
      addToast("Titlul pasului este obligatoriu", "error");
      return;
    }
    setSaving(true);
    if (editing) {
      const res = await updateProcessStep(editing.id, form);
      if (res.data) {
        addToast("Pas actualizat cu succes", "success");
        await loadSteps();
        resetForm();
      } else addToast(res.error || "Eroare la actualizare", "error");
    } else {
      const res = await createProcessStep({
        ...form,
        order: steps.length,
      });
      if (res.data) {
        addToast("Pas creat cu succes", "success");
        await loadSteps();
        resetForm();
      } else addToast(res.error || "Eroare la creare", "error");
    }
    setSaving(false);
  };

  // ── Delete ────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    const res = await deleteProcessStep(id);
    if (res.ok) {
      addToast("Pas șters", "success");
      await loadSteps();
    } else addToast(res.error || "Eroare la ștergere", "error");
    setConfirmDelete(null);
  };

  // ── Reorder (local) ───────────────────────────────────────
  const moveUp = (index: number) => {
    if (index === 0) return;
    const newSteps = [...steps];
    [newSteps[index - 1], newSteps[index]] = [
      newSteps[index],
      newSteps[index - 1],
    ];
    setSteps(newSteps);
  };

  const moveDown = (index: number) => {
    if (index === steps.length - 1) return;
    const newSteps = [...steps];
    [newSteps[index], newSteps[index + 1]] = [
      newSteps[index + 1],
      newSteps[index],
    ];
    setSteps(newSteps);
  };

  // ── Persist reorder ───────────────────────────────────────
  const handlePersistReorder = async () => {
    setReordering(true);
    const orderedIds = steps.map((s) => s.id);
    const res = await reorderProcessSteps(orderedIds);
    if (res.data) {
      setSteps(res.data);
      addToast("Ordine salvată", "success");
    } else {
      addToast(res.error || "Eroare la salvare ordine", "error");
      await loadSteps();
    }
    setReordering(false);
  };

  // ── Filter ────────────────────────────────────────────────
  const filteredSteps = steps.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.title.toLowerCase().includes(q) ||
      s.label.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q)
    );
  });

  // ── Loading state ─────────────────────────────────────────
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
            Se încarcă pașii...
          </p>
        </motion.div>
      </div>
    );
  }

  // ── FORM VIEW ──────────────────────────────────────────────
  if (view === "form") {
    return (
      <div className="flex flex-col gap-6">
        <button
          type="button"
          onClick={resetForm}
          className="flex items-center gap-2 text-sm text-foreground-dim hover:text-white transition-colors w-fit"
          style={{
            fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
          }}
        >
          <i className={IC.ARROW_LEFT} aria-hidden="true" /> Înapoi la lista de
          pași
        </button>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.33, 1, 0.68, 1] }}
          className="glass p-6 sm:p-8 flex flex-col gap-6"
        >
          {/* Header */}
          <div className="flex items-center gap-3">
            <span
              className="w-10 h-10 rounded-xl flex items-center justify-center bg-purple-500/10 text-purple-400 ring-1 ring-purple-500/10"
              style={{ background: editing ? form.gradient : undefined }}
            >
              <i
                className={`${editing ? form.icon : IC.PLUS} ${editing ? "text-white text-xs" : ""}`}
                aria-hidden="true"
              />
            </span>
            <div>
              <h3
                className="text-xl font-bold text-white/90"
                style={{
                  fontFamily:
                    "var(--font-playfair), 'Playfair Display', serif",
                }}
              >
                {editing ? "Editează pasul" : "Adaugă pas nou"}
              </h3>
              <p
                className="text-xs text-foreground-muted"
                style={{
                  fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
                }}
              >
                {editing
                  ? "Modifică detaliile pasului existent"
                  : "Completează detaliile noului pas de proces"}
              </p>
            </div>
          </div>

          {/* Form fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Etichetă */}
            <FormField label="Etichetă">
              <input
                type="text"
                value={form.label}
                onChange={(e) =>
                  setForm((p) => ({ ...p, label: e.target.value }))
                }
                placeholder="Pasul 1"
                className="w-full px-4 py-2.5 rounded-lg text-sm text-white placeholder:text-foreground-dim/30 bg-white/5 border border-white/10 hover:border-white/20 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 outline-none transition-all duration-200"
                style={{
                  fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
                }}
              />
            </FormField>

            {/* Titlu */}
            <FormField label="Titlu" required>
              <input
                type="text"
                value={form.title}
                onChange={(e) =>
                  setForm((p) => ({ ...p, title: e.target.value }))
                }
                placeholder="Discovery & Strategie"
                className="w-full px-4 py-2.5 rounded-lg text-sm text-white placeholder:text-foreground-dim/30 bg-white/5 border border-white/10 hover:border-white/20 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 outline-none transition-all duration-200"
                style={{
                  fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
                }}
              />
            </FormField>

            {/* Descriere */}
            <div className="md:col-span-2">
              <FormField label="Descriere">
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, description: e.target.value }))
                  }
                  placeholder="Descrierea detaliată a acestui pas..."
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-lg text-sm text-white placeholder:text-foreground-dim/30 bg-white/5 border border-white/10 hover:border-white/20 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 outline-none transition-all duration-200 resize-vertical"
                  style={{
                    fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
                  }}
                />
              </FormField>
            </div>

            {/* Iconiță */}
            <FormField label="Iconiță" required>
              <IconPicker
                selected={form.icon}
                onChange={(icon) => setForm((p) => ({ ...p, icon }))}
              />
            </FormField>

            {/* Gradient */}
            <FormField label="Gradient">
              <GradientPicker
                selected={form.gradient}
                onChange={(gradient) =>
                  setForm((p) => ({ ...p, gradient }))
                }
              />
            </FormField>

            {/* Previzualizare gradient */}
            <div className="md:col-span-2">
              <GradientPreviewCard gradient={form.gradient} />
            </div>

            {/* Highlights */}
            <div className="md:col-span-2 flex flex-col gap-3">
              <span
                className="text-xs uppercase tracking-wider text-foreground-dim font-medium"
                style={{
                  fontFamily:
                    "var(--font-jetbrains), 'JetBrains Mono', monospace",
                }}
              >
                Highlights
              </span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newHighlight}
                  onChange={(e) => setNewHighlight(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addHighlight();
                  }}
                  placeholder="Punct cheie al acestui pas..."
                  className="flex-1 px-4 py-2.5 rounded-lg text-sm text-white placeholder:text-foreground-dim/30 bg-white/5 border border-white/10 hover:border-white/20 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 outline-none transition-all duration-200"
                  style={{
                    fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
                  }}
                />
                <button
                  type="button"
                  onClick={addHighlight}
                  className="px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-purple-600 hover:bg-purple-500 transition-all duration-200 flex items-center gap-1.5"
                  style={{
                    fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
                  }}
                >
                  <i className={IC.PLUS} aria-hidden="true" /> Adaugă
                </button>
              </div>
              {form.highlights.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  {form.highlights.map((h, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.02] border border-white/5 group/highlight"
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ background: form.gradient }}
                      />
                      <span
                        className="flex-1 text-sm text-foreground-muted"
                        style={{
                          fontFamily:
                            "var(--font-poppins), 'Poppins', sans-serif",
                        }}
                      >
                        {h}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeHighlight(i)}
                        className="w-6 h-6 rounded flex items-center justify-center text-foreground-dim hover:text-red-400 transition-colors opacity-0 group-hover/highlight:opacity-100"
                        aria-label={`Șterge highlight: ${h}`}
                      >
                        <i className={`${IC.XMARK} text-xs`} aria-hidden="true" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
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
                  {editing ? "Actualizează" : "Adaugă pasul"}
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
          title="Șterge pasul"
          message="Ești sigur că vrei să ștergi acest pas? Această acțiune este ireversibilă."
          onConfirm={() => confirmDelete && handleDelete(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      </div>
    );
  }

  // ── LIST VIEW ──────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
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
            <i className={`${IC.LIST} text-purple-400`} aria-hidden="true" />{" "}
            Pași Proces
            <span
              className="text-sm font-normal text-foreground-dim"
              style={{
                fontFamily:
                  "var(--font-jetbrains), 'JetBrains Mono', monospace",
              }}
            >
              ({steps.length})
            </span>
          </h3>
        </div>
        <div className="flex items-center gap-3">
          {steps.length > 0 && (
            <button
              type="button"
              onClick={handlePersistReorder}
              disabled={reordering}
              className="px-4 py-2.5 rounded-lg text-sm font-medium text-foreground-muted hover:text-white border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
              style={{
                fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
              }}
            >
              {reordering ? (
                <>
                  <i
                    className={`${IC.SPINNER} animate-spin`}
                    aria-hidden="true"
                  />{" "}
                  Se salvează...
                </>
              ) : (
                <>
                  <i className={IC.SAVE} aria-hidden="true" /> Salvează ordinea
                </>
              )}
            </button>
          )}
          <button
            type="button"
            onClick={handleNew}
            className="px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-purple-700 to-purple-500 hover:from-purple-600 hover:to-purple-400 shadow-[0_4px_16px_rgba(126,34,206,0.3)] hover:shadow-[0_6px_24px_rgba(126,34,206,0.45)] transition-all duration-200 flex items-center gap-2"
            style={{
              fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
            }}
          >
            <i className={IC.PLUS} aria-hidden="true" /> Pas nou
          </button>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05, ease: [0.33, 1, 0.68, 1] }}
      >
        <div className="relative max-w-sm">
          <i
            className={`${IC.SEARCH} absolute left-3 top-1/2 -translate-y-1/2 text-foreground-dim text-xs`}
            aria-hidden="true"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Caută pași..."
            className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm text-white placeholder:text-foreground-dim/30 bg-white/5 border border-white/10 hover:border-white/20 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 outline-none transition-all duration-200"
            style={{
              fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
            }}
          />
        </div>
      </motion.div>

      {/* List / Empty */}
      {filteredSteps.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="glass p-12 flex flex-col items-center justify-center gap-4 text-center"
        >
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-white/[0.02] border border-white/5">
            <i
              className={`${IC.LAYER} text-2xl text-foreground-dim/30`}
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
              {steps.length === 0
                ? "Niciun pas adăugat"
                : "Niciun rezultat găsit"}
            </p>
            <p
              className="text-xs text-foreground-dim max-w-xs"
              style={{
                fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
              }}
            >
              {steps.length === 0
                ? "Adaugă primul pas pentru a defini procesul de lucru."
                : "Încearcă să modifici termenii de căutare."}
            </p>
          </div>
          {steps.length === 0 && (
            <button
              type="button"
              onClick={handleNew}
              className="mt-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-purple-700 to-purple-500 hover:from-purple-600 hover:to-purple-400 shadow-[0_4px_16px_rgba(126,34,206,0.3)] transition-all duration-200 flex items-center gap-2"
              style={{
                fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
              }}
            >
              <i className={IC.PLUS} aria-hidden="true" /> Adaugă primul pas
            </button>
          )}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="glass p-5 sm:p-6 flex flex-col gap-3"
        >
          <div className="flex items-center justify-between mb-1">
            <span
              className="text-xs uppercase tracking-wider text-foreground-dim"
              style={{
                fontFamily:
                  "var(--font-jetbrains), 'JetBrains Mono', monospace",
              }}
            >
              {filteredSteps.length} pas{filteredSteps.length !== 1 && "i"}
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
          <AnimatePresence mode="wait">
            <div className="flex flex-col gap-2">
              {filteredSteps.map((step, idx) => (
                <ProcessCard
                  key={step.id}
                  step={step}
                  index={idx}
                  onEdit={() => handleEdit(step)}
                  onDelete={() => setConfirmDelete(step.id)}
                  onMoveUp={() => moveUp(idx)}
                  onMoveDown={() => moveDown(idx)}
                  isFirst={idx === 0}
                  isLast={idx === filteredSteps.length - 1}
                />
              ))}
            </div>
          </AnimatePresence>
        </motion.div>
      )}

      <ConfirmModal
        open={!!confirmDelete}
        title="Șterge pasul"
        message="Ești sigur că vrei să ștergi acest pas? Această acțiune este ireversibilă."
        onConfirm={() => confirmDelete && handleDelete(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}