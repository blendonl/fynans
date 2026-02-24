import { Injectable, Inject } from '@nestjs/common';
import { IBasketRepository } from '../../domain/repositories/basket.repository.interface';
import { FamilyService } from '../../../../family/core/application/services/family.service';
import { Basket } from '../../domain/entities/basket.entity';

@Injectable()
export class ListBasketsUseCase {
  constructor(
    @Inject('BasketRepository')
    private readonly basketRepository: IBasketRepository,
    private readonly familyService: FamilyService,
  ) {}

  async execute(userId: string): Promise<Basket[]> {
    const personalBasket = await this.basketRepository.upsertPersonal(userId);

    const families = await this.familyService.findByUserId(userId);

    const familyBaskets = await Promise.all(
      families.map((family) =>
        this.basketRepository.upsertFamily(family.id, userId),
      ),
    );

    return [personalBasket, ...familyBaskets];
  }
}
