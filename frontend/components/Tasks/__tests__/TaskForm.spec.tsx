import React from 'react'
import { render, screen, within, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TaskForm } from '@/components/Tasks/TaskForm'

const inputVal = (el: HTMLElement) => (el as HTMLInputElement).value

describe('TaskForm', () => {
    const onSave = jest.fn<Promise<void>, any[]>().mockResolvedValue(undefined)
    const onCancel = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('rend le dialog accessible (role, aria-modal, labelledby/desc) en mode création', () => {
        render(<TaskForm task={null} onSave={onSave} onCancel={onCancel} />)

        const dialog = screen.getByTestId('taskform-dialog')
        expect(dialog).toHaveAttribute('role', 'dialog')
        expect(dialog).toHaveAttribute('aria-modal', 'true')
        expect(dialog).toHaveAttribute('aria-labelledby', 'taskform-title')
        expect(dialog).toHaveAttribute('aria-describedby', 'taskform-desc')

        expect(screen.getByTestId('taskform-title')).toHaveTextContent(/nouvelle tâche/i)
        expect(screen.getByTestId('task-form-mode')).toHaveTextContent('creating')

        expect(screen.queryByTestId('taskform-isCompleted')).not.toBeInTheDocument()
    })

    it('rend le dialog en mode édition et affiche la case "Tâche terminée"', () => {
        render(
            <TaskForm
                task={{
                    id: 't1',
                    title: 'Initial',
                    description: 'Desc',
                    isCompleted: true,
                    priority: 'high',
                    listId: 'list-1',
                    createdAt: '2024-01-01T00:00:00.000Z',
                    dueDate: '2025-08-17T10:00:00.000Z',
                }}
                onSave={onSave}
                onCancel={onCancel}
            />,
        )

        expect(screen.getByTestId('taskform-title')).toHaveTextContent(/modifier la tâche/i)
        expect(screen.getByTestId('task-form-mode')).toHaveTextContent('editing')

        const completed = screen.getByTestId('taskform-isCompleted') as HTMLInputElement
        expect(completed).toBeInTheDocument()
        expect(completed).toBeChecked()

        expect(inputVal(screen.getByTestId('taskform-title-input'))).toBe('Initial')
        expect(inputVal(screen.getByTestId('taskform-description'))).toBe('Desc')
        expect((screen.getByTestId('taskform-priority') as HTMLSelectElement).value).toBe('high')
        expect(inputVal(screen.getByTestId('taskform-dueDate'))).toBe('2025-08-17')
    })

    it('désactive le bouton "Sauvegarder" tant que le titre est vide', async () => {
        render(<TaskForm task={null} onSave={onSave} onCancel={onCancel} />)

        const submit = screen.getByTestId('taskform-submit')
        expect(submit).toBeDisabled()

        await userEvent.type(screen.getByTestId('taskform-title-input'), 'Ma tâche')
        expect(submit).toBeEnabled()
    })

    it('soumet les données (création) avec transformation de dueDate en ISO', async () => {
        render(<TaskForm task={null} onSave={onSave} onCancel={onCancel} />)

        await userEvent.type(screen.getByTestId('taskform-title-input'), 'Nouvelle')
        await userEvent.type(screen.getByTestId('taskform-description'), 'Une description')
        await userEvent.selectOptions(screen.getByTestId('taskform-priority'), 'high')
        await userEvent.type(screen.getByTestId('taskform-dueDate'), '2025-12-24')

        await userEvent.click(screen.getByTestId('taskform-submit'))

        await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1))
        const payload = onSave.mock.calls[0][0]

        expect(payload).toMatchObject({
            title: 'Nouvelle',
            description: 'Une description',
            isCompleted: false,
            priority: 'high',
        })
        expect(typeof payload.dueDate).toBe('string')
        expect(payload.dueDate.startsWith('2025-12-24')).toBe(true)
    })

    it('soumet les données (édition) et transmet isCompleted', async () => {
        render(
            <TaskForm
                task={{
                    id: 't1',
                    title: 'Init',
                    description: '',
                    isCompleted: false,
                    priority: 'medium',
                    listId: 'list-1',
                    createdAt: '2024-01-01T00:00:00.000Z',
                }}
                onSave={onSave}
                onCancel={onCancel}
            />,
        )

        await userEvent.click(screen.getByTestId('taskform-isCompleted'))
        await userEvent.clear(screen.getByTestId('taskform-title-input'))
        await userEvent.type(screen.getByTestId('taskform-title-input'), 'Mise à jour')
        await userEvent.click(screen.getByTestId('taskform-submit'))

        await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1))
        expect(onSave.mock.calls[0][0]).toMatchObject({
            title: 'Mise à jour',
            isCompleted: true,
            priority: 'medium',
            dueDate: undefined,
        })
    })

    it('affiche le spinner et aria-busy quand loading=true', () => {
        render(<TaskForm task={null} onSave={onSave} onCancel={onCancel} loading />)

        const submit = screen.getByTestId('taskform-submit')
        expect(submit).toBeDisabled()
        expect(submit).toHaveAttribute('aria-busy', 'true')

        const spinner = within(submit).getByRole('status', { name: /chargement/i })
        expect(spinner).toBeInTheDocument()
        expect(screen.getByTestId('taskform-spinner')).toBeInTheDocument()
    })

    it('ferme via le bouton "Annuler" et via le bouton (X)', async () => {
        const { unmount, getByTestId } = render(
            <TaskForm task={null} onSave={onSave} onCancel={onCancel} />,
        )

        await userEvent.click(getByTestId('taskform-cancel'))
        expect(onCancel).toHaveBeenCalledTimes(1)

        unmount()

        const { getByTestId: getByTestId2 } = render(
            <TaskForm task={null} onSave={onSave} onCancel={onCancel} />,
        )

        await userEvent.click(getByTestId2('taskform-close'))
        expect(onCancel).toHaveBeenCalledTimes(2)
    })

    it('ferme via la touche Escape', async () => {
        render(<TaskForm task={null} onSave={onSave} onCancel={onCancel} />)

        const overlay = screen.getByTestId('taskform-overlay')
        overlay.focus()
        await userEvent.keyboard('{Escape}')

        expect(onCancel).toHaveBeenCalledTimes(1)
    })
})
