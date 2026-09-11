# 🔄 LearnLoop — Personal Learning Notes & Progress Tracker

LearnLoop adalah web app pribadi yang menggabungkan pencatatan konsep teknis (dengan bahasa sendiri), sistem pengulangan terjadwal (*spaced repetition* Leitner box ala flashcard), pelacak roadmap visual, dan gamifikasi ringan (streak, XP, level) untuk membantu penguasaan skill teknis jangka panjang.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router, TypeScript)
- **Styling**: Tailwind CSS v4 & `@tailwindcss/typography`
- **Database & ORM**: Supabase (PostgreSQL) + Prisma ORM
- **Autentikasi**: Single-User Auth (Password hashing dengan `bcryptjs`, session JWT via `jose` dalam `httpOnly` cookie, dilindungi `middleware.ts`)
- **Animasi & Interaksi**: Framer Motion & `canvas-confetti`
- **Markdown**: `react-markdown` + `remark-gfm`

---

## 🚀 Panduan Setup & Instalasi

### 1. Persiapan Supabase Database

1. Buka [Supabase](https://supabase.com) dan buat project baru.
2. Masuk ke menu **Project Settings** $\rightarrow$ **Database**.
3. Di bagian **Connection string**:
   - Pilih tab **Connection Pooling** (Mode: Transaction, Port `6543`). Salin string ini untuk `DATABASE_URL`. String ini sangat penting untuk serverless runtime Next.js / Vercel agar koneksi database tidak habis.
   - Pilih tab **Direct connection** (Port `5432`). Salin string ini untuk `DIRECT_URL` (digunakan untuk migrasi Prisma & seeding).

### 2. Konfigurasi Lingkungan (`.env`)

Salin file `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```

Isi variabel di dalam `.env`:
```env
# Supabase Transaction Pooler (Port 6543)
DATABASE_URL="postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"

# Supabase Direct Connection (Port 5432)
DIRECT_URL="postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

# Kunci Rahasia JWT (minimal 32 karakter acak)
JWT_SECRET="ganti-dengan-string-rahasia-panjang-dan-acak-di-sini!"

# Telegram Bot (opsional — untuk fitur reminder harian)
# Token didapat dari @BotFather di Telegram
TELEGRAM_BOT_TOKEN="123456789:AAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# Secret untuk mengamankan endpoint cron (/api/cron/reminder)
# Buat string acak panjang, isi di Vercel Environment Variables juga
CRON_SECRET="string-rahasia-cron-yang-aman"

# Gemini API Key (gratis di aistudio.google.com) — untuk AI Note Review
GEMINI_API_KEY="AIzaSy..."
```

### 3. Push Skema ke Supabase

Jalankan perintah berikut untuk mengaplikasikan skema PostgreSQL ke Supabase:
```bash
npx prisma db push
```

### 4. Seeding Data Awal

Jalankan seed untuk membuat akun default admin dan catatan pembelajaran percontohan (Laravel Service Layer, Queue, Next.js Server Components, Golang Concurrency):
```bash
npx prisma db seed
```

> 🔑 **Kredensial Default:**
> - **Username**: `irsyad`
> - **Password**: `learnloop123!`

### 5. Menjalankan Server Development

```bash
npm run dev
```
Buka browser di `http://localhost:3000`. Jika belum login, rute otomatis diarahkan ke `/login`.

---

## 🔒 Mengganti Password Default

Karena aplikasi ini berkonsep **single-user** (tanpa registrasi publik untuk mencegah orang lain mendaftar), Anda dapat mengganti password kapan saja melalui:
1. Mengubah password pada file `prisma/seed.ts` lalu jalankan ulang `npx prisma db seed`, atau
2. Menggunakan Prisma Studio untuk mengedit hash password:
   ```bash
   npx prisma studio
   ```

---

## ☁️ Panduan Deploy ke Vercel

1. Push repository Anda ke GitHub.
2. Import repository di dashboard [Vercel](https://vercel.com).
3. Tambahkan **Environment Variables** di Vercel Settings:
   - `DATABASE_URL`: Connection pooling string Supabase (Port 6543).
   - `DIRECT_URL`: Direct connection string Supabase (Port 5432).
   - `JWT_SECRET`: Random secret key yang aman.
   - `TELEGRAM_BOT_TOKEN` *(opsional)*: Token dari @BotFather — untuk reminder harian.
   - `CRON_SECRET` *(opsional)*: Secret acak untuk mengamankan endpoint `/api/cron/reminder`.
   - `GEMINI_API_KEY` *(opsional)*: API key dari [aistudio.google.com](https://aistudio.google.com) (gratis) — untuk AI Note Review.
4. Klik **Deploy**! Vercel akan mem-build project secara otomatis.

---

## 💡 Navigasi Cepat Keyboard pada Sesi Review

Saat berada di halaman review flashcard (`/review`):
- `[Spasi]`: Menampilkan jawaban kartu (*reveal*).
- `[1]`: Tandai **Lupa** (Kartu diulang besok, stage reset ke 0).
- `[2]`: Tandai **Ingat Sebagian** (Interval bertahan di tahap saat ini).
- `[3]`: Tandai **Ingat Jelas** (Naik ke tahap Leitner berikutnya: 3 hari $\rightarrow$ 7 hari $\rightarrow$ 14 hari $\rightarrow$ 30 hari).
