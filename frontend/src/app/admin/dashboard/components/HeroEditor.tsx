"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { SiteSettings } from "@/lib/api";
import InputField from "./InputField";

// ═══════════════════════════════════════════════════════════════
// CONSTANTE
// ═══════════════════════════════════════════════════════════════

const ICONS = {
  SPINNER: "fa-solid fa-spinner",
  SAVE: "fa-solid fa-floppy-disk",
  HOME: "fa-solid fa-house",
  USER: "fa-solid fa-user",
  PLUS: "fa-solid fa-plus",
  XMARK: "fa-solid fa-xmark",
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTA HERO EDITOR
// ═══════════════════════════════════════════════════════════════

interface HeroEditorProps {
  settings: SiteSettings;
  setSettings: React.Dispatch<React.SetStateAction<SiteSettings>>;
  saving: boolean;
  onSave: () => void;
}

export default function HeroEditor({
  settings,
  setSettings,
  saving,
  onSave,
}: HeroEditorProps) {
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
      {/* ═════════════════════════════════════════════════════════
          SECȚIUNEA HERO
          ═════════════════════════════════════════════════════════ */}
      <div className="glass p-6 flex flex-col gap-5">
        <h3
          className="text-lg font-bold text-white/90 flex items-center gap-2"
          style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif" }}
        >
          <i className={`${ICONS.HOME} text-purple-400`} aria-hidden="true" />
          Secțiunea Hero
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Titlu Hero"
            value={settings.heroTitle}
            onChange={(v) => setSettings((p) => ({ ...p, heroTitle: v }))}
            placeholder="Nexus Dev Studio"
          />
          <InputField
            label="Subtitlu"
            value={settings.heroSubtitle}
            onChange={(v) => setSettings((p) => ({ ...p, heroSubtitle: v }))}
            placeholder="Transformăm idei în realitate digitală"
          />
          <InputField
            label="Badge ofertă"
            value={settings.heroBadge}
            onChange={(v) => setSettings((p) => ({ ...p, heroBadge: v }))}
            placeholder="🔥 Ofertă limitată -20%"
          />
          <InputField
            label="URL Video fundal"
            value={settings.heroVideoUrl}
            onChange={(v) => setSettings((p) => ({ ...p, heroVideoUrl: v }))}
            placeholder="https://... .mp4"
          />
        </div>

        {/* ── Mesaje Morphing ──────────────────────────────── */}
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
              onKeyDown={(e) => {
                if (e.key === "Enter") addMorphMessage();
              }}
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

        {/* ── Toggle Portofoliu ────────────────────────────── */}
        <label className="flex items-center gap-3 cursor-pointer">
          <button
            type="button"
            role="switch"
            aria-checked={settings.heroShowPortfolioButton}
            onClick={() =>
              setSettings((p) => ({
                ...p,
                heroShowPortfolioButton: !p.heroShowPortfolioButton,
              }))
            }
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
          <span
            className="text-sm text-foreground-muted"
            style={{ fontFamily: "var(--font-poppins), 'Poppins', sans-serif" }}
          >
            Afișează butonul Portofoliu în Hero
          </span>
        </label>
      </div>

      {/* ═════════════════════════════════════════════════════════
          SECȚIUNEA DESPRE
          ═════════════════════════════════════════════════════════ */}
      <div className="glass p-6 flex flex-col gap-5">
        <h3
          className="text-lg font-bold text-white/90 flex items-center gap-2"
          style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif" }}
        >
          <i className={`${ICONS.USER} text-purple-400`} aria-hidden="true" />
          Secțiunea Despre
        </h3>

        <InputField
          label="Titlu Despre"
          value={settings.aboutTitle}
          onChange={(v) => setSettings((p) => ({ ...p, aboutTitle: v }))}
          placeholder="Despre Nexus Dev Studio"
        />
        <InputField
          label="Descriere Despre"
          value={settings.aboutDescription}
          onChange={(v) => setSettings((p) => ({ ...p, aboutDescription: v }))}
          placeholder="Suntem o echipă pasionată..."
          rows={4}
        />
        <InputField
          label="Identitate"
          value={settings.aboutIdentity}
          onChange={(v) => setSettings((p) => ({ ...p, aboutIdentity: v }))}
          placeholder="Nexus Dev Studio — agenție de dezvoltare digitală"
        />
      </div>

      {/* ═════════════════════════════════════════════════════════
          BUTON SALVARE
          ═════════════════════════════════════════════════════════ */}
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
              <i className={`${ICONS.SPINNER} animate-spin`} aria-hidden="true" /> Se
              salvează...
            </>
          ) : (
            <>
              <i className={ICONS.SAVE} aria-hidden="true" /> Salvează Hero &amp; Despre
            </>
          )}
        </button>
      </div>
    </div>
  );
}