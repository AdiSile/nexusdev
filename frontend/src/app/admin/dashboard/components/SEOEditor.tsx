"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import type { SiteSettings, FooterLink } from "@/lib/api";
import InputField from "./InputField";

// ═══════════════════════════════════════════════════════════════
// CONSTANTE
// ═══════════════════════════════════════════════════════════════

const ICONS = {
  SPINNER: "fa-solid fa-spinner",
  SAVE: "fa-solid fa-floppy-disk",
  CHART: "fa-solid fa-chart-simple",
  GLOBE: "fa-solid fa-globe",
  LINK: "fa-solid fa-link",
  PLUS: "fa-solid fa-plus",
  XMARK: "fa-solid fa-xmark",
  FACEBOOK: "fa-brands fa-facebook",
  TIKTOK: "fa-brands fa-tiktok",
  TWITTER: "fa-brands fa-x-twitter",
  IMAGE: "fa-solid fa-image",
  KEY: "fa-solid fa-key",
  COPYRIGHT: "fa-solid fa-copyright",
  TAG: "fa-solid fa-tag",
};

const TWITTER_CARD_OPTIONS = [
  { value: "summary", label: "Summary" },
  { value: "summary_large_image", label: "Summary Large Image" },
  { value: "app", label: "App" },
  { value: "player", label: "Player" },
];

// ═══════════════════════════════════════════════════════════════
// COMPONENTA SEO EDITOR
// ═══════════════════════════════════════════════════════════════

interface SEOEditorProps {
  settings: SiteSettings;
  setSettings: React.Dispatch<React.SetStateAction<SiteSettings>>;
  saving: boolean;
  onSave: () => void;
}

