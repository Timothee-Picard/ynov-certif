import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TodoListPage } from '@/components/Pages/TodoListPage'

jest.mock('@/hooks/useTodoList', () => ({
    useTodoList: () => ({
        todoList: { id: 'list-1', name: 'Liste test', description: 'desc', color: '#00f' },
        loading: false,
        error: null,
    }),
}))

jest.mock('@/contexts/AuthContext', () => ({
    useAuth: () => ({
        user: { id: 'u1', username: 'Test User' },
    }),
}))

const mockCreateTask = jest.fn()
const mockUpdateTask = jest.fn()
const mockDeleteTask = jest.fn()
const mockToggleTaskComplete = jest.fn()

jest.mock('@/hooks/useTasks', () => ({
    useTasks: () => ({
        tasks: [
            {
                id: 't1',
                title: 'Task 1',
                description: 'Desc 1',
                isCompleted: false,
                createdAt: new Date().toISOString(),
            },
            {
                id: 't2',
                title: 'Task 2',
                description: 'Desc 2',
                isCompleted: true,
                createdAt: new Date().toISOString(),
            },
        ],
        loading: false,
        error: null,
        createTask: mockCreateTask,
        updateTask: mockUpdateTask,
        deleteTask: mockDeleteTask,
        toggleTaskComplete: mockToggleTaskComplete,
    }),
}))

jest.mock('next/navigation', () => ({
    useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
}))

jest.mock('@/components/Tasks/TaskItem', () => {
    type Task = {
        id: string
        title: string
        description?: string
        isCompleted: boolean
        createdAt: string
        priority?: 'low' | 'medium' | 'high'
        dueDate?: string | null
    }

    type Props = {
        task: Task
        onToggleComplete: (id: string) => void
        onEdit: (task: Task) => void
        onDelete: (id: string) => void
    }

    const TaskItem = ({ task, onToggleComplete, onEdit, onDelete }: Props) => (
        <div data-testid={`task-${task.id}`}>
            <span>{task.title}</span>
            <button data-testid={`toggle-${task.id}`} onClick={() => onToggleComplete(task.id)}>
                toggle
            </button>
            <button data-testid={`edit-${task.id}`} onClick={() => onEdit(task)}>
                edit
            </button>
            <button data-testid={`delete-${task.id}`} onClick={() => onDelete(task.id)}>
                delete
            </button>
        </div>
    )

    return { TaskItem }
})

jest.mock('@/components/Tasks/TaskForm', () => {
    type Task = {
        id: string
        title: string
        description?: string
        isCompleted: boolean
        createdAt: string
        priority?: 'low' | 'medium' | 'high'
        dueDate?: string | null
    }

    type SavePayload = {
        title: string
        description?: string
        isCompleted?: boolean
        priority?: 'low' | 'medium' | 'high'
        dueDate?: string | null
    }

    type Props = {
        task?: Task | null
        onSave: (data: SavePayload) => void
        onCancel: () => void
        loading?: boolean
    }

    const TaskForm = ({ task, onSave, onCancel, loading }: Props) => (
        <div data-testid="task-form-content" aria-busy={loading ? 'true' : 'false'}>
            <div data-testid="task-form-mode">{task ? 'editing' : 'creating'}</div>
            <button
                data-testid="task-form-save"
                onClick={() =>
                    onSave({
                        title: 'Saved task',
                        description: 'Saved desc',
                        isCompleted: false,
                        priority: 'medium',
                        dueDate: null,
                    })
                }
            >
                save
            </button>
            <button data-testid="task-form-cancel" onClick={onCancel}>
                cancel
            </button>
        </div>
    )

    return { TaskForm }
})

describe('TodoListPage', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('affiche la liste et les tâches', () => {
        render(<TodoListPage id="list-1" />)
        expect(screen.getByText('Liste test')).toBeInTheDocument()
        expect(screen.getByTestId('task-t1')).toBeInTheDocument()
        expect(screen.getByTestId('task-t2')).toBeInTheDocument()
    })

    it('ouvre et ferme le formulaire de création', async () => {
        render(<TodoListPage id="list-1" />)

        await userEvent.click(screen.getByRole('button', { name: /nouvelle tâche/i }))

        const formWrapper = await screen.findByTestId('task-form')
        expect(formWrapper).toBeInTheDocument()

        const content = within(formWrapper).getByTestId('task-form-content')
        expect(within(content).getByTestId('task-form-mode')).toHaveTextContent('creating')

        await userEvent.click(within(content).getByTestId('task-form-cancel'))

        await waitFor(() => {
            expect(screen.queryByTestId('task-form')).not.toBeInTheDocument()
        })
    })

    it('ouvre le formulaire en mode édition et sauvegarde', async () => {
        render(<TodoListPage id="list-1" />)

        await userEvent.click(screen.getByTestId('edit-t1'))

        const formWrapper = await screen.findByTestId('task-form')
        const content = within(formWrapper).getByTestId('task-form-content')
        expect(within(content).getByTestId('task-form-mode')).toHaveTextContent('editing')

        await userEvent.click(within(content).getByTestId('task-form-save'))
        expect(mockUpdateTask).toHaveBeenCalledWith(
            't1',
            expect.objectContaining({ title: 'Saved task' }),
        )
    })

    it('supprime une tâche', async () => {
        render(<TodoListPage id="list-1" />)
        await userEvent.click(screen.getByTestId('delete-t1'))
        expect(mockDeleteTask).toHaveBeenCalledWith('t1')
    })

    it('toggle une tâche', async () => {
        render(<TodoListPage id="list-1" />)
        await userEvent.click(screen.getByTestId('toggle-t2'))
        expect(mockToggleTaskComplete).toHaveBeenCalledWith('t2')
    })
})
