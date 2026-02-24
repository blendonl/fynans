import { Injectable } from '@nestjs/common';
import { PrismaService } from '~common/prisma/prisma.service';
import { Pagination, PaginatedResult } from '~common/dto/pagination.dto';
import {
  IStoredReceiptRepository,
  StoredReceiptFilters,
} from '../../domain/repositories/stored-receipt.repository.interface';
import { StoredReceipt } from '../../domain/entities/stored-receipt.entity';
import { StoredReceiptMapper } from '../mappers/stored-receipt.mapper';
import { Prisma } from 'prisma/generated/prisma/client';

@Injectable()
export class PrismaStoredReceiptRepository implements IStoredReceiptRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    id: string;
    userId: string;
    familyId?: string;
    expenseId?: string;
    fileName: string;
    originalName: string;
    mimeType: string;
    fileSize: number;
    storageKey: string;
  }): Promise<StoredReceipt> {
    const receipt = await this.prisma.receipt.create({
      data: {
        id: data.id,
        userId: data.userId,
        familyId: data.familyId ?? null,
        expenseId: data.expenseId ?? null,
        fileName: data.fileName,
        originalName: data.originalName,
        mimeType: data.mimeType,
        fileSize: data.fileSize,
        storageKey: data.storageKey,
      },
    });

    return StoredReceiptMapper.toDomain(receipt);
  }

  async findById(id: string): Promise<StoredReceipt | null> {
    const receipt = await this.prisma.receipt.findUnique({
      where: { id },
    });

    return receipt ? StoredReceiptMapper.toDomain(receipt) : null;
  }

  async findAll(
    filters?: StoredReceiptFilters,
    pagination?: Pagination,
  ): Promise<PaginatedResult<StoredReceipt>> {
    const where = this.buildWhereClause(filters);

    const [receipts, total] = await Promise.all([
      this.prisma.receipt.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: pagination?.skip,
        take: pagination?.take,
      }),
      this.prisma.receipt.count({ where }),
    ]);

    return {
      data: receipts.map(StoredReceiptMapper.toDomain),
      total,
      page: pagination?.page ?? 1,
      limit: pagination?.limit ?? 10,
    };
  }

  async update(
    id: string,
    data: Partial<{ expenseId: string | null }>,
  ): Promise<StoredReceipt> {
    const receipt = await this.prisma.receipt.update({
      where: { id },
      data,
    });

    return StoredReceiptMapper.toDomain(receipt);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.receipt.delete({
      where: { id },
    });
  }

  async verifyOwnership(
    receiptId: string,
    userId: string,
  ): Promise<boolean> {
    const receipt = await this.prisma.receipt.findUnique({
      where: { id: receiptId },
    });

    if (!receipt) return false;

    if (receipt.userId === userId) return true;

    // Family membership check for family-scoped receipts
    if (receipt.familyId) {
      const membership = await this.prisma.familyMember.findUnique({
        where: {
          familyId_userId: {
            familyId: receipt.familyId,
            userId,
          },
        },
      });
      return !!membership;
    }

    return false;
  }

  private buildWhereClause(
    filters?: StoredReceiptFilters,
  ): Prisma.ReceiptWhereInput {
    if (!filters) return {};

    const where: Prisma.ReceiptWhereInput = {};

    if (filters.userId) {
      where.userId = filters.userId;
    }

    if (filters.familyId) {
      where.familyId = filters.familyId;
    }

    if (filters.expenseId) {
      where.expenseId = filters.expenseId;
    }

    return where;
  }
}
