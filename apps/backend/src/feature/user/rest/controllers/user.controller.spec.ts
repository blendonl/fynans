import { Server } from 'http';
import { INestApplication } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AllExceptionsFilter } from '~common/filters/all-exceptions.filter';
import { withoutCorrelationId } from '~common/filters/testing/without-correlation-id';
import {
  FAMILY_MEMBERSHIP_REPOSITORY,
  IFamilyMembershipRepository,
} from '~common/authorization/domain/repositories/family-membership.repository.interface';
import { UserService } from '../../core/application/services/user.service';
import { GetVisibleUserUseCase } from '../../core/application/use-cases/get-visible-user.use-case';
import { IUserRepository } from '../../core/domain/repositories/user.repository.interface';
import { User } from '../../core/domain/entities/user.entity';
import { UserController } from './user.controller';

const USER_A = 'user-a';
const USER_B = 'user-b';
const USER_C = 'user-c';

function userOf(id: string): User {
  return new User({
    id,
    email: `${id}@example.com`,
    firstName: 'Test',
    lastName: 'User',
    emailVerified: true,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  });
}

interface UserResponseBody {
  email?: string;
}

const CO_MEMBERS: Record<string, string[]> = {
  [USER_A]: [USER_A, USER_C],
  [USER_C]: [USER_A, USER_C],
};

describe('UserController authorization', () => {
  let app: INestApplication;
  let server: Server;
  let currentUserId: string;

  const userRepository: IUserRepository = {
    findById: (id: string) =>
      Promise.resolve(
        [USER_A, USER_B, USER_C].includes(id) ? userOf(id) : null,
      ),
    findByEmail: () => Promise.resolve(null),
    search: () => Promise.resolve([]),
  };

  const familyMembershipRepository: IFamilyMembershipRepository = {
    isMember: () => Promise.resolve(false),
    findFamilyIds: () => Promise.resolve([]),
    findRole: () => Promise.resolve(null),
    findCoMemberUserIds: (userId: string) =>
      Promise.resolve(CO_MEMBERS[userId] ?? [userId]),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        { provide: 'UserRepository', useValue: userRepository },
        {
          provide: FAMILY_MEMBERSHIP_REPOSITORY,
          useValue: familyMembershipRepository,
        },
        GetVisibleUserUseCase,
        UserService,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.use((req: Request, _res: Response, next: NextFunction) => {
      (req as Request & { user: { id: string } }).user = { id: currentUserId };
      next();
    });
    app.useGlobalFilters(new AllExceptionsFilter());

    server = app.getHttpServer() as Server;

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('lets a user read their own record', async () => {
    currentUserId = USER_A;

    const response = await request(server).get(`/users/${USER_A}`).expect(200);

    expect((response.body as UserResponseBody).email).toBe(
      `${USER_A}@example.com`,
    );
  });

  it('never exposes a balance', async () => {
    currentUserId = USER_A;

    const response = await request(server).get(`/users/${USER_A}`).expect(200);

    expect(response.body).not.toHaveProperty('balance');
  });

  it('lets a family co-member read the record', async () => {
    currentUserId = USER_C;

    const response = await request(server).get(`/users/${USER_A}`).expect(200);

    expect((response.body as UserResponseBody).email).toBe(
      `${USER_A}@example.com`,
    );
  });

  it("denies an unrelated user another account's record", async () => {
    currentUserId = USER_B;

    await request(server).get(`/users/${USER_A}`).expect(404);
  });

  it('reports an unknown account the same way as a forbidden one', async () => {
    currentUserId = USER_B;

    const forbidden = await request(server).get(`/users/${USER_A}`);
    const unknown = await request(server).get('/users/does-not-exist');

    expect(unknown.status).toBe(forbidden.status);
    expect(withoutCorrelationId(unknown.body)).toEqual(
      withoutCorrelationId(forbidden.body),
    );
    expect(unknown.body.correlationId).toEqual(expect.any(String));
  });
});
