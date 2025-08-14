import { User, TodoList, Task, LoginCredentials, RegisterCredentials, AuthToken } from './types';

// Mock data storage
let users: User[] = [
	{
		id: '1',
		email: 'demo@example.com',
		name: 'Demo User',
		avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
		createdAt: new Date().toISOString(),
	}
];

let todoLists: TodoList[] = [
	{
		id: '1',
		userId: '1',
		title: 'Projets Personnels',
		description: 'Mes projets et idées personnelles',
		color: '#3B82F6',
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
	{
		id: '2',
		userId: '1',
		title: 'Travail',
		description: 'Tâches professionnelles',
		color: '#10B981',
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	}
];

let tasks: Task[] = [
	{
		id: '1',
		listId: '1',
		title: 'Créer une application TodoList',
		description: 'Développer une app complète avec auth',
		completed: false,
		priority: 'high',
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
	{
		id: '2',
		listId: '1',
		title: 'Apprendre React hooks',
		completed: true,
		priority: 'medium',
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
	{
		id: '3',
		listId: '2',
		title: 'Réunion équipe',
		description: 'Point hebdomadaire avec l\'équipe',
		completed: false,
		priority: 'medium',
		dueDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	}
];

// Simulate API delays
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Auth API
export const authApi = {
	async login(credentials: LoginCredentials): Promise<AuthToken> {
		await delay(800);

		const user = users.find(u => u.email === credentials.email);
		if (!user || credentials.password !== 'password123') {
			throw new Error('Email ou mot de passe incorrect');
		}

		const token = `mock_jwt_${user.id}_${Date.now()}`;
		const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

		return {
			token,
			user,
			expiresAt
		};
	},

	async register(credentials: RegisterCredentials): Promise<AuthToken> {
		await delay(1000);

		if (users.some(u => u.email === credentials.email)) {
			throw new Error('Cet email est déjà utilisé');
		}

		const newUser: User = {
			id: String(Date.now()),
			email: credentials.email,
			name: credentials.name,
			createdAt: new Date().toISOString(),
		};

		users.push(newUser);

		const token = `mock_jwt_${newUser.id}_${Date.now()}`;
		const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

		return {
			token,
			user: newUser,
			expiresAt
		};
	},

	async validateToken(token: string): Promise<User | null> {
		await delay(300);

		if (!token.startsWith('mock_jwt_')) {
			return null;
		}

		const userId = token.split('_')[2];
		return users.find(u => u.id === userId) || null;
	}
};

// User API
export const userApi = {
	async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
		await delay(600);

		const userIndex = users.findIndex(u => u.id === userId);
		if (userIndex === -1) {
			throw new Error('Utilisateur non trouvé');
		}

		users[userIndex] = { ...users[userIndex], ...updates };
		return users[userIndex];
	},

	async getProfile(userId: string): Promise<User> {
		await delay(300);

		const user = users.find(u => u.id === userId);
		if (!user) {
			throw new Error('Utilisateur non trouvé');
		}

		return user;
	}
};

// TodoList API
export const todoListApi = {
	async getTodoLists(userId: string): Promise<TodoList[]> {
		await delay(500);
		return todoLists.filter(list => list.userId === userId);
	},

	async createTodoList(userId: string, data: Omit<TodoList, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<TodoList> {
		await delay(600);

		const newList: TodoList = {
			id: String(Date.now()),
			userId,
			...data,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};

		todoLists.push(newList);
		return newList;
	},

	async updateTodoList(listId: string, data: Partial<TodoList>): Promise<TodoList> {
		await delay(500);

		const listIndex = todoLists.findIndex(list => list.id === listId);
		if (listIndex === -1) {
			throw new Error('Liste non trouvée');
		}

		todoLists[listIndex] = {
			...todoLists[listIndex],
			...data,
			updatedAt: new Date().toISOString(),
		};

		return todoLists[listIndex];
	},

	async deleteTodoList(listId: string): Promise<void> {
		await delay(400);

		todoLists = todoLists.filter(list => list.id !== listId);
		tasks = tasks.filter(task => task.listId !== listId);
	},

	async getTodoListById(listId: string): Promise<TodoList | null> {
		await delay(300);
		return todoLists.find(list => list.id === listId) || null;
	}
};

// Task API
export const taskApi = {
	async getTasks(listId: string): Promise<Task[]> {
		await delay(400);
		return tasks.filter(task => task.listId === listId);
	},

	async createTask(listId: string, data: Omit<Task, 'id' | 'listId' | 'createdAt' | 'updatedAt'>): Promise<Task> {
		await delay(500);

		const newTask: Task = {
			id: String(Date.now()),
			listId,
			...data,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};

		tasks.push(newTask);
		return newTask;
	},

	async updateTask(taskId: string, data: Partial<Task>): Promise<Task> {
		await delay(400);

		const taskIndex = tasks.findIndex(task => task.id === taskId);
		if (taskIndex === -1) {
			throw new Error('Tâche non trouvée');
		}

		tasks[taskIndex] = {
			...tasks[taskIndex],
			...data,
			updatedAt: new Date().toISOString(),
		};

		return tasks[taskIndex];
	},

	async deleteTask(taskId: string): Promise<void> {
		await delay(300);
		tasks = tasks.filter(task => task.id !== taskId);
	},

	async toggleTaskComplete(taskId: string): Promise<Task> {
		await delay(200);

		const taskIndex = tasks.findIndex(task => task.id === taskId);
		if (taskIndex === -1) {
			throw new Error('Tâche non trouvée');
		}

		tasks[taskIndex] = {
			...tasks[taskIndex],
			completed: !tasks[taskIndex].completed,
			updatedAt: new Date().toISOString(),
		};

		return tasks[taskIndex];
	}
};