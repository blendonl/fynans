import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DomainForbiddenException } from '~common/exceptions/domain.exceptions';
import { type IIncomeCategoryRepository } from '../../domain/repositories/income-category.repository.interface';
import { UpdateIncomeCategoryDto } from '../dto/update-income-category.dto';
import { IncomeCategory } from '../../domain/entities/income-category.entity';

@Injectable()
export class UpdateIncomeCategoryUseCase {
  constructor(
    @Inject('IncomeCategoryRepository')
    private readonly incomeCategoryRepository: IIncomeCategoryRepository,
  ) {}

  async execute(
    id: string,
    dto: UpdateIncomeCategoryDto,
    userId: string,
  ): Promise<IncomeCategory> {
    const category = await this.incomeCategoryRepository.findById(id);

    if (!category) {
      throw new NotFoundException('Income category not found');
    }

    if (category.userId !== userId) {
      throw new DomainForbiddenException(
        'Income category does not belong to this user',
      );
    }

    await this.validate(id, dto, userId);

    const updated = await this.incomeCategoryRepository.update(id, {
      name: dto.name,
      parentId: dto.parentId,
    });

    return updated;
  }

  private async validate(
    id: string,
    dto: UpdateIncomeCategoryDto,
    userId: string,
  ): Promise<void> {
    if (dto.name) {
      const existingCategory =
        await this.incomeCategoryRepository.findOwnedByName(dto.name, userId);
      if (existingCategory && existingCategory.id !== id) {
        throw new BadRequestException('Category name must be unique');
      }
    }

    if (dto.parentId !== undefined) {
      if (dto.parentId === id) {
        throw new BadRequestException('Category cannot be its own parent');
      }

      if (dto.parentId !== null) {
        const parent = await this.incomeCategoryRepository.findById(
          dto.parentId,
        );
        if (!parent || parent.userId !== userId) {
          throw new BadRequestException('Parent category not found');
        }

        await this.checkCircularReference(id, dto.parentId);
      }
    }
  }

  private async checkCircularReference(
    categoryId: string,
    newParentId: string,
  ): Promise<void> {
    let currentId: string | null = newParentId;

    while (currentId !== null) {
      if (currentId === categoryId) {
        throw new BadRequestException('Circular reference detected');
      }

      const current = await this.incomeCategoryRepository.findById(currentId);
      if (!current) {
        break;
      }
      currentId = current.parentId;
    }
  }
}
