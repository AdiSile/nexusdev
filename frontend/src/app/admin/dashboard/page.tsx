Dashboard-ul admin complet cu **8 secțiuni** (tab-uri), fiecare cu formulare complete și toast verde de confirmare:

| Tab | Conținut |
|-----|----------|
| **Hero & General** | Titlu, subtitlu, badge ofertă, video fundal, mesaje morphing (adaugă/șterge), toggle buton portofoliu, secțiunea Despre (titlu, descriere, identitate) |
| **Servicii** | CRUD complet: iconiță (picker vizual 27 iconițe), titlu, descriere, categorie, preț original/redus, toggle Popular, discount auto-calculat |
| **Cum lucrăm** | CRUD pași proces: etichetă, titlu, descriere, iconiță, gradient CSS, highlights (adaugă/șterge), reordonare cu săgeți sus/jos |
| **FAQ** | CRUD întrebări: întrebare, răspuns, categorie (Generale/Prețuri/Proces/Tehnic) |
| **Portofoliu** | CRUD proiecte: titlu, categorie, descriere, imagine URL, alt text, Demo/GitHub URL-uri, tag-uri tehnologii, toggle Featured |
| **Contact** | Email, telefon, adresă, program de lucru |
| **SEO & Footer** | Titlu/descriere SEO, cuvinte cheie, URL site, Open Graph, Twitter Card, copyright, Facebook/TikTok URL-uri, link-uri footer dinamice |
| **Mesaje** | Listă mesaje contact cu detaliu, marcare citit, ștergere, badge necitite, toast confirmare |

**Integrare backend:**
- Setările se încarcă din `GET /api/settings` și se salvează prin `PUT /api/settings` cu JWT din cookie
- Mesajele se încarcă din `GET /api/messages`, se marchează citite prin `PATCH /api/messages/:id/read`, se șterg prin `DELETE /api/messages/:id`
- Toast-ul verde apare la fiecare salvare/operație reușită; toast roșu la erori