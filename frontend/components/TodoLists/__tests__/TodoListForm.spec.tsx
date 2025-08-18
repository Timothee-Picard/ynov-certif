import React from 'react'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TodoListForm } from '@/components/TodoLists/TodoListForm'
import type { TodoList } from '@/utils/types'

type SavePayload = { name: string; description?: string; color: string }

const baseList = (overrides: Partial<TodoList> = {}): TodoList => ({
    id: 'list-1',
    userId: 'u1',
    name: 'Courses',
    description: 'Acheter fruits et légumes',
    color: '#3B82F6',
    createdAt: new Date('2025-08-10T10:00:00.000Z').toISOString(),
    updatedAt: new Date('2025-08-15T10:00:00.000Z').toISOString(),
    tasksCount: 0,
    completedTasksCount: 0,
    ...overrides,
})

describe('TodoListForm', () => {
    const onSave = jest.fn<Promise<void>, [SavePayload]>().mockResolvedValue(undefined)
    const onCancel = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('rend un dialog accessible en mode création', () => {
        render(<TodoListForm list={null} onSave={onSave} onCancel={onCancel} />)

        const dialog = screen.getByTestId('todolistform-dialog')
        expect(dialog).toHaveAttribute('role', 'dialog')
        expect(dialog).toHaveAttribute('aria-modal', 'true')
        expect(dialog).toHaveAttribute('aria-labelledby', 'todolistform-title')
        expect(dialog).toHaveAttribute('aria-describedby', 'todolistform-desc')

        expect(screen.getByTestId('todolistform-title')).toHaveTextContent(/nouvelle liste/i)
        expect(screen.getByTestId('todolist-form-mode')).toHaveTextContent('creating')

        expect(screen.getByTestId('todolistform-name')).toBeInTheDocument()
        expect(screen.getByTestId('todolistform-description')).toBeInTheDocument()

        const colorGroup = screen.getByTestId('todolistform-color-group')
        expect(colorGroup).toHaveAttribute('role', 'radiogroup')
    })

    it('pré-remplit les champs en mode édition et sélectionne la bonne couleur', () => {
        const list = baseList({ color: '#EF4444' })
        render(<TodoListForm list={list} onSave={onSave} onCancel={onCancel} />)

        expect(screen.getByTestId('todolistform-title')).toHaveTextContent(/modifier la liste/i)
        expect(screen.getByTestId('todolist-form-mode')).toHaveTextContent('editing')

        expect(screen.getByTestId('todolistform-name')).toHaveValue('Courses')
        expect(screen.getByTestId('todolistform-description')).toHaveValue(
            'Acheter fruits et légumes',
        )

        expect(screen.getByTestId('todolistform-color-#EF4444')).toBeChecked()
    })

    it('permet de changer la couleur (radiogroup)', async () => {
        const user = userEvent.setup()
        const list = baseList({ color: '#3B82F6' })
        render(<TodoListForm list={list} onSave={onSave} onCancel={onCancel} />)

        const oldBtn = screen.getByTestId('todolistform-color-#3B82F6')
        const newBtn = screen.getByTestId('todolistform-color-#10B981')

        expect(oldBtn).toBeChecked()
        expect(newBtn).not.toBeChecked()

        await user.click(newBtn)

        await waitFor(() => {
            expect(newBtn).toHaveAttribute('aria-checked', 'true')
        })
        expect(oldBtn).not.toBeChecked()
    })

    it('désactive "Sauvegarder" si le titre est vide, puis l’active après saisie', async () => {
        const user = userEvent.setup()
        render(<TodoListForm list={null} onSave={onSave} onCancel={onCancel} />)

        const submit = screen.getByTestId('todolistform-submit')
        expect(submit).toBeDisabled()

        await user.type(screen.getByTestId('todolistform-name'), 'Ma liste')
        expect(submit).toBeEnabled()
    })

    it('soumet les données saisies (name, description, color)', async () => {
        const user = userEvent.setup()
        render(<TodoListForm list={null} onSave={onSave} onCancel={onCancel} />)

        await user.type(screen.getByTestId('todolistform-name'), 'Travail')
        await user.type(screen.getByTestId('todolistform-description'), 'Tâches bureau')
        const colorBtn = screen.getByTestId('todolistform-color-#06B6D4')
        await user.click(colorBtn)

        await user.click(screen.getByTestId('todolistform-submit'))

        expect(onSave).toHaveBeenCalledTimes(1)
        expect(onSave).toHaveBeenCalledWith({
            name: 'Travail',
            description: 'Tâches bureau',
            color: '#06B6D4',
        })
    })

    it('affiche le spinner et aria-busy quand loading=true', () => {
        render(<TodoListForm list={null} onSave={onSave} onCancel={onCancel} loading />)

        const submit = screen.getByTestId('todolistform-submit')
        expect(submit).toBeDisabled()
        expect(submit).toHaveAttribute('aria-busy', 'true')

        const spinner = within(submit).getByTestId('todolistform-spinner')
        expect(spinner).toBeInTheDocument()
        expect(within(submit).getByRole('status', { name: /chargement/i })).toBeInTheDocument()
    })

    it('ferme via le bouton "Annuler" puis via le bouton (X) en démontant entre les rendus', async () => {
        const user = userEvent.setup()

        const { unmount } = render(<TodoListForm list={null} onSave={onSave} onCancel={onCancel} />)
        await user.click(screen.getByTestId('todolistform-cancel'))

        unmount()

        render(<TodoListForm list={null} onSave={onSave} onCancel={onCancel} />)
        await user.click(screen.getByTestId('todolistform-close'))
        expect(onCancel).toHaveBeenCalledTimes(2)
    })

    it('ferme via la touche Escape', async () => {
        const user = userEvent.setup()
        render(<TodoListForm list={null} onSave={onSave} onCancel={onCancel} />)

        const overlay = screen.getByTestId('todolistform-overlay')
        overlay.focus()
        await user.keyboard('{Escape}')
        expect(onCancel).toHaveBeenCalledTimes(1)
    })
})
