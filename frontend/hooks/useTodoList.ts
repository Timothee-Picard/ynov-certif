import { useState, useEffect } from 'react';
import { TodoList } from '@/utils/types';
import { todoListApi } from '@/utils/mockApi';

export function useTodoList(listId: string | null) {
	const [todoList, setTodoList] = useState<TodoList | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!listId) {
			setTodoList(null);
			setLoading(false);
			return;
		}

		const fetchTodoList = async () => {
			try {
				setLoading(true);
				setError(null);
				const list = await todoListApi.getTodoListById(listId);
				if (!list) throw new Error('Liste non trouvée');
				setTodoList(list);
			} catch (err) {
				setError(err instanceof Error ? err.message : 'Erreur lors du chargement de la liste');
			} finally {
				setLoading(false);
			}
		};

		fetchTodoList();
	}, [listId]);

	return {
		todoList,
		loading,
		error,
		refetch: () => listId && todoListApi.getTodoListById(listId).then(setTodoList)
	};
}
