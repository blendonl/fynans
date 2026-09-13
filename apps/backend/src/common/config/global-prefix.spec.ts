import { Server } from 'http';
import { Controller, Get, INestApplication, Post } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AuthController } from '~feature/auth/rest/controllers/auth.controller';
import { applyGlobalPrefix } from './global-prefix';

@Controller('expenses')
class BusinessController {
  @Get()
  list() {
    return { data: [] };
  }
}

@Controller('auth')
class AuthShapedController {
  @Post('login')
  login() {
    return { via: 'nest' };
  }

  @Post('register')
  register() {
    return { via: 'nest' };
  }

  @Post('logout')
  logout() {
    return { via: 'nest' };
  }

  @Get('me')
  me() {
    return { via: 'nest' };
  }

  @Get('get-session')
  getSession() {
    return { via: 'nest' };
  }
}

describe('global api prefix', () => {
  let app: INestApplication;
  let server: Server;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [BusinessController, AuthShapedController],
    }).compile();

    app = moduleRef.createNestApplication();
    applyGlobalPrefix(app);
    await app.init();
    server = app.getHttpServer() as Server;
  });

  afterAll(async () => {
    await app.close();
  });

  it('serves business routes under /api', async () => {
    await request(server).get('/api/expenses').expect(200);
    await request(server).get('/expenses').expect(404);
  });

  describe('better-auth path space', () => {
    it('leaves /api/auth/get-session unclaimed by nest', async () => {
      await request(server).get('/api/auth/get-session').expect(404);
    });

    it.each([
      ['/api/auth/login'],
      ['/api/auth/register'],
      ['/api/auth/logout'],
      ['/api/auth/callback/google'],
      ['/api/auth/sign-in/email'],
    ])('leaves %s unclaimed by nest', async (path) => {
      const post = await request(server).post(path);
      const get = await request(server).get(path);

      expect(post.status).toBe(404);
      expect(get.status).toBe(404);
    });
  });

  describe('the nest auth controller', () => {
    it.each([['/auth/login'], ['/auth/register'], ['/auth/logout']])(
      'keeps %s unprefixed',
      async (path) => {
        const response = await request(server).post(path);

        expect(response.status).toBe(201);
        expect(response.body).toEqual({ via: 'nest' });
      },
    );

    it('keeps GET /auth/me unprefixed', async () => {
      await request(server).get('/auth/me').expect(200, { via: 'nest' });
    });
  });

  it('excludes every route the real AuthController declares', () => {
    const declared = Object.getOwnPropertyNames(
      AuthController.prototype,
    ).filter((name) => name !== 'constructor');
    const covered = Object.getOwnPropertyNames(
      AuthShapedController.prototype,
    ).filter((name) => name !== 'constructor');

    expect(covered).toEqual(expect.arrayContaining(declared));
  });
});
