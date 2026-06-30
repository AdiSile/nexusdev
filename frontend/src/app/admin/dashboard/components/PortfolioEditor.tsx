"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  fetchPortfolio,
  createPortfolioProject,
  updatePortfolioProject,
  deletePortfolioProject,
} from "@/lib/api";
import type {
  PortfolioProject,
  PortfolioProjectPayload,
} from "@/lib/api";

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
  EYE: "fa-solid fa-eye",
  EYE_SLASH: "fa-solid fa-eye-slash",
  FOLDER: "fa-solid fa-folder-open",
  STAR: "fa-solid fa-star",
  FIRE: "fa-solid fa-fire",
  TAG: "fa-solid fa-tag",
  SEARCH: "fa-solid fa-magnifying-glass",
  FILTER: "fa-solid fa-filter",
  GRID: "fa-solid fa-grid-2",
  ROWS: "fa-solid fa-bars",
  LINK: "fa-solid fa-link",
  GITHUB: "fa-brands fa-github",
  GLOBE: "fa-solid fa-globe",
  IMAGE: "fa-solid fa-image",
  CODE: "fa-solid fa-code",
  LAYER: "fa-solid fa-layer-group",
  EMPTY: "fa-solid fa-diagram-project",
  LIST: "fa-solid fa-list-check",
  BOLT: "fa-solid fa-bolt",
  WAND: "fa-solid fa-wand-magic-sparkles",
  INFO: "fa-solid fa-circle-info",
  EXTERNAL: "fa-solid fa-arrow-up-right-from-square",
  COPY: "fa-solid fa-copy",
};

// ═══════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════

const PORTFOLIO_CATEGORIES: string[] = [
  "Web Development",
  "Mobile Apps",
  "E-Commerce",
  "Design",
  "Dashboard",
  "Backend",
  "Full-Stack",
  "Landing Page",
];

const CATEGORY_COLORS: Record<string, string> = {
  "Web Development": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "Mobile Apps": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  "E-Commerce": "bg-amber-500/10 text-amber-400 border-amber-500/20",
  "Design": "bg-pink-500/10 text-pink-400 border-pink-500/20",
  "Dashboard": "bg-purple-500/10 text-purple-400 border-purple-500/20",
  "Backend": "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  "Full-Stack": "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  "Landing Page": "bg-rose-500/10 text-rose-400 border-rose-500/20",
};

