import 'reflect-metadata'
import { Test, TestingModule } from '@nestjs/testing'
import { ListController } from './list.controller'
import { ListService } from './list.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { CreateListDto } from './dto/create-list.dto'
import { UpdateListDto } from './dto/update-list.dto'
import { User } from '../utils/types'

const listServiceMock = {
    create: jest.fn(),
    findAllByUser: jest.fn(),
    findOneByUser: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
}

describe('ListController', () => {
    let controller: ListController

    const user: User = { id: 'user-123' } as User

    beforeEach(async () => {
        jest.clearAllMocks()

        const module: TestingModule = await Test.createTestingModule({
            controllers: [ListController],
            providers: [
                {
                    provide: ListService,
                    useValue: listServiceMock,
                },
            ],
        }).compile()

        controller = module.get<ListController>(ListController)
    })

    it('create() doit appeler listService.create avec user.id et le DTO', async () => {
        const dto: CreateListDto = { name: 'Courses', description: 'À faire' } as any
        const expected = { id: 'list-1', ...dto, userId: user.id }
        listServiceMock.create.mockResolvedValue(expected)

        const result = await controller.create({ id: user.id }, dto)
        expect(listServiceMock.create).toHaveBeenCalledWith(user.id, dto)
        expect(result).toEqual(expected)
    })

    it('findAllByUser() doit retourner les listes du user', async () => {
        const expected = [{ id: 'list-1' }, { id: 'list-2' }]
        listServiceMock.findAllByUser.mockResolvedValue(expected)

        const result = await controller.findAllByUser(user)
        expect(listServiceMock.findAllByUser).toHaveBeenCalledWith(user.id)
        expect(result).toEqual(expected)
    })

    it('findOneByUser() doit retourner une liste par id si elle appartient au user', async () => {
        const listId = 'list-123'
        const expected = { id: listId, name: 'Projets' }
        listServiceMock.findOneByUser.mockResolvedValue(expected)

        const result = await controller.findOneByUser(user, listId)
        expect(listServiceMock.findOneByUser).toHaveBeenCalledWith(user.id, listId)
        expect(result).toEqual(expected)
    })

    it('update() doit mettre à jour la liste', async () => {
        const listId = 'list-123'
        const dto: UpdateListDto = { name: 'Nouveau nom' } as any
        const expected = { id: listId, ...dto }
        listServiceMock.update.mockResolvedValue(expected)

        const result = await controller.update(user, listId, dto)
        expect(listServiceMock.update).toHaveBeenCalledWith(user.id, listId, dto)
        expect(result).toEqual(expected)
    })

    it('remove() doit supprimer la liste', async () => {
        const listId = 'list-123'
        const expected = { success: true }
        listServiceMock.remove.mockResolvedValue(expected)

        const result = await controller.remove({ id: user.id }, listId)
        expect(listServiceMock.remove).toHaveBeenCalledWith(user.id, listId)
        expect(result).toEqual(expected)
    })

    /**
     * Petit helper pour récupérer les decorators d’une méthode.
     * On vérifie juste la présence de @UseGuards(JwtAuthGuard) appliqué via Nest,
     * sans exécuter le guard.
     */
    function getMethodGuards(controllerPrototype: any, methodName: string) {
        const guards = Reflect.getMetadata('__guards__', controllerPrototype[methodName]) ?? []
        return guards.map((g: any) => (typeof g === 'function' ? g : g?.canActivate))
    }

    it('doit avoir JwtAuthGuard sur create()', () => {
        const guards = getMethodGuards(ListController.prototype, 'create')
        expect(guards).toContain(JwtAuthGuard)
    })

    it('doit avoir JwtAuthGuard sur findAllByUser()', () => {
        const guards = getMethodGuards(ListController.prototype, 'findAllByUser')
        expect(guards).toContain(JwtAuthGuard)
    })

    it('doit avoir JwtAuthGuard sur findOneByUser()', () => {
        const guards = getMethodGuards(ListController.prototype, 'findOneByUser')
        expect(guards).toContain(JwtAuthGuard)
    })

    it('doit avoir JwtAuthGuard sur update()', () => {
        const guards = getMethodGuards(ListController.prototype, 'update')
        expect(guards).toContain(JwtAuthGuard)
    })

    it('doit avoir JwtAuthGuard sur remove()', () => {
        const guards = getMethodGuards(ListController.prototype, 'remove')
        expect(guards).toContain(JwtAuthGuard)
    })
})
