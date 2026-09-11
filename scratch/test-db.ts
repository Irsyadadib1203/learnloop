import { prisma } from '../src/lib/prisma';

async function test() {
  console.log('Testing DB connection...');
  const user = await prisma.user.findFirst();
  console.log('User:', user?.username);
  const mood = await prisma.moodLog.findFirst();
  console.log('Mood:', mood);
  const note = await prisma.note.findFirst();
  console.log('Note:', note?.title);
  const cards = await prisma.reviewCard.findMany();
  console.log('Cards count:', cards.length);
}

test()
  .then(() => console.log('ALL QUERIES PASSED!'))
  .catch((err) => console.error('FAILED WITH ERROR:', err))
  .finally(async () => {
    await prisma.$disconnect();
  });
