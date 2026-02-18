import { Injectable, Inject } from '@nestjs/common';
import { IBasketRepository } from '../../domain/repositories/basket.repository.interface';
import { IFamilyRepository } from '../../../../family/core/domain/repositories/family.repository.interface';
import { Basket } from '../../domain/entities/basket.entity';

@Injectable()
export class ListBasketsUseCase {
  constructor(
    @Inject('BasketRepository')
    private readonly basketRepository: IBasketRepository,
    @Inject('FamilyRepository')
    private readonly familyRepository: IFamilyRepository,
  ) {}

  async execute(userId: string): Promise<Basket[]> {
    // Upsert personal basket
    const personalBasket = await this.basketRepository.upsertPersonal(userId);

    // Get all families the user belongs to
    const families = await this.familyRepository.findByUserId(userId);

    // Upsert one basket per family
    const familyBaskets = await Promise.all(
      families.map((family) =>
        this.basketRepository.upsertFamily(family.id, userId),
      ),
    );

    return [personalBasket, ...familyBaskets];
  }
}
