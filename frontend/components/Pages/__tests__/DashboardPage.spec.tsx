import React from 'react';
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DashboardPage } from '@/components/Pages/DashboardPage';

let mockLists: any[] = [];
let mockLoading = false;
let mockError: string | null = null;

const mockCreate = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();

jest.mock('@/hooks/useTodoLists', () => ({
	useTodoLists: () => ({
		todoLists: mockLists,
		loading: mockLoading,
		error: mockError,
		createTodoList: mockCreate,
		updateTodoList: mockUpdate,
		deleteTodoList: mockDelete,
	}),
}));

const push = jest.fn();
jest.mock('next/navigation', () => ({
	useRouter: () => ({ push }),
}));

jest.mock('@/components/TodoLists/TodoListCard', () => ({
	TodoListCard: ({ todoList, onEdit, onDelete, onSelect }: any) => (
		<div data-testid={`card-${todoList.id}`}>
			<span data-testid="card-title">{todoList.name}</span>
			<button onClick={() => onEdit(todoList)} data-testid={`edit-${todoList.id}`}>
				edit
			</button>
			<button onClick={() => onDelete(todoList.id)} data-testid={`delete-${todoList.id}`}>
				delete
			</button>
			<button onClick={() => onSelect()} data-testid={`select-${todoList.id}`}>
				open
			</button>
		</div>
	),
}));

jest.mock('@/components/TodoLists/TodoListForm', () => ({
	TodoListForm: ({ list, onSave, onCancel, loading }: any) => (
		<div data-testid="list-form" aria-busy={loading ? 'true' : 'false'}>
			<div data-testid="form-mode">{list ? 'editing' : 'creating'}</div>
			<button
				onClick={() =>
					onSave({
						name: 'Saved name',
						description: 'Saved description',
						color: '#123456',
					})
				}
				data-testid="form-save"
			>
				save
			</button>
			<button onClick={onCancel} data-testid="form-cancel">
				cancel
			</button>
		</div>
	),
}));