export default function SEOEditor({
  settings,
  setSettings,
  saving,
  onSave,
}: SEOEditorProps) {
  // ── Stare locală pentru cuvinte cheie (input text) ───────
  const [keywordsInput, setKeywordsInput] = useState(
    settings.seoKeywords.join(", ")
  );

  // ── Stare locală pentru link-uri footer ──────────────────
  const [newFooterLink, setNewFooterLink] = useState<FooterLink>({
    label: "",
    href: "",
  });

  // ── Sincronizare keywords când se schimbă din exterior ───
  useEffect(() => {
    setKeywordsInput(settings.seoKeywords.join(", "));
  }, [settings.seoKeywords]);

  // ── Handlers ─────────────────────────────────────────────

  /** Transformă inputul text în array de cuvinte cheie */
  const syncKeywords = (input: string) => {
    setKeywordsInput(input);
    const arr = input
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);
    setSettings((prev) => ({ ...prev, seoKeywords: arr }));
  };

  /** Adaugă un link nou în footer */
  const addFooterLink = () => {
    const label = newFooterLink.label.trim();
    const href = newFooterLink.href.trim();
    if (!label || !href) return;
    setSettings((prev) => ({
      ...prev,
      footerLinks: [...prev.footerLinks, { label, href }],
    }));
    setNewFooterLink({ label: "", href: "" });
  };

  /** Elimină un link din footer */
  const removeFooterLink = (index: number) => {
    setSettings((prev) => ({
      ...prev,
      footerLinks: prev.footerLinks.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="flex flex-col gap-8">
      {/* ═══════════════════════════════════════════════════════
          SECȚIUNEA SEO
          ═══════════════════════════════════════════════════════ */}
      <div className="glass p-6 flex flex-col gap-5">
        <h3
          className="text-lg font-bold text-white/90 flex items-center gap-2"
          style={{
            fontFamily: "var(--font-playfair), 'Playfair Display', serif",
          }}
        >
          <i className={`${ICONS.CHART} text-purple-400`} aria-hidden="true" />
          Setări SEO
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Titlu SEO"
            value={settings.seoTitle}
            onChange={(v) => setSettings((p) => ({ ...p, seoTitle: v }))}
            placeholder="Nexus Dev Studio — Agenție de dezvoltare digitală"
          />
          <InputField
            label="URL Site"
            value={settings.seoUrl}
            onChange={(v) => setSettings((p) => ({ ...p, seoUrl: v }))}
            placeholder="https://nexusdevstudio.ro"
            type="url"
          />
          <div className="md:col-span-2">
            <InputField
              label="Descriere SEO (meta description)"
              value={settings.seoDescription}
              onChange={(v) =>
                setSettings((p) => ({ ...p, seoDescription: v }))
              }
              placeholder="Transformăm idei în realitate digitală. Servicii complete de web development, mobile apps și design UX/UI."
              rows={3}
            />
          </div>
          <div className="md:col-span-2 flex flex-col gap-1.5">
            <span
              className="text-xs uppercase tracking-wider text-foreground-dim font-medium"
              style={{
                fontFamily:
                  "var(--font-jetbrains), 'JetBrains Mono', monospace",
              }}
            >
              <i className={`${ICONS.KEY} mr-1.5`} aria-hidden="true" />
              Cuvinte cheie (separate prin virgulă)
            </span>
            <input
              type="text"
              value={keywordsInput}
              onChange={(e) => syncKeywords(e.target.value)}
              placeholder="web development, design, mobile apps, react, next.js"
              className="w-full px-4 py-2.5 rounded-lg text-sm text-white placeholder:text-foreground-dim/30 bg-white/5 border border-white/10 hover:border-white/20 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 outline-none transition-all duration-200"
              style={{
                fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
              }}
            />
            {settings.seoKeywords.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1">
                {settings.seoKeywords.map((kw, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-full text-[11px] text-purple-300 bg-purple-500/10 border border-purple-500/20"
                    style={{
                      fontFamily:
                        "var(--font-poppins), 'Poppins', sans-serif",
                    }}
                  >
                    <i className={`${ICONS.TAG} mr-1 text-[9px]`} aria-hidden="true" />
                    {kw}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          SECȚIUNEA OPEN GRAPH
          ═══════════════════════════════════════════════════════ */}
      <div className="glass p-6 flex flex-col gap-5">
        <h3
          className="text-lg font-bold text-white/90 flex items-center gap-2"
          style={{
            fontFamily: "var(--font-playfair), 'Playfair Display', serif",
          }}
        >
          <i className={`${ICONS.GLOBE} text-purple-400`} aria-hidden="true" />
          Open Graph
        </h3>
        <p
          className="text-xs text-foreground-dim -mt-3"
          style={{
            fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
          }}
        >
          Controlează modul în care site-ul apare când este distribuit pe
          Facebook, LinkedIn și alte platforme sociale.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="OG Title"
            value={settings.seoOgTitle}
            onChange={(v) => setSettings((p) => ({ ...p, seoOgTitle: v }))}
            placeholder="Nexus Dev Studio"
          />
          <InputField
            label="OG Image URL"
            value={settings.seoOgImage}
            onChange={(v) => setSettings((p) => ({ ...p, seoOgImage: v }))}
            placeholder="https://nexusdevstudio.ro/og-image.jpg"
            type="url"
          />
          <div className="md:col-span-2">
            <InputField
              label="OG Description"
              value={settings.seoOgDescription}
              onChange={(v) =>
                setSettings((p) => ({ ...p, seoOgDescription: v }))
              }
              placeholder="Descrierea care apare la share pe rețele sociale..."
              rows={2}
            />
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          SECȚIUNEA TWITTER CARD
          ═══════════════════════════════════════════════════════ */}
      <div className="glass p-6 flex flex-col gap-5">
        <h3
          className="text-lg font-bold text-white/90 flex items-center gap-2"
          style={{
            fontFamily: "var(--font-playfair), 'Playfair Display', serif",
          }}
        >
          <i className={`${ICONS.TWITTER} text-purple-400`} aria-hidden="true" />
          Twitter Card
        </h3>
        <p
          className="text-xs text-foreground-dim -mt-3"
          style={{
            fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
          }}
        >
          Configurează modul în care link-urile apar pe Twitter / X.
        </p>

        <div className="flex flex-col gap-1.5 max-w-xs">
          <span
            className="text-xs uppercase tracking-wider text-foreground-dim font-medium"
            style={{
              fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace",
            }}
          >
            Tip Card
          </span>
          <select
            value={settings.seoTwitterCard}
            onChange={(e) =>
              setSettings((p) => ({ ...p, seoTwitterCard: e.target.value }))
            }
            className="px-4 py-2.5 rounded-lg text-sm text-white bg-white/5 border border-white/10 hover:border-white/20 focus:border-purple-500/50 outline-none transition-all duration-200 cursor-pointer"
            style={{
              fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
            }}
          >
            {TWITTER_CARD_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-[#1a1a25]">
                {opt.label}
              </option>
            ))}
          </select>
          <span className="text-[11px] text-foreground-dim/60 mt-1">
            {settings.seoTwitterCard === "summary_large_image" &&
              "Card mare cu imagine — recomandat pentru articole și pagini de conținut."}
            {settings.seoTwitterCard === "summary" &&
              "Card simplu cu thumbnail — compact, fără imagine mare."}
            {settings.seoTwitterCard === "app" &&
              "Card pentru aplicații mobile — necesită ID-uri de app store."}
            {settings.seoTwitterCard === "player" &&
              "Card cu player video / audio încorporat."}
          </span>
        </div>

        {/* Previzualizare Twitter Card */}
        <div className="mt-3 p-4 rounded-xl bg-white/[0.02] border border-white/5 max-w-md">
          <span
            className="text-[10px] uppercase tracking-wider text-foreground-dim/50"
            style={{
              fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace",
            }}
          >
            Previzualizare
          </span>
          <div className="mt-2 rounded-lg overflow-hidden border border-white/10 bg-[#15202b]">
            {settings.seoTwitterCard === "summary_large_image" &&
              settings.seoOgImage && (
                <div className="w-full h-32 bg-white/5 flex items-center justify-center">
                  <img
                    src={settings.seoOgImage}
                    alt="OG Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              )}
            <div className="p-3 flex flex-col gap-1">
              <span className="text-[11px] text-foreground-dim/60">
                {settings.seoUrl || "nexusdevstudio.ro"}
              </span>
              <span className="text-sm font-semibold text-white/90 truncate">
                {settings.seoOgTitle || settings.seoTitle || "Nexus Dev Studio"}
              </span>
              <span className="text-xs text-foreground-muted line-clamp-2">
                {settings.seoOgDescription ||
                  settings.seoDescription ||
                  "Transformăm idei în realitate digitală."}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          SECȚIUNEA FOOTER
          ═══════════════════════════════════════════════════════ */}
      <div className="glass p-6 flex flex-col gap-5">
        <h3
          className="text-lg font-bold text-white/90 flex items-center gap-2"
          style={{
            fontFamily: "var(--font-playfair), 'Playfair Display', serif",
          }}
        >
          <i className={`${ICONS.LINK} text-purple-400`} aria-hidden="true" />
          Setări Footer
        </h3>

        {/* ── Copyright ───────────────────────────────────── */}
        <InputField
          label="Copyright"
          value={settings.footerCopyright}
          onChange={(v) =>
            setSettings((p) => ({ ...p, footerCopyright: v }))
          }
          placeholder={`© ${new Date().getFullYear()} Nexus Dev Studio. Toate drepturile rezervate.`}
        />

        {/* ── Rețele sociale ──────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Facebook URL"
            value={settings.footerFacebookUrl}
            onChange={(v) =>
              setSettings((p) => ({ ...p, footerFacebookUrl: v }))
            }
            placeholder="https://facebook.com/nexusdevstudio"
            type="url"
          />
          <InputField
            label="TikTok URL"
            value={settings.footerTiktokUrl}
            onChange={(v) =>
              setSettings((p) => ({ ...p, footerTiktokUrl: v }))
            }
            placeholder="https://tiktok.com/@nexusdevstudio"
            type="url"
          />
        </div>

        {/* ── Previzualizare social links ─────────────────── */}
        {(settings.footerFacebookUrl || settings.footerTiktokUrl) && (
          <div className="flex items-center gap-3 mt-1">
            {settings.footerFacebookUrl && (
              <a
                href={settings.footerFacebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-blue-400 bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/15 transition-all duration-200 no-underline"
                style={{
                  fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
                }}
              >
                <i className={ICONS.FACEBOOK} aria-hidden="true" /> Facebook
              </a>
            )}
            {settings.footerTiktokUrl && (
              <a
                href={settings.footerTiktokUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-pink-400 bg-pink-500/10 border border-pink-500/20 hover:bg-pink-500/15 transition-all duration-200 no-underline"
                style={{
                  fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
                }}
              >
                <i className={ICONS.TIKTOK} aria-hidden="true" /> TikTok
              </a>
            )}
          </div>
        )}

        {/* ── Link-uri footer ─────────────────────────────── */}
        <div className="flex flex-col gap-3 mt-3">
          <span
            className="text-xs uppercase tracking-wider text-foreground-dim font-medium"
            style={{
              fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace",
            }}
          >
            Link-uri footer
          </span>
          <div className="flex gap-2 flex-wrap">
            <input
              type="text"
              value={newFooterLink.label}
              onChange={(e) =>
                setNewFooterLink((p) => ({ ...p, label: e.target.value }))
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") addFooterLink();
              }}
              placeholder="Etichetă (ex: Termeni și condiții)"
              className="flex-1 min-w-[140px] px-4 py-2.5 rounded-lg text-sm text-white placeholder:text-foreground-dim/30 bg-white/5 border border-white/10 hover:border-white/20 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 outline-none transition-all duration-200"
              style={{
                fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
              }}
            />
            <input
              type="text"
              value={newFooterLink.href}
              onChange={(e) =>
                setNewFooterLink((p) => ({ ...p, href: e.target.value }))
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") addFooterLink();
              }}
              placeholder="URL (ex: /termeni)"
              className="flex-1 min-w-[180px] px-4 py-2.5 rounded-lg text-sm text-white placeholder:text-foreground-dim/30 bg-white/5 border border-white/10 hover:border-white/20 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 outline-none transition-all duration-200"
              style={{
                fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
              }}
            />
            <button
              type="button"
              onClick={addFooterLink}
              className="px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-purple-600 hover:bg-purple-500 transition-all duration-200 flex items-center gap-1.5"
              style={{
                fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
              }}
            >
              <i className={ICONS.PLUS} aria-hidden="true" /> Adaugă
            </button>
          </div>

          {/* ── Lista link-urilor existente ──────────────── */}
          {settings.footerLinks.length > 0 && (
            <div className="flex flex-col gap-1.5">
              {settings.footerLinks.map((link, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all duration-200 group"
                >
                  <i
                    className={`${ICONS.LINK} text-[10px] text-purple-400/60`}
                    aria-hidden="true"
                  />
                  <span
                    className="flex-1 text-sm text-foreground-muted"
                    style={{
                      fontFamily:
                        "var(--font-poppins), 'Poppins', sans-serif",
                    }}
                  >
                    {link.label}{" "}
                    <span className="text-foreground-dim/50 text-xs">
                      → {link.href}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFooterLink(i)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-foreground-dim hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 opacity-0 group-hover:opacity-100"
                    aria-label={`Șterge linkul: ${link.label}`}
                  >
                    <i className={`${ICONS.XMARK} text-xs`} aria-hidden="true" />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          BUTON SALVARE
          ═══════════════════════════════════════════════════════ */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="px-6 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-purple-700 via-purple-500 to-purple-700 bg-[length:200%_100%] shadow-[0_4px_20px_rgba(126,34,206,0.35)] hover:shadow-[0_6px_28px_rgba(126,34,206,0.5)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
          style={{
            fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
          }}
        >
          {saving ? (
            <>
              <i className={`${ICONS.SPINNER} animate-spin`} aria-hidden="true" />{" "}
              Se salvează...
            </>
          ) : (
            <>
              <i className={ICONS.SAVE} aria-hidden="true" /> Salvează SEO &amp;
              Footer
            </>
          )}
        </button>
      </div>
    </div>
  );
}