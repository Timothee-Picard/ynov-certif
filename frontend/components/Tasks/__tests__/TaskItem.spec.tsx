import React from 'react'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TaskItem } from '@/components/Tasks/TaskItem'
import type { Task } from '@/utils/types'

function deferred<T = void>() {
    let resolve!: (value: T | PromiseLike<T>) => void
    let reject!: (reason?: unknown) => void

    const promise = new Promise<T>((res, rej) => {
        resolve = res
        reject = rej
    })

    return { promise, resolve, reject }
}

const baseTask = (overrides: Partial<Task> = {}): Task => ({
    id: 't1',
    listId: 'l1',
    title: 'Ma tâche',
    description: 'Une description',
    priority: 'medium',
    isCompleted: false,
    createdAt: new Date().toISOString(),
    ...overrides,
})

describe('TaskItem', () => {
    it('rend le titre, la description, le badge de priorité et la date (non overdue)', () => {
        const dueDate = '2099-12-31T10:00:00.000Z'
        const task = baseTask({ dueDate })

        render(
            <TaskItem
                task={task}
                onToggleComplete={jest.fn().mockResolvedValue(task)}
                onEdit={jest.fn()}
                onDelete={jest.fn().mockResolvedValue(undefined)}
            />,
        )

        expect(screen.getByTestId('task-title')).toHaveTextContent('Ma tâche')
        expect(screen.getByTestId('task-description')).toHaveTextContent('Une description')
        expect(screen.getByTestId('task-priority')).toHaveTextContent(/medium/i)

        const expected = new Date(dueDate).toLocaleDateString('fr-FR')
        expect(screen.getByTestId('task-due-date')).toHaveTextContent(expected)
    })

    it('affiche la date en retard (overdue)', () => {
        const past = '2000-01-01T00:00:00.000Z'
        const task = baseTask({ dueDate: past, isCompleted: false })

        render(
            <TaskItem
                task={task}
                onToggleComplete={jest.fn().mockResolvedValue(task)}
                onEdit={jest.fn()}
                onDelete={jest.fn().mockResolvedValue(undefined)}
            />,
        )

        expect(screen.getByTestId('task-due-overdue')).toBeInTheDocument()
    })

    it('le bouton de complétion est une checkbox accessible et passe en aria-busy pendant la mutation', async () => {
        const user = userEvent.setup()
        const task = baseTask({ isCompleted: false })

        const d = deferred<Task>()
        const onToggleComplete = jest.fn().mockReturnValue(d.promise)

        render(
            <TaskItem
                task={task}
                onToggleComplete={onToggleComplete}
                onEdit={jest.fn()}
                onDelete={jest.fn().mockResolvedValue(undefined)}
            />,
        )

        const toggle = screen.getByTestId(`toggle-${task.id}`)
        expect(toggle).toHaveAttribute('role', 'checkbox')
        expect(toggle).not.toBeChecked()

        await user.click(toggle)
        expect(onToggleComplete).toHaveBeenCalledWith(task.id)
        expect(toggle).toBeDisabled()
        expect(toggle).toHaveAttribute('aria-busy', 'true')

        await act(async () => {
            d.resolve(task)
            await d.promise
        })

        await waitFor(() => expect(toggle).toBeEnabled())
        expect(toggle).not.toHaveAttribute('aria-busy')
    })

    it("clique sur 'Modifier' appelle onEdit avec la tâche", async () => {
        const user = userEvent.setup()
        const task = baseTask()
        const onEdit = jest.fn()

        render(
            <TaskItem
                task={task}
                onToggleComplete={jest.fn().mockResolvedValue(task)}
                onEdit={onEdit}
                onDelete={jest.fn().mockResolvedValue(undefined)}
            />,
        )

        await user.click(screen.getByTestId(`edit-${task.id}`))
        expect(onEdit).toHaveBeenCalledWith(task)
    })

    it("clique sur 'Supprimer' désactive le bouton pendant la promesse puis se réactive", async () => {
        const user = userEvent.setup()
        const task = baseTask()

        const d = deferred<void>()
        const onDelete = jest.fn().mockReturnValue(d.promise)

        render(
            <TaskItem
                task={task}
                onToggleComplete={jest.fn().mockResolvedValue(task)}
                onEdit={jest.fn()}
                onDelete={onDelete}
            />,
        )

        const del = screen.getByTestId(`delete-${task.id}`)
        await user.click(del)
        expect(onDelete).toHaveBeenCalledWith(task.id)
        expect(del).toBeDisabled()
        expect(del).toHaveAttribute('aria-busy', 'true')

        await act(async () => {
            d.resolve()
            await d.promise
        })

        await waitFor(() => expect(del).toBeEnabled())
        expect(del).not.toHaveAttribute('aria-busy')
    })

    it('affiche les styles barrés quand la tâche est complétée', () => {
        const task = baseTask({ isCompleted: true })

        render(
            <TaskItem
                task={task}
                onToggleComplete={jest.fn().mockResolvedValue(task)}
                onEdit={jest.fn()}
                onDelete={jest.fn().mockResolvedValue(undefined)}
            />,
        )

        expect(screen.getByTestId('task-title')).toHaveTextContent('Ma tâche')
        const toggle = screen.getByTestId(`toggle-${task.id}`)
        expect(toggle).toBeChecked()
    })
})
