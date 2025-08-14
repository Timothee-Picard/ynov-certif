import {AuthToken, LoginCredentials, RegisterCredentials, Task, TodoList, User} from "@/utils/types";

const API_URL = "http://localhost:3002";

export const authApi = {
    async login(credentials: LoginCredentials): Promise<AuthToken> {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(credentials),
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },

    async register(credentials: RegisterCredentials): Promise<AuthToken> {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(credentials),
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },

    async validateToken(token: string): Promise<User | null> {
        const res = await fetch(`${API_URL}/auth/validate`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 401) return null;
        return res.json();
    }
};

export const userApi = {
    async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
        const res = await fetch(`${API_URL}/users/${userId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify(updates),
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },

    async getProfile(userId: string): Promise<User> {
        const res = await fetch(`${API_URL}/users/${userId}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    }
};

export const todoListApi = {
    async getTodoLists(userId: string): Promise<TodoList[]> {
        const res = await fetch(`${API_URL}/users/${userId}/todolists`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },

    async createTodoList(
        userId: string,
        data: Omit<TodoList, "id" | "userId" | "createdAt" | "updatedAt">
    ): Promise<TodoList> {
        const res = await fetch(`${API_URL}/todolists`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({ ...data, userId }),
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },

    async updateTodoList(listId: string, data: Partial<TodoList>): Promise<TodoList> {
        const res = await fetch(`${API_URL}/todolists/${listId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },

    async deleteTodoList(listId: string): Promise<void> {
        const res = await fetch(`${API_URL}/todolists/${listId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (!res.ok) throw new Error(await res.text());
    },

    async getTodoListById(listId: string): Promise<TodoList | null> {
        const res = await fetch(`${API_URL}/todolists/${listId}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (res.status === 404) return null;
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    }
};

export const taskApi = {
    async getTasks(listId: string): Promise<Task[]> {
        const res = await fetch(`${API_URL}/todolists/${listId}/tasks`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },

    async createTask(
        listId: string,
        data: Omit<Task, "id" | "listId" | "createdAt" | "updatedAt">
    ): Promise<Task> {
        const res = await fetch(`${API_URL}/tasks`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({ ...data, listId }),
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },

    async updateTask(taskId: string, data: Partial<Task>): Promise<Task> {
        const res = await fetch(`${API_URL}/tasks/${taskId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },

    async deleteTask(taskId: string): Promise<void> {
        const res = await fetch(`${API_URL}/tasks/${taskId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (!res.ok) throw new Error(await res.text());
    },

    async toggleTaskComplete(taskId: string): Promise<Task> {
        const res = await fetch(`${API_URL}/tasks/${taskId}/toggle`, {
            method: "PATCH",
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    }
};
