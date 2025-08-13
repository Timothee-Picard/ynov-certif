import { useState, useEffect } from 'react';
import { TodoList } from '@/utils/types';
import { todoListApi } from '@/utils/mockApi';

export function useTodoLists(userId: string | null) {
	const [todoLists, setTodoLists] = useState<TodoList[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!userId) {
			setTodoLists([]);
			setLoading(false);
			return;
		}

		const fetchTodoLists = async () => {
			try {
				setLoading(true);
				setError(null);
				const lists = await todoListApi.getTodoLists(userId);
				setTodoLists(lists);
			} catch (err) {
				setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
			} finally {
				setLoading(false);
			}
		};

		fetchTodoLists();
	}, [userId]);

	const createTodoList = async (data: Omit<TodoList, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
		if (!userId) throw new Error('User not authenticated');

		const newList = await todoListApi.createTodoList(userId, data);
		setTodoLists(prev => [...prev, newList]);
		return newList;
	};

	const updateTodoList = async (listId: string, data: Partial<TodoList>) => {
		const updatedList = await todoListApi.updateTodoList(listId, data);
		setTodoLists(prev => prev.map(list => list.id === listId ? updatedList : list));
		return updatedList;
	};

	const deleteTodoList = async (listId: string) => {
		await todoListApi.deleteTodoList(listId);
		setTodoLists(prev => prev.filter(list => list.id !== listId));
	};

	return {
		todoLists,
		loading,
		error,
		createTodoList,
		updateTodoList,
		deleteTodoList,
		refetch: () => {
			if (userId) {
				todoListApi.getTodoLists(userId).then(setTodoLists);
			}
		}
	};
}