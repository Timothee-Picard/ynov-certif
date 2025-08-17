import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from '../user/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

type MockRepo<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

function createMockRepo<T>(): MockRepo<T> {
	return {
		findOne: jest.fn(),
		create: jest.fn(),
		save: jest.fn(),
	};
}

// Mocks explicites
jest.mock('bcrypt', () => ({
	compare: jest.fn(),
	hash: jest.fn(),
}));

describe('AuthService', () => {
	let service: AuthService;
	let userRepo: MockRepo<User>;
	let jwtService: { sign: jest.Mock };

	// Figer le temps pour des expiresAt déterministes
	const FIXED_NOW = new Date('2025-08-17T12:00:00.000Z').getTime();

	beforeAll(() => {
		jest.spyOn(Date, 'now').mockImplementation(() => FIXED_NOW);
	});

	afterAll(() => {
		(Date.now as jest.Mock).mockRestore?.();
	});

	beforeEach(async () => {
		userRepo = createMockRepo<User>();
		jwtService = { sign: jest.fn().mockReturnValue('signed.jwt.token') };

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				AuthService,
				{ provide: getRepositoryToken(User), useValue: userRepo },
				{ provide: JwtService, useValue: jwtService },
			],
		}).compile();

		service = module.get<AuthService>(AuthService);
		jest.clearAllMocks();
	});

	// -------- login --------
	it('login() retourne le token et les infos user si credentials OK', async () => {
		const credentials = { email: 'john@doe.tld', password: 'plain' };
		const createdAt = new Date('2025-08-01T10:00:00.000Z');

		userRepo.findOne!.mockResolvedValue({
			id: 'u1',
			email: credentials.email,
			username: 'John',
			password: 'hashed',
			avatar: null,
			createdAt,
		});

		(bcrypt.compare as jest.Mock).mockResolvedValue(true);

		const result = await service.login(credentials);

		expect(userRepo.findOne).toHaveBeenCalledWith({ where: { email: credentials.email } });
		expect(bcrypt.compare).toHaveBeenCalledWith('plain', 'hashed');
		expect(jwtService.sign).toHaveBeenCalledWith({ id: 'u1', email: credentials.email, avatar: null });

		// expiresAt = now + 24h
		expect(result.expiresAt).toBe(new Date(FIXED_NOW + 24 * 60 * 60 * 1000).toISOString());
		expect(result).toEqual({
			token: 'signed.jwt.token',
			expiresAt: result.expiresAt,
			user: {
				id: 'u1',
				email: 'john@doe.tld',
				username: 'John',
				avatar: undefined, // null devient undefined selon le service
				createdAt: createdAt.toISOString(),
			},
		});
	});

	it('login() -> Unauthorized si email inconnu', async () => {
		userRepo.findOne!.mockResolvedValue(null);
		await expect(service.login({ email: 'x@y.z', password: 'pw' }))
			.rejects.toBeInstanceOf(UnauthorizedException);
	});

	it('login() -> Unauthorized si mot de passe invalide', async () => {
		userRepo.findOne!.mockResolvedValue({
			id: 'u1',
			email: 'x@y.z',
			password: 'hashed',
			username: 'X',
			avatar: null,
			createdAt: new Date(),
		});
		(bcrypt.compare as jest.Mock).mockResolvedValue(false);

		await expect(service.login({ email: 'x@y.z', password: 'bad' }))
			.rejects.toBeInstanceOf(UnauthorizedException);
	});

	// -------- register --------
	it('register() crée l’utilisateur (hash pw) puis retourne le token et le user', async () => {
		const data = { username: 'Jane', email: 'jane@doe.tld', password: 'plain' };

		userRepo.findOne!.mockResolvedValue(null); // pas d’utilisateur existant
		(bcrypt.hash as jest.Mock).mockResolvedValue('hashedpw');

		const createdAt = new Date('2025-08-02T09:00:00.000Z');

		userRepo.create!.mockImplementation((arg) => ({ ...arg, id: undefined, createdAt })); // simul create()
		userRepo.save!.mockImplementation(async (arg) => ({ ...arg, id: 'u2', createdAt })); // simul save()

		const result = await service.register(data);

		expect(userRepo.findOne).toHaveBeenCalledWith({ where: { email: data.email } });
		expect(bcrypt.hash).toHaveBeenCalledWith('plain', 10);
		expect(userRepo.create).toHaveBeenCalledWith({
			username: 'Jane',
			email: 'jane@doe.tld',
			password: 'hashedpw',
			avatar: null,
		});
		expect(jwtService.sign).toHaveBeenCalledWith({
			id: 'u2',
			email: 'jane@doe.tld',
			avatar: null,
		});

		expect(result.expiresAt).toBe(new Date(FIXED_NOW + 24 * 60 * 60 * 1000).toISOString());
		expect(result).toEqual({
			token: 'signed.jwt.token',
			expiresAt: result.expiresAt,
			user: {
				id: 'u2',
				email: 'jane@doe.tld',
				username: 'Jane',
				avatar: undefined,
				createdAt: createdAt.toISOString(),
			},
		});
	});

	it('register() -> BadRequest si email déjà utilisé', async () => {
		userRepo.findOne!.mockResolvedValue({ id: 'u1' });
		await expect(service.register({
			username: 'A',
			email: 'dup@dup.tld',
			password: 'pw',
		})).rejects.toBeInstanceOf(BadRequestException);
	});

	// -------- validateToken --------
	it('validateToken() retourne token + user si user trouvé', async () => {
		const createdAt = new Date('2025-08-05T08:00:00.000Z');

		userRepo.findOne!.mockResolvedValue({
			id: 'u1',
			email: 'a@b.c',
			username: 'A',
			avatar: 'http://img',
			createdAt,
		});

		const result = await service.validateToken('u1');

		expect(userRepo.findOne).toHaveBeenCalledWith({ where: { id: 'u1' } });
		expect(jwtService.sign).toHaveBeenCalledWith({
			id: 'u1',
			email: 'a@b.c',
			avatar: 'http://img',
		});
		expect(result).toEqual({
			token: 'signed.jwt.token',
			expiresAt: new Date(FIXED_NOW + 3600 * 1000).toISOString(), // +1h
			user: {
				id: 'u1',
				email: 'a@b.c',
				username: 'A',
				avatar: 'http://img',
				createdAt: createdAt.toISOString(),
			},
		});
	});

	it('validateToken() retourne null si user introuvable', async () => {
		userRepo.findOne!.mockResolvedValue(null);
		const result = await service.validateToken('absent');
		expect(result).toBeNull();
	});

	it('validateToken() retourne null si une exception est levée', async () => {
		userRepo.findOne!.mockRejectedValue(new Error('DB error'));
		const result = await service.validateToken('u1');
		expect(result).toBeNull();
	});
});
