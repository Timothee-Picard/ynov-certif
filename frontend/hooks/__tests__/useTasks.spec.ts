import { renderHook, act, waitFor } from '@testing-library/react'
import { useTasks } from '@/hooks/useTasks'
import type { Task } from '@/utils/types'

const getTasks = jest.fn()
const createTask = jest.fn()
const updateTask = jest.fn()
const deleteTask = jest.fn()
const toggleTaskComplete = jest.fn()

jest.mock('@/utils/Api', () => ({
    taskApi: {
        getTasks: (...args: any[]) => getTasks(...args),
        createTask: (...args: any[]) => createTask(...args),
        updateTask: (...args: any[]) => updateTask(...args),
        deleteTask: (...args: any[]) => deleteTask(...args),
        toggleTaskComplete: (...args: any[]) => toggleTaskComplete(...args),
    },
}))

const makeTask = (over: Partial<Task> = {}): Task => ({
    id: 't1',
    listId: 'l1',
    title: 'Tâche A',
    description: 'Desc A',
    priority: 'medium',
    isCompleted: false,
    createdAt: new Date('2025-08-01T10:00:00.000Z').toISOString(),
    ...over,
})

beforeEach(() => {
    jest.clearAllMocks()
})

describe('useTasks', () => {
    it('fetch: succès → charge la liste, loading=false, error=null', async () => {
        const items = [makeTask({ id: 't1' }), makeTask({ id: 't2', title: 'Tâche B' })]
        getTasks.mockResolvedValue(items)

        const { result } = renderHook(() => useTasks('l1'))

        expect(result.current.loading).toBe(true)

        await waitFor(() => expect(result.current.loading).toBe(false))
        expect(result.current.tasks).toEqual(items)
        expect(result.current.error).toBeNull()
        expect(getTasks).toHaveBeenCalledWith('l1')
    })

    it('fetch: échec → error définie, tasks=[], loading=false', async () => {
        getTasks.mockRejectedValue(new Error('boom'))

        const { result } = renderHook(() => useTasks('l1'))

        await waitFor(() => expect(result.current.loading).toBe(false))
        expect(result.current.tasks).toEqual([])
        expect(result.current.error).toBe('boom')
    })

    it('listId null → pas d’appel API, tasks=[], loading=false', async () => {
        const { result } = renderHook(() => useTasks(null))

        await waitFor(() => expect(result.current.loading).toBe(false))
        expect(result.current.tasks).toEqual([])
        expect(getTasks).not.toHaveBeenCalled()
    })

    it('createTask: ajoute la tâche (et appelle API avec listId)', async () => {
        const initial = [makeTask({ id: 't1' })]
        getTasks.mockResolvedValue(initial)

        const { result } = renderHook(() => useTasks('l1'))
        await waitFor(() => expect(result.current.loading).toBe(false))

        const payload = {
            title: 'Nouvelle',
            description: 'Détail',
            priority: 'high' as const,
            isCompleted: false,
        }

        const created = makeTask({
            id: 't2',
            title: payload.title,
            description: payload.description,
            priority: 'high',
        })
        createTask.mockResolvedValue(created)

        await act(async () => {
            await result.current.createTask(payload)
        })

        expect(createTask).toHaveBeenCalledWith('l1', payload)
        expect(result.current.tasks.map((t) => t.id)).toEqual(['t1', 't2'])
    })

    it('createTask: avec listId null → throw', async () => {
        const { result } = renderHook(() => useTasks(null))

        await waitFor(() => expect(result.current.loading).toBe(false))

        const payload = {
            title: 'X',
            description: '',
            priority: 'low' as const,
            isCompleted: false,
        }

        await expect(result.current.createTask(payload)).rejects.toThrow('List ID required')
        expect(createTask).not.toHaveBeenCalled()
    })

    it('updateTask: remplace la tâche par la version mise à jour', async () => {
        const initial = [
            makeTask({ id: 't1', title: 'Old' }),
            makeTask({ id: 't2', title: 'Keep' }),
        ]
        getTasks.mockResolvedValue(initial)

        const { result } = renderHook(() => useTasks('l1'))
        await waitFor(() => expect(result.current.loading).toBe(false))

        const updated = makeTask({ id: 't1', title: 'New', isCompleted: true })
        updateTask.mockResolvedValue(updated)

        await act(async () => {
            await result.current.updateTask('t1', { title: 'New', isCompleted: true })
        })

        expect(updateTask).toHaveBeenCalledWith('t1', { title: 'New', isCompleted: true })
        expect(result.current.tasks.find((t) => t.id === 't1')?.title).toBe('New')
        expect(result.current.tasks.find((t) => t.id === 't1')?.isCompleted).toBe(true)
        expect(result.current.tasks.find((t) => t.id === 't2')?.title).toBe('Keep')
    })

    it('deleteTask: supprime la tâche donnée', async () => {
        const initial = [makeTask({ id: 't1' }), makeTask({ id: 't2' })]
        getTasks.mockResolvedValue(initial)
        deleteTask.mockResolvedValue(undefined)

        const { result } = renderHook(() => useTasks('l1'))
        await waitFor(() => expect(result.current.loading).toBe(false))

        await act(async () => {
            await result.current.deleteTask('t1')
        })

        expect(deleteTask).toHaveBeenCalledWith('t1')
        expect(result.current.tasks.map((t) => t.id)).toEqual(['t2'])
    })

    it('toggleTaskComplete: remplace la tâche par celle renvoyée par l’API', async () => {
        const initial = [makeTask({ id: 't1', isCompleted: false })]
        getTasks.mockResolvedValue(initial)

        const { result } = renderHook(() => useTasks('l1'))
        await waitFor(() => expect(result.current.loading).toBe(false))

        const updated = makeTask({ id: 't1', isCompleted: true })
        toggleTaskComplete.mockResolvedValue(updated)

        await act(async () => {
            await result.current.toggleTaskComplete('t1')
        })

        expect(toggleTaskComplete).toHaveBeenCalledWith('t1')
        expect(result.current.tasks[0].isCompleted).toBe(true)
    })

    it('refetch: recharge les tâches pour le listId courant', async () => {
        getTasks.mockResolvedValueOnce([makeTask({ id: 't1' })])

        const { result } = renderHook(() => useTasks('l1'))
        await waitFor(() => expect(result.current.loading).toBe(false))
        expect(result.current.tasks.map((t) => t.id)).toEqual(['t1'])

        getTasks.mockResolvedValueOnce([makeTask({ id: 't2' }), makeTask({ id: 't3' })])

        await act(async () => {
            result.current.refetch()
        })

        await waitFor(() => expect(result.current.tasks.map((t) => t.id)).toEqual(['t2', 't3']))

        expect(getTasks).toHaveBeenLastCalledWith('l1')
    })
})
