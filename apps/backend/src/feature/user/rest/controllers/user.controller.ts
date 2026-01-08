import { Controller, Get, Param, Query } from '@nestjs/common';
import { UserService } from '../../core/application/services/user.service';
import { UserResponseDto, UserSearchResponseDto } from '../dto/user-response.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('search')
  async search(
    @Query('q') query: string,
    @Query('excludeFamilyId') excludeFamilyId?: string,
  ) {
    const users = await this.userService.search(query, excludeFamilyId);
    return users.map(UserSearchResponseDto.fromEntity);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.userService.findById(id);
    return UserResponseDto.fromEntity(user);
  }
}
