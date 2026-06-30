"use client";

import { motion } from "framer-motion";
import type { SiteSettings } from "@/lib/api";

// ═══════════════════════════════════════════════════════════════
// CONSTANTE
// ═══════════════════════════════════════════════════════════════

const ICONS = {
  SPINNER: "fa-solid fa-spinner",
  SAVE: "fa-solid fa-floppy-disk",
  ENVELOPE: "fa-solid fa-envelope",
  PHONE: "fa-solid fa-phone",
  LOCATION: "fa-solid fa-location-dot",
  CLOCK: "fa-solid fa-clock",
  EYE: "fa-solid fa-eye",
  PALETTE: "fa-solid fa-palette",
  CHECK: "fa-solid fa-circle-check",
  GLOBE: "fa-solid fa-globe",
  PAPER_PLANE: "fa-solid fa-paper-plane",
  MAP_PIN: "fa-solid fa-map-pin",
  CALENDAR: "fa-solid fa-calendar-check",
  AT: "fa-solid fa-at",
  MOBILE: "fa-solid fa-mobile-screen",
  BUILDING: "fa-solid fa-building",
  HOURGLASS: "fa-solid fa-hourglass-half",
};

const CONTACT_CARD_GRADIENTS = [
  "linear-gradient(135deg, #7e22ce, #a855f7)",
  "linear-gradient(135deg, #0ea5e9, #6366f1)",
  "linear-gradient(135deg, #10b981, #14b8a6)",
  "linear-gradient(135deg, #f59e0b, #ef4444)",
  "linear-gradient(135deg, #ec4899, #8b5cf6)",
];

// ═══════════════════════════════════════════════════════════════
// TIPURI
// ═══════════════════════════════════════════════════════════════

interface ContactEditorProps {
  settings: SiteSettings;
  setSettings: React.Dispatch<React.SetStateAction<SiteSettings>>;
  saving: boolean;
  onSave: () => void;
}

// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENTĂ: CONTACT FIELD (cu iconiță dedicată)
// ═══════════════════════════════════════════════════════════════

function ContactField({
  icon,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  rows,
}: {
  icon: string;
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  type?: string;
  rows?: number;
}) {
  const inputClasses =
    "w-full pl-10 pr-4 py-2.5 rounded-lg text-sm text-white placeholder:text-foreground-dim/30 bg-white/5 border border-white/10 hover:border-white/20 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 outline-none transition-all duration-200";

  return (
    <label className="flex flex-col gap-1.5">
      <span
        className="text-xs uppercase tracking-wider text-foreground-dim font-medium"
        style={{
          fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace",
        }}
      >
        {label}
      </span>
      <div className="relative">
        <i
          className={`${icon} absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-foreground-dim/60 pointer-events-none transition-colors duration-200`}
          aria-hidden="true"
        />
        {rows ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            className={inputClasses}
            style={{
              fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
              resize: "vertical",
            }}
          />
        ) : (
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={inputClasses}
            style={{
              fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
            }}
          />
        )}
      </div>
    </label>
  );
}

// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENTĂ: LIVE PREVIEW CARD
// ═══════════════════════════════════════════════════════════════

