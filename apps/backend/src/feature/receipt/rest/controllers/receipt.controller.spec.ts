import { NotFoundException } from '@nestjs/common';
import { firstValueFrom, toArray } from 'rxjs';
import { ReceiptController } from './receipt.controller';

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
