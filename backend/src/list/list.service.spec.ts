import 'reflect-metadata'
import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ListService } from './list.service'
import { List } from './entities/list.entity'
import { User } from '../user/entities/user.entity'
import { NotFoundException, ForbiddenException } from '@nestjs/common'

type MockRepo<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>

function createMockRepo<T>(): MockRepo<T> {
    return {
        create: jest.fn(),
        save: jest.fn(),
        find: jest.fn(),
        findOne: jest.fn(),
        remove: jest.fn(),
    }
}

describe('ListService', () => {
    let service: ListService
    let listRepo: MockRepo<List>
    let userRepo: MockRepo<User>

    const userId = 'user-1'

    beforeEach(async () => {
        listRepo = createMockRepo<List>()
        userRepo = createMockRepo<User>()

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ListService,
                { provide: getRepositoryToken(List), useValue: listRepo },
                { provide: getRepositoryToken(User), useValue: userRepo },
            ],
        }).compile()

        service = module.get<ListService>(ListService)
    })

    afterEach(() => jest.clearAllMocks())

    it('create() crée et sauvegarde une liste liée au user', async () => {
        const dto = { name: 'Courses', description: 'Hebdo', color: '#fff' }
        const created = { id: 'list-1', ...dto, user: { id: userId } } as any

        listRepo.create!.mockReturnValue(created)
        listRepo.save!.mockResolvedValue(created)

        const result = await service.create(userId, dto as any)

        expect(listRepo.create).toHaveBeenCalledWith({
            name: dto.name,
            description: dto.description,
            color: dto.color,
            user: { id: userId },
        })
        expect(listRepo.save).toHaveBeenCalledWith(created)
        expect(result).toEqual(created)
    })

    it('findAllByUser() retourne les listes avec tasksCount et completedTasksCount', async () => {
        const lists = [
            { id: 'l1', name: 'A', tasks: [{ isCompleted: false }, { isCompleted: true }] },
            { id: 'l2', name: 'B', tasks: [] },
        ] as any[]

        listRepo.find!.mockResolvedValue(lists)

        const result = await service.findAllByUser(userId)

        expect(listRepo.find).toHaveBeenCalledWith({
            where: { user: { id: userId } },
            relations: ['tasks'],
        })
        expect(result).toEqual([
            { id: 'l1', name: 'A', tasksCount: 2, completedTasksCount: 1 },
            { id: 'l2', name: 'B', tasksCount: 0, completedTasksCount: 0 },
        ])
    })

    it('findOneByUser() retourne la liste si elle appartient au user', async () => {
        const list = { id: 'l1', user: { id: userId } } as any
        listRepo.findOne!.mockResolvedValue(list)

        const result = await service.findOneByUser(userId, 'l1')

        expect(listRepo.findOne).toHaveBeenCalledWith({
            where: { id: 'l1', user: { id: userId } },
        })
        expect(result).toBe(list)
    })

    it('findOneByUser() lève NotFoundException si la liste est absente', async () => {
        listRepo.findOne!.mockResolvedValue(null)

        await expect(service.findOneByUser(userId, 'bad')).rejects.toBeInstanceOf(NotFoundException)
    })

    it('update() met à jour les champs fournis et sauvegarde', async () => {
        const existing = {
            id: 'l1',
            name: 'Old',
            description: 'Desc',
            color: '#111',
            user: { id: userId },
            tasks: [],
        } as any

        listRepo.findOne!.mockResolvedValue(existing)
        listRepo.save!.mockImplementation(async (x) => x)

        const dto = { name: 'New', color: '#222' } as any

        const result = await service.update(userId, 'l1', dto)

        expect(listRepo.findOne).toHaveBeenCalledWith({
            where: { id: 'l1' },
            relations: ['user', 'tasks'],
        })
        expect(listRepo.save).toHaveBeenCalledWith({
            ...existing,
            name: 'New',
            color: '#222',
        })
        expect(result.name).toBe('New')
        expect(result.color).toBe('#222')
        expect(result.description).toBe('Desc')
    })

    it('update() lève NotFoundException si la liste est absente', async () => {
        listRepo.findOne!.mockResolvedValue(null)
        await expect(service.update(userId, 'missing', {} as any)).rejects.toBeInstanceOf(
            NotFoundException,
        )
    })

    it("update() lève ForbiddenException si l'utilisateur n'est pas propriétaire", async () => {
        const existing = { id: 'l1', user: { id: 'other' }, tasks: [] } as any
        listRepo.findOne!.mockResolvedValue(existing)

        await expect(service.update(userId, 'l1', { name: 'X' } as any)).rejects.toBeInstanceOf(
            ForbiddenException,
        )
    })

    it('remove() supprime la liste et retourne un message', async () => {
        const existing = { id: 'l1', user: { id: userId } } as any
        listRepo.findOne!.mockResolvedValue(existing)
        listRepo.remove!.mockResolvedValue(undefined)

        const result = await service.remove(userId, 'l1')

        expect(listRepo.findOne).toHaveBeenCalledWith({
            where: { id: 'l1' },
            relations: ['user'],
        })
        expect(listRepo.remove).toHaveBeenCalledWith(existing)
        expect(result).toEqual({ message: 'List deleted successfully' })
    })

    it('remove() lève NotFoundException si la liste est absente', async () => {
        listRepo.findOne!.mockResolvedValue(null)

        await expect(service.remove(userId, 'missing')).rejects.toBeInstanceOf(NotFoundException)
    })

    it("remove() lève ForbiddenException si l'utilisateur n'est pas propriétaire", async () => {
        const existing = { id: 'l1', user: { id: 'other' } } as any
        listRepo.findOne!.mockResolvedValue(existing)

        await expect(service.remove(userId, 'l1')).rejects.toBeInstanceOf(ForbiddenException)
    })
})
