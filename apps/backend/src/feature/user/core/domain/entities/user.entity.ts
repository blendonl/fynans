import { DomainValidationException } from '~common/exceptions/domain.exceptions';
interface UserProps {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class User {
  private readonly props: UserProps;

  constructor(props: UserProps) {
    this.validate(props);
    this.props = props;
  }

  private validate(props: UserProps): void {
    if (!props.id?.trim())
      throw new DomainValidationException('User ID is required');
    if (!props.email?.includes('@'))
      throw new DomainValidationException('Valid email is required');
    // firstName and lastName can be empty (e.g., OAuth users)
  }

  get id(): string {
    return this.props.id;
  }
  get email(): string {
    return this.props.email;
  }
  get firstName(): string {
    return this.props.firstName;
  }
  get lastName(): string {
    return this.props.lastName;
  }
  get emailVerified(): boolean {
    return this.props.emailVerified;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get fullName(): string {
    const firstName = this.props.firstName?.trim();
    const lastName = this.props.lastName?.trim();

    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    }

    return firstName || lastName || 'Unknown User';
  }

  toJSON() {
    return { ...this.props };
  }
}
