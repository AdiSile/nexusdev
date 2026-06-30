"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchMessages, markMessageRead, deleteMessage } from "@/lib/api";
import type { ContactMessage } from "@/lib/api";

// ═══════════════════════════════════════════════════════════════
// CONSTANTE
// ═══════════════════════════════════════════════════════════════

const ICONS = {
  SPINNER: "fa-solid fa-spinner",
  CHECK: "fa-solid fa-circle-check",
  TRIANGLE: "fa-solid fa-triangle-exclamation",
  XMARK: "fa-solid fa-xmark",
  TRASH: "fa-solid fa-trash-can",
  EYE: "fa-solid fa-eye",
  EYE_SLASH: "fa-solid fa-eye-slash",
  ENVELOPE: "fa-solid fa-envelope",
  ENVELOPE_OPEN: "fa-solid fa-envelope-open",
  USER: "fa-solid fa-user",
  PHONE: "fa-solid fa-phone",
  MESSAGE: "fa-solid fa-message",
  COMMENTS: "fa-solid fa-comments",
  BELL: "fa-solid fa-bell",
  SEARCH: "fa-solid fa-magnifying-glass",
  FILTER: "fa-solid fa-filter",
  CHEVRON_DOWN: "fa-solid fa-chevron-down",
  CHEVRON_UP: "fa-solid fa-chevron-up",
  INBOX: "fa-solid fa-inbox",
  ARROW_LEFT: "fa-solid fa-arrow-left",
  CLOCK: "fa-solid fa-clock",
  CALENDAR: "fa-solid fa-calendar-days",
  REPLY: "fa-solid fa-reply",
  COPY: "fa-solid fa-copy",
  CHECK_DOUBLE: "fa-solid fa-check-double",
  CIRCLE: "fa-solid fa-circle",
  EXCLAMATION: "fa-solid fa-circle-exclamation",
  CHART: "fa-solid fa-chart-pie",
};

// ═══════════════════════════════════════════════════════════════
// TIPURI
// ═══════════════════════════════════════════════════════════════

interface MessagesViewerProps {
  /** Callback pentru toast notifications */
  addToast: (msg: string, type: "success" | "error") => void;
}

type FilterMode = "all" | "unread" | "read";

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
          className="relative z-10 glass-lg p-6 sm:p-8 mx-4 max-w-md w-full flex flex-col gap-5"
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
              Șterge
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENTĂ: MESAJ LIST ITEM
// ═══════════════════════════════════════════════════════════════

