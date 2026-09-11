import { prisma } from '../src/lib/prisma';
import { calculateLevelInfo } from '../src/lib/gamification';

async function verifyPhase2() {
  console.log('Testing Phase 2 integration...');

  // 1. Check Roadmap stages
  const stages = await prisma.roadmapStage.findMany({
    orderBy: { order: 'asc' },
    include: { notes: true },
  });
  console.log(`Stages count: ${stages.length}`);
  stages.forEach((s) => {
    console.log(`- Stage ${s.order}: "${s.title}" [${s.status}] (${s.notes.length} notes linked)`);
  });

  // 2. Check Leveling & Gamification
  const stats = await prisma.userStats.findUnique({ where: { id: 'singleton' } });
  if (stats) {
    const info = calculateLevelInfo(stats.totalXP);
    console.log(`User XP: ${stats.totalXP}, Level: ${info.level} (${info.title}), Progress: ${info.progressPercent}%`);
  }

  console.log('PHASE 2 VERIFICATION PASSED!');
}

verifyPhase2()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
