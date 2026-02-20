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
import { PaymentMethodService } from '../../core/application/services/payment-method.service';
import { CreatePaymentMethodRequestDto } from '../dto/create-payment-method-request.dto';
import { UpdatePaymentMethodRequestDto } from '../dto/update-payment-method-request.dto';
import { PaymentMethodResponseDto } from '../dto/payment-method-response.dto';
import { CreatePaymentMethodDto } from '../../core/application/dto/create-payment-method.dto';
import { UpdatePaymentMethodDto } from '../../core/application/dto/update-payment-method.dto';
import { CurrentUser } from '../../../auth/rest/decorators/current-user.decorator';
import { User } from '../../../user/core/domain/entities/user.entity';

@Controller('payment-methods')
export class PaymentMethodController {
  constructor(
    private readonly paymentMethodService: PaymentMethodService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
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
  async findAll(@CurrentUser() user: User) {
    const paymentMethods = await this.paymentMethodService.findAll(user.id);
    return PaymentMethodResponseDto.fromEntities(paymentMethods);
  }

  @Get('balance-summary')
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
  async findOne(@Param('id') id: string, @CurrentUser() user: User) {
    const paymentMethod = await this.paymentMethodService.findById(id, user.id);
    return PaymentMethodResponseDto.fromEntity(paymentMethod);
  }

  @Put(':id')
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
  async remove(@Param('id') id: string, @CurrentUser() user: User) {
    await this.paymentMethodService.delete(id, user.id);
  }
}
