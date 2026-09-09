import { EventEmitter } from 'events';
import { QueueEvents } from 'bullmq';
import { ReceiptJobQueueService } from './receipt-job-queue.service';

jest.mock('bullmq', () => {
  const { EventEmitter: Emitter } =
    jest.requireActual<typeof import('events')>('events');

  class FakeQueueEvents extends Emitter {
    static instances: FakeQueueEvents[] = [];
    closed = false;

    constructor() {
      super();
      FakeQueueEvents.instances.push(this);
    }

    waitUntilReady(): Promise<void> {
      return Promise.resolve();
    }

    close(): Promise<void> {
      this.closed = true;
      return Promise.resolve();
    }
  }

  return { QueueEvents: FakeQueueEvents };
});

type FakeQueueEvents = EventEmitter & { closed: boolean };
const instances = () =>
  (QueueEvents as unknown as { instances: FakeQueueEvents[] }).instances;

describe('ReceiptJobQueueService QueueEvents sharing', () => {
  let service: ReceiptJobQueueService;
  let job: { id: string; getState: jest.Mock; progress: number };

  beforeEach(() => {
    instances().length = 0;
    job = {
      id: 'job-1',
      getState: jest.fn().mockResolvedValue('active'),
      progress: 0,
    };
    const queue = {
      add: jest.fn().mockResolvedValue({ id: 'job-1' }),
      getJob: jest.fn().mockResolvedValue(job),
    };
    service = new ReceiptJobQueueService(
      queue as never,
      {
        get: jest.fn((_key: string, fallback: unknown) => fallback),
      } as never,
    );
  });

  const subscribe = (jobId: string, signal: AbortSignal) =>
    service.streamJobProgress(jobId, () => undefined, signal);

  const settle = async () => {
    for (let tick = 0; tick < 10; tick += 1) {
      await new Promise((resolve) => setImmediate(resolve));
    }
  };

  it('opens one redis connection no matter how many subscribers there are', async () => {
    const controllers = [
      new AbortController(),
      new AbortController(),
      new AbortController(),
    ];

    const streams = controllers.map((controller, index) =>
      subscribe(`job-${index}`, controller.signal),
    );
    await settle();

    expect(instances()).toHaveLength(1);

    controllers.forEach((controller) => controller.abort());
    await Promise.all(streams);
  });

  it('removes a subscriber listeners on abort without closing the shared connection', async () => {
    const first = new AbortController();
    const second = new AbortController();

    const streams = [
      subscribe('job-0', first.signal),
      subscribe('job-1', second.signal),
    ];
    await settle();

    const shared = instances()[0];
    const before = shared.listenerCount('progress');

    first.abort();
    await streams[0];

    expect(shared.listenerCount('progress')).toBe(before - 1);
    expect(shared.closed).toBe(false);

    second.abort();
    await streams[1];
  });

  it('closes the shared connection on shutdown', async () => {
    const controller = new AbortController();
    const stream = subscribe('job-0', controller.signal);
    await settle();
    controller.abort();
    await stream;

    await service.onModuleDestroy();

    expect(instances()[0].closed).toBe(true);
  });
});
