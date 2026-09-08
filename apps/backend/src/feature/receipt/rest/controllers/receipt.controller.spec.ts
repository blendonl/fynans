import { BadRequestException, NotFoundException } from '@nestjs/common';
import { firstValueFrom, toArray } from 'rxjs';
import { ReceiptController } from './receipt.controller';
import { DomainForbiddenException } from '~common/exceptions/domain.exceptions';

const owner = { id: 'owner-1' };
const attacker = { id: 'attacker-1' };

describe('ReceiptController job scoping', () => {
  let receiptJobQueue: {
    findJobOwnerId: jest.Mock;
    getJobResult: jest.Mock;
    streamJobProgress: jest.Mock;
    addJob: jest.Mock;
  };
  let saveReceiptFileUseCase: { execute: jest.Mock };
  let controller: ReceiptController;
  const req = { on: jest.fn() };

  beforeEach(() => {
    receiptJobQueue = {
      findJobOwnerId: jest.fn().mockResolvedValue(owner.id),
      getJobResult: jest.fn().mockResolvedValue({ status: 'active', progress: 40 }),
      streamJobProgress: jest.fn().mockImplementation((_jobId, onEvent) => {
        onEvent({ status: 'completed', progress: 100 });
        return Promise.resolve();
      }),
      addJob: jest.fn().mockResolvedValue('7'),
    };
    saveReceiptFileUseCase = { execute: jest.fn() };
    controller = new ReceiptController(
      receiptJobQueue as never,
      saveReceiptFileUseCase as never,
    );
  });

  describe('getJobStatus', () => {
    it("404s on another user's job instead of returning its parsed receipt", async () => {
      await expect(
        controller.getJobStatus('7', attacker as never),
      ).rejects.toBeInstanceOf(NotFoundException);

      expect(receiptJobQueue.getJobResult).not.toHaveBeenCalled();
    });

    it('404s on a job that no longer exists', async () => {
      receiptJobQueue.findJobOwnerId.mockResolvedValue(null);

      await expect(
        controller.getJobStatus('7', owner as never),
      ).rejects.toBeInstanceOf(NotFoundException);

      expect(receiptJobQueue.getJobResult).not.toHaveBeenCalled();
    });

    it('returns the job to its owner', async () => {
      await expect(controller.getJobStatus('7', owner as never)).resolves.toEqual({
        status: 'active',
        progress: 40,
      });
    });
  });

  describe('processReceipt', () => {
    const file = {
      buffer: Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00]),
      originalname: 'receipt.jpg',
      mimetype: 'image/jpeg',
    };

    it('rejects a payload that only claims to be a JPEG', async () => {
      await expect(
        controller.processReceipt(
          { ...file, buffer: Buffer.from('<?php ?>') } as never,
          {} as never,
          owner as never,
          req as never,
        ),
      ).rejects.toBeInstanceOf(BadRequestException);

      expect(receiptJobQueue.addJob).not.toHaveBeenCalled();
    });

    it('surfaces a rejected familyId instead of queueing the job anyway', async () => {
      saveReceiptFileUseCase.execute.mockRejectedValue(
        new DomainForbiddenException('Not a member of this family'),
      );

      await expect(
        controller.processReceipt(
          file as never,
          { familyId: 'someone-elses-family' } as never,
          attacker as never,
          req as never,
        ),
      ).rejects.toBeInstanceOf(DomainForbiddenException);

      expect(receiptJobQueue.addJob).not.toHaveBeenCalled();
    });

    it('still swallows storage failures and queues the job', async () => {
      saveReceiptFileUseCase.execute.mockRejectedValue(new Error('minio down'));

      await expect(
        controller.processReceipt(file as never, {} as never, owner as never, req as never),
      ).resolves.toEqual({ jobId: '7', status: 'processing', receiptId: undefined });

      expect(receiptJobQueue.addJob).toHaveBeenCalled();
    });
  });

  describe('streamJobProgress', () => {
    it("404s before opening a stream for another user's job", async () => {
      await expect(
        controller.streamJobProgress('7', attacker as never, req as never),
      ).rejects.toBeInstanceOf(NotFoundException);

      expect(receiptJobQueue.streamJobProgress).not.toHaveBeenCalled();
    });

    it('streams the job to its owner', async () => {
      const stream = await controller.streamJobProgress(
        '7',
        owner as never,
        req as never,
      );

      const events = await firstValueFrom(stream.pipe(toArray()));

      expect(receiptJobQueue.streamJobProgress).toHaveBeenCalled();
      expect(events).toEqual([
        { data: { status: 'completed', progress: 100 } },
      ]);
    });
  });
});
