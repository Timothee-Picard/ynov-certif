import { renderHook, act, waitFor } from '@testing-library/react'
import { useTodoLists } from '@/hooks/useTodoLists'
import type { TodoList } from '@/utils/types'

const getTodoLists = jest.fn()
const createTodoList = jest.fn()
const updateTodoList = jest.fn()
const deleteTodoList = jest.fn()

jest.mock('@/utils/Api', () => ({
    todoListApi: {
        getTodoLists: (...args: any[]) => getTodoLists(...args),
        createTodoList: (...args: any[]) => createTodoList(...args),
        updateTodoList: (...args: any[]) => updateTodoList(...args),
        deleteTodoList: (...args: any[]) => deleteTodoList(...args),
    },
}))

const baseList = (over: Partial<TodoList> = {}): TodoList => ({
    id: 'l1',
    userId: 'u1',
    name: 'Liste A',
    description: 'Desc A',
    color: '#3B82F6',
    tasksCount: 0,
    completedTasksCount: 0,
    createdAt: new Date('2025-08-10T10:00:00.000Z').toISOString(),
    updatedAt: new Date('2025-08-15T10:00:00.000Z').toISOString(),
    ...over,
})

beforeEach(() => {
    jest.clearAllMocks()
})

describe('useTodoLists', () => {
    it('fetch succès', async () => {
        const lists = [baseList({ id: 'l1' }), baseList({ id: 'l2', name: 'Liste B' })]
        getTodoLists.mockResolvedValue(lists)
        const { result } = renderHook(() => useTodoLists())
        expect(result.current.loading).toBe(true)
        await waitFor(() => expect(result.current.loading).toBe(false))
        expect(result.current.todoLists).toEqual(lists)
        expect(result.current.error).toBeNull()
        expect(getTodoLists).toHaveBeenCalled()
    })

    it('fetch échec', async () => {
        getTodoLists.mockRejectedValue(new Error('boom'))
        const { result } = renderHook(() => useTodoLists())
        await waitFor(() => expect(result.current.loading).toBe(false))
        expect(result.current.todoLists).toEqual([])
        expect(result.current.error).toBe('boom')
    })

    it('createTodoList ajoute la liste', async () => {
        getTodoLists.mockResolvedValue([baseList({ id: 'l1' })])
        const created = baseList({ id: 'l2', name: 'Nouvelle', color: '#10B981' })
        createTodoList.mockResolvedValue(created)
        const { result } = renderHook(() => useTodoLists())
        await waitFor(() => expect(result.current.loading).toBe(false))
        await act(async () => {
            await result.current.createTodoList({
                name: 'Nouvelle',
                description: 'D',
                color: '#10B981',
            })
        })
        expect(createTodoList).toHaveBeenCalledWith({
            name: 'Nouvelle',
            description: 'D',
            color: '#10B981',
        })
        expect(result.current.todoLists.map((l) => l.id)).toEqual(['l1', 'l2'])
    })

    it('updateTodoList remplace la liste mise à jour', async () => {
        const l1 = baseList({ id: 'l1', name: 'A' })
        const l2 = baseList({ id: 'l2', name: 'B' })
        getTodoLists.mockResolvedValue([l1, l2])
        const updated = baseList({ id: 'l2', name: 'B modifiée', color: '#EF4444' })
        updateTodoList.mockResolvedValue(updated)
        const { result } = renderHook(() => useTodoLists())
        await waitFor(() => expect(result.current.loading).toBe(false))
        await act(async () => {
            await result.current.updateTodoList('l2', { name: 'B modifiée', color: '#EF4444' })
        })
        expect(updateTodoList).toHaveBeenCalledWith('l2', { name: 'B modifiée', color: '#EF4444' })
        expect(result.current.todoLists.find((l) => l.id === 'l2')?.name).toBe('B modifiée')
    })

    it('deleteTodoList supprime la liste', async () => {
        const l1 = baseList({ id: 'l1' })
        const l2 = baseList({ id: 'l2' })
        getTodoLists.mockResolvedValue([l1, l2])
        deleteTodoList.mockResolvedValue(undefined)
        const { result } = renderHook(() => useTodoLists())
        await waitFor(() => expect(result.current.loading).toBe(false))
        await act(async () => {
            await result.current.deleteTodoList('l1')
        })
        expect(deleteTodoList).toHaveBeenCalledWith('l1')
        expect(result.current.todoLists.map((l) => l.id)).toEqual(['l2'])
    })
})
