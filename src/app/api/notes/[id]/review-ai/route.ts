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
        maxOutputTokens: 500,
        thinkingConfig: {
          thinkingBudget: 0,
        },
      },
    };

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;

    const geminiRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!geminiRes.ok) {
      if (geminiRes.status === 429) {
        return NextResponse.json(
          { error: 'Kuota harian AI review gratis sedang penuh / rate limit. Silakan coba lagi beberapa saat lagi.' },
          { status: 429 }
        );
      }

      const errData = (await geminiRes.json().catch(() => ({}))) as {
        error?: { message?: string; status?: string; code?: number };
      };
      console.error('Gemini API error:', errData);

      const errorMsg = errData?.error?.message || '';

      if (geminiRes.status === 404 && errorMsg.includes('is not found for API version')) {
        return NextResponse.json(
          { error: 'Model AI sedang tidak tersedia, coba beberapa saat lagi.' },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          error: `Gagal menghubungi Google Gemini AI: ${errorMsg || `HTTP ${geminiRes.status}`}. Periksa kembali GEMINI_API_KEY Anda.`,
        },
        { status: geminiRes.status || 500 }
      );
    }

    const data = await geminiRes.json();
    const parts = data.candidates?.[0]?.content?.parts || [];
    const feedbackText =
      parts
        .filter((p: { thought?: boolean; text?: string }) => !p.thought && p.text)
        .map((p: { text?: string }) => p.text)
        .join('\n')
        .trim() || 'Tidak ada feedback yang dihasilkan.';

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
