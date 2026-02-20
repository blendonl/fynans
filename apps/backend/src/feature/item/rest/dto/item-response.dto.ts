import { Item } from '../../core/domain/entities/item.entity';

export class ItemResponseDto {
  id: string;
  name: string;
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(item: Item): ItemResponseDto {
    const dto = new ItemResponseDto();
    dto.id = item.id;
    dto.name = item.name;
    dto.categoryId = item.categoryId;
    dto.createdAt = item.createdAt;
    dto.updatedAt = item.updatedAt;
    return dto;
  }

  static fromEntities(items: Item[]): ItemResponseDto[] {
    return items.map((item) => this.fromEntity(item));
  }
}
