import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DomainForbiddenException } from '~common/exceptions/domain.exceptions';
import { type IIncomeCategoryRepository } from '../../domain/repositories/income-category.repository.interface';

@Injectable()
export class DeleteIncomeCategoryUseCase {
  constructor(
    @Inject('IncomeCategoryRepository')
    private readonly incomeCategoryRepository: IIncomeCategoryRepository,
  ) {}

  async execute(id: string, userId: string): Promise<void> {
    const category = await this.incomeCategoryRepository.findById(id);

    if (!category) {
      throw new NotFoundException('Income category not found');
    }

    const linked = await this.incomeCategoryRepository.isLinkedToUser(
      id,
      userId,
    );
    if (!linked) {
      throw new DomainForbiddenException(
        'Income category does not belong to this user',
      );
    }

    await this.validate(id);

    await this.incomeCategoryRepository.delete(id);
  }

  private async validate(id: string): Promise<void> {
    const children = await this.incomeCategoryRepository.findChildren(id);
    if (children.length > 0) {
      throw new BadRequestException(
        'Cannot delete category with child categories',
      );
    }
  }
}
