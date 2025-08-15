export interface User {
    id: string
    email: string
    username: string
    avatar?: string
    createdAt: string
}

export interface TodoList {
    id: string
    userId: string
    name: string
    description?: string
    color: string
    tasksCount?: number
    completedTasksCount?: number
    createdAt: string
    updatedAt: string
}

export interface Task {
    id: string
    listId: string
    title: string
    description?: string
    priority: 'low' | 'medium' | 'high'
    isCompleted?: boolean
    createdAt: string
    dueDate?: string
}

export interface AuthToken {
    token: string
    user: User
    expiresAt: string
}

export interface LoginCredentials {
    email: string
    password: string
}

export interface RegisterCredentials {
    email: string
    password: string
    username: string
}
