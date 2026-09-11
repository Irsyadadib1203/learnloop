import { PrismaClient, MasteryStatus, StageStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Memulai proses seeding LearnLoop Fase 2...');

  // 1. Buat User Admin Utama (Single-User)
  const defaultUsername = 'irsyad';
  const defaultPassword = 'learnloop123!';
  const passwordHash = await bcrypt.hash(defaultPassword, 10);

  const user = await prisma.user.upsert({
    where: { username: defaultUsername },
    update: {},
    create: {
      username: defaultUsername,
      passwordHash,
    },
  });
  console.log(`👤 User '${user.username}' siap.`);

  // 2. Inisialisasi UserStats
  await prisma.userStats.upsert({
    where: { id: 'singleton' },
    update: {},
    create: {
      id: 'singleton',
      totalXP: 95,
      currentStreak: 3,
      longestStreak: 5,
      lastActivityDate: new Date(),
    },
  });

  // 3. Roadmap Stages (Sesuai profil roadmap belajar Irsyad di PRD)
  const stagesData = [
    {
      title: 'Fondasi OOP & Design Pattern',
      description:
        'Pemahaman class, encapsulation, inheritance, polymorphism, interface, abstract class, dan prinsip SOLID sebelum masuk ke framework.',
      order: 0,
      status: StageStatus.DONE,
    },
    {
      title: 'Service Layer Pattern di Laravel',
      description:
        'Memisahkan business logic dari controller agar code reusable, clean, dan mudah di-test secara independen.',
      order: 1,
      status: StageStatus.IN_PROGRESS,
    },
    {
      title: 'Queue & Background Jobs di Laravel',
      description:
        'Asynchronous processing, database queue driver, worker supervisor, retry logic, dan rate limiting.',
      order: 2,
      status: StageStatus.NOT_STARTED,
    },
    {
      title: 'Next.js App Router dari Nol',
      description:
        'Server Components vs Client Components, routing, layout nesting, Server Actions, streaming SSR, dan caching strategy.',
      order: 3,
      status: StageStatus.IN_PROGRESS,
    },
    {
      title: 'Golang Fundamental & Concurrency',
      description:
        'Syntax dasar Go, struct, interface, goroutines, channels, WaitGroup, dan mutex untuk high-concurrency backend.',
      order: 4,
      status: StageStatus.NOT_STARTED,
    },
    {
      title: 'Gap Teknis: Tailwind, Redis, State Management',
      description:
        'Utility-first CSS styling, Redis memory caching & TTL, serta client state management yang efisien (Zustand).',
      order: 5,
      status: StageStatus.NOT_STARTED,
    },
  ];

  const stageMap: Record<string, string> = {};

  for (const s of stagesData) {
    let existingStage = await prisma.roadmapStage.findFirst({
      where: { title: s.title },
    });

    if (!existingStage) {
      existingStage = await prisma.roadmapStage.create({
        data: s,
      });
    } else {
      existingStage = await prisma.roadmapStage.update({
        where: { id: existingStage.id },
        data: {
          description: s.description,
          order: s.order,
          status: s.status,
        },
      });
    }
    stageMap[s.title] = existingStage.id;
  }
  console.log(`🗺️  ${stagesData.length} Roadmap Stages berhasil disiapkan.`);

  // 4. Catatan Belajar Riil terhubung ke Roadmap Stages
  const initialNotes = [
    {
      title: 'Service Layer Pattern di Laravel',
      topic: 'Laravel',
      stageId: stageMap['Service Layer Pattern di Laravel'],
      content: `### Service Layer Pattern
Pola ini memisahkan **Business Logic** dari **Controller** agar controller tetap "ramping" (*skinny controller*) dan fokus menangani HTTP Request/Response saja.

**Kapan menggunakan:**
- Ketika satu logic proses (misal checkout) melibatkan validasi kompleks, kalkulasi diskon, update stok, dan trigger invoice.
- Agar business logic dapat digunakan ulang di Controller, Artisan Command, maupun Queue Job tanpa duplikasi kode.`,
      whyImportant: 'Mencegah Controller jadi berantakan (*fat controller*) dan mempermudah unit testing bisnis logika secara terisolasi.',
      codeExample: `// app/Services/OrderService.php
namespace App\\Services;

use App\\Models\\Order;
use Illuminate\\Support\\Facades\\DB;

class OrderService
{
    public function createOrder(array $data, int $userId): Order
    {
        return DB::transaction(function () use ($data, $userId) {
            $order = Order::create([
                'user_id' => $userId,
                'total' => $data['total'],
                'status' => 'pending',
            ]);

            return $order;
        });
    }
}`,
      masteryStatus: MasteryStatus.MASTER,
      dueToday: true,
      stage: 1,
    },
    {
      title: 'Database Queue & Asynchronous Jobs',
      topic: 'Laravel',
      stageId: stageMap['Queue & Background Jobs di Laravel'],
      content: `### Mengapa Queue Diperlukan?
Operasi yang lambat (mengirim email verifikasi, memproses gambar, memanggil third-party API) tidak boleh memblokir response HTTP user.

Gunakan interface \`ShouldQueue\` pada class Mailable atau Job class. Jalankan worker dengan:
\`php artisan queue:work\``,
      whyImportant: 'Meningkatkan waktu respon aplikasi dari beberapa detik menjadi beberapa milidetik bagi pengguna.',
      codeExample: `// app/Jobs/ProcessUserReport.php
class ProcessUserReport implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(): void
    {
        // Operasi berat pembuatan PDF report
    }
}

// Di Controller:
ProcessUserReport::dispatch($reportData)->onQueue('reports');`,
      masteryStatus: MasteryStatus.STILL_UNSURE,
      dueToday: true,
      stage: 0,
    },
    {
      title: 'Server Components vs Client Components di Next.js App Router',
      topic: 'Next.js',
      stageId: stageMap['Next.js App Router dari Nol'],
      content: `Secara default di App Router, semua komponen di dalam folder \`app/\` adalah **React Server Components (RSC)**.

- **RSC**: Render di server, nol client bundle size, bisa fetch data langsung ke database/API tanpa useEffect.
- **Client Component** (\`'use client'\`): Dibutuhkan saat memakai event listener (\`onClick\`, \`onChange\`), React hooks (\`useState\`, \`useEffect\`), atau browser API (\`window\`, \`localStorage\`).`,
      whyImportant: 'Kunci optimasi performa dan pemahaman fundamental arsitektur modern Next.js App Router.',
      codeExample: `'use client';

import { useState } from 'react';

export default function InteractiveCounter() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(c => c + 1)}>
      Count: {count}
    </button>
  );
}`,
      masteryStatus: MasteryStatus.MASTER,
      dueToday: false,
      stage: 2,
    },
    {
      title: 'Goroutines & Concurrency Dasar di Golang',
      topic: 'Golang',
      stageId: stageMap['Golang Fundamental & Concurrency'],
      content: `Goroutine adalah lightweight thread yang dikelola oleh Go runtime. Memulai goroutine sangat sederhana dengan prefix keyword \`go\`.

Gunakan **Channels** untuk komunikasi antar goroutine secara aman (*"Do not communicate by sharing memory; instead, share memory by communicating"*).`,
      whyImportant: 'Fondasi utama keunggulan performa Golang dalam menangani ribuan task konkuren dengan memori sangat efisien (~2KB per goroutine).',
      codeExample: `package main

import (
    "fmt"
    "time"
)

func worker(id int, ch chan string) {
    time.Sleep(100 * time.Millisecond)
    ch <- fmt.Sprintf("Worker %d selesai", id)
}

func main() {
    ch := make(chan string, 2)
    go worker(1, ch)
    go worker(2, ch)

    fmt.Println(<-ch)
    fmt.Println(<-ch)
}`,
      masteryStatus: MasteryStatus.STILL_UNSURE,
      dueToday: true,
      stage: 0,
    },
  ];

  for (const item of initialNotes) {
    const existing = await prisma.note.findFirst({
      where: { title: item.title },
    });

    if (!existing) {
      const createdNote = await prisma.note.create({
        data: {
          title: item.title,
          topic: item.topic,
          stageId: item.stageId,
          content: item.content,
          whyImportant: item.whyImportant,
          codeExample: item.codeExample,
          masteryStatus: item.masteryStatus,
        },
      });

      const reviewDate = new Date();
      if (!item.dueToday) {
        reviewDate.setDate(reviewDate.getDate() + 3);
      }

      await prisma.reviewCard.create({
        data: {
          noteId: createdNote.id,
          intervalStage: item.stage,
          nextReviewDate: reviewDate,
        },
      });
    } else {
      // Pastikan stageId terhubung
      await prisma.note.update({
        where: { id: existing.id },
        data: {
          stageId: item.stageId,
        },
      });
    }
  }

  // 5. Seeding Journal Entries
  const journalData = [
    {
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 hari lalu
      content:
        'Hari ini memahami pemisahan tanggung jawab Controller vs Service Layer di Laravel. Memindahkan logic validasi custom dan transaksi database ke Service class membuat kode controller jauh lebih bersih dan mudah di-maintain.',
      challenges: 'Masih perlu membiasakan diri kapan harus inject Repository vs Service langsung.',
      mood: 'focused',
    },
    {
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 hari lalu
      content:
        'Mendalami React Server Components vs Client Components di Next.js App Router. Sangat membantu memahami bahwa secara default halaman adalah RSC, dan `use client` hanya diperlukan saat ada interaktivitas seperti hook useState / useEffect.',
      challenges: 'Sempat bingung kenapa fungsi async database tidak bisa dipanggil langsung di Client Component.',
      mood: 'excited',
    },
    {
      date: new Date(), // Hari ini
      content:
        'Selesai mengimplementasikan fitur Jurnal Refleksi dan Grafik Statistik di LearnLoop! Spaced repetition dan visualisasi roadmap berjalan lancar.',
      challenges: null,
      mood: 'happy',
    },
  ];

  for (const j of journalData) {
    const existing = await prisma.journalEntry.findFirst({
      where: { content: j.content },
    });
    if (!existing) {
      await prisma.journalEntry.create({ data: j });
    }
  }
  console.log(`📖 Journal entries disiapkan.`);

  // 6. Seeding XpLog Riwayat 7 Hari Terakhir
  const xpLogEntries = [
    { amount: 15, source: 'note_created', daysAgo: 6 },
    { amount: 10, source: 'review_remembered', daysAgo: 5 },
    { amount: 15, source: 'note_created', daysAgo: 4 },
    { amount: 10, source: 'journal_entry', daysAgo: 3 },
    { amount: 50, source: 'roadmap_stage_completed', daysAgo: 2 },
    { amount: 10, source: 'journal_entry', daysAgo: 1 },
    { amount: 10, source: 'journal_entry', daysAgo: 0 },
    { amount: 15, source: 'note_created', daysAgo: 0 },
  ];

  const totalLogs = await prisma.xpLog.count();
  if (totalLogs === 0) {
    for (const log of xpLogEntries) {
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - log.daysAgo);
      await prisma.xpLog.create({
        data: {
          amount: log.amount,
          source: log.source,
          createdAt,
        },
      });
    }
    console.log(`📈 ${xpLogEntries.length} XpLog riwayat berhasil di-seed.`);
  }

  console.log('✅ Seeding Fase 3 selesai dengan sukses!');
}

main()
  .catch((e) => {
    console.error('❌ Terjadi kesalahan saat seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

