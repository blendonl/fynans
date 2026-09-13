import { Decimal } from 'prisma/generated/prisma/internal/prismaNamespace';
import { DomainValidationException } from '~common/exceptions/domain.exceptions';

export enum FamilyMemberRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

interface FamilyMemberProps {
  id: string;
  familyId: string;
  userId: string;
  role: FamilyMemberRole;
  balance: Decimal;
  joinedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class FamilyMember {
  private readonly props: FamilyMemberProps;

  constructor(props: FamilyMemberProps) {
    this.validate(props);
    this.props = props;
  }

  private validate(props: FamilyMemberProps): void {
    if (!props.id || props.id.trim() === '') {
      throw new DomainValidationException('FamilyMember ID is required');
    }

    if (!props.familyId || props.familyId.trim() === '') {
      throw new DomainValidationException('Family ID is required');
    }

    if (!props.userId || props.userId.trim() === '') {
      throw new DomainValidationException('User ID is required');
    }

    if (!props.role) {
      throw new DomainValidationException('Role is required');
    }

    if (!props.joinedAt) {
      throw new DomainValidationException('Joined date is required');
    }

    if (!props.createdAt) {
      throw new DomainValidationException('Created date is required');
    }

    if (!props.updatedAt) {
      throw new DomainValidationException('Updated date is required');
    }
  }

  get id(): string {
    return this.props.id;
  }

  get familyId(): string {
    return this.props.familyId;
  }

  get userId(): string {
    return this.props.userId;
  }

  get role(): FamilyMemberRole {
    return this.props.role;
  }

  get balance(): Decimal {
    return this.props.balance;
  }

  get joinedAt(): Date {
    return this.props.joinedAt;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  isOwner(): boolean {
    return this.props.role === FamilyMemberRole.OWNER;
  }

  isAdmin(): boolean {
    return this.props.role === FamilyMemberRole.ADMIN;
  }

  canManageMembers(): boolean {
    return this.isOwner() || this.isAdmin();
  }

  toJSON() {
    return {
      id: this.props.id,
      familyId: this.props.familyId,
      userId: this.props.userId,
      role: this.props.role,
      balance: this.props.balance,
      joinedAt: this.props.joinedAt,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }
}
