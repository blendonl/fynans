import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { PaymentMethodService } from '../../core/application/services/payment-method.service';
import { CreatePaymentMethodRequestDto } from '../dto/create-payment-method-request.dto';
import { UpdatePaymentMethodRequestDto } from '../dto/update-payment-method-request.dto';
import { PaymentMethodResponseDto } from '../dto/payment-method-response.dto';
import { CreatePaymentMethodDto } from '../../core/application/dto/create-payment-method.dto';
import { UpdatePaymentMethodDto } from '../../core/application/dto/update-payment-method.dto';
import { CurrentUser } from '../../../auth/rest/decorators/current-user.decorator';
import { User } from '../../../user/core/domain/entities/user.entity';

@ApiTags('PaymentMethod')
@ApiBearerAuth('bearer')
@Controller('payment-methods')
export class PaymentMethodController {
  constructor(
    private readonly paymentMethodService: PaymentMethodService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new payment method' })
  @ApiResponse({ status: 201, type: PaymentMethodResponseDto })
  async create(
    @Body() createDto: CreatePaymentMethodRequestDto,
    @CurrentUser() user: User,
  ) {
    const coreDto = new CreatePaymentMethodDto(
      user.id,
      createDto.name,
      createDto.type,
      createDto.color,
      createDto.initialBalance,
    );

    const paymentMethod = await this.paymentMethodService.create(coreDto);
    return PaymentMethodResponseDto.fromEntity(paymentMethod);
  }

  @Get()
  @ApiOperation({ summary: 'Get all payment methods' })
  @ApiResponse({ status: 200, type: [PaymentMethodResponseDto] })
  async findAll(@CurrentUser() user: User) {
    const paymentMethods = await this.paymentMethodService.findAll(user.id);
    return PaymentMethodResponseDto.fromEntities(paymentMethods);
  }

  @Get('balance-summary')
  @ApiOperation({ summary: 'Get balance summary' })
  @ApiResponse({ status: 200 })
  async getBalanceSummary(@CurrentUser() user: User) {
    const summary = await this.paymentMethodService.getBalanceSummary(user.id);
    return summary.map((item) => ({
      id: item.id,
      name: item.name,
      color: item.color,
      currentBalance: Number(item.currentBalance),
    }));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a payment method by ID' })
  @ApiResponse({ status: 200, type: PaymentMethodResponseDto })
  async findOne(@Param('id') id: string, @CurrentUser() user: User) {
    const paymentMethod = await this.paymentMethodService.findById(id, user.id);
    return PaymentMethodResponseDto.fromEntity(paymentMethod);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a payment method' })
  @ApiResponse({ status: 200, type: PaymentMethodResponseDto })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdatePaymentMethodRequestDto,
    @CurrentUser() user: User,
  ) {
    const coreDto = new UpdatePaymentMethodDto({
      name: updateDto.name,
      type: updateDto.type,
      color: updateDto.color,
      initialBalance: updateDto.initialBalance,
    });

    const paymentMethod = await this.paymentMethodService.update(
      id,
      user.id,
      coreDto,
    );
    return PaymentMethodResponseDto.fromEntity(paymentMethod);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a payment method' })
  @ApiResponse({ status: 204 })
  async remove(@Param('id') id: string, @CurrentUser() user: User) {
    await this.paymentMethodService.delete(id, user.id);
  }
}
