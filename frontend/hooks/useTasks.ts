import { useState, useEffect } from 'react'
import { Task } from '@/utils/types'
import { taskApi } from '@/utils/Api'

export function useTasks(listId: string | null) {
    const [tasks, setTasks] = useState<Task[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!listId) {
            setTasks([])
            setLoading(false)
            return
        }

        const fetchTasks = async () => {
            try {
                setLoading(true)
                setError(null)
                const taskList = await taskApi.getTasks(listId)
                setTasks(taskList)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Erreur lors du chargement')
            } finally {
                setLoading(false)
            }
        }

        fetchTasks()
    }, [listId])

    const createTask = async (data: Omit<Task, 'id' | 'listId' | 'createdAt' | 'updatedAt'>) => {
        if (!listId) throw new Error('List ID required')

        const newTask = await taskApi.createTask(listId, data)
        setTasks((prev) => [...prev, newTask])
        return newTask
    }

    const updateTask = async (taskId: string, data: Partial<Task>) => {
        const updatedTask = await taskApi.updateTask(taskId, data)
        setTasks((prev) => prev.map((task) => (task.id === taskId ? updatedTask : task)))
        return updatedTask
    }

    const deleteTask = async (taskId: string) => {
        await taskApi.deleteTask(taskId)
        setTasks((prev) => prev.filter((task) => task.id !== taskId))
    }

    const toggleTaskComplete = async (taskId: string) => {
        const updatedTask = await taskApi.toggleTaskComplete(taskId)
        setTasks((prev) => prev.map((task) => (task.id === taskId ? updatedTask : task)))
        return updatedTask
    }

    return {
        tasks,
        loading,
        error,
        createTask,
        updateTask,
        deleteTask,
        toggleTaskComplete,
        refetch: () => {
            if (listId) {
                taskApi.getTasks(listId).then(setTasks)
            }
        },
    }
}
