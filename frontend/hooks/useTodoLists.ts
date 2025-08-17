import { useState, useEffect } from 'react'
import { TodoList } from '@/utils/types'
import { todoListApi } from '@/utils/Api'

export function useTodoLists() {
    const [todoLists, setTodoLists] = useState<TodoList[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchTodoLists = async () => {
            try {
                setLoading(true)
                setError(null)
                const lists = await todoListApi.getTodoLists()
                setTodoLists(lists)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Erreur lors du chargement')
            } finally {
                setLoading(false)
            }
        }

        fetchTodoLists()
    }, [])

    const createTodoList = async (
        data: Omit<TodoList, 'id' | 'userId' | 'createdAt' | 'updatedAt'>,
    ) => {
        const newList = await todoListApi.createTodoList(data)
        setTodoLists((prev) => [...prev, newList])
        return newList
    }

    const updateTodoList = async (listId: string, data: Partial<TodoList>) => {
        const updatedList = await todoListApi.updateTodoList(listId, data)
        setTodoLists((prev) => prev.map((list) => (list.id === listId ? updatedList : list)))
        return updatedList
    }

    const deleteTodoList = async (listId: string) => {
        await todoListApi.deleteTodoList(listId)
        setTodoLists((prev) => prev.filter((list) => list.id !== listId))
    }

    return {
        todoLists,
        loading,
        error,
        createTodoList,
        updateTodoList,
        deleteTodoList,
        // refetch: () => {
        // 	if (userId) {
        // 		todoListApi.getTodoLists().then(setTodoLists);
        // 	}
        // }
    }
}
