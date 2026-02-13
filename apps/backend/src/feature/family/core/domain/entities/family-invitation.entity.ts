export enum FamilyInvitationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

export interface FamilyInvitationProps {
  id: string;
  familyId: string;
  inviterId: string;
  inviteeId?: string;
  inviteeEmail: string;
  status: FamilyInvitationStatus;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class FamilyInvitation {
  private readonly props: FamilyInvitationProps;

  constructor(props: FamilyInvitationProps) {
    this.validate(props);
    this.props = props;
  }

  private validate(props: FamilyInvitationProps): void {
    if (!props.id || props.id.trim() === '') {
      throw new Error('Invitation ID is required');
    }

    if (!props.familyId || props.familyId.trim() === '') {
      throw new Error('Family ID is required');
    }

    if (!props.inviterId || props.inviterId.trim() === '') {
      throw new Error('Inviter ID is required');
    }

    if (!props.inviteeEmail || !props.inviteeEmail.includes('@')) {
      throw new Error('Valid invitee email is required');
    }

    if (!props.status) {
      throw new Error('Status is required');
    }

    if (!props.expiresAt) {
      throw new Error('Expiration date is required');
    }

    if (!props.createdAt) {
      throw new Error('Created date is required');
    }

    if (!props.updatedAt) {
      throw new Error('Updated date is required');
    }
  }

  get id(): string {
    return this.props.id;
  }

  get familyId(): string {
    return this.props.familyId;
  }

  get inviterId(): string {
    return this.props.inviterId;
  }

  get inviteeId(): string | undefined {
    return this.props.inviteeId;
  }

  get inviteeEmail(): string {
    return this.props.inviteeEmail;
  }

  get status(): FamilyInvitationStatus {
    return this.props.status;
  }

  get expiresAt(): Date {
    return this.props.expiresAt;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  // Status helpers
  isPending(): boolean {
    return this.props.status === FamilyInvitationStatus.PENDING;
  }

  isExpired(): boolean {
    return new Date() > this.props.expiresAt;
  }

  canBeAccepted(): boolean {
    return this.isPending() && !this.isExpired();
  }

  canBeDeclined(): boolean {
    return this.isPending() && !this.isExpired();
  }

  canBeCancelled(): boolean {
    return this.isPending() && !this.isExpired();
  }

  toJSON() {
    return {
      id: this.props.id,
      familyId: this.props.familyId,
      inviterId: this.props.inviterId,
      inviteeId: this.props.inviteeId,
      inviteeEmail: this.props.inviteeEmail,
      status: this.props.status,
      expiresAt: this.props.expiresAt,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }
}
