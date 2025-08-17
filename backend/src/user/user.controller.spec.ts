import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '../utils/types';

// --- Mock du service ---
const userServiceMock = {
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('UserController', () => {
  let controller: UserController;
  const user: User = { id: 'user-123' } as User;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        { provide: UserService, useValue: userServiceMock },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  // Helper pour vérifier la présence des guards
  function getMethodGuards(proto: any, methodName: string) {
    const guards = Reflect.getMetadata('__guards__', proto[methodName]) ?? [];
    return guards.map((g: any) => (typeof g === 'function' ? g : g?.canActivate));
  }

  // --- Présence du JwtAuthGuard sur chaque route ---
  it('findMe() est protégé par JwtAuthGuard', () => {
    const guards = getMethodGuards(UserController.prototype, 'findMe');
    expect(guards).toContain(JwtAuthGuard);
  });

  it('update() est protégé par JwtAuthGuard', () => {
    const guards = getMethodGuards(UserController.prototype, 'update');
    expect(guards).toContain(JwtAuthGuard);
  });

  it('remove() est protégé par JwtAuthGuard', () => {
    const guards = getMethodGuards(UserController.prototype, 'remove');
    expect(guards).toContain(JwtAuthGuard);
  });

  // --- Tests fonctionnels ---
  it('findMe() appelle userService.findOne avec user.id et retourne le résultat', async () => {
    const expected = { id: user.id, email: 'john@doe.tld' };
    userServiceMock.findOne.mockResolvedValue(expected);

    const result = await controller.findMe(user);

    expect(userServiceMock.findOne).toHaveBeenCalledWith(user.id);
    expect(result).toEqual(expected);
  });

  it('update() appelle userService.update avec (user.id, dto) et retourne le résultat', async () => {
    const dto: UpdateUserDto = { username: 'John' } as any;
    const expected = { id: user.id, username: 'John' };
    userServiceMock.update.mockResolvedValue(expected);

    const result = await controller.update(user, dto);

    expect(userServiceMock.update).toHaveBeenCalledWith(user.id, dto);
    expect(result).toEqual(expected);
  });

  it('remove() appelle userService.remove avec user.id et retourne le résultat', async () => {
    const expected = { success: true };
    userServiceMock.remove.mockResolvedValue(expected);

    const result = await controller.remove(user);

    expect(userServiceMock.remove).toHaveBeenCalledWith(user.id);
    expect(result).toEqual(expected);
  });
});
