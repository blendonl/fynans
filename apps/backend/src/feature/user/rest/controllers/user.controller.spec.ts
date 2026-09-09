import { Server } from 'http';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { DomainExceptionFilter } from '~common/filters/domain-exception.filter';
import { DomainValidationException } from '~common/exceptions/domain.exceptions';
import {
  FAMILY_MEMBERSHIP_REPOSITORY,
  IFamilyMembershipRepository,
} from '~common/authorization/domain/repositories/family-membership.repository.interface';
import { UserService } from '../../core/application/services/user.service';
import { GetVisibleUserUseCase } from '../../core/application/use-cases/get-visible-user.use-case';
import { UpdateProfileUseCase } from '../../core/application/use-cases/update-profile.use-case';
import { ChangePasswordUseCase } from '../../core/application/use-cases/change-password.use-case';
import {
  ChangePasswordCommand,
  IPasswordChanger,
  PASSWORD_CHANGER,
} from '../../core/domain/services/password-changer.interface';
import {
  IUserRepository,
  UserProfileChanges,
} from '../../core/domain/repositories/user.repository.interface';
import { User } from '../../core/domain/entities/user.entity';
import { UserController } from './user.controller';

const USER_A = 'user-a';
const USER_B = 'user-b';
const USER_C = 'user-c';

function userOf(id: string, overrides: Partial<UserFields> = {}): User {
  return new User({
    id,
    email: `${id}@example.com`,
    firstName: 'Test',
    lastName: 'User',
    image: null,
    emailVerified: true,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  });
}

interface UserFields {
  email: string;
  firstName: string;
  lastName: string;
  image: string | null;
  emailVerified: boolean;
}

interface UserResponseBody {
  email?: string;
  firstName?: string;
  lastName?: string;
  image?: string | null;
  emailVerified?: boolean;
}

const CO_MEMBERS: Record<string, string[]> = {
  [USER_A]: [USER_A, USER_C],
  [USER_C]: [USER_A, USER_C],
};

