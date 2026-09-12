import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const note = await prisma.note.findUnique({ where: { id } });

    if (!note) {
      return NextResponse.json({ error: 'Catatan tidak ditemukan.' }, { status: 404 });
    }

    const rawApiKey = process.env.GEMINI_API_KEY;
    if (!rawApiKey) {
      return NextResponse.json(
        {
          error:
            'GEMINI_API_KEY belum dikonfigurasi di Environment Variables. Anda bisa mendapatkannya secara gratis di aistudio.google.com.',
        },
        { status: 400 }
      );
    }

    // Bersihkan spasi dan tanda kutip yang tidak sengaja terbawa saat copy-paste di Vercel
    const apiKey = rawApiKey.trim().replace(/^["']|["']$/g, '');

    const systemPrompt = `Kamu reviewer teknis software engineering berpengalaman. Baca catatan belajar berikut, nilai apakah pemahaman teknisnya sudah akurat, sebutkan jika ada miskonsepsi atau kesalahan fatal, dan berikan saran perbaikan singkat. Jawab ringkas dalam Bahasa Indonesia, maksimal 150 kata.
Awali responmu dengan baris status: "[STATUS: SUDAH TEPAT]" atau "[STATUS: PERLU DIPERBAIKI]", lalu lanjutkan dengan poin analisis dan rekomendasi singkat.`;

    const userContent = `Judul: ${note.title}
Topik: ${note.topic}
Isi Catatan:
${note.content}

Kenapa Penting:
${note.whyImportant || 'Tidak dicantumkan'}

Contoh Kode:
${note.codeExample || 'Tidak ada kode'}`;

    const payload = {
      contents: [
        {
          parts: [
            {
              text: `${systemPrompt}\n\n---\n\n${userContent}`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 350,
      },
    };

    // Coba gemini-2.0-flash terlebih dahulu, jika model belum aktif di akun user coba fallback ke gemini-1.5-flash
    const modelsToTry = ['gemini-2.0-flash', 'gemini-1.5-flash'];
    let geminiRes: Response | null = null;
    let lastErrorMsg = '';

    for (const model of modelsToTry) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      try {
        geminiRes = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (geminiRes.ok) {
          break;
        }

        if (geminiRes.status === 429) {
          return NextResponse.json(
            { error: 'Kuota harian AI review gratis sedang penuh / rate limit. Silakan coba lagi beberapa saat lagi.' },
            { status: 429 }
          );
        }

        const errData = (await geminiRes.json().catch(() => ({}))) as {
          error?: { message?: string; status?: string; code?: number };
        };
        lastErrorMsg = errData?.error?.message || `HTTP ${geminiRes.status}`;
        console.error(`Gemini API error with model ${model}:`, errData);

        // Jika bukan 404 (model not found), jangan looping model lain, langsung laporkan
        if (geminiRes.status !== 404) {
          break;
        }
      } catch (fetchErr) {
        lastErrorMsg = fetchErr instanceof Error ? fetchErr.message : 'Koneksi gagal';
      }
    }

    if (!geminiRes || !geminiRes.ok) {
      return NextResponse.json(
        {
          error: `Gagal menghubungi Google Gemini AI: ${lastErrorMsg}. Periksa kembali GEMINI_API_KEY Anda.`,
        },
        { status: 500 }
      );
    }

    const data = await geminiRes.json();
    const feedbackText =
      data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
      'Tidak ada feedback yang dihasilkan.';

    const now = new Date();
    const updatedNote = await prisma.note.update({
      where: { id },
      data: {
        aiReviewFeedback: feedbackText,
        aiReviewedAt: now,
      },
    });

    return NextResponse.json({
      success: true,
      aiReviewFeedback: updatedNote.aiReviewFeedback,
      aiReviewedAt: updatedNote.aiReviewedAt,
    });
  } catch (error) {
    console.error('Error in AI review note:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat memproses review AI.' },
      { status: 500 }
    );
  }
}
