export interface StoredReceiptProps {
  id: string;
  userId: string;
  familyId: string | null;
  expenseId: string | null;
  fileName: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  storageKey: string;
  createdAt: Date;
  updatedAt: Date;
}

export class StoredReceipt {
  private readonly props: StoredReceiptProps;

  constructor(props: StoredReceiptProps) {
    this.validate(props);
    this.props = props;
  }

  private validate(props: StoredReceiptProps): void {
    if (!props.id || props.id.trim() === '') {
      throw new Error('Receipt ID is required');
    }

    if (!props.userId || props.userId.trim() === '') {
      throw new Error('User ID is required');
    }

    if (!props.fileName || props.fileName.trim() === '') {
      throw new Error('File name is required');
    }

    if (!props.storageKey || props.storageKey.trim() === '') {
      throw new Error('Storage key is required');
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

  get userId(): string {
    return this.props.userId;
  }

  get familyId(): string | null {
    return this.props.familyId;
  }

  get expenseId(): string | null {
    return this.props.expenseId;
  }

  get fileName(): string {
    return this.props.fileName;
  }

  get originalName(): string {
    return this.props.originalName;
  }

  get mimeType(): string {
    return this.props.mimeType;
  }

  get fileSize(): number {
    return this.props.fileSize;
  }

  get storageKey(): string {
    return this.props.storageKey;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  toJSON() {
    return {
      id: this.props.id,
      userId: this.props.userId,
      familyId: this.props.familyId,
      expenseId: this.props.expenseId,
      fileName: this.props.fileName,
      originalName: this.props.originalName,
      mimeType: this.props.mimeType,
      fileSize: this.props.fileSize,
      storageKey: this.props.storageKey,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }
}
