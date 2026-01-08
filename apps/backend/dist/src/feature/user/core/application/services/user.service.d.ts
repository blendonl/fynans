import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { User } from '../../domain/entities/user.entity';
export declare class UserService {
    private readonly userRepository;
    constructor(userRepository: IUserRepository);
    findById(id: string): Promise<User>;
    findByEmail(email: string): Promise<User | null>;
    search(query: string, excludeFamilyId?: string, limit?: number): Promise<User[]>;
}
