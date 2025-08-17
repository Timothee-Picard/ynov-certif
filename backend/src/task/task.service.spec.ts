import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskService } from './task.service';
import { Task } from './entities/task.entity';
import { List } from '../list/entities/list.entity';
import { ForbiddenException, NotFoundException, UnauthorizedException } from '@nestjs/common';

type MockRepo<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

function createMockRepo<T>(): MockRepo<T> {
  return {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };
}

describe('TaskService', () => {
  let service: TaskService;
  let taskRepo: MockRepo<Task>;
  let listRepo: MockRepo<List>;

  const userId = 'user-1';
  const listId = 'list-1';
  const taskId = 'task-1';

  beforeEach(async () => {
    taskRepo = createMockRepo<Task>();
    listRepo = createMockRepo<List>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        { provide: getRepositoryToken(Task), useValue: taskRepo },
        { provide: getRepositoryToken(List), useValue: listRepo },
      ],
    }).compile();

    service = module.get<TaskService>(TaskService);
  });

  afterEach(() => jest.clearAllMocks());

  it('create() crée une tâche si la liste existe et appartient au user', async () => {
    const createDto = {
      title: 'Acheter du lait',
      description: 'Avant 18h',
      priority: 'high',
      isCompleted: true,
      dueDate: '2025-08-17T10:00:00.000Z',
    } as any;

    const list = { id: listId, user: { id: userId } } as any;
    listRepo.findOne!.mockResolvedValue(list);

    const created = { id: taskId, ...createDto, list } as any;
    taskRepo.create!.mockImplementation((arg) => arg);
    taskRepo.save!.mockImplementation(async (arg) => ({ id: taskId, ...arg }));

    const result = await service.create(userId, listId, createDto);

    expect(listRepo.findOne).toHaveBeenCalledWith({
      where: { id: listId },
      relations: ['user'],
    });
    expect(taskRepo.create).toHaveBeenCalled();
    expect(result.id).toBe(taskId);
    expect(result.list).toBe(list);
    expect(result.priority).toBe('high');
    expect(result.isCompleted).toBe(true);
    expect(result.dueDate).toBeInstanceOf(Date);
  });

  it('create() met des valeurs par défaut si non fournies', async () => {
    const createDto = { title: 'Titre' } as any;
    listRepo.findOne!.mockResolvedValue({ id: listId, user: { id: userId } });

    taskRepo.create!.mockImplementation((arg) => arg);
    taskRepo.save!.mockImplementation(async (arg) => arg);

    const result = await service.create(userId, listId, createDto);

    expect(result.priority).toBe('medium');
    expect(result.isCompleted).toBe(false);
    expect(result.dueDate).toBeNull();
  });

  it('create() -> NotFound si la liste est absente', async () => {
    listRepo.findOne!.mockResolvedValue(null);
    await expect(service.create(userId, listId, {} as any))
        .rejects.toBeInstanceOf(NotFoundException);
  });

  it('create() -> Unauthorized si la liste appartient à un autre user', async () => {
    listRepo.findOne!.mockResolvedValue({ id: listId, user: { id: 'other' } });
    await expect(service.create(userId, listId, {} as any))
        .rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('findAllByListId() renvoie les tâches triées par dueDate ASC et avec select', async () => {
    const tasks = [
      { id: 't1', dueDate: new Date('2025-01-01') },
      { id: 't2', dueDate: new Date('2025-02-01') },
    ] as any[];
    taskRepo.find!.mockResolvedValue(tasks);

    const result = await service.findAllByListId(userId, listId);

    expect(taskRepo.find).toHaveBeenCalledWith({
      where: { list: { id: listId, user: { id: userId } } },
      order: { dueDate: 'ASC' },
      select: ['id','title','description','priority','isCompleted','dueDate','createdAt'],
    });
    expect(result).toEqual(tasks);
  });

  it('update() met à jour les champs fournis et sauvegarde', async () => {
    const existing = {
      id: taskId,
      title: 'Old',
      description: 'Old desc',
      priority: 'low',
      isCompleted: false,
      dueDate: new Date('2025-01-01T00:00:00.000Z'),
      createdAt: new Date(),
      list: { id: listId, user: { id: userId } },
    } as any;

    taskRepo.findOne!.mockResolvedValue(existing);
    taskRepo.save!.mockImplementation(async (arg) => arg);

    const dto = {
      title: 'New',
      description: 'New desc',
      priority: 'high',
      isCompleted: true,
      dueDate: '2025-03-10T12:00:00.000Z',
    } as any;

    const result = await service.update(userId, taskId, dto);

    expect(taskRepo.findOne).toHaveBeenCalledWith({
      where: { id: taskId },
      relations: ['list', 'list.user'],
      select: ['id','title','description','priority','isCompleted','dueDate','createdAt'],
    });
    expect(result.title).toBe('New');
    expect(result.description).toBe('New desc');
    expect(result.priority).toBe('high');
    expect(result.isCompleted).toBe(true);
    expect(result.dueDate).toBeInstanceOf(Date);
  });

  it('update() -> NotFound si la tâche est absente', async () => {
    taskRepo.findOne!.mockResolvedValue(null);
    await expect(service.update(userId, taskId, {} as any))
        .rejects.toBeInstanceOf(NotFoundException);
  });

  it('update() -> Forbidden si la tâche appartient à un autre user', async () => {
    const existing = {
      id: taskId,
      list: { id: listId, user: { id: 'other' } },
    } as any;
    taskRepo.findOne!.mockResolvedValue(existing);

    await expect(service.update(userId, taskId, { title: 'X' } as any))
        .rejects.toBeInstanceOf(ForbiddenException);
  });

  it('toggleComplete() inverse isCompleted et sauvegarde', async () => {
    const existing = {
      id: taskId,
      isCompleted: false,
      title: 'T',
      description: 'D',
      priority: 'medium',
      dueDate: null,
      createdAt: new Date(),
      list: { id: listId, user: { id: userId } },
    } as any;

    taskRepo.findOne!.mockResolvedValue(existing);
    taskRepo.save!.mockImplementation(async (arg) => arg);

    const result = await service.toggleComplete(userId, taskId);

    expect(taskRepo.findOne).toHaveBeenCalledWith({
      where: { id: taskId },
      relations: ['list', 'list.user'],
      select: ['id','title','description','priority','isCompleted','dueDate','createdAt'],
    });
    expect(result.isCompleted).toBe(true);
  });

  it('toggleComplete() -> NotFound si la tâche est absente', async () => {
    taskRepo.findOne!.mockResolvedValue(null);
    await expect(service.toggleComplete(userId, taskId))
        .rejects.toBeInstanceOf(NotFoundException);
  });

  it('toggleComplete() -> Forbidden si la tâche appartient à un autre user', async () => {
    taskRepo.findOne!.mockResolvedValue({
      id: taskId,
      isCompleted: false,
      list: { id: listId, user: { id: 'other' } },
    } as any);

    await expect(service.toggleComplete(userId, taskId))
        .rejects.toBeInstanceOf(ForbiddenException);
  });

  it('remove() supprime la tâche et renvoie un message', async () => {
    const existing = { id: taskId, list: { id: listId, user: { id: userId } } } as any;
    taskRepo.findOne!.mockResolvedValue(existing);
    taskRepo.remove!.mockResolvedValue(undefined);

    const result = await service.remove(userId, taskId);

    expect(taskRepo.findOne).toHaveBeenCalledWith({
      where: { id: taskId },
      relations: ['list', 'list.user'],
    });
    expect(taskRepo.remove).toHaveBeenCalledWith(existing);
    expect(result).toEqual({ message: 'Task deleted successfully' });
  });

  it('remove() -> NotFound si la tâche est absente', async () => {
    taskRepo.findOne!.mockResolvedValue(null);
    await expect(service.remove(userId, taskId))
        .rejects.toBeInstanceOf(NotFoundException);
  });

  it('remove() -> Forbidden si la tâche appartient à un autre user', async () => {
    taskRepo.findOne!.mockResolvedValue({
      id: taskId,
      list: { id: listId, user: { id: 'other' } },
    } as any);

    await expect(service.remove(userId, taskId))
        .rejects.toBeInstanceOf(ForbiddenException);
  });
});
