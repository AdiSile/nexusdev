import type { Metadata } from "next";
import { Playfair_Display, Poppins, JetBrains_Mono } from "next/font/google";
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper";
import type { AppSettings, SEOSettings } from "@/types";
import "./globals.css";

// ═══════════════════════════════════════════════════════════════
// ÎNCĂRCARE ASINCRONĂ FONTURI (next/font • display:swap)
//
// Fonturile sunt self-hosted la build time – nu mai depind de
// Google CDN la runtime. Variabilele CSS injectate de next/font
// (--font-playfair, --font-poppins, --font-jetbrains) sunt
// folosite în globals.css pentru a stabili font-family corect.
// ═══════════════════════════════════════════════════════════════

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
});

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
});

// ═══════════════════════════════════════════════════════════════
// TIPURI PENTRU SETĂRILE API
//
// Importate din @/types — definițiile centralizate.
// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
// FETCH SETĂRI DE LA API (la build time pentru static export)
//
// Se încearcă conectarea la backend-ul Express. Dacă API-ul nu
// răspunde (ex: build fără server pornit), se folosesc fallback-uri
// care reproduc exact valorile din seed-ul bazei de date.
// ═══════════════════════════════════════════════════════════════

const API_URL: string =
  (process.env.NEXT_PUBLIC_API_URL as string | undefined) ??
  "http://localhost:3001";

async function fetchSettings(): Promise<AppSettings | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(`${API_URL}/api/settings`, {
      signal: controller.signal,
      next: { revalidate: 3600 },
    });

    clearTimeout(timeoutId);

    if (!res.ok) return null;
    const data: unknown = await res.json();
    return data as AppSettings;
  } catch {
    console.warn(
      "[layout] Nu s-au putut încărca setările de la API. Se folosesc valorile implicite."
    );
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════
// METADATA DINAMIC (generateMetadata)
//
// Populează <title>, <meta name="description">, Open Graph
// (og:title, og:description, og:image, og:url etc.) și
// Twitter Card (twitter:title, twitter:description, twitter:image)
// din setările SEO stocate în backend.
//
// Rulează la build time pentru `output: "export"`.
// ═══════════════════════════════════════════════════════════════

export async function generateMetadata(): Promise<Metadata> {
  const settings = await fetchSettings();
  const seo = settings?.seo;

  // ── Titlu pagină ──────────────────────────────────────────
  const title: string =
    seo?.title || "Nexus Dev Studio | Dezvoltare Web și Mobilă cu AI";

  // ── Descriere ─────────────────────────────────────────────
  const description: string =
    seo?.description ||
    "Freelancer Full-Stack specializat în dezvoltare web și mobilă. Soluții digitale complete cu AI (Nexus Core Neural). Lansare 2026 cu prețuri promoționale.";

  // ── URL canonic ───────────────────────────────────────────
  const siteUrl: string = seo?.siteUrl || "https://nexusdevstudio.ro";

  // ── Imagine Open Graph / Twitter ──────────────────────────
  const ogImageUrl: string = seo?.ogImage || "/images/og-image.jpg";
  const twitterImageUrl: string = seo?.twitterImage || ogImageUrl;

  // ── Limbă ─────────────────────────────────────────────────
  const language: string = seo?.language || "ro";

  // ── Autor ─────────────────────────────────────────────────
  const author: string = seo?.author || "Nexus Dev Studio";

  // ── Twitter Card type ─────────────────────────────────────
  const twitterCardType: "summary" | "summary_large_image" | "app" | "player" =
    (seo?.twitterCard as
      | "summary"
      | "summary_large_image"
      | "app"
      | "player") || "summary_large_image";

  return {
    title,
    description,
    keywords: seo?.keywords,
    authors: [{ name: author }],
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: siteUrl,
    },

    // ── Open Graph ──────────────────────────────────────────
    openGraph: {
      title: seo?.ogTitle || title,
      description: seo?.ogDescription || description,
      url: siteUrl,
      siteName: "Nexus Dev Studio",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: seo?.ogTitle || title,
        },
      ],
      locale: language,
      type: "website",
    },

    // ── Twitter Card ────────────────────────────────────────
    twitter: {
      card: twitterCardType,
      title: seo?.twitterTitle || title,
      description: seo?.twitterDescription || description,
      images: [twitterImageUrl],
    },

    // ── Robots ──────────────────────────────────────────────
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },

    // ── Alte meta tag-uri ───────────────────────────────────
    other: {
      "theme-color": "#0a0a0f",
      "apple-mobile-web-app-capable": "yes",
      "apple-mobile-web-app-status-bar-style": "black-translucent",
      "format-detection": "telephone=no",
    },
  };
}

// ═══════════════════════════════════════════════════════════════
// SCHEMA.ORG JSON-LD
//
// Generează structured data pentru:
//  • ProfessionalService (organizația)
//  • WebSite
//  • WebPage
//  • ImageObject (imaginea principală)
//
// Google folosește aceste date pentru rich results, Knowledge
// Graph și sitelinks search box.
// ═══════════════════════════════════════════════════════════════

