import { PrismaClient } from './generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import {
  DEFAULT_EXPENSE_CATEGORIES,
  DEFAULT_INCOME_CATEGORIES,
  DEFAULT_ITEM_CATEGORIES,
  SeedCategoryNode,
} from '../src/feature/onboarding/core/domain/default-catalog';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

interface UserSeedOutcome {
  userId: string;
  email: string;
  expenseCategoriesCreated: number;
  incomeCategoriesCreated: number;
  itemCategoriesLinked: number;
}

async function visibleUserIds(userId: string): Promise<string[]> {
  const memberships = await prisma.familyMember.findMany({
    where: { userId },
    select: { familyId: true },
  });

  if (memberships.length === 0) {
    return [userId];
  }

  const coMembers = await prisma.familyMember.findMany({
    where: { familyId: { in: memberships.map((m) => m.familyId) } },
    select: { userId: true },
  });

  return [...new Set([userId, ...coMembers.map((m) => m.userId)])];
}

async function seedExpenseCategories(
  userId: string,
  audience: string[],
): Promise<number> {
  const alreadyVisible = await prisma.expenseCategory.count({
    where: { userId: { in: audience } },
  });

  if (alreadyVisible > 0) {
    return 0;
  }

  let created = 0;

  const insert = async (
    nodes: SeedCategoryNode[],
    parentId: string | null,
  ): Promise<void> => {
    for (const node of nodes) {
      const category = await prisma.expenseCategory.upsert({
        where: { userId_name: { userId, name: node.name } },
        update: {},
        create: {
          userId,
          name: node.name,
          parentId,
          isConnectedToStore: node.requiresStore ?? false,
        },
      });
      created += 1;
      await insert(node.children ?? [], category.id);
    }
  };

  await insert(DEFAULT_EXPENSE_CATEGORIES, null);

  return created;
}

async function seedIncomeCategories(
  userId: string,
  audience: string[],
): Promise<number> {
  const alreadyVisible = await prisma.incomeCategory.count({
    where: { userId: { in: audience } },
  });

  if (alreadyVisible > 0) {
    return 0;
  }

  let created = 0;

  const insert = async (
    nodes: SeedCategoryNode[],
    parentId: string | null,
  ): Promise<void> => {
    for (const node of nodes) {
      const category = await prisma.incomeCategory.upsert({
        where: { userId_name: { userId, name: node.name } },
        update: {},
        create: { userId, name: node.name, parentId },
      });
      created += 1;
      await insert(node.children ?? [], category.id);
    }
  };

  await insert(DEFAULT_INCOME_CATEGORIES, null);

  return created;
}

async function seedItemCategories(userId: string): Promise<number> {
  const alreadyLinked = await prisma.userItemCategory.count({
    where: { userId },
  });

  if (alreadyLinked > 0) {
    return 0;
  }

  let linked = 0;

  for (const name of DEFAULT_ITEM_CATEGORIES) {
    const existing = await prisma.itemCategory.findFirst({ where: { name } });
    const category =
      existing ?? (await prisma.itemCategory.create({ data: { name } }));

    await prisma.userItemCategory.upsert({
      where: { userId_categoryId: { userId, categoryId: category.id } },
      update: {},
      create: { userId, categoryId: category.id },
    });
    linked += 1;
  }

  return linked;
}

async function seedUser(user: {
  id: string;
  email: string;
}): Promise<UserSeedOutcome> {
  const audience = await visibleUserIds(user.id);

  return {
    userId: user.id,
    email: user.email,
    expenseCategoriesCreated: await seedExpenseCategories(user.id, audience),
    incomeCategoriesCreated: await seedIncomeCategories(user.id, audience),
    itemCategoriesLinked: await seedItemCategories(user.id),
  };
}

function targetUserId(): string | undefined {
  const flagIndex = process.argv.indexOf('--user');

  return flagIndex === -1 ? undefined : process.argv[flagIndex + 1];
}

async function main(): Promise<void> {
  const only = targetUserId();
  const users = await prisma.user.findMany({
    where: only ? { id: only } : undefined,
    select: { id: true, email: true },
    orderBy: { createdAt: 'asc' },
  });

  if (users.length === 0) {
    console.log('No users to seed.');
    return;
  }

  const outcomes: UserSeedOutcome[] = [];
  for (const user of users) {
    outcomes.push(await seedUser(user));
  }

  const touched = outcomes.filter(
    (outcome) =>
      outcome.expenseCategoriesCreated > 0 ||
      outcome.incomeCategoriesCreated > 0 ||
      outcome.itemCategoriesLinked > 0,
  );

  for (const outcome of touched) {
    console.log(
      `${outcome.email}: +${outcome.expenseCategoriesCreated} expense, ` +
        `+${outcome.incomeCategoriesCreated} income, ` +
        `+${outcome.itemCategoriesLinked} item categories`,
    );
  }

  console.log(
    `Seeded ${touched.length} of ${users.length} users; ` +
      `${users.length - touched.length} already had a visible catalog.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
