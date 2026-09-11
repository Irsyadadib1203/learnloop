import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { MasteryStatus, StageStatus, ReviewResult } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Tidak terautentikasi.' }, { status: 401 });
    }

    const payload = await request.json();
    const { notes, roadmapStages, journalEntries, xpLogs, userStats } = payload;

    if (!Array.isArray(notes) && !Array.isArray(roadmapStages)) {
      return NextResponse.json(
        { error: 'Format file JSON tidak valid. Data catatan atau roadmap tidak ditemukan.' },
        { status: 400 }
      );
    }

    let importedStagesCount = 0;
    let importedTasksCount = 0;
    let importedNotesCount = 0;
    let importedJournalsCount = 0;

    await prisma.$transaction(async (tx) => {
      // 1. Import Roadmap Stages & Roadmap Tasks
      const stageIdMap: Record<string, string> = {}; // oldId -> newId or existingId

      if (Array.isArray(roadmapStages)) {
        for (const s of roadmapStages) {
          if (!s.title) continue;

          let stage = await tx.roadmapStage.findFirst({
            where: { title: s.title },
          });

          if (!stage) {
            stage = await tx.roadmapStage.create({
              data: {
                title: s.title,
                description: s.description || '',
                order: typeof s.order === 'number' ? s.order : 0,
                status: (s.status as StageStatus) || StageStatus.NOT_STARTED,
              },
            });
            importedStagesCount++;
          }

          if (s.id) stageIdMap[s.id] = stage.id;

          // Import sub-tasks for this stage if present
          if (Array.isArray(s.tasks)) {
            for (const t of s.tasks) {
              if (!t.title) continue;
              const existingTask = await tx.roadmapTask.findFirst({
                where: { stageId: stage.id, title: t.title },
              });

              if (!existingTask) {
                await tx.roadmapTask.create({
                  data: {
                    stageId: stage.id,
                    title: t.title,
                    resourceUrl: t.resourceUrl || null,
                    isDone: !!t.isDone,
                    order: typeof t.order === 'number' ? t.order : 0,
                  },
                });
                importedTasksCount++;
              }
            }
          }
        }
      }

      // 2. Import Notes & Review Cards
      if (Array.isArray(notes)) {
        for (const n of notes) {
          if (!n.title || !n.content) continue;

          let note = await tx.note.findFirst({
            where: { title: n.title },
          });

          const resolvedStageId = n.stageId
            ? stageIdMap[n.stageId] || n.stageId
            : null;

          if (!note) {
            note = await tx.note.create({
              data: {
                title: n.title,
                topic: n.topic || 'General',
                content: n.content,
                whyImportant: n.whyImportant || null,
                codeExample: n.codeExample || null,
                masteryStatus:
                  n.masteryStatus === 'MASTER'
                    ? MasteryStatus.MASTER
                    : MasteryStatus.STILL_UNSURE,
                aiReviewFeedback: n.aiReviewFeedback || null,
                aiReviewedAt: n.aiReviewedAt ? new Date(n.aiReviewedAt) : null,
                stageId: resolvedStageId,
                reviewCard: {
                  create: {
                    intervalStage: n.reviewCard?.intervalStage ?? 0,
                    nextReviewDate: n.reviewCard?.nextReviewDate
                      ? new Date(n.reviewCard.nextReviewDate)
                      : new Date(),
                    lastReviewedAt: n.reviewCard?.lastReviewedAt
                      ? new Date(n.reviewCard.lastReviewedAt)
                      : null,
                    lastResult: (n.reviewCard?.lastResult as ReviewResult) || null,
                  },
                },
              },
            });
            importedNotesCount++;
          }
        }
      }

      // 3. Import Journal Entries
      if (Array.isArray(journalEntries)) {
        for (const j of journalEntries) {
          if (!j.content) continue;
          const existing = await tx.journalEntry.findFirst({
            where: { content: j.content },
          });

          if (!existing) {
            await tx.journalEntry.create({
              data: {
                date: j.date ? new Date(j.date) : new Date(),
                content: j.content,
                challenges: j.challenges || null,
                mood: j.mood || 'calm',
              },
            });
            importedJournalsCount++;
          }
        }
      }

      // 4. Import XpLogs (if provided)
      if (Array.isArray(xpLogs)) {
        for (const log of xpLogs) {
          if (!log.amount || !log.source) continue;
          await tx.xpLog.create({
            data: {
              amount: log.amount,
              source: log.source,
              createdAt: log.createdAt ? new Date(log.createdAt) : new Date(),
            },
          });
        }
      }

      // 5. Update UserStats if exported totalXP is higher
      if (userStats && typeof userStats.totalXP === 'number') {
        const currentStats = await tx.userStats.findUnique({
          where: { id: 'singleton' },
        });

        if (!currentStats || userStats.totalXP > currentStats.totalXP) {
          await tx.userStats.upsert({
            where: { id: 'singleton' },
            update: {
              totalXP: userStats.totalXP,
              currentStreak: userStats.currentStreak ?? 0,
              longestStreak: userStats.longestStreak ?? 0,
            },
            create: {
              id: 'singleton',
              totalXP: userStats.totalXP,
              currentStreak: userStats.currentStreak ?? 0,
              longestStreak: userStats.longestStreak ?? 0,
            },
          });
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Data berhasil dipulihkan / diimpor!',
      summary: {
        stages: importedStagesCount,
        tasks: importedTasksCount,
        notes: importedNotesCount,
        journals: importedJournalsCount,
      },
    });
  } catch (error) {
    console.error('Error importing data:', error);
    return NextResponse.json(
      { error: 'Gagal mengimpor data. Pastikan format JSON sesuai.' },
      { status: 500 }
    );
  }
}
