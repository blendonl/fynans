import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { TransactionStatus } from '~feature/transaction/core/domain/value-objects/transaction-status.vo';
import { CreateExpenseRequestDto } from './create-expense-request.dto';

const CATEGORY = '11111111-1111-4111-8111-111111111111';
const STORE = '22222222-2222-4222-8222-222222222222';

const parse = (body: Record<string, unknown>) =>
  plainToInstance(CreateExpenseRequestDto, { categoryId: CATEGORY, ...body });

describe('CreateExpenseRequestDto', () => {
  it('no longer accepts the scope field that toCoreDto never read', async () => {
    const pipe = new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    });
    const metadata = {
      type: 'body' as const,
      metatype: CreateExpenseRequestDto,
    };

    const rejection = await pipe
      .transform({ categoryId: CATEGORY, scope: 'FAMILY' }, metadata)
      .then(
        () => null,
        (error: BadRequestException) => error,
      );

    expect(rejection).toBeInstanceOf(BadRequestException);
    expect(JSON.stringify(rejection?.getResponse())).toContain('scope');

    await expect(
      pipe.transform({ categoryId: CATEGORY }, metadata),
    ).resolves.toBeInstanceOf(CreateExpenseRequestDto);
  });

  it('passes an existing storeId through to the core dto', () => {
    const dto = parse({ storeId: STORE });

    expect(validateSync(dto)).toHaveLength(0);
    expect(dto.toCoreDto('user-1').storeId).toBe(STORE);
  });

  it('rejects a storeId that is not a uuid', () => {
    expect(validateSync(parse({ storeId: 'not-a-uuid' }))).not.toHaveLength(0);
  });

  describe('pending', () => {
    it('treats the string "false" as not pending', () => {
      const dto = parse({ pending: 'false' });

      expect(validateSync(dto)).toHaveLength(0);
      expect(dto.toCoreDto('user-1').status).toBeUndefined();
    });

    it('treats the string "true" as pending', () => {
      const dto = parse({ pending: 'true' });

      expect(validateSync(dto)).toHaveLength(0);
      expect(dto.toCoreDto('user-1').status).toBe(TransactionStatus.PENDING);
    });
  });
});
