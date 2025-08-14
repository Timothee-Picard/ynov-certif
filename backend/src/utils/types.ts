export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
}

export interface TodoList {
  id: string;
  userId: string;
  title: string;
  description?: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  listId: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthToken {
  token: string;
  user: User;
  expiresAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
}
