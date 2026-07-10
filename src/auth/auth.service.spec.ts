import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { User } from './entities/user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: {
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    update: jest.Mock;
  };

  beforeEach(async () => {
    userRepository = {
      findOne: jest.fn(),
      create: jest.fn((dto: Partial<User>) => dto as User),
      save: jest.fn((user: User) => Promise.resolve({ ...user, id: 'user-1' })),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: userRepository },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(() => 'signed-token'),
            verify: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('throws a ConflictException when the email is already registered', async () => {
      userRepository.findOne.mockResolvedValue({ id: 'existing' });

      await expect(
        service.register({
          email: 'test@example.com',
          password: 'password123',
        }),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('creates a new user and returns a token pair when the email is available', async () => {
      userRepository.findOne.mockResolvedValue(null);

      const result = await service.register({
        email: 'new@example.com',
        password: 'password123',
      });

      expect(result.accessToken).toBe('signed-token');
      expect(result.refreshToken).toBe('signed-token');
      expect(result.user.email).toBe('new@example.com');
      expect(userRepository.update).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('throws UnauthorizedException for an unknown email', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(
        service.login({ email: 'nope@example.com', password: 'password123' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('throws UnauthorizedException for an incorrect password', async () => {
      const hashed = await bcrypt.hash('correct-password', 10);
      userRepository.findOne.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        password: hashed,
      });

      await expect(
        service.login({
          email: 'test@example.com',
          password: 'wrong-password',
        }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('returns a token pair for correct credentials', async () => {
      const hashed = await bcrypt.hash('correct-password', 10);
      userRepository.findOne.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        password: hashed,
      });

      const result = await service.login({
        email: 'test@example.com',
        password: 'correct-password',
      });

      expect(result.accessToken).toBe('signed-token');
    });
  });
});
