import { ExpenseCategoryMapper } from './expense-category.mapper';

describe('ExpenseCategoryMapper.toDomain', () => {
  const date = new Date('2026-01-15T10:00:00.000Z');

  it('maps every prisma column onto the domain entity', () => {
    const category = ExpenseCategoryMapper.toDomain({
      id: 'cat-1',
      parentId: 'cat-parent',
      name: 'Ushqime',
      isConnectedToStore: true,
      createdAt: date,
      updatedAt: date,
    } as never);

    expect(category.id).toBe('cat-1');
    expect(category.parentId).toBe('cat-parent');
    expect(category.name).toBe('Ushqime');
    expect(category.isConnectedToStore).toBe(true);
    expect(category.createdAt).toBe(date);
    expect(category.updatedAt).toBe(date);
  });
});
