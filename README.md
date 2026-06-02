# VeriKost

Aplikasi web pencarian dan verifikasi kost berbasis **Next.js** dan **Supabase**.

## Tech Stack

- **Next.js 16** — React framework (App Router)
- **Supabase** — Auth & Database
- **Tailwind CSS 4** — Styling
- **Leaflet** — Peta interaktif
- **Zod** — Validasi data
- **Lucide React** — Ikon

## Fitur

- Pencarian & filter kost
- Peta lokasi kost (Leaflet)
- Perbandingan kost
- Favorit & review
- Chat
- Video tour kost
- Auth (login, register, forgot password)
- Dashboard owner
- Admin panel
- Badge verifikasi kost

## Instalasi

1. Clone repository:
   ```bash
   git clone <repo-url>
   cd verikost
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Setup environment variables:
   ```bash
   cp .env.local.example .env.local
   ```
   Isi `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` dengan kredensial Supabase kamu.

4. Jalankan development server:
   ```bash
   npm run dev
   ```

5. Buka [http://localhost:3000](http://localhost:3000)