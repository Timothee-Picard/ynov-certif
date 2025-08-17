import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LoginCredentialsDto } from './dto/login-credentials.dto';
import { RegisterCredentialsDto } from './dto/register-credentials.dto';
import { User } from '../utils/types';

const authServiceMock = {
	login: jest.fn(),
	register: jest.fn(),
	validateToken: jest.fn(),
};

describe('AuthController', () => {
	let controller: AuthController;

	const token = {
		access_token: 'jwt.token.here',
		expiresIn: 3600,
	};

	const user: User = { id: 'user-123' } as User;

	beforeEach(async () => {
		jest.clearAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			controllers: [AuthController],
			providers: [{ provide: AuthService, useValue: authServiceMock }],
		}).compile();

		controller = module.get<AuthController>(AuthController);
	});

	function getMethodGuards(proto: any, methodName: string) {
		const guards =
			Reflect.getMetadata('__guards__', proto[methodName]) ?? [];
		return guards.map((g: any) => (typeof g === 'function' ? g : g?.canActivate));
	}

	it('validateToken() est protégé par JwtAuthGuard', () => {
		const guards = getMethodGuards(AuthController.prototype, 'validateToken');
		expect(guards).toContain(JwtAuthGuard);
	});

	it('login() appelle authService.login avec les credentials et retourne le token', async () => {
		const creds: LoginCredentialsDto = { email: 'a@b.c', password: 'pw' };
		authServiceMock.login.mockResolvedValue(token);

		const result = await controller.login(creds);

		expect(authServiceMock.login).toHaveBeenCalledWith(creds);
		expect(result).toEqual(token);
	});

	it('register() appelle authService.register avec les données et retourne le token', async () => {
		const data: RegisterCredentialsDto = {
			username: 'Tim',
			email: 'tim@example.com',
			password: 'secret123',
		};
		authServiceMock.register.mockResolvedValue(token);

		const result = await controller.register(data);

		expect(authServiceMock.register).toHaveBeenCalledWith(data);
		expect(result).toEqual(token);
	});

	it('validateToken() appelle authService.validateToken avec user.id et retourne le token (ou null)', async () => {
		authServiceMock.validateToken.mockResolvedValue(token);

		const result = await controller.validateToken(user);

		expect(authServiceMock.validateToken).toHaveBeenCalledWith(user.id);
		expect(result).toEqual(token);
	});

	it('validateToken() peut retourner null si le service le renvoie', async () => {
		authServiceMock.validateToken.mockResolvedValue(null);

		const result = await controller.validateToken(user);

		expect(authServiceMock.validateToken).toHaveBeenCalledWith(user.id);
		expect(result).toBeNull();
	});
});
