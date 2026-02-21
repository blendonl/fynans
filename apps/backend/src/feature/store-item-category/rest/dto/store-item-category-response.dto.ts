import { ApiProperty } from '@nestjs/swagger';
import { StoreItemCategory } from '../../core/domain/entities/store-item-category.entity';

export class StoreItemCategoryResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ nullable: true })
  parentId: string | null;

  @ApiProperty()
  name: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  static fromEntity(category: StoreItemCategory): StoreItemCategoryResponseDto {
    const dto = new StoreItemCategoryResponseDto();
    dto.id = category.id;
    dto.parentId = category.parentId;
    dto.name = category.name;
    dto.createdAt = category.createdAt;
    dto.updatedAt = category.updatedAt;
    return dto;
  }

  static fromEntities(
    categories: StoreItemCategory[],
  ): StoreItemCategoryResponseDto[] {
    return categories.map((category) => this.fromEntity(category));
  }
}
