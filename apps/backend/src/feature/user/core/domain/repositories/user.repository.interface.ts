import { User } from '../entities/user.entity';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  search(query: string, excludeFamilyId?: string, limit?: number): Promise<User[]>;
}
