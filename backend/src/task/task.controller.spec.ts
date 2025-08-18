import 'reflect-metadata'
import { Test, TestingModule } from '@nestjs/testing'
import { TaskController } from './task.controller'
import { TaskService } from './task.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { CreateTaskDto } from './dto/create-task.dto'
import { UpdateTaskDto } from './dto/update-task.dto'
import { User } from '../utils/types'

const taskServiceMock = {
    create: jest.fn(),
    findAllByListId: jest.fn(),
    update: jest.fn(),
    toggleComplete: jest.fn(),
    remove: jest.fn(),
}

describe('TaskController', () => {
    let controller: TaskController

    const user: User = { id: 'user-1' } as User

    beforeEach(async () => {
        jest.clearAllMocks()

        const module: TestingModule = await Test.createTestingModule({
            controllers: [TaskController],
            providers: [
                {
                    provide: TaskService,
                    useValue: taskServiceMock,
                },
            ],
        }).compile()

        controller = module.get<TaskController>(TaskController)
    })

    function getMethodGuards(controllerProto: any, methodName: string) {
        const guards = Reflect.getMetadata('__guards__', controllerProto[methodName]) ?? []
        return guards.map((g: any) => (typeof g === 'function' ? g : g?.canActivate))
    }

    it('create() doit être protégé par JwtAuthGuard', () => {
        const guards = getMethodGuards(TaskController.prototype, 'create')
        expect(guards).toContain(JwtAuthGuard)
    })

    it('findAllByListId() doit être protégé par JwtAuthGuard', () => {
        const guards = getMethodGuards(TaskController.prototype, 'findAllByListId')
        expect(guards).toContain(JwtAuthGuard)
    })

    it('update() doit être protégé par JwtAuthGuard', () => {
        const guards = getMethodGuards(TaskController.prototype, 'update')
        expect(guards).toContain(JwtAuthGuard)
    })

    it('toggle() doit être protégé par JwtAuthGuard', () => {
        const guards = getMethodGuards(TaskController.prototype, 'toggle')
        expect(guards).toContain(JwtAuthGuard)
    })

    it('remove() doit être protégé par JwtAuthGuard', () => {
        const guards = getMethodGuards(TaskController.prototype, 'remove')
        expect(guards).toContain(JwtAuthGuard)
    })

    it('create() appelle taskService.create avec (user.id, listeId, dto) et retourne le résultat', async () => {
        const listeId = 'list-123'
        const dto: CreateTaskDto = {
            title: 'Acheter du lait',
            description: 'Avant 18h',
            dueDate: new Date().toISOString() as any,
        } as any
        const expected = { id: 'task-1', ...dto, listId: listeId, userId: user.id }
        taskServiceMock.create.mockResolvedValue(expected)

        const result = await controller.create(user, listeId, dto)

        expect(taskServiceMock.create).toHaveBeenCalledWith(user.id, listeId, dto)
        expect(result).toEqual(expected)
    })

    it('findAllByListId() appelle taskService.findAllByListId et retourne la liste', async () => {
        const listeId = 'list-123'
        const expected = [
            { id: 'task-1', title: 'A' },
            { id: 'task-2', title: 'B' },
        ]
        taskServiceMock.findAllByListId.mockResolvedValue(expected)

        const result = await controller.findAllByListId(user, listeId)

        expect(taskServiceMock.findAllByListId).toHaveBeenCalledWith(user.id, listeId)
        expect(result).toEqual(expected)
    })

    it('update() appelle taskService.update avec (user.id, id, dto) et retourne la tâche mise à jour', async () => {
        const id = 'task-42'
        const dto: UpdateTaskDto = { title: 'Nouveau titre', isCompleted: true } as any
        const expected = { id, ...dto }
        taskServiceMock.update.mockResolvedValue(expected)

        const result = await controller.update(user, id, dto)

        expect(taskServiceMock.update).toHaveBeenCalledWith(user.id, id, dto)
        expect(result).toEqual(expected)
    })

    it('toggle() appelle taskService.toggleComplete et retourne la tâche', async () => {
        const id = 'task-42'
        const expected = { id, isCompleted: true }
        taskServiceMock.toggleComplete.mockResolvedValue(expected)

        const result = await controller.toggle(user, id)

        expect(taskServiceMock.toggleComplete).toHaveBeenCalledWith(user.id, id)
        expect(result).toEqual(expected)
    })

    it('remove() appelle taskService.remove avec (user.id, id) et retourne le résultat', async () => {
        const id = 'task-42'
        const expected = { success: true }
        taskServiceMock.remove.mockResolvedValue(expected)

        const result = await controller.remove(user, id)

        expect(taskServiceMock.remove).toHaveBeenCalledWith(user.id, id)
        expect(result).toEqual(expected)
    })
})