function MessageListItem({
  msg,
  isSelected,
  onClick,
}: {
  msg: ContactMessage;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left px-4 py-3.5 rounded-xl transition-all duration-200 border group ${
        isSelected
          ? "bg-purple-500/8 border-purple-500/25 shadow-[0_0_20px_rgba(126,34,206,0.08)]"
          : msg.read
          ? "bg-white/[0.01] border-white/5 hover:border-white/12 hover:bg-white/[0.03]"
          : "bg-white/[0.03] border-emerald-500/10 hover:border-emerald-500/25 hover:bg-emerald-500/[0.04]"
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-sm transition-colors duration-200 ${
            isSelected
              ? "bg-purple-500/15 text-purple-400"
              : msg.read
              ? "bg-white/5 text-foreground-dim"
              : "bg-emerald-500/10 text-emerald-400"
          }`}
        >
          <i
            className={msg.read ? ICONS.ENVELOPE_OPEN : ICONS.ENVELOPE}
            aria-hidden="true"
          />
        </div>

        <div className="flex-1 min-w-0">
          {/* Nume + dată */}
          <div className="flex items-center gap-2">
            {!msg.read && (
              <span
                className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0 shadow-[0_0_6px_rgba(52,211,153,0.4)]"
                aria-label="Necitit"
              />
            )}
            <span
              className="text-sm font-semibold text-white/90 truncate"
              style={{
                fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
              }}
            >
              {msg.name || "Anonim"}
            </span>
            <span
              className="text-[10px] text-foreground-dim ml-auto flex-shrink-0"
              style={{
                fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace",
              }}
            >
              {formatMessageDate(msg.createdAt)}
            </span>
          </div>

          {/* Email */}
          <p className="text-xs text-foreground-dim mt-0.5 truncate">
            {msg.email}
          </p>

          {/* Preview mesaj */}
          <p
            className={`text-xs mt-1 line-clamp-2 leading-relaxed ${
              msg.read ? "text-foreground-dim/60" : "text-foreground-muted"
            }`}
            style={{
              fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
            }}
          >
            {msg.message}
          </p>

          {/* Telefon (dacă există) */}
          {msg.phone && (
            <div className="flex items-center gap-1 mt-1.5">
              <i
                className={`${ICONS.PHONE} text-[9px] text-foreground-dim/40`}
                aria-hidden="true"
              />
              <span
                className="text-[10px] text-foreground-dim/50"
                style={{
                  fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace",
                }}
              >
                {msg.phone}
              </span>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENTĂ: DETALIU MESAJ
// ═══════════════════════════════════════════════════════════════

function MessageDetail({
  msg,
  onMarkRead,
  onDelete,
  onCopyEmail,
  copied,
}: {
  msg: ContactMessage;
  onMarkRead: () => void;
  onDelete: () => void;
  onCopyEmail: () => void;
  copied: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25, ease: [0.33, 1, 0.68, 1] }}
      className="flex flex-col gap-5"
    >
      {/* Header cu acțiuni */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3
          className="text-lg font-bold text-white/90 flex items-center gap-2"
          style={{
            fontFamily: "var(--font-playfair), 'Playfair Display', serif",
          }}
        >
          <i className={`${ICONS.ENVELOPE} text-purple-400`} aria-hidden="true" />
          Detaliu mesaj
        </h3>

        <div className="flex gap-1.5">
          {!msg.read && (
            <button
              type="button"
              onClick={onMarkRead}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/20 transition-all duration-200 flex items-center gap-1.5"
              style={{
                fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
              }}
            >
              <i className={ICONS.EYE} aria-hidden="true" />
              Marchează citit
            </button>
          )}
          <button
            type="button"
            onClick={onDelete}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/15 border border-red-500/20 transition-all duration-200 flex items-center gap-1.5"
            style={{
              fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
            }}
          >
            <i className={ICONS.TRASH} aria-hidden="true" />
            Șterge
          </button>
        </div>
      </div>

      {/* Card expeditor */}
      <div className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5">
        <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 flex-shrink-0">
          <i className={`${ICONS.USER} text-lg`} aria-hidden="true" />
        </div>

        <div className="flex-1 min-w-0">
          <p
            className="text-base font-bold text-white/90"
            style={{
              fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
            }}
          >
            {msg.name || "Anonim"}
          </p>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
            {/* Email cu copy */}
            <button
              type="button"
              onClick={onCopyEmail}
              className="flex items-center gap-1.5 text-sm text-foreground-muted hover:text-purple-400 transition-colors group/email"
              style={{
                fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace",
              }}
              aria-label={`Copiază email: ${msg.email}`}
            >
              <i
                className={`${ICONS.ENVELOPE} text-xs text-foreground-dim group-hover/email:text-purple-400 transition-colors`}
                aria-hidden="true"
              />
              {msg.email}
              <i
                className={`${
                  copied ? ICONS.CHECK_DOUBLE : ICONS.COPY
                } text-[10px] ml-1 opacity-0 group-hover/email:opacity-100 transition-all ${
                  copied ? "text-emerald-400 opacity-100" : "text-foreground-dim"
                }`}
                aria-hidden="true"
              />
            </button>

            {msg.phone && (
              <span
                className="flex items-center gap-1.5 text-sm text-foreground-muted"
                style={{
                  fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace",
                }}
              >
                <i
                  className={`${ICONS.PHONE} text-xs text-foreground-dim`}
                  aria-hidden="true"
                />
                {msg.phone}
              </span>
            )}
          </div>

          {/* Status badge */}
          <div className="flex items-center gap-2 mt-2">
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                msg.read
                  ? "bg-white/5 text-foreground-dim border-white/5"
                  : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              }`}
              style={{
                fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace",
              }}
            >
              {msg.read ? (
                <span className="flex items-center gap-1">
                  <i className={ICONS.CHECK_DOUBLE} aria-hidden="true" /> Citit
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <i className={ICONS.CIRCLE} aria-hidden="true" /> Necitit
                </span>
              )}
            </span>
            <span
              className="flex items-center gap-1 text-[10px] text-foreground-dim"
              style={{
                fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace",
              }}
            >
              <i className={ICONS.CALENDAR} aria-hidden="true" />
              {formatMessageFullDate(msg.createdAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Corp mesaj */}
      <div className="p-5 rounded-xl bg-white/[0.02] border border-white/5">
        <div className="flex items-center gap-2 mb-3">
          <i
            className={`${ICONS.MESSAGE} text-xs text-purple-400`}
            aria-hidden="true"
          />
          <span
            className="text-[10px] uppercase tracking-wider text-foreground-dim font-medium"
            style={{
              fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace",
            }}
          >
            Mesaj
          </span>
        </div>
        <p
          className="text-sm text-foreground-muted leading-relaxed whitespace-pre-wrap"
          style={{
            fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
          }}
        >
          {msg.message}
        </p>
      </div>

      {/* Info suplimentar */}
      <div className="flex items-center gap-4 text-[10px] text-foreground-dim/50">
        <span className="flex items-center gap-1">
          <i className={ICONS.CLOCK} aria-hidden="true" />
          ID: {msg.id.slice(0, 8)}...
        </span>
        {msg.updatedAt && msg.updatedAt !== msg.createdAt && (
          <span className="flex items-center gap-1">
            <i className={ICONS.REPLY} aria-hidden="true" />
            Actualizat: {formatMessageFullDate(msg.updatedAt)}
          </span>
        )}
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENTĂ: STARE GOALĂ (EMPTY STATE)
// ═══════════════════════════════════════════════════════════════

function EmptyState({
  filter,
  hasMessages,
}: {
  filter: FilterMode;
  hasMessages: boolean;
}) {
  if (hasMessages && filter === "unread") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-16 gap-4 text-center"
      >
        <div className="w-16 h-16 rounded-full bg-emerald-500/[0.06] border border-emerald-500/10 flex items-center justify-center">
          <i
            className={`${ICONS.CHECK_DOUBLE} text-2xl text-emerald-400/40`}
            aria-hidden="true"
          />
        </div>
        <div>
          <p
            className="text-sm font-medium text-white/60"
            style={{
              fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
            }}
          >
            Toate mesajele sunt citite
          </p>
          <p
            className="text-xs text-foreground-dim mt-1"
            style={{
              fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
            }}
          >
            Nu există mesaje necitite în acest moment.
          </p>
        </div>
      </motion.div>
    );
  }

  if (hasMessages && filter === "read") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-16 gap-4 text-center"
      >
        <div className="w-16 h-16 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center">
          <i
            className={`${ICONS.EYE_SLASH} text-2xl text-foreground-dim/30`}
            aria-hidden="true"
          />
        </div>
        <div>
          <p
            className="text-sm font-medium text-white/60"
            style={{
              fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
            }}
          >
            Niciun mesaj citit
          </p>
          <p
            className="text-xs text-foreground-dim mt-1"
            style={{
              fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
            }}
          >
            Mesajele marcate ca citite vor apărea aici.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 gap-4 text-center"
    >
      <div className="w-16 h-16 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center">
        <i
          className={`${ICONS.INBOX} text-2xl text-foreground-dim/30`}
          aria-hidden="true"
        />
      </div>
      <div>
        <p
          className="text-sm font-medium text-white/60"
          style={{
            fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
          }}
        >
          Niciun mesaj primit
        </p>
        <p
          className="text-xs text-foreground-dim mt-1"
          style={{
            fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
          }}
        >
          Mesajele trimise din formularul de contact vor apărea aici.
        </p>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENTĂ: BADGE NECITITE
// ═══════════════════════════════════════════════════════════════

function UnreadBadge({ count }: { count: number }) {
  if (count === 0) return null;

  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
      style={{
        fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace",
      }}
    >
      <i className={`${ICONS.BELL} text-[10px]`} aria-hidden="true" />
      {count} {count === 1 ? "necitit" : "necitite"}
    </motion.span>
  );
}

// ═══════════════════════════════════════════════════════════════
// UTILITARE
// ═══════════════════════════════════════════════════════════════

function formatMessageDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return "Acum";
    if (diffMin < 60) return `${diffMin}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}z`;
    return date.toLocaleDateString("ro-RO", {
      day: "2-digit",
      month: "short",
    });
  } catch {
    return dateStr;
  }
}

function formatMessageFullDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleString("ro-RO", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTA PRINCIPALĂ: MESSAGES VIEWER
// ═══════════════════════════════════════════════════════════════

export default function MessagesViewer({ addToast }: MessagesViewerProps) {
  // ── State ───────────────────────────────────────────────
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterMode>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [showMobileList, setShowMobileList] = useState(true);

  // ── Mesaje filtrate ────────────────────────────────────
  const filteredMessages = messages.filter((m) => {
    // Filtru read/unread
    if (filter === "unread" && m.read) return false;
    if (filter === "read" && !m.read) return false;

    // Căutare
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const haystack = [m.name, m.email, m.message, m.phone]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(term)) return false;
    }

    return true;
  });

  // ── Contoare ───────────────────────────────────────────
  const unreadCount = messages.filter((m) => !m.read).length;
  const readCount = messages.filter((m) => m.read).length;

  // ── Încărcare mesaje ───────────────────────────────────
  const loadMessages = useCallback(async () => {
    setLoading(true);
    const res = await fetchMessages();
    if (res.data) {
      setMessages(res.data);
    } else {
      addToast(res.error || "Eroare la încărcarea mesajelor", "error");
    }
    setLoading(false);
  }, [addToast]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // ── Handlers ───────────────────────────────────────────
  const handleSelect = (msg: ContactMessage) => {
    setSelected(msg);
    setShowMobileList(false);
  };

  const handleBackToList = () => {
    setShowMobileList(true);
  };

  const handleMarkRead = async (id: string) => {
    const res = await markMessageRead(id);
    if (res.ok) {
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, read: true } : m))
      );
      if (selected?.id === id) {
        setSelected((prev) => (prev ? { ...prev, read: true } : null));
      }
      addToast("Mesaj marcat ca citit", "success");
    } else {
      addToast(res.error || "Eroare la marcarea mesajului", "error");
    }
  };

  const handleDelete = async (id: string) => {
    const res = await deleteMessage(id);
    if (res.ok) {
      setMessages((prev) => prev.filter((m) => m.id !== id));
      if (selected?.id === id) {
        setSelected(null);
        setShowMobileList(true);
      }
      addToast("Mesaj șters cu succes", "success");
    } else {
      addToast(res.error || "Eroare la ștergerea mesajului", "error");
    }
    setConfirmDelete(null);
  };

  const handleCopyEmail = async (email: string) => {
    try {
      await navigator.clipboard.writeText(email);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } catch {
      addToast("Nu s-a putut copia email-ul", "error");
    }
  };

  const handleMarkAllRead = async () => {
    const unread = messages.filter((m) => !m.read);
    if (unread.length === 0) return;

    let successCount = 0;
    for (const m of unread) {
      const res = await markMessageRead(m.id);
      if (res.ok) successCount++;
    }

    if (successCount > 0) {
      setMessages((prev) => prev.map((m) => ({ ...m, read: true })));
      if (selected && !selected.read) {
        setSelected((prev) => (prev ? { ...prev, read: true } : null));
      }
      addToast(
        `${successCount} mesaj${successCount > 1 ? "e" : ""} marcat${
          successCount > 1 ? "e" : ""
        } ca citit${successCount > 1 ? "e" : ""}`,
        "success"
      );
    }
  };

  // ── Loading state ──────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-5"
        >
          <div className="w-12 h-12 rounded-full border-2 border-purple-500/20 flex items-center justify-center">
            <i
              className={`${ICONS.SPINNER} text-purple-400 animate-spin text-xl`}
              aria-hidden="true"
            />
          </div>
          <p
            className="text-sm text-foreground-dim tracking-wider"
            style={{
              fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace",
            }}
          >
            Se încarcă mesajele...
          </p>
        </motion.div>
      </div>
    );
  }

  // ── Main ───────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6">
      {/* ── HEADER + STATS ──────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <h2
            className="text-2xl sm:text-3xl font-bold text-white/90 flex items-center gap-2"
            style={{
              fontFamily: "var(--font-playfair), 'Playfair Display', serif",
            }}
          >
            <i className={`${ICONS.COMMENTS} text-purple-400`} aria-hidden="true" />
            Mesaje
          </h2>
          <UnreadBadge count={unreadCount} />
        </div>

        {unreadCount > 0 && (
          <motion.button
            type="button"
            onClick={handleMarkAllRead}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/20 transition-all duration-200 flex items-center gap-1.5 self-start sm:self-auto"
            style={{
              fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
            }}
          >
            <i className={ICONS.CHECK_DOUBLE} aria-hidden="true" />
            Marchează totul citit
          </motion.button>
        )}
      </motion.div>

      {/* ── STATS CARDS ─────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-3"
      >
        {/* Total */}
        <div className="glass p-4 flex items-center gap-3 rounded-xl">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <i
              className={`${ICONS.COMMENTS} text-purple-400`}
              aria-hidden="true"
            />
          </div>
          <div>
            <p
              className="text-lg font-bold text-white/90"
              style={{
                fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
              }}
            >
              {messages.length}
            </p>
            <p
              className="text-[10px] uppercase tracking-wider text-foreground-dim"
              style={{
                fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace",
              }}
            >
              Total mesaje
            </p>
          </div>
        </div>

        {/* Necitite */}
        <div className="glass p-4 flex items-center gap-3 rounded-xl">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <i
              className={`${ICONS.CIRCLE} text-emerald-400 text-xs`}
              aria-hidden="true"
            />
          </div>
          <div>
            <p
              className="text-lg font-bold text-emerald-400"
              style={{
                fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
              }}
            >
              {unreadCount}
            </p>
            <p
              className="text-[10px] uppercase tracking-wider text-foreground-dim"
              style={{
                fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace",
              }}
            >
              Necitite
            </p>
          </div>
        </div>

        {/* Citite */}
        <div className="glass p-4 flex items-center gap-3 rounded-xl">
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
            <i
              className={`${ICONS.CHECK_DOUBLE} text-foreground-dim`}
              aria-hidden="true"
            />
          </div>
          <div>
            <p
              className="text-lg font-bold text-white/70"
              style={{
                fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
              }}
            >
              {readCount}
            </p>
            <p
              className="text-[10px] uppercase tracking-wider text-foreground-dim"
              style={{
                fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace",
              }}
            >
              Citite
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── FILTRE + CĂUTARE ─────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        {/* Filter pills */}
        <div className="flex gap-1.5 p-1 rounded-lg bg-white/[0.02] border border-white/5">
          {(
            [
              { id: "all" as FilterMode, label: "Toate", count: messages.length },
              { id: "unread" as FilterMode, label: "Necitite", count: unreadCount },
              { id: "read" as FilterMode, label: "Citite", count: readCount },
            ] as const
          ).map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`relative px-3.5 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                filter === f.id
                  ? "text-white"
                  : "text-foreground-dim hover:text-white hover:bg-white/5"
              }`}
              style={{
                fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
              }}
            >
              {filter === f.id && (
                <motion.div
                  layoutId="filter-pill"
                  className="absolute inset-0 rounded-md bg-purple-600/20 border border-purple-500/25"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative z-10">
                {f.label}
                <span className="ml-1.5 opacity-50">{f.count}</span>
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 min-w-0">
          <i
            className={`${ICONS.SEARCH} absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-foreground-dim/50 pointer-events-none`}
            aria-hidden="true"
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Caută după nume, email sau conținut..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm text-white placeholder:text-foreground-dim/30 bg-white/5 border border-white/10 hover:border-white/20 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 outline-none transition-all duration-200"
            style={{
              fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
            }}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded flex items-center justify-center text-foreground-dim hover:text-white transition-colors"
              aria-label="Șterge căutarea"
            >
              <i className={`${ICONS.XMARK} text-xs`} aria-hidden="true" />
            </button>
          )}
        </div>
      </motion.div>

      {/* ── CONȚINUT PRINCIPAL ───────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Listă mesaje */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className={`flex-1 glass p-5 flex flex-col gap-4 min-w-0 ${
            showMobileList ? "block" : "hidden lg:block"
          }`}
        >
          <div className="flex items-center justify-between">
            <h3
              className="text-base font-bold text-white/80 flex items-center gap-2"
              style={{
                fontFamily: "var(--font-playfair), 'Playfair Display', serif",
              }}
            >
              <i className={`${ICONS.INBOX} text-purple-400`} aria-hidden="true" />
              Inbox
              {filteredMessages.length > 0 && (
                <span
                  className="text-xs font-normal text-foreground-dim"
                  style={{
                    fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace",
                  }}
                >
                  ({filteredMessages.length})
                </span>
              )}
            </h3>

            {/* Rezultate căutare */}
            {searchTerm && (
              <span
                className="text-[10px] text-foreground-dim"
                style={{
                  fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace",
                }}
              >
                Căutare: &quot;{searchTerm}&quot;
              </span>
            )}
          </div>

          {filteredMessages.length === 0 ? (
            <EmptyState filter={filter} hasMessages={messages.length > 0} />
          ) : (
            <div className="flex flex-col gap-2 max-h-[55vh] overflow-y-auto pr-1 custom-scrollbar">
              <AnimatePresence mode="popLayout">
                {filteredMessages.map((m, idx) => (
                  <motion.div
                    key={m.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -16, scale: 0.96 }}
                    transition={{
                      duration: 0.2,
                      delay: idx * 0.015,
                      ease: [0.33, 1, 0.68, 1],
                    }}
                  >
                    <MessageListItem
                      msg={m}
                      isSelected={selected?.id === m.id}
                      onClick={() => handleSelect(m)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>

        {/* Detaliu mesaj */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={`flex-1 glass p-6 flex flex-col min-w-0 ${
            !showMobileList ? "block" : "hidden lg:block"
          }`}
        >
          {selected ? (
            <>
              {/* Back button (mobil) */}
              <button
                type="button"
                onClick={handleBackToList}
                className="lg:hidden flex items-center gap-2 text-sm text-foreground-dim hover:text-white mb-4 transition-colors"
                style={{
                  fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
                }}
              >
                <i className={ICONS.ARROW_LEFT} aria-hidden="true" />
                Înapoi la listă
              </button>

              <MessageDetail
                msg={selected}
                onMarkRead={() => handleMarkRead(selected.id)}
                onDelete={() => setConfirmDelete(selected.id)}
                onCopyEmail={() => handleCopyEmail(selected.email)}
                copied={copiedEmail}
              />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
              <div className="w-20 h-20 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center">
                <i
                  className={`${ICONS.ENVELOPE} text-3xl text-foreground-dim/20`}
                  aria-hidden="true"
                />
              </div>
              <div>
                <p
                  className="text-sm font-medium text-white/50"
                  style={{
                    fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
                  }}
                >
                  Selectează un mesaj
                </p>
                <p
                  className="text-xs text-foreground-dim mt-1"
                  style={{
                    fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
                  }}
                >
                  Click pe un mesaj din listă pentru a vedea detaliile.
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* ── STATISTICI RAPIDE ────────────────────────────── */}
      {messages.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass p-5 flex flex-col gap-3"
        >
          <h4
            className="text-sm font-bold text-white/70 flex items-center gap-2"
            style={{
              fontFamily: "var(--font-playfair), 'Playfair Display', serif",
            }}
          >
            <i className={`${ICONS.CHART} text-purple-400`} aria-hidden="true" />
            Statistici mesaje
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                label: "Rata citire",
                value: `${messages.length > 0 ? Math.round((readCount / messages.length) * 100) : 0}%`,
                icon: ICONS.CHECK_DOUBLE,
                color: "text-emerald-400",
                bg: "bg-emerald-500/10",
              },
              {
                label: "Cel mai recent",
                value: (() => {
                  if (messages.length === 0) return "—";
                  const sorted = [...messages].sort(
                    (a, b) =>
                      new Date(b.createdAt).getTime() -
                      new Date(a.createdAt).getTime()
                  );
                  return formatMessageDate(sorted[0].createdAt);
                })(),
                icon: ICONS.CLOCK,
                color: "text-amber-400",
                bg: "bg-amber-500/10",
              },
              {
                label: "Cu telefon",
                value: `${
                  messages.filter((m) => m.phone).length
                }`,
                icon: ICONS.PHONE,
                color: "text-blue-400",
                bg: "bg-blue-500/10",
              },
              {
                label: "Astăzi",
                value: `${
                  messages.filter((m) => {
                    const msgDate = new Date(m.createdAt).toDateString();
                    const today = new Date().toDateString();
                    return msgDate === today;
                  }).length
                }`,
                icon: ICONS.CALENDAR,
                color: "text-purple-400",
                bg: "bg-purple-500/10",
              },
            ].map((stat, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5"
              >
                <div
                  className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center flex-shrink-0`}
                >
                  <i
                    className={`${stat.icon} ${stat.color} text-sm`}
                    aria-hidden="true"
                  />
                </div>
                <div className="min-w-0">
                  <p
                    className="text-sm font-bold text-white/80"
                    style={{
                      fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
                    }}
                  >
                    {stat.value}
                  </p>
                  <p
                    className="text-[10px] text-foreground-dim"
                    style={{
                      fontFamily:
                        "var(--font-jetbrains), 'JetBrains Mono', monospace",
                    }}
                  >
                    {stat.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── MODAL CONFIRMARE ȘTERGERE ────────────────────── */}
      <ConfirmModal
        open={!!confirmDelete}
        title="Șterge mesajul"
        message="Ești sigur că vrei să ștergi acest mesaj? Acțiunea este ireversibilă."
        onConfirm={() => confirmDelete && handleDelete(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />

      {/* ── STIL PENTRU SCROLLBAR CUSTOM ─────────────────── */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .custom-scrollbar::-webkit-scrollbar { width: 4px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.14); }
          `,
        }}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// EXPORT SUB-COMPONENTE PENTRU REUTILIZARE
// ═══════════════════════════════════════════════════════════════

export { UnreadBadge };
export type { MessagesViewerProps };