import {
    AuthToken,
    LoginCredentials,
    RegisterCredentials,
    Task,
    TodoList,
    User,
} from '@/utils/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL

export const authApi = {
    async login(credentials: LoginCredentials): Promise<AuthToken> {
        console.log(API_URL)
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
        })
        if (!res.ok) throw new Error(await res.text())
        return res.json()
    },

    async register(credentials: RegisterCredentials): Promise<AuthToken> {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
        })
        if (!res.ok) throw new Error(await res.text())
        return res.json()
    },

    async validateToken(token: string): Promise<AuthToken | null> {
        const res = await fetch(`${API_URL}/auth/validate`, {
            headers: { Authorization: `Bearer ${token}` },
        })
        if (res.status === 401) return null
        return res.json()
    },
}

export const userApi = {
    async getProfile(): Promise<User> {
        const res = await fetch(`${API_URL}/user`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        })
        if (!res.ok) throw new Error(await res.text())
        return res.json()
    },

    async updateProfile(updates: Partial<User>): Promise<User> {
        const res = await fetch(`${API_URL}/user`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify(updates),
        })
        if (!res.ok) throw new Error(await res.text())
        return res.json()
    },

    async deleteProfile(): Promise<void> {
        const res = await fetch(`${API_URL}/user`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        })
        if (!res.ok) throw new Error(await res.text())
    },
}

export const todoListApi = {
    async getTodoLists(): Promise<TodoList[]> {
        const res = await fetch(`${API_URL}/list`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        })
        if (!res.ok) throw new Error(await res.text())
        return res.json()
    },

    async createTodoList(
        data: Omit<TodoList, 'id' | 'userId' | 'createdAt' | 'updatedAt'>,
    ): Promise<TodoList> {
        const res = await fetch(`${API_URL}/list`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify(data),
        })
        if (!res.ok) throw new Error(await res.text())
        return res.json()
    },

    async updateTodoList(listId: string, data: Partial<TodoList>): Promise<TodoList> {
        const res = await fetch(`${API_URL}/list/${listId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify(data),
        })
        if (!res.ok) throw new Error(await res.text())
        return res.json()
    },

    async deleteTodoList(listId: string): Promise<void> {
        const res = await fetch(`${API_URL}/list/${listId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        })
        if (!res.ok) throw new Error(await res.text())
    },

    async getTodoListById(listId: string): Promise<TodoList | null> {
        const res = await fetch(`${API_URL}/list/${listId}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        })
        if (res.status === 404) return null
        if (!res.ok) throw new Error(await res.text())
        return res.json()
    },
}

export const taskApi = {
    async getTasks(listId: string): Promise<Task[]> {
        const res = await fetch(`${API_URL}/task/list/${listId}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        })
        if (!res.ok) throw new Error(await res.text())
        return res.json()
    },

    async createTask(
        listId: string,
        data: Omit<Task, 'id' | 'listId' | 'createdAt' | 'updatedAt'>,
    ): Promise<Task> {
        const res = await fetch(`${API_URL}/task/${listId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify(data),
        })
        if (!res.ok) throw new Error(await res.text())
        return res.json()
    },

    async updateTask(taskId: string, data: Partial<Task>): Promise<Task> {
        const res = await fetch(`${API_URL}/task/${taskId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify(data),
        })
        if (!res.ok) throw new Error(await res.text())
        return res.json()
    },

    async deleteTask(taskId: string): Promise<void> {
        const res = await fetch(`${API_URL}/task/${taskId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        })
        if (!res.ok) throw new Error(await res.text())
    },

    async toggleTaskComplete(taskId: string): Promise<Task> {
        const res = await fetch(`${API_URL}/task/${taskId}/toggle`, {
            method: 'PATCH',
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        })
        if (!res.ok) throw new Error(await res.text())
        return res.json()
    },
}
