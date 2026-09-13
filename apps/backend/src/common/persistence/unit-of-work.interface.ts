export const UNIT_OF_WORK = 'UnitOfWork';

export interface IUnitOfWork {
  runInTransaction<T>(work: () => Promise<T>): Promise<T>;
}