function ContactPreviewCard({
  email,
  phone,
  address,
  workingHours,
}: {
  email: string;
  phone: string;
  address: string;
  workingHours: string;
}) {
  const gradient =
    CONTACT_CARD_GRADIENTS[
      (email.length + phone.length + address.length + workingHours.length) %
        CONTACT_CARD_GRADIENTS.length
    ];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm">
      {/* Gradient accent bar */}
      <div
        className="h-1.5 w-full"
        style={{ background: gradient }}
        aria-hidden="true"
      />

      <div className="p-6 flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center gap-2.5">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm"
            style={{ background: gradient }}
            aria-hidden="true"
          >
            <i className={ICONS.PAPER_PLANE} />
          </div>
          <div>
            <h4
              className="text-base font-bold text-white/90"
              style={{
                fontFamily: "var(--font-playfair), 'Playfair Display', serif",
              }}
            >
              Contact
            </h4>
            <p
              className="text-xs text-foreground-dim"
              style={{
                fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
              }}
            >
              Previzualizare secțiune contact
            </p>
          </div>
        </div>

        {/* Contact items */}
        <div className="flex flex-col gap-3">
          {/* Email */}
          <motion.div
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors duration-200"
            animate={{ opacity: email ? 1 : 0.4 }}
            transition={{ duration: 0.3 }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: `${gradient}30` }}
              aria-hidden="true"
            >
              <i className={`${ICONS.ENVELOPE} text-xs`} style={{ color: "#a855f7" }} />
            </div>
            <div className="min-w-0">
              <p
                className="text-[10px] uppercase tracking-wider text-foreground-dim"
                style={{ fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace" }}
              >
                Email
              </p>
              <p
                className="text-sm text-white/90 truncate"
                style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}
              >
                {email || "—"}
              </p>
            </div>
          </motion.div>

          {/* Telefon */}
          <motion.div
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors duration-200"
            animate={{ opacity: phone ? 1 : 0.4 }}
            transition={{ duration: 0.3 }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: `${gradient}30` }}
              aria-hidden="true"
            >
              <i className={`${ICONS.PHONE} text-xs`} style={{ color: "#a855f7" }} />
            </div>
            <div className="min-w-0">
              <p
                className="text-[10px] uppercase tracking-wider text-foreground-dim"
                style={{ fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace" }}
              >
                Telefon
              </p>
              <p
                className="text-sm text-white/90 truncate"
                style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}
              >
                {phone || "—"}
              </p>
            </div>
          </motion.div>

          {/* Adresă */}
          <motion.div
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors duration-200"
            animate={{ opacity: address ? 1 : 0.4 }}
            transition={{ duration: 0.3 }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: `${gradient}30` }}
              aria-hidden="true"
            >
              <i className={`${ICONS.LOCATION} text-xs`} style={{ color: "#a855f7" }} />
            </div>
            <div className="min-w-0">
              <p
                className="text-[10px] uppercase tracking-wider text-foreground-dim"
                style={{ fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace" }}
              >
                Adresă
              </p>
              <p
                className="text-sm text-white/90 truncate"
                style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}
              >
                {address || "—"}
              </p>
            </div>
          </motion.div>

          {/* Program */}
          <motion.div
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors duration-200"
            animate={{ opacity: workingHours ? 1 : 0.4 }}
            transition={{ duration: 0.3 }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: `${gradient}30` }}
              aria-hidden="true"
            >
              <i className={`${ICONS.CLOCK} text-xs`} style={{ color: "#a855f7" }} />
            </div>
            <div className="min-w-0">
              <p
                className="text-[10px] uppercase tracking-wider text-foreground-dim"
                style={{ fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace" }}
              >
                Program
              </p>
              <p
                className="text-sm text-white/90 truncate"
                style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}
              >
                {workingHours || "—"}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Quick stats */}
        <div className="flex items-center gap-2 pt-2 border-t border-white/5">
          <i className={`${ICONS.CHECK} text-emerald-400 text-xs`} aria-hidden="true" />
          <span
            className="text-xs text-foreground-dim"
            style={{ fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace" }}
          >
            {[email, phone, address, workingHours].filter(Boolean).length}/4 câmpuri completate
          </span>
        </div>
      </div>

      {/* Subtle glow */}
      <div
        className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: gradient }}
        aria-hidden="true"
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTA PRINCIPALĂ: CONTACT EDITOR
// ═══════════════════════════════════════════════════════════════

