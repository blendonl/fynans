import { User } from '../entities/user.entity';

export interface UserProfileChanges {
  firstName?: string;
  lastName?: string;
  image?: string | null;
  email?: string;
  emailVerified?: boolean;
}

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  search(query: string, excludeFamilyId?: string, limit?: number): Promise<User[]>;
  update(id: string, changes: UserProfileChanges): Promise<User>;
}