describe('UserController', () => {
  let app: INestApplication;
  let server: Server;
  let currentUserId: string;
  let users: Map<string, User>;
  let passwordChanges: ChangePasswordCommand[];
  let passwordChangerError: Error | null;

  const userRepository: IUserRepository = {
    findById: (id: string) => Promise.resolve(users.get(id) ?? null),
    findByEmail: () => Promise.resolve(null),
    search: () => Promise.resolve([]),
    update: (id: string, changes: UserProfileChanges) => {
      const existing = users.get(id);

      if (!existing) {
        return Promise.reject(new Error(`Unknown user ${id}`));
      }

      const updated = userOf(id, {
        email: changes.email ?? existing.email,
        firstName: changes.firstName ?? existing.firstName,
        lastName: changes.lastName ?? existing.lastName,
        image: changes.image === undefined ? existing.image : changes.image,
        emailVerified: changes.emailVerified ?? existing.emailVerified,
      });

      users.set(id, updated);

      return Promise.resolve(updated);
    },
  };

  const familyMembershipRepository: IFamilyMembershipRepository = {
    isMember: () => Promise.resolve(false),
    findFamilyIds: () => Promise.resolve([]),
    findRole: () => Promise.resolve(null),
    findCoMemberUserIds: (userId: string) =>
      Promise.resolve(CO_MEMBERS[userId] ?? [userId]),
  };

  const passwordChanger: IPasswordChanger = {
    changePassword: (command: ChangePasswordCommand) => {
      if (passwordChangerError) {
        return Promise.reject(passwordChangerError);
      }

      passwordChanges.push(command);

      return Promise.resolve({
        sessionCookies: ['better-auth.session_token=rotated; Path=/; HttpOnly'],
      });
    },
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
        { provide: PASSWORD_CHANGER, useValue: passwordChanger },
        GetVisibleUserUseCase,
        UpdateProfileUseCase,
        ChangePasswordUseCase,
        UserService,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.use((req: Request, _res: Response, next: NextFunction) => {
      (req as Request & { user: { id: string } }).user = { id: currentUserId };
      next();
    });
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    app.useGlobalFilters(new DomainExceptionFilter());

    server = app.getHttpServer() as Server;

    await app.init();
  });

  beforeEach(() => {
    users = new Map(
      [USER_A, USER_B, USER_C].map((id) => [id, userOf(id)] as const),
    );
    passwordChanges = [];
    passwordChangerError = null;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('reading another account', () => {
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
      expect(unknown.body).toEqual(forbidden.body);
    });
  });

  describe('GET /users/me', () => {
    it('resolves the account from the session, not a route param', async () => {
      currentUserId = USER_B;

      const response = await request(server).get('/users/me').expect(200);

      expect((response.body as UserResponseBody).email).toBe(
        `${USER_B}@example.com`,
      );
    });

    it('returns the avatar so the client can render it', async () => {
      currentUserId = USER_A;
      users.set(
        USER_A,
        userOf(USER_A, { image: 'https://cdn.example.com/a.png' }),
      );

      const response = await request(server).get('/users/me').expect(200);

      expect((response.body as UserResponseBody).image).toBe(
        'https://cdn.example.com/a.png',
      );
    });
  });

  describe('PATCH /users/me', () => {
    it('updates the name of the signed-in account', async () => {
      currentUserId = USER_A;

      const response = await request(server)
        .patch('/users/me')
        .send({ firstName: 'Blendon', lastName: 'Luta' })
        .expect(200);

      expect(response.body as UserResponseBody).toMatchObject({
        firstName: 'Blendon',
        lastName: 'Luta',
      });
      expect(users.get(USER_A)?.firstName).toBe('Blendon');
    });

    it('leaves every other account untouched', async () => {
      currentUserId = USER_A;

      await request(server)
        .patch('/users/me')
        .send({ firstName: 'Blendon' })
        .expect(200);

      expect(users.get(USER_B)?.firstName).toBe('Test');
      expect(users.get(USER_C)?.firstName).toBe('Test');
    });

    it('rejects an attempt to name a different account in the body', async () => {
      currentUserId = USER_A;

      await request(server)
        .patch('/users/me')
        .send({ id: USER_B, firstName: 'Taken' })
        .expect(400);

      expect(users.get(USER_B)?.firstName).toBe('Test');
    });

    it('rejects an email change, which needs the verification flow', async () => {
      currentUserId = USER_A;

      await request(server)
        .patch('/users/me')
        .send({ email: 'attacker@example.com' })
        .expect(400);

      expect(users.get(USER_A)?.email).toBe(`${USER_A}@example.com`);
    });

    it('stores an https avatar URL', async () => {
      currentUserId = USER_A;

      const response = await request(server)
        .patch('/users/me')
        .send({ image: 'https://cdn.example.com/avatar.png' })
        .expect(200);

      expect((response.body as UserResponseBody).image).toBe(
        'https://cdn.example.com/avatar.png',
      );
    });

    it('clears the avatar when sent null', async () => {
      currentUserId = USER_A;
      users.set(
        USER_A,
        userOf(USER_A, { image: 'https://cdn.example.com/a.png' }),
      );

      const response = await request(server)
        .patch('/users/me')
        .send({ image: null })
        .expect(200);

      expect((response.body as UserResponseBody).image).toBeNull();
    });

    it('rejects a non-http avatar URL', async () => {
      currentUserId = USER_A;

      await request(server)
        .patch('/users/me')
        .send({ image: 'javascript:alert(1)' })
        .expect(400);

      expect(users.get(USER_A)?.image).toBeNull();
    });

    it('never marks an account as email-verified', async () => {
      currentUserId = USER_A;
      users.set(USER_A, userOf(USER_A, { emailVerified: false }));

      const response = await request(server)
        .patch('/users/me')
        .send({ firstName: 'Blendon' })
        .expect(200);

      expect((response.body as UserResponseBody).emailVerified).toBe(false);
    });
  });

  describe('POST /users/me/change-password', () => {
    it('forwards both passwords to the authoritative password changer', async () => {
      currentUserId = USER_A;

      await request(server)
        .post('/users/me/change-password')
        .send({ currentPassword: 'old-password', newPassword: 'new-password' })
        .expect(204);

      expect(passwordChanges).toHaveLength(1);
      expect(passwordChanges[0]).toMatchObject({
        currentPassword: 'old-password',
        newPassword: 'new-password',
      });
    });

    it('forwards the session credentials so the current password can be verified', async () => {
      currentUserId = USER_A;

      await request(server)
        .post('/users/me/change-password')
        .set('cookie', 'better-auth.session_token=abc')
        .send({ currentPassword: 'old-password', newPassword: 'new-password' })
        .expect(204);

      expect(passwordChanges[0].sessionHeaders.get('cookie')).toBe(
        'better-auth.session_token=abc',
      );
    });

    it('returns the rotated session cookie', async () => {
      currentUserId = USER_A;

      const response = await request(server)
        .post('/users/me/change-password')
        .send({ currentPassword: 'old-password', newPassword: 'new-password' })
        .expect(204);

      expect(response.headers['set-cookie']).toEqual([
        'better-auth.session_token=rotated; Path=/; HttpOnly',
      ]);
    });

    it('rejects a new password identical to the current one', async () => {
      currentUserId = USER_A;

      await request(server)
        .post('/users/me/change-password')
        .send({ currentPassword: 'same-password', newPassword: 'same-password' })
        .expect(400);

      expect(passwordChanges).toHaveLength(0);
    });

    it('rejects a new password shorter than the minimum', async () => {
      currentUserId = USER_A;

      await request(server)
        .post('/users/me/change-password')
        .send({ currentPassword: 'old-password', newPassword: 'short' })
        .expect(400);

      expect(passwordChanges).toHaveLength(0);
    });

    it('requires the current password', async () => {
      currentUserId = USER_A;

      await request(server)
        .post('/users/me/change-password')
        .send({ newPassword: 'new-password' })
        .expect(400);

      expect(passwordChanges).toHaveLength(0);
    });

    it('surfaces a wrong current password as a rejected request', async () => {
      currentUserId = USER_A;
      passwordChangerError = new DomainValidationException('Invalid password');

      await request(server)
        .post('/users/me/change-password')
        .send({ currentPassword: 'wrong', newPassword: 'new-password' })
        .expect(400);
    });
  });
});
