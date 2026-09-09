import {
  DeliveryMethod,
  NotificationPriority,
  NotificationType,
} from '../../domain/value-objects/notification-type.vo';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { CreateNotificationsUseCase } from './create-notifications.use-case';

const recipients = ['user-1', 'user-2', 'user-3'];

const dtoFor = (userId: string): CreateNotificationDto =>
  ({
    userId,
    type: NotificationType.FAMILY_MEMBER_LEFT,
    data: { familyId: 'family-1' },
    deliveryMethods: [DeliveryMethod.IN_APP, DeliveryMethod.PUSH],
    priority: NotificationPriority.LOW,
    familyId: 'family-1',
  }) as CreateNotificationDto;

describe('CreateNotificationsUseCase', () => {
  let repository: { createMany: jest.Mock; create: jest.Mock };
  let templateService: { generateTemplate: jest.Mock };
  let deliveryService: { deliver: jest.Mock };
  let useCase: CreateNotificationsUseCase;

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      createMany: jest
        .fn()
        .mockImplementation((rows: { userId: string }[]) =>
          Promise.resolve(rows),
        ),
    };
    templateService = {
      generateTemplate: jest.fn().mockReturnValue({
        title: 'Anëtari u largua',
        message: 'Një anëtar u largua nga familja',
        actionUrl: '/families/family-1',
      }),
    };
    deliveryService = { deliver: jest.fn().mockResolvedValue(undefined) };
    useCase = new CreateNotificationsUseCase(
      repository as never,
      templateService as never,
      deliveryService as never,
    );
    jest.spyOn(useCase['logger'], 'error').mockImplementation(() => undefined);
  });

  it('writes every recipient in a single repository call', async () => {
    await useCase.execute(recipients.map(dtoFor));

    expect(repository.createMany).toHaveBeenCalledTimes(1);
    expect(repository.create).not.toHaveBeenCalled();
    expect(repository.createMany.mock.calls[0][0]).toHaveLength(3);
  });

  it('gives each notification its own id', async () => {
    await useCase.execute(recipients.map(dtoFor));

    const rows = repository.createMany.mock.calls[0][0] as { id: string }[];

    expect(new Set(rows.map((row) => row.id)).size).toBe(3);
  });

  it('renders the template for each recipient', async () => {
    await useCase.execute(recipients.map(dtoFor));

    expect(templateService.generateTemplate).toHaveBeenCalledTimes(3);
    const rows = repository.createMany.mock.calls[0][0] as { title: string }[];
    expect(rows.every((row) => row.title === 'Anëtari u largua')).toBe(true);
  });

  it('still delivers to every recipient', async () => {
    await useCase.execute(recipients.map(dtoFor));

    expect(deliveryService.deliver).toHaveBeenCalledTimes(3);
  });

  it('does not touch the database for an empty list', async () => {
    await expect(useCase.execute([])).resolves.toEqual([]);

    expect(repository.createMany).not.toHaveBeenCalled();
  });

  it('keeps the other recipients when one delivery fails', async () => {
    deliveryService.deliver
      .mockRejectedValueOnce(new Error('push token expired'))
      .mockResolvedValue(undefined);

    const created = await useCase.execute(recipients.map(dtoFor));

    expect(created).toHaveLength(3);
    expect(deliveryService.deliver).toHaveBeenCalledTimes(3);
  });
});
