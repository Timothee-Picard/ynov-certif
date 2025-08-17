import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';
import { User } from '../user/entities/user.entity';

type MockRepo<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

function createMockRepo<T>(): MockRepo<T> {
	return {
		findOne: jest.fn(),
	};
}

describe('JwtStrategy', () => {
	let strategy: JwtStrategy;
	let userRepo: MockRepo<User>;

	beforeEach(async () => {
		// Optionnel : fixer une clé pour éviter toute dépendance à l'env
		process.env.JWT_SECRET = 'test_secret_key';

		userRepo = createMockRepo<User>();

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				JwtStrategy,
				{ provide: getRepositoryToken(User), useValue: userRepo },
			],
		}).compile();

		strategy = module.get<JwtStrategy>(JwtStrategy);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('doit être défini', () => {
		expect(strategy).toBeDefined();
	});

	it('validate() retourne le user sans password quand il existe', async () => {
		const payload = { id: 'user-1', email: 'john@doe.tld' };
		const entity = {
			id: 'user-1',
			email: 'john@doe.tld',
			username: 'John',
			password: 'hashed',
			avatar: null,
			createdAt: new Date('2025-08-01T10:00:00.000Z'),
		} as any;

		userRepo.findOne!.mockResolvedValue(entity);

		const result = await strategy.validate(payload);

		expect(userRepo.findOne).toHaveBeenCalledWith({ where: { id: payload.id } });
		expect(result).toEqual({
			id: 'user-1',
			email: 'john@doe.tld',
			username: 'John',
			avatar: null,
			createdAt: entity.createdAt,
		});
		expect((result as any).password).toBeUndefined();
	});

	it('validate() lève UnauthorizedException si le user est introuvable', async () => {
		const payload = { id: 'absent' };
		userRepo.findOne!.mockResolvedValue(null);

		await expect(strategy.validate(payload)).rejects.toBeInstanceOf(UnauthorizedException);
	});
});
