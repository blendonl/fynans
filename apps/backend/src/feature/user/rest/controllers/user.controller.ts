import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserService } from '../../core/application/services/user.service';
import { UserResponseDto, UserSearchResponseDto } from '../dto/user-response.dto';

@ApiTags('Users')
@ApiBearerAuth('bearer')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('search')
  @ApiOperation({ summary: 'Search users by query' })
  @ApiResponse({ status: 200, type: [UserSearchResponseDto] })
  async search(
    @Query('q') query: string,
    @Query('excludeFamilyId') excludeFamilyId?: string,
  ) {
    const users = await this.userService.search(query, excludeFamilyId);
    return users.map(UserSearchResponseDto.fromEntity);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  async findOne(@Param('id') id: string) {
    const user = await this.userService.findById(id);
    return UserResponseDto.fromEntity(user);
  }
}
