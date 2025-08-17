import { renderHook, waitFor, act } from '@testing-library/react';
import { useTodoList } from '@/hooks/useTodoList';
import type { TodoList } from '@/utils/types';

const getTodoListById = jest.fn();

jest.mock('@/utils/Api', () => ({
	todoListApi: {
		getTodoListById: (...args: any[]) => getTodoListById(...args),
	},
}));

const baseList = (over: Partial<TodoList> = {}): TodoList => ({
	id: 'l1',
	userId: 'u1',
	name: 'Ma liste',
	description: 'Description',
	color: '#3B82F6',
	tasksCount: 2,
	completedTasksCount: 1,
	createdAt: new Date('2025-08-10T10:00:00.000Z').toISOString(),
	updatedAt: new Date('2025-08-15T10:00:00.000Z').toISOString(),
	...over,
});

beforeEach(() => {
	jest.clearAllMocks();
});

describe('useTodoList', () => {
	it('listId=null → todoList=null, loading=false, pas d’appel API', async () => {
		const { result } = renderHook(() => useTodoList(null));
		await waitFor(() => expect(result.current.loading).toBe(false));
		expect(result.current.todoList).toBeNull();
		expect(result.current.error).toBeNull();
		expect(getTodoListById).not.toHaveBeenCalled();
	});

	it('succès → récupère la liste, loading=false, error=null', async () => {
		const list = baseList();
		getTodoListById.mockResolvedValue(list);
		const { result } = renderHook(() => useTodoList('l1'));
		expect(result.current.loading).toBe(true);
		await waitFor(() => expect(result.current.loading).toBe(false));
		expect(result.current.todoList).toEqual(list);
		expect(result.current.error).toBeNull();
		expect(getTodoListById).toHaveBeenCalledWith('l1');
	});

	it('API renvoie null → error="Liste non trouvée", todoList=null', async () => {
		getTodoListById.mockResolvedValue(null);
		const { result } = renderHook(() => useTodoList('l1'));
		await waitFor(() => expect(result.current.loading).toBe(false));
		expect(result.current.todoList).toBeNull();
		expect(result.current.error).toBe('Liste non trouvée');
	});

	it('API throw → error définie, todoList=null', async () => {
		getTodoListById.mockRejectedValue(new Error('boom'));
		const { result } = renderHook(() => useTodoList('l1'));
		await waitFor(() => expect(result.current.loading).toBe(false));
		expect(result.current.todoList).toBeNull();
		expect(result.current.error).toBe('boom');
	});

	it('refetch → recharge et met à jour la liste', async () => {
		const lA = baseList({ id: 'l1', name: 'Liste A' });
		getTodoListById.mockResolvedValueOnce(lA);
		const { result } = renderHook(() => useTodoList('l1'));
		await waitFor(() => expect(result.current.loading).toBe(false));
		expect(result.current.todoList?.name).toBe('Liste A');
		const lB = baseList({ id: 'l1', name: 'Liste B', updatedAt: new Date().toISOString() });
		getTodoListById.mockResolvedValueOnce(lB);
		await act(async () => {
			await result.current.refetch();
		});
		await waitFor(() => expect(result.current.todoList?.name).toBe('Liste B'));
		expect(getTodoListById).toHaveBeenLastCalledWith('l1');
	});
});
