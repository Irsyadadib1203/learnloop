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

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            'GEMINI_API_KEY belum dikonfigurasi di .env. Anda bisa mendapatkannya secara gratis di aistudio.google.com.',
        },
        { status: 400 }
      );
    }

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

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const geminiRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
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
      }),
    });

    if (!geminiRes.ok) {
      if (geminiRes.status === 429) {
        return NextResponse.json(
          { error: 'Kuota harian AI review gratis sedang penuh / rate limit. Silakan coba lagi beberapa saat lagi.' },
          { status: 429 }
        );
      }
      const errData = await geminiRes.json().catch(() => ({}));
      console.error('Gemini API Error:', errData);
      return NextResponse.json(
        { error: 'Gagal menghubungi Google Gemini AI. Periksa kembali GEMINI_API_KEY Anda.' },
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
