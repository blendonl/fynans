import { ApiProperty } from '@nestjs/swagger';
import { Store } from '../../core/domain/entities/store.entity';

export class StoreResponseDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    name: string;

    @ApiProperty()
    location: string;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;

    static fromEntity(store: Store): StoreResponseDto {
        const dto = new StoreResponseDto();
        dto.id = store.id;
        dto.name = store.name;
        dto.location = store.location;
        dto.createdAt = store.createdAt;
        dto.updatedAt = store.updatedAt;
        return dto;
    }

    static fromEntities(stores: Store[]): StoreResponseDto[] {
        return stores.map((store) => this.fromEntity(store));
    }
}