const INITIAL_FORM: PortfolioProjectPayload = {
  title: "",
  category: "",
  description: "",
  imageUrl: "",
  imageAlt: "",
  demoUrl: "",
  githubUrl: "",
  techTags: [],
  featured: false,
};

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface PortfolioEditorProps {
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
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
          checked ? (colorClass ?? "bg-purple-600") : "bg-white/10"
        }`}
      >
        <motion.span
          className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md"
          animate={{ x: checked ? 20 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </button>
      <span
        className="text-sm text-foreground-muted flex items-center gap-1.5"
        style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}
      >
        {icon && (
          <i
            className={`${icon} ${checked ? "text-amber-400" : "text-foreground-dim"}`}
            aria-hidden="true"
          />
        )}
        {label}
      </span>
    </label>
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
// SUB-COMPONENT: PORTFOLIO CARD (list item)
// ═══════════════════════════════════════════════════════════════

function PortfolioCard({
  project,
  onEdit,
  onDelete,
  index,
}: {
  project: PortfolioProject;
  onEdit: () => void;
  onDelete: () => void;
  index: number;
}) {
  const catColor =
    CATEGORY_COLORS[project.category] ?? CATEGORY_COLORS["Web Development"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        delay: index * 0.04,
        ease: [0.33, 1, 0.68, 1],
      }}
      className="flex items-center gap-4 px-5 py-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all duration-200 group"
    >
      {/* Thumbnail */}
      <div className="w-14 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-white/5 border border-white/5 relative">
        {project.imageUrl ? (
          <img
            src={project.imageUrl}
            alt={project.imageAlt || project.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
              const fallback = (e.target as HTMLImageElement)
                .nextElementSibling as HTMLElement | null;
              if (fallback) fallback.style.display = "flex";
            }}
          />
        ) : null}
        <div
          className={`w-full h-full items-center justify-center text-foreground-dim/40 text-sm ${
            project.imageUrl ? "hidden" : "flex"
          }`}
        >
          <i className={IC.IMAGE} aria-hidden="true" />
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <p
            className="text-sm font-semibold text-white/90 truncate"
            style={{
              fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
            }}
          >
            {project.title}
          </p>
          {project.featured && (
            <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-[10px] font-bold text-amber-400 flex-shrink-0">
              <i className={`${IC.STAR} text-[8px]`} aria-hidden="true" />{" "}
              Featured
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {project.category && (
            <span
              className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${catColor}`}
              style={{
                fontFamily:
                  "var(--font-jetbrains), 'JetBrains Mono', monospace",
              }}
            >
              {project.category}
            </span>
          )}
          {project.techTags.length > 0 && (
            <span
              className="text-[10px] text-foreground-dim"
              style={{
                fontFamily:
                  "var(--font-jetbrains), 'JetBrains Mono', monospace",
              }}
            >
              {project.techTags.slice(0, 4).join(" · ")}
              {project.techTags.length > 4 && " · ..."}
            </span>
          )}
        </div>
      </div>

      {/* Links */}
      <div className="hidden lg:flex items-center gap-1.5 flex-shrink-0">
        {project.demoUrl && (
          <a
            href={project.demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Demo live"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-foreground-dim hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
            onClick={(e) => e.stopPropagation()}
            aria-label="Demo live"
          >
            <i className={`${IC.EXTERNAL} text-xs`} aria-hidden="true" />
          </a>
        )}
        {project.githubUrl && (
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="GitHub"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-foreground-dim hover:text-white hover:bg-white/10 transition-all"
            onClick={(e) => e.stopPropagation()}
            aria-label="GitHub"
          >
            <i className={`${IC.GITHUB} text-xs`} aria-hidden="true" />
          </a>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0">
        <button
          type="button"
          onClick={onEdit}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-foreground-dim hover:text-purple-400 hover:bg-purple-500/10 transition-all"
          aria-label={`Editează ${project.title}`}
        >
          <i className={IC.PEN} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-foreground-dim hover:text-red-400 hover:bg-red-500/10 transition-all"
          aria-label={`Șterge ${project.title}`}
        >
          <i className={IC.TRASH} aria-hidden="true" />
        </button>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT: PORTFOLIO EDITOR
// ═══════════════════════════════════════════════════════════════

export default function PortfolioEditor({
  addToast,
}: PortfolioEditorProps) {
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState<ViewMode>("list");
  const [editing, setEditing] = useState<PortfolioProject | null>(null);
  const [form, setForm] = useState<PortfolioProjectPayload>({
    ...INITIAL_FORM,
  });
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [newTag, setNewTag] = useState("");

  // ── Load projects ──────────────────────────────────────────
  const loadProjects = useCallback(async () => {
    setLoading(true);
    const res = await fetchPortfolio();
    if (res.data) setProjects(res.data);
    else addToast(res.error || "Eroare la încărcarea proiectelor", "error");
    setLoading(false);
  }, [addToast]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // ── Form helpers ───────────────────────────────────────────
  const resetForm = () => {
    setEditing(null);
    setForm({ ...INITIAL_FORM });
    setNewTag("");
    setView("list");
  };

  const handleEdit = (project: PortfolioProject) => {
    setEditing(project);
    setForm({
      title: project.title,
      category: project.category,
      description: project.description,
      imageUrl: project.imageUrl,
      imageAlt: project.imageAlt,
      demoUrl: project.demoUrl,
      githubUrl: project.githubUrl,
      techTags: [...project.techTags],
      featured: project.featured,
    });
    setNewTag("");
    setView("form");
  };

  const handleNew = () => {
    setEditing(null);
    setForm({ ...INITIAL_FORM });
    setNewTag("");
    setView("form");
  };

  // ── Tag management ─────────────────────────────────────────
  const addTag = () => {
    const t = newTag.trim();
    if (!t || form.techTags.includes(t)) return;
    setForm((p) => ({ ...p, techTags: [...p.techTags, t] }));
    setNewTag("");
  };

  const removeTag = (i: number) => {
    setForm((p) => ({
      ...p,
      techTags: p.techTags.filter((_, idx) => idx !== i),
    }));
  };

  // ── Save ───────────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.title.trim()) {
      addToast("Titlul proiectului este obligatoriu", "error");
      return;
    }

    setSaving(true);

    if (editing) {
      const res = await updatePortfolioProject(editing.id, form);
      if (res.data) {
        addToast("Proiect actualizat cu succes", "success");
        await loadProjects();
        resetForm();
      } else {
        addToast(res.error || "Eroare la actualizare", "error");
      }
    } else {
      const res = await createPortfolioProject(form);
      if (res.data) {
        addToast("Proiect creat cu succes", "success");
        await loadProjects();
        resetForm();
      } else {
        addToast(res.error || "Eroare la creare", "error");
      }
    }

    setSaving(false);
  };

  // ── Delete ─────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    const res = await deletePortfolioProject(id);
    if (res.ok) {
      addToast("Proiect șters", "success");
      await loadProjects();
    } else {
      addToast(res.error || "Eroare la ștergere", "error");
    }
    setConfirmDelete(null);
  };

  // ── Filtering & search ─────────────────────────────────────
  const filteredProjects = useMemo(() => {
    let result = [...projects];

    if (categoryFilter !== "all") {
      result = result.filter((p) => p.category === categoryFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.techTags.some((t) => t.toLowerCase().includes(q)) ||
          p.category.toLowerCase().includes(q)
      );
    }

    return result;
  }, [projects, categoryFilter, searchQuery]);

  // ── Derived data ───────────────────────────────────────────
  const featuredCount = projects.filter((p) => p.featured).length;

  const activeCategories = useMemo(() => {
    const cats = new Set(projects.map((p) => p.category).filter(Boolean));
    return PORTFOLIO_CATEGORIES.filter((cat) => cats.has(cat));
  }, [projects]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: projects.length };
    PORTFOLIO_CATEGORIES.forEach((cat) => {
      counts[cat] = projects.filter((p) => p.category === cat).length;
    });
    return counts;
  }, [projects]);

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
            Se încarcă proiectele...
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
          proiecte
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
              <i
                className={editing ? IC.PEN : IC.PLUS}
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
                {editing ? "Editează proiectul" : "Adaugă proiect nou"}
              </h3>
              <p
                className="text-xs text-foreground-muted"
                style={{
                  fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
                }}
              >
                Completează detaliile proiectului pentru portofoliu
              </p>
            </div>
          </div>

          {/* Form fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Titlu */}
            <FormField label="Titlu proiect" required>
              <input
                type="text"
                value={form.title}
                onChange={(e) =>
                  setForm((p) => ({ ...p, title: e.target.value }))
                }
                placeholder="My Awesome Project"
                className="w-full px-4 py-2.5 rounded-lg text-sm text-white placeholder:text-foreground-dim/30 bg-white/5 border border-white/10 hover:border-white/20 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 outline-none transition-all duration-200"
                style={{
                  fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
                }}
              />
            </FormField>

            {/* Categorie */}
            <FormField label="Categorie">
              <div className="flex flex-wrap gap-2">
                {PORTFOLIO_CATEGORIES.map((cat) => {
                  const isActive = form.category === cat;
                  const colorCls =
                    CATEGORY_COLORS[cat] ?? CATEGORY_COLORS["Web Development"];
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() =>
                        setForm((p) => ({ ...p, category: cat }))
                      }
                      className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 border ${
                        isActive
                          ? `${colorCls} ring-1 ring-white/5`
                          : "text-foreground-dim border-white/5 hover:border-white/10 hover:text-white"
                      }`}
                      style={{
                        fontFamily:
                          "var(--font-poppins), 'Poppins', sans-serif",
                      }}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </FormField>

            {/* Descriere */}
            <div className="md:col-span-2">
              <FormField label="Descriere">
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, description: e.target.value }))
                  }
                  placeholder="Descrierea detaliată a proiectului, tehnologii folosite, provocări rezolvate..."
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-lg text-sm text-white placeholder:text-foreground-dim/30 bg-white/5 border border-white/10 hover:border-white/20 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 outline-none transition-all duration-200 resize-vertical"
                  style={{
                    fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
                  }}
                />
              </FormField>
            </div>

            {/* URL Imagine */}
            <FormField label="URL Imagine">
              <div className="relative">
                <i
                  className={`${IC.IMAGE} absolute left-3 top-1/2 -translate-y-1/2 text-foreground-dim text-xs`}
                  aria-hidden="true"
                />
                <input
                  type="url"
                  value={form.imageUrl}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, imageUrl: e.target.value }))
                  }
                  placeholder="https://... .jpg"
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm text-white placeholder:text-foreground-dim/30 bg-white/5 border border-white/10 hover:border-white/20 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 outline-none transition-all duration-200"
                  style={{
                    fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
                  }}
                />
              </div>
            </FormField>

            {/* Text alternativ */}
            <FormField label="Text alternativ imagine">
              <input
                type="text"
                value={form.imageAlt}
                onChange={(e) =>
                  setForm((p) => ({ ...p, imageAlt: e.target.value }))
                }
                placeholder="Captură ecran proiect"
                className="w-full px-4 py-2.5 rounded-lg text-sm text-white placeholder:text-foreground-dim/30 bg-white/5 border border-white/10 hover:border-white/20 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 outline-none transition-all duration-200"
                style={{
                  fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
                }}
              />
            </FormField>

            {/* URL Demo */}
            <FormField label="URL Demo">
              <div className="relative">
                <i
                  className={`${IC.GLOBE} absolute left-3 top-1/2 -translate-y-1/2 text-foreground-dim text-xs`}
                  aria-hidden="true"
                />
                <input
                  type="url"
                  value={form.demoUrl}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, demoUrl: e.target.value }))
                  }
                  placeholder="https://..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm text-white placeholder:text-foreground-dim/30 bg-white/5 border border-white/10 hover:border-white/20 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 outline-none transition-all duration-200"
                  style={{
                    fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
                  }}
                />
              </div>
            </FormField>

            {/* URL GitHub */}
            <FormField label="URL GitHub">
              <div className="relative">
                <i
                  className={`${IC.GITHUB} absolute left-3 top-1/2 -translate-y-1/2 text-foreground-dim text-xs`}
                  aria-hidden="true"
                />
                <input
                  type="url"
                  value={form.githubUrl}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, githubUrl: e.target.value }))
                  }
                  placeholder="https://github.com/..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm text-white placeholder:text-foreground-dim/30 bg-white/5 border border-white/10 hover:border-white/20 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 outline-none transition-all duration-200"
                  style={{
                    fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
                  }}
                />
              </div>
            </FormField>

            {/* Image preview */}
            {form.imageUrl && (
              <div className="md:col-span-2">
                <FormField label="Previzualizare imagine">
                  <div className="relative w-full h-40 rounded-xl overflow-hidden bg-white/5 border border-white/10 group">
                    <img
                      src={form.imageUrl}
                      alt={form.imageAlt || "Previzualizare"}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                        const fallback =
                          target.parentElement?.querySelector(
                            ".preview-fallback"
                          );
                        if (fallback) {
                          (fallback as HTMLElement).style.display = "flex";
                        }
                      }}
                    />
                    <div className="preview-fallback absolute inset-0 items-center justify-center gap-2 text-foreground-dim/50 hidden">
                      <i className={`${IC.IMAGE} text-lg`} aria-hidden="true" />
                      <span
                        className="text-xs"
                        style={{
                          fontFamily:
                            "var(--font-poppins), 'Poppins', sans-serif",
                        }}
                      >
                        Imaginea nu s-a putut încărca
                      </span>
                    </div>
                  </div>
                </FormField>
              </div>
            )}
          </div>

          {/* Tech Tags */}
          <div className="flex flex-col gap-3">
            <span
              className="text-xs uppercase tracking-wider text-foreground-dim font-medium"
              style={{
                fontFamily:
                  "var(--font-jetbrains), 'JetBrains Mono', monospace",
              }}
            >
              Tag-uri tehnologii
            </span>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="React, TypeScript, Next.js..."
                className="flex-1 px-4 py-2.5 rounded-lg text-sm text-white placeholder:text-foreground-dim/30 bg-white/5 border border-white/10 hover:border-white/20 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 outline-none transition-all duration-200"
                style={{
                  fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
                }}
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-purple-600 hover:bg-purple-500 transition-all duration-200 flex items-center gap-1.5"
                style={{
                  fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
                }}
              >
                <i className={IC.PLUS} aria-hidden="true" /> Adaugă
              </button>
            </div>
            {form.techTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <AnimatePresence>
                  {form.techTags.map((tag, i) => (
                    <motion.span
                      key={tag}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.15 }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-white/80 bg-purple-500/15 border border-purple-500/20"
                      style={{
                        fontFamily:
                          "var(--font-poppins), 'Poppins', sans-serif",
                      }}
                    >
                      <i
                        className={`${IC.CODE} text-[10px] text-purple-400/60`}
                        aria-hidden="true"
                      />
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(i)}
                        className="w-4 h-4 rounded-full flex items-center justify-center text-purple-400/60 hover:text-red-400 transition-colors"
                        aria-label={`Șterge ${tag}`}
                      >
                        <i
                          className={`${IC.XMARK} text-[10px]`}
                          aria-hidden="true"
                        />
                      </button>
                    </motion.span>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Featured Toggle */}
          <div className="flex items-center gap-8 pt-2 border-t border-white/5">
            <ToggleSwitch
              checked={form.featured}
              onChange={() =>
                setForm((p) => ({ ...p, featured: !p.featured }))
              }
              label="Featured"
              icon={IC.STAR}
              colorClass="bg-amber-500"
            />
            {form.featured && (
              <span
                className="text-[10px] text-foreground-dim"
                style={{
                  fontFamily:
                    "var(--font-jetbrains), 'JetBrains Mono', monospace",
                }}
              >
                Proiectul va fi evidențiat pe prima pagină a portofoliului
              </span>
            )}
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
                  {editing ? "Actualizează proiectul" : "Adaugă proiectul"}
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
          title="Șterge proiectul"
          message="Ești sigur că vrei să ștergi acest proiect? Această acțiune este ireversibilă."
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
            <i className={`${IC.FOLDER} text-purple-400`} aria-hidden="true" />{" "}
            Portofoliu
            <span
              className="text-sm font-normal text-foreground-dim"
              style={{
                fontFamily:
                  "var(--font-jetbrains), 'JetBrains Mono', monospace",
              }}
            >
              ({projects.length})
            </span>
          </h3>
        </div>
        <div className="flex items-center gap-3">
          {featuredCount > 0 && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <i className={`${IC.STAR} text-[8px]`} aria-hidden="true" />
              {featuredCount} featured
            </span>
          )}
          {(projects.filter((p) => p.githubUrl).length > 0 ||
            projects.filter((p) => p.demoUrl).length > 0) && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <i className={`${IC.LINK} text-[8px]`} aria-hidden="true" />
              {projects.filter((p) => p.demoUrl || p.githubUrl).length} online
            </span>
          )}
          <button
            type="button"
            onClick={handleNew}
            className="px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-purple-700 to-purple-500 hover:from-purple-600 hover:to-purple-400 shadow-[0_4px_16px_rgba(126,34,206,0.3)] hover:shadow-[0_6px_24px_rgba(126,34,206,0.45)] transition-all duration-200 flex items-center gap-2"
            style={{
              fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
            }}
          >
            <i className={IC.PLUS} aria-hidden="true" /> Proiect nou
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
            placeholder="Caută proiecte, tag-uri..."
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
            onClick={() => setCategoryFilter("all")}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 border ${
              categoryFilter === "all"
                ? "bg-white/10 text-white border-white/20"
                : "text-foreground-dim border-white/5 hover:border-white/10 hover:text-white"
            }`}
            style={{
              fontFamily:
                "var(--font-jetbrains), 'JetBrains Mono', monospace",
            }}
          >
            <i className={`${IC.GRID} mr-1 text-[10px]`} aria-hidden="true" />
            Toate ({projects.length})
          </button>
          {activeCategories.map((cat) => {
            const count = categoryCounts[cat] ?? 0;
            const colorCls =
              CATEGORY_COLORS[cat] ?? CATEGORY_COLORS["Web Development"];
            const isActive = categoryFilter === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() =>
                  setCategoryFilter((prev) =>
                    prev === cat ? "all" : cat
                  )
                }
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 border ${
                  isActive
                    ? colorCls
                    : "text-foreground-dim border-white/5 hover:border-white/10 hover:text-white"
                }`}
                style={{
                  fontFamily:
                    "var(--font-jetbrains), 'JetBrains Mono', monospace",
                }}
              >
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
      {filteredProjects.length === 0 ? (
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
              {projects.length === 0
                ? "Niciun proiect adăugat"
                : "Niciun rezultat găsit"}
            </p>
            <p
              className="text-xs text-foreground-dim max-w-xs"
              style={{
                fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
              }}
            >
              {projects.length === 0
                ? "Adaugă primul proiect pentru a începe să construiești portofoliul."
                : "Încearcă să modifici filtrele sau termenii de căutare."}
            </p>
          </div>
          {projects.length === 0 && (
            <button
              type="button"
              onClick={handleNew}
              className="mt-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-purple-700 to-purple-500 hover:from-purple-600 hover:to-purple-400 shadow-[0_4px_16px_rgba(126,34,206,0.3)] transition-all duration-200 flex items-center gap-2"
              style={{
                fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
              }}
            >
              <i className={IC.PLUS} aria-hidden="true" /> Adaugă primul proiect
            </button>
          )}
          {projects.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setCategoryFilter("all");
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
              {filteredProjects.length} proiect
              {filteredProjects.length !== 1 ? "e" : ""}
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

          {/* List */}
          <AnimatePresence mode="wait">
            <div className="flex flex-col gap-2">
              {filteredProjects.map((project, idx) => (
                <PortfolioCard
                  key={project.id}
                  project={project}
                  index={idx}
                  onEdit={() => handleEdit(project)}
                  onDelete={() => setConfirmDelete(project.id)}
                />
              ))}
            </div>
          </AnimatePresence>
        </motion.div>
      )}

      {/* ── CONFIRM MODAL ───────────────────────────────────── */}
      <ConfirmModal
        open={!!confirmDelete}
        title="Șterge proiectul"
        message="Ești sigur că vrei să ștergi acest proiect? Această acțiune este ireversibilă."
        onConfirm={() => confirmDelete && handleDelete(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}