export default function ContactEditor({
  settings,
  setSettings,
  saving,
  onSave,
}: ContactEditorProps) {
  const isComplete =
    !!settings.contactEmail &&
    !!settings.contactPhone &&
    !!settings.contactAddress &&
    !!settings.contactWorkingHours;

  return (
    <div className="flex flex-col gap-8">
      {/* Grid: Formular + Previzualizare */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Formular (3/5) */}
        <div className="lg:col-span-3 glass p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <h3
              className="text-lg font-bold text-white/90 flex items-center gap-2"
              style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif" }}
            >
              <i className={`${ICONS.AT} text-purple-400`} aria-hidden="true" />
              Editează contact
            </h3>

            {isComplete && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1"
                style={{ fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace" }}
              >
                <i className={ICONS.CHECK} aria-hidden="true" />
                COMPLET
              </motion.span>
            )}
          </div>

          <p
            className="text-sm text-foreground-muted -mt-2"
            style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}
          >
            Completează informațiile de contact care vor fi afișate pe site.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ContactField
              icon={ICONS.ENVELOPE}
              label="Email"
              value={settings.contactEmail}
              onChange={(v) => setSettings((p) => ({ ...p, contactEmail: v }))}
              placeholder="contact@nexusdevstudio.ro"
              type="email"
            />

            <ContactField
              icon={ICONS.PHONE}
              label="Telefon"
              value={settings.contactPhone}
              onChange={(v) => setSettings((p) => ({ ...p, contactPhone: v }))}
              placeholder="+40 712 345 678"
              type="tel"
            />

            <div className="md:col-span-2">
              <ContactField
                icon={ICONS.LOCATION}
                label="Adresă"
                value={settings.contactAddress}
                onChange={(v) => setSettings((p) => ({ ...p, contactAddress: v }))}
                placeholder="Strada Exemplu, București, România"
                rows={2}
              />
            </div>

            <div className="md:col-span-2">
              <ContactField
                icon={ICONS.CLOCK}
                label="Program de lucru"
                value={settings.contactWorkingHours}
                onChange={(v) => setSettings((p) => ({ ...p, contactWorkingHours: v }))}
                placeholder="Luni - Vineri: 09:00 - 18:00"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
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
                  <i className={ICONS.SAVE} aria-hidden="true" /> Salvează Contact
                </>
              )}
            </button>
          </div>
        </div>

        {/* Previzualizare live (2/5) */}
        <div className="lg:col-span-2">
          <div className="sticky top-6">
            <ContactPreviewCard
              email={settings.contactEmail}
              phone={settings.contactPhone}
              address={settings.contactAddress}
              workingHours={settings.contactWorkingHours}
            />
          </div>
        </div>
      </div>

      {/* Sfaturi */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="glass p-6 flex flex-col gap-4"
      >
        <h4
          className="text-base font-bold text-white/80 flex items-center gap-2"
          style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif" }}
        >
          <i className={`${ICONS.EYE} text-purple-400`} aria-hidden="true" />
          Sfaturi pentru secțiunea de contact
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { icon: ICONS.ENVELOPE, text: "Folosește o adresă de email profesională cu domeniul tău." },
            { icon: ICONS.PHONE, text: "Adaugă prefixul de țară (+40) pentru clienți internaționali." },
            { icon: ICONS.LOCATION, text: "Include orașul și județul — ajută și la SEO local." },
            { icon: ICONS.CLOCK, text: "Specifică zilele și intervalul orar pentru transparență." },
          ].map((tip, i) => (
            <div
              key={i}
              className="flex items-start gap-3 px-4 py-3 rounded-lg bg-white/[0.02] border border-white/5"
            >
              <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-purple-500/10 flex-shrink-0 mt-0.5">
                <i className={`${tip.icon} text-purple-400 text-xs`} aria-hidden="true" />
              </div>
              <p
                className="text-xs text-foreground-muted leading-relaxed"
                style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}
              >
                {tip.text}
              </p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Buton salvare jos */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="px-8 py-3.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-purple-700 via-purple-500 to-purple-700 bg-[length:200%_100%] shadow-[0_4px_20px_rgba(126,34,206,0.35)] hover:shadow-[0_6px_28px_rgba(126,34,206,0.5)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
          style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}
        >
          {saving ? (
            <>
              <i className={`${ICONS.SPINNER} animate-spin`} aria-hidden="true" /> Se salvează...
            </>
          ) : (
            <>
              <i className={ICONS.SAVE} aria-hidden="true" /> Salvează Contact
            </>
          )}
        </button>
      </div>
    </div>
  );
}