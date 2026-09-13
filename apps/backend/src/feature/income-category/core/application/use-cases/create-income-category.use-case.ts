import { Injectable, Inject } from '@nestjs/common';
import { DomainValidationException } from '~common/exceptions/domain.exceptions';
import { type IIncomeCategoryRepository } from '../../domain/repositories/income-category.repository.interface';
import { CreateIncomeCategoryDto } from '../dto/create-income-category.dto';
import { IncomeCategory } from '../../domain/entities/income-category.entity';

@Injectable()
export class CreateIncomeCategoryUseCase {
  constructor(
    @Inject('IncomeCategoryRepository')
    private readonly incomeCategoryRepository: IIncomeCategoryRepository,
  ) {}

  async execute(
    dto: CreateIncomeCategoryDto,
    userId: string,
  ): Promise<IncomeCategory> {
    await this.validate(dto, userId);

    const existing = await this.incomeCategoryRepository.findOwnedByName(
      dto.name,
      userId,
    );
    if (existing) {
      return existing;
    }

    return this.incomeCategoryRepository.create({
      userId,
      name: dto.name,
      parentId: dto.parentId ?? null,
    });
  }

  private async validate(
    dto: CreateIncomeCategoryDto,
    userId: string,
  ): Promise<void> {
    if (!dto.name || dto.name.trim() === '') {
      throw new DomainValidationException('Category name is required');
    }

    if (dto.parentId) {
      const parent = await this.incomeCategoryRepository.findById(dto.parentId);
      if (!parent || parent.userId !== userId) {
        throw new DomainValidationException('Parent category not found');
      }
    }
  }
}