function generateJsonLd(settings: AppSettings | null): Record<string, unknown> {
  const seo = settings?.seo;
  const contact = settings?.contact;
  const hero = settings?.hero;
  const siteUrl: string = seo?.siteUrl || "https://nexusdevstudio.ro";
  const orgName: string = hero?.title || "Nexus Dev Studio";
  const orgDescription: string =
    seo?.description ||
    hero?.subtitle ||
    "Dezvoltare Web și Mobilă cu AI";

  const ogImageUrl: string = seo?.ogImage || "/images/og-image.jpg";
  const fullImageUrl: string = ogImageUrl.startsWith("http")
    ? ogImageUrl
    : `${siteUrl}${ogImageUrl}`;

  const sameAs: string[] = [];
  if (settings?.footer?.facebook && settings.footer.facebook !== "#") {
    sameAs.push(settings.footer.facebook);
  }
  if (settings?.footer?.tiktok && settings.footer.tiktok !== "#") {
    sameAs.push(settings.footer.tiktok);
  }

  return {
    "@context": "https://schema.org",
    "@graph": [
      // ── Organizația ───────────────────────────────────────
      {
        "@type": "ProfessionalService",
        "@id": `${siteUrl}/#organization`,
        name: orgName,
        description: orgDescription,
        url: siteUrl,
        ...(contact?.email ? { email: contact.email } : {}),
        ...(contact?.phone ? { telephone: contact.phone } : {}),
        ...(contact?.address
          ? {
              address: {
                "@type": "PostalAddress",
                addressCountry: "RO",
                addressLocality: contact.address,
              },
            }
          : {}),
        image: fullImageUrl,
        ...(sameAs.length > 0 ? { sameAs } : {}),
        priceRange: "EUR 60-9600",
        founder: {
          "@type": "Person",
          name: seo?.author || "Nexus Dev Studio",
        },
        openingHours: "Mo-Fr 09:00-18:00",
      },

      // ── Website ───────────────────────────────────────────
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: seo?.title || orgName,
        description: seo?.description || orgDescription,
        inLanguage: seo?.language || "ro",
        publisher: { "@id": `${siteUrl}/#organization` },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${siteUrl}/?s={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },

      // ── Pagina web ────────────────────────────────────────
      {
        "@type": "WebPage",
        "@id": `${siteUrl}/#webpage`,
        url: siteUrl,
        name: seo?.title || orgName,
        description: seo?.description || orgDescription,
        isPartOf: { "@id": `${siteUrl}/#website` },
        about: { "@id": `${siteUrl}/#organization` },
        primaryImageOfPage: { "@id": `${siteUrl}/#primaryimage` },
        inLanguage: seo?.language || "ro",
      },

      // ── Imaginea principală ───────────────────────────────
      {
        "@type": "ImageObject",
        "@id": `${siteUrl}/#primaryimage`,
        url: fullImageUrl,
        width: 1200,
        height: 630,
        caption: seo?.ogTitle || orgName,
        creditText: orgName,
      },
    ],
  };
}

// ═══════════════════════════════════════════════════════════════
// ROOT LAYOUT – STRUCTURĂ HTML5 SEMANTICĂ
//
//  • <html lang="ro"> setat dinamic din setări
//  • <head> include JSON-LD, favicon, preconnect
//  • <body> cu skip-link pentru accesibilitate
//  • <main id="main-content"> ca wrapper semantic
// ═══════════════════════════════════════════════════════════════

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await fetchSettings();
  const jsonLd = generateJsonLd(settings);
  const lang: string = settings?.seo?.language || "ro";
  const jsonLdString: string = JSON.stringify(jsonLd, null, 2);
  const author: string = settings?.seo?.author || "Nexus Dev Studio";
  const copyright: string =
    settings?.footer?.copyright ||
    `© ${new Date().getFullYear()} Nexus Dev Studio`;

  return (
    <html
      lang={lang}
      className={`${playfairDisplay.variable} ${poppins.variable} ${jetbrainsMono.variable}`}
      data-theme="dark"
      prefix="og: https://ogp.me/ns#"
    >
      <head>
        {/* ── Preconnect pentru domenii externe ──────────────── */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />

        {/* ── Favicon & Icon-uri ────────────────────────────── */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link
          rel="apple-touch-icon"
          href="/images/apple-touch-icon.png"
          sizes="180x180"
        />

        {/* ── PWA Manifest ──────────────────────────────────── */}
        <link rel="manifest" href="/manifest.json" />

        {/* ── Schema.org JSON-LD ────────────────────────────── */}
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: jsonLdString,
          }}
        />

        {/* ── Meta suplimentare (complementare generateMetadata) */}
        <meta name="author" content={author} />
        <meta name="copyright" content={copyright} />
        <meta name="language" content={lang} />
        <meta
          name="classification"
          content="Web Development, Mobile Development"
        />
        <meta name="rating" content="General" />
        <meta name="revisit-after" content="7 days" />
      </head>

      <body
        className={`${playfairDisplay.variable} ${poppins.variable} ${jetbrainsMono.variable} antialiased`}
      >
        {/* ── Skip link pentru accesibilitate ────────────────── */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-purple-700 focus:text-white focus:rounded-lg focus:outline-none"
        >
          Sari la conținutul principal
        </a>

        {/* ── Conținut principal semantic ────────────────────── */}
        <ClientLayoutWrapper>
          <main id="main-content" className="relative min-h-screen">
            {children}
          </main>
        </ClientLayoutWrapper>

        {/* ── JSON-LD fallback pentru browsere fără JS ────────── */}
        <noscript>
          <div
            style={{ display: "none" }}
            data-jsonld={jsonLdString}
          />
        </noscript>
      </body>
    </html>
  );
}