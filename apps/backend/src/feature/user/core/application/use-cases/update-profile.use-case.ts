import { Inject, Injectable } from '@nestjs/common';
import {
  DomainNotFoundException,
  DomainValidationException,
} from '~common/exceptions/domain.exceptions';
import {
  type IUserRepository,
  UserProfileChanges,
} from '../../domain/repositories/user.repository.interface';
import { User } from '../../domain/entities/user.entity';

export interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  image?: string | null;
}

const MAX_NAME_LENGTH = 100;
const ALLOWED_IMAGE_PROTOCOLS = ['http:', 'https:'];

@Injectable()
export class UpdateProfileUseCase {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(userId: string, input: UpdateProfileInput): Promise<User> {
    const existing = await this.userRepository.findById(userId);

    if (!existing) {
      throw new DomainNotFoundException('User not found');
    }

    const changes: UserProfileChanges = {};

    if (input.firstName !== undefined) {
      changes.firstName = this.normalizeName(input.firstName, 'First name');
    }

    if (input.lastName !== undefined) {
      changes.lastName = this.normalizeName(input.lastName, 'Last name');
    }

    if (input.image !== undefined) {
      changes.image = this.normalizeImage(input.image);
    }

    if (Object.keys(changes).length === 0) {
      return existing;
    }

    return this.userRepository.update(userId, changes);
  }

  private normalizeName(value: string, label: string): string {
    const trimmed = value.trim();

    if (trimmed.length > MAX_NAME_LENGTH) {
      throw new DomainValidationException(
        `${label} must be at most ${MAX_NAME_LENGTH} characters`,
      );
    }

    return trimmed;
  }

  private normalizeImage(value: string | null): string | null {
    if (value === null) {
      return null;
    }

    const trimmed = value.trim();

    if (trimmed === '') {
      return null;
    }

    let parsed: URL;

    try {
      parsed = new URL(trimmed);
    } catch {
      throw new DomainValidationException('Avatar must be a valid URL');
    }

    if (!ALLOWED_IMAGE_PROTOCOLS.includes(parsed.protocol)) {
      throw new DomainValidationException(
        'Avatar must be an http or https URL',
      );
    }

    return parsed.toString();
  }
}
