import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserService } from './user.service';
import { User } from './entities/user.entity';

type MockRepo<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

function createMockRepo<T>(): MockRepo<T> {
  return {
    findOne: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };
}

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
}));

describe('UserService', () => {
  let service: UserService;
  let userRepo: MockRepo<User>;

  const userId = 'user-1';

  beforeEach(async () => {
    userRepo = createMockRepo<User>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getRepositoryToken(User), useValue: userRepo },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    jest.clearAllMocks();
  });

  it('findOne() retourne l’utilisateur sans le champ password', async () => {
    const entity = {
      id: userId,
      email: 'test@example.com',
      username: 'John',
      password: 'hashed',
    } as any;

    userRepo.findOne!.mockResolvedValue(entity);

    const result = await service.findOne(userId);

    expect(userRepo.findOne).toHaveBeenCalledWith({ where: { id: userId } });
    expect(result).toEqual({
      id: userId,
      email: 'test@example.com',
      username: 'John',
    });
    expect((result as any).password).toBeUndefined();
  });

  it('findOne() -> NotFound si absent', async () => {
    userRepo.findOne!.mockResolvedValue(null);
    await expect(service.findOne(userId)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('update() met à jour sans mot de passe (pas de hash) et sauvegarde', async () => {
    const existing = { id: userId, username: 'Old', email: 'old@a.b', password: 'hash' } as any;
    userRepo.findOne!.mockResolvedValue(existing);
    userRepo.save!.mockImplementation(async (x) => x);

    const dto = { username: 'New' } as any;

    const result = await service.update(userId, dto);

    expect(userRepo.findOne).toHaveBeenCalledWith({ where: { id: userId } });
    expect(bcrypt.hash).not.toHaveBeenCalled();
    expect(userRepo.save).toHaveBeenCalledWith({ ...existing, username: 'New' });
    expect(result.username).toBe('New');
  });

  it('update() hash le mot de passe si fourni puis sauvegarde', async () => {
    const existing = { id: userId, username: 'John', password: 'oldhash' } as any;
    userRepo.findOne!.mockResolvedValue(existing);
    userRepo.save!.mockImplementation(async (x) => x);

    (bcrypt.hash as jest.Mock).mockResolvedValue('newhash');

    const dto = { password: 'plain' } as any;

    const result = await service.update(userId, dto);

    expect(bcrypt.hash).toHaveBeenCalledWith('plain', 10);
    expect(userRepo.save).toHaveBeenCalledWith({ ...existing, password: 'newhash' });
    expect(result.password).toBe('newhash');
  });

  it('update() -> NotFound si utilisateur inexistant', async () => {
    userRepo.findOne!.mockResolvedValue(null);
    await expect(service.update(userId, {} as any)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('remove() supprime et renvoie un message', async () => {
    const existing = { id: userId } as any;
    userRepo.findOne!.mockResolvedValue(existing);
    userRepo.remove!.mockResolvedValue(undefined);

    const result = await service.remove(userId);

    expect(userRepo.findOne).toHaveBeenCalledWith({ where: { id: userId } });
    expect(userRepo.remove).toHaveBeenCalledWith(existing);
    expect(result).toEqual({ message: 'User deleted successfully' });
  });

  it('remove() -> NotFound si utilisateur inexistant', async () => {
    userRepo.findOne!.mockResolvedValue(null);
    await expect(service.remove(userId)).rejects.toBeInstanceOf(NotFoundException);
  });
});
