import { Request } from 'express';
import { User } from '~feature/user/core/domain/entities/user.entity';

export interface AuthenticatedRequest extends Request {
  user: User;
}