describe('DashboardPage', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockLists = [];
		mockLoading = false;
		mockError = null;
	});

	it('affiche le spinner quand loading=true et aucune liste', () => {
		mockLoading = true;
		mockLists = [];
		render(<DashboardPage />);

		const loading = screen.getByTestId('dashboard-loading');
		expect(loading).toHaveAttribute('role', 'status');
		expect(within(loading).getByLabelText(/chargement/i)).toBeInTheDocument();
	});

	it('affiche une erreur quand error est présent', () => {
		mockError = 'Oups';
		render(<DashboardPage />);
		expect(screen.getByTestId('dashboard-error')).toHaveAttribute('role', 'alert');
		expect(screen.getByText('Oups')).toBeInTheDocument();
	});

	it('affiche le header, le compteur et la grille de listes', () => {
		mockLists = [
			{ id: '1', name: 'Courses', description: 'Acheter', tasksCount: 2, completedTasksCount: 1 },
			{ id: '2', name: 'Travail', description: 'Faire PR', tasksCount: 3, completedTasksCount: 0 },
		];
		render(<DashboardPage />);

		expect(screen.getByTestId('dashboard-title')).toHaveTextContent(/mes listes de tâches/i);
		expect(screen.getByTestId('lists-count')).toHaveTextContent('2 listes');

		const grid = screen.getByTestId('lists-grid');
		expect(grid).toHaveAttribute('role', 'region');
		expect(grid).toHaveAttribute('aria-label', 'Listes de tâches');

		expect(screen.getByTestId('card-1')).toBeInTheDocument();
		expect(screen.getByTestId('card-2')).toBeInTheDocument();
	});

	it('filtre les listes via la recherche et permet de nettoyer la recherche', async () => {
		mockLists = [
			{ id: '1', name: 'Courses', description: 'Acheter du lait' },
			{ id: '2', name: 'Travail', description: 'Standup quotidien' },
		];
		render(<DashboardPage />);

		await userEvent.type(screen.getByTestId('search-input'), 'course');

		expect(screen.getByTestId('lists-grid')).toBeInTheDocument();
		expect(screen.getByTestId('card-1')).toBeInTheDocument();
		expect(screen.queryByTestId('card-2')).toBeNull();

		await userEvent.clear(screen.getByTestId('search-input'));
		await userEvent.type(screen.getByTestId('search-input'), 'zzz');

		const empty = screen.getByTestId('empty-state');
		expect(empty).toBeInTheDocument();
		expect(screen.getByText(/aucune liste trouvée pour/i)).toBeInTheDocument();

		await userEvent.click(screen.getByTestId('clear-search-button'));
		expect((screen.getByTestId('search-input') as HTMLInputElement).value).toBe('');
	});

	it('affiche l’état vide initial et permet de créer la première liste (ouvre le formulaire)', async () => {
		mockLists = [];
		render(<DashboardPage />);

		const empty = screen.getByTestId('empty-state');
		expect(empty).toBeInTheDocument();
		expect(screen.getByText(/aucune liste de tâches pour le moment/i)).toBeInTheDocument();

		await userEvent.click(screen.getByTestId('create-first-list-button'));
		expect(screen.getByTestId('list-form')).toBeInTheDocument();
		expect(screen.getByTestId('form-mode')).toHaveTextContent('creating');

		await userEvent.click(screen.getByTestId('form-save'));
		await waitFor(() => {
			expect(mockCreate).toHaveBeenCalledWith({
				name: 'Saved name',
				description: 'Saved description',
				color: '#123456',
			});
		});
	});

	it('ouvre le formulaire en mode création via le bouton "Nouvelle Liste"', async () => {
		mockLists = [{ id: '1', name: 'Courses' }];
		render(<DashboardPage />);

		await userEvent.click(screen.getByTestId('add-list-button'));

		expect(screen.getByTestId('list-form')).toBeInTheDocument();
		expect(screen.getByTestId('form-mode')).toHaveTextContent('creating');
	});

	it('passe en édition depuis une card puis appelle updateTodoList au save', async () => {
		mockLists = [{ id: '42', name: 'À éditer', description: 'Ancienne desc' }];
		render(<DashboardPage />);

		await userEvent.click(screen.getByTestId('edit-42'));

		expect(screen.getByTestId('list-form')).toBeInTheDocument();
		expect(screen.getByTestId('form-mode')).toHaveTextContent('editing');

		await userEvent.click(screen.getByTestId('form-save'));
		await waitFor(() => {
			expect(mockUpdate).toHaveBeenCalledWith('42', {
				name: 'Saved name',
				description: 'Saved description',
				color: '#123456',
			});
		});
	});

	it('supprime une liste après confirmation', async () => {
		mockLists = [{ id: '7', name: 'À supprimer' }];
		jest.spyOn(window, 'confirm').mockReturnValueOnce(true);

		render(<DashboardPage />);
		await userEvent.click(screen.getByTestId('delete-7'));

		await waitFor(() => {
			expect(mockDelete).toHaveBeenCalledWith('7');
		});

		(window.confirm as jest.Mock).mockRestore();
	});

	it('navigue vers la page de la liste au clic sur open/select', async () => {
		mockLists = [{ id: '9', name: 'Navigation' }];
		render(<DashboardPage />);

		await userEvent.click(screen.getByTestId('select-9'));
		expect(push).toHaveBeenCalledWith('/listes/9');
	});

	it('ferme le formulaire via cancel', async () => {
		mockLists = [{ id: '1', name: 'X' }];
		render(<DashboardPage />);

		await userEvent.click(screen.getByTestId('add-list-button'));
		expect(screen.getByTestId('list-form')).toBeInTheDocument();

		await userEvent.click(screen.getByTestId('form-cancel'));
		await waitFor(() => {
			expect(screen.queryByTestId('list-form')).toBeNull();
		});
	});
});
