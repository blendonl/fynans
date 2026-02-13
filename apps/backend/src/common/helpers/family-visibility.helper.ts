import { PrismaService } from '../prisma/prisma.service';

export async function getVisibleUserIds(
  prisma: PrismaService,
  userId: string,
): Promise<string[]> {
  const familyIds = await prisma.familyMember
    .findMany({ where: { userId }, select: { familyId: true } })
    .then((f) => f.map((m) => m.familyId));

  if (familyIds.length === 0) return [userId];

  const members = await prisma.familyMember.findMany({
    where: { familyId: { in: familyIds } },
    select: { userId: true },
  });

  return [...new Set([userId, ...members.map((m) => m.userId)])];
}
