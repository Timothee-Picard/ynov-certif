import type { AuthToken, User, TodoList, Task } from '@/utils/types';

const API_BASE = 'https://api.example.com';

const makeUser = (o: Partial<User> = {}): User => ({
	id: 'u1',
	email: 'tim@example.com',
	username: 'Tim',
	avatar: '',
	createdAt: new Date('2025-08-01T10:00:00.000Z').toISOString(),
	...o,
});

const makeToken = (o: Partial<AuthToken> = {}): AuthToken => ({
	token: 'jwt-token',
	expiresAt: new Date(Date.now() + 60_000).toISOString(),
	user: makeUser(),
	...o,
});

const makeList = (o: Partial<TodoList> = {}): TodoList => ({
	id: 'l1',
	userId: 'u1',
	name: 'Liste A',
	description: 'Desc',
	color: '#3B82F6',
	tasksCount: 0,
	completedTasksCount: 0,
	createdAt: new Date('2025-08-10T10:00:00.000Z').toISOString(),
	updatedAt: new Date('2025-08-15T10:00:00.000Z').toISOString(),
	...o,
});

const makeTask = (o: Partial<Task> = {}): Task => ({
	id: 't1',
	listId: 'l1',
	title: 'Ma tâche',
	description: 'D',
	priority: 'medium',
	isCompleted: false,
	createdAt: new Date('2025-08-12T10:00:00.000Z').toISOString(),
	...o,
});

let authApi: any;
let userApi: any;
let todoListApi: any;
let taskApi: any;

const silenceLog = jest.spyOn(console, 'log').mockImplementation(() => {});

const mockFetchOnce = (init: { ok: boolean; status: number; json?: any; text?: string }) => {
	(global.fetch as jest.Mock).mockResolvedValueOnce({
		ok: init.ok,
		status: init.status,
		json: async () => init.json,
		text: async () => init.text ?? '',
	});
};

beforeEach(() => {
	jest.resetModules();

	process.env.NEXT_PUBLIC_API_URL = API_BASE;

	const store: Record<string, string> = {};
	Object.defineProperty(window, 'localStorage', {
		value: {
			getItem: jest.fn((k: string) => (k in store ? store[k] : null)),
			setItem: jest.fn((k: string, v: string) => {
				store[k] = String(v);
			}),
			removeItem: jest.fn((k: string) => {
				delete store[k];
			}),
			clear: jest.fn(() => {
				for (const k of Object.keys(store)) delete store[k];
			}),
			key: jest.fn(),
			length: 0,
		},
		writable: true,
	});

	global.fetch = jest.fn() as any;

	// importe le module APRÈS avoir fixé env, fetch et localStorage
	const apis = require('@/utils/Api');
	authApi = apis.authApi;
	userApi = apis.userApi;
	todoListApi = apis.todoListApi;
	taskApi = apis.taskApi;
});

afterAll(() => {
	silenceLog.mockRestore();
});

describe('authApi', () => {
	it('login OK', async () => {
		const token = makeToken();
		mockFetchOnce({ ok: true, status: 200, json: token });
		const res = await authApi.login({ email: 'a@b.com', password: 'x' });
		expect(fetch).toHaveBeenCalledWith(`${API_BASE}/auth/login`, expect.objectContaining({
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ email: 'a@b.com', password: 'x' }),
		}));
		expect(res).toEqual(token);
	});

	it('login KO', async () => {
		mockFetchOnce({ ok: false, status: 400, text: 'Bad' });
		await expect(authApi.login({ email: 'a@b.com', password: 'x' })).rejects.toThrow('Bad');
	});

	it('register OK', async () => {
		const token = makeToken();
		mockFetchOnce({ ok: true, status: 201, json: token });
		const res = await authApi.register({ username: 'Tim', email: 'a@b.com', password: 'x' });
		expect(fetch).toHaveBeenCalledWith(`${API_BASE}/auth/register`, expect.objectContaining({
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ username: 'Tim', email: 'a@b.com', password: 'x' }),
		}));
		expect(res).toEqual(token);
	});

	it('register KO', async () => {
		mockFetchOnce({ ok: false, status: 409, text: 'Exists' });
		await expect(authApi.register({ username: 'Tim', email: 'a@b.com', password: 'x' })).rejects.toThrow('Exists');
	});

	it('validateToken 401 => null', async () => {
		mockFetchOnce({ ok: false, status: 401, text: 'Unauthorized' });
		const res = await authApi.validateToken('jwt');
		expect(fetch).toHaveBeenCalledWith(`${API_BASE}/auth/validate`, expect.objectContaining({
			headers: { Authorization: 'Bearer jwt' },
		}));
		expect(res).toBeNull();
	});

	it('validateToken OK => token', async () => {
		const token = makeToken();
		mockFetchOnce({ ok: true, status: 200, json: token });
		const res = await authApi.validateToken('jwt');
		expect(res).toEqual(token);
	});
});

describe('userApi', () => {
	beforeEach(() => {
		window.localStorage.setItem('token', 'jwt');
	});

	it('getProfile OK', async () => {
		const u = makeUser();
		mockFetchOnce({ ok: true, status: 200, json: u });
		const res = await userApi.getProfile();
		expect(fetch).toHaveBeenCalledWith(`${API_BASE}/user`, expect.objectContaining({
			headers: { Authorization: 'Bearer jwt' },
		}));
		expect(res).toEqual(u);
	});

	it('getProfile KO', async () => {
		mockFetchOnce({ ok: false, status: 500, text: 'Err' });
		await expect(userApi.getProfile()).rejects.toThrow('Err');
	});

	it('updateProfile OK', async () => {
		const u = makeUser({ username: 'Neo' });
		mockFetchOnce({ ok: true, status: 200, json: u });
		const res = await userApi.updateProfile({ username: 'Neo' });
		expect(fetch).toHaveBeenCalledWith(`${API_BASE}/user`, expect.objectContaining({
			method: 'PATCH',
			headers: expect.objectContaining({
				'Content-Type': 'application/json',
				Authorization: 'Bearer jwt',
			}),
			body: JSON.stringify({ username: 'Neo' }),
		}));
		expect(res).toEqual(u);
	});

	it('updateProfile KO', async () => {
		mockFetchOnce({ ok: false, status: 400, text: 'Nope' });
		await expect(userApi.updateProfile({ username: 'Neo' })).rejects.toThrow('Nope');
	});

	it('deleteProfile OK', async () => {
		mockFetchOnce({ ok: true, status: 200, json: {} });
		await userApi.deleteProfile();
		expect(fetch).toHaveBeenCalledWith(`${API_BASE}/user`, expect.objectContaining({
			method: 'DELETE',
			headers: { Authorization: 'Bearer jwt' },
		}));
	});

	it('deleteProfile KO', async () => {
		mockFetchOnce({ ok: false, status: 500, text: 'Err' });
		await expect(userApi.deleteProfile()).rejects.toThrow('Err');
	});
});

describe('todoListApi', () => {
	beforeEach(() => {
		window.localStorage.setItem('token', 'jwt');
	});

	it('getTodoLists OK', async () => {
		const lists = [makeList({ id: 'l1' }), makeList({ id: 'l2' })];
		mockFetchOnce({ ok: true, status: 200, json: lists });
		const res = await todoListApi.getTodoLists();
		expect(fetch).toHaveBeenCalledWith(`${API_BASE}/list`, expect.objectContaining({
			headers: { Authorization: 'Bearer jwt' },
		}));
		expect(res).toEqual(lists);
	});

	it('getTodoLists KO', async () => {
		mockFetchOnce({ ok: false, status: 500, text: 'Err' });
		await expect(todoListApi.getTodoLists()).rejects.toThrow('Err');
	});

	it('createTodoList OK', async () => {
		const created = makeList({ id: 'l2', name: 'Nouvelle' });
		mockFetchOnce({ ok: true, status: 201, json: created });
		const res = await todoListApi.createTodoList({ name: 'Nouvelle', description: 'D', color: '#10B981' });
		expect(fetch).toHaveBeenCalledWith(`${API_BASE}/list`, expect.objectContaining({
			method: 'POST',
			headers: expect.objectContaining({
				'Content-Type': 'application/json',
				Authorization: 'Bearer jwt',
			}),
			body: JSON.stringify({ name: 'Nouvelle', description: 'D', color: '#10B981' }),
		}));
		expect(res).toEqual(created);
	});

	it('createTodoList KO', async () => {
		mockFetchOnce({ ok: false, status: 400, text: 'No' });
		await expect(todoListApi.createTodoList({ name: 'X', description: '', color: '#3B82F6' })).rejects.toThrow('No');
	});

	it('updateTodoList OK', async () => {
		const updated = makeList({ id: 'l1', name: 'MAJ' });
		mockFetchOnce({ ok: true, status: 200, json: updated });
		const res = await todoListApi.updateTodoList('l1', { name: 'MAJ' });
		expect(fetch).toHaveBeenCalledWith(`${API_BASE}/list/l1`, expect.objectContaining({
			method: 'PATCH',
			headers: expect.objectContaining({
				'Content-Type': 'application/json',
				Authorization: 'Bearer jwt',
			}),
			body: JSON.stringify({ name: 'MAJ' }),
		}));
		expect(res).toEqual(updated);
	});

	it('updateTodoList KO', async () => {
		mockFetchOnce({ ok: false, status: 404, text: 'NF' });
		await expect(todoListApi.updateTodoList('l1', { name: 'X' })).rejects.toThrow('NF');
	});

	it('deleteTodoList OK', async () => {
		mockFetchOnce({ ok: true, status: 200, json: {} });
		await todoListApi.deleteTodoList('l1');
		expect(fetch).toHaveBeenCalledWith(`${API_BASE}/list/l1`, expect.objectContaining({
			method: 'DELETE',
			headers: { Authorization: 'Bearer jwt' },
		}));
	});

	it('deleteTodoList KO', async () => {
		mockFetchOnce({ ok: false, status: 500, text: 'Err' });
		await expect(todoListApi.deleteTodoList('l1')).rejects.toThrow('Err');
	});

	it('getTodoListById 404 => null', async () => {
		mockFetchOnce({ ok: false, status: 404, text: 'Not Found' });
		const res = await todoListApi.getTodoListById('l9');
		expect(fetch).toHaveBeenCalledWith(`${API_BASE}/list/l9`, expect.objectContaining({
			headers: { Authorization: 'Bearer jwt' },
		}));
		expect(res).toBeNull();
	});

	it('getTodoListById OK', async () => {
		const l = makeList({ id: 'l1' });
		mockFetchOnce({ ok: true, status: 200, json: l });
		const res = await todoListApi.getTodoListById('l1');
		expect(res).toEqual(l);
	});

	it('getTodoListById KO', async () => {
		mockFetchOnce({ ok: false, status: 500, text: 'Err' });
		await expect(todoListApi.getTodoListById('l1')).rejects.toThrow('Err');
	});
});

describe('taskApi', () => {
	beforeEach(() => {
		window.localStorage.setItem('token', 'jwt');
	});

	it('getTasks OK', async () => {
		const tasks = [makeTask({ id: 't1' }), makeTask({ id: 't2' })];
		mockFetchOnce({ ok: true, status: 200, json: tasks });
		const res = await taskApi.getTasks('l1');
		expect(fetch).toHaveBeenCalledWith(`${API_BASE}/task/list/l1`, expect.objectContaining({
			headers: { Authorization: 'Bearer jwt' },
		}));
		expect(res).toEqual(tasks);
	});

	it('getTasks KO', async () => {
		mockFetchOnce({ ok: false, status: 500, text: 'Err' });
		await expect(taskApi.getTasks('l1')).rejects.toThrow('Err');
	});

	it('createTask OK', async () => {
		const created = makeTask({ id: 't2', title: 'New' });
		mockFetchOnce({ ok: true, status: 201, json: created });
		const res = await taskApi.createTask('l1', { title: 'New', description: 'D', priority: 'high', isCompleted: false });
		expect(fetch).toHaveBeenCalledWith(`${API_BASE}/task/l1`, expect.objectContaining({
			method: 'POST',
			headers: expect.objectContaining({
				'Content-Type': 'application/json',
				Authorization: 'Bearer jwt',
			}),
			body: JSON.stringify({ title: 'New', description: 'D', priority: 'high', isCompleted: false }),
		}));
		expect(res).toEqual(created);
	});

	it('createTask KO', async () => {
		mockFetchOnce({ ok: false, status: 400, text: 'No' });
		await expect(taskApi.createTask('l1', { title: 'x', description: '', priority: 'low', isCompleted: false })).rejects.toThrow('No');
	});

	it('updateTask OK', async () => {
		const updated = makeTask({ id: 't1', title: 'MAJ' });
		mockFetchOnce({ ok: true, status: 200, json: updated });
		const res = await taskApi.updateTask('t1', { title: 'MAJ' });
		expect(fetch).toHaveBeenCalledWith(`${API_BASE}/task/t1`, expect.objectContaining({
			method: 'PATCH',
			headers: expect.objectContaining({
				'Content-Type': 'application/json',
				Authorization: 'Bearer jwt',
			}),
			body: JSON.stringify({ title: 'MAJ' }),
		}));
		expect(res).toEqual(updated);
	});

	it('updateTask KO', async () => {
		mockFetchOnce({ ok: false, status: 404, text: 'NF' });
		await expect(taskApi.updateTask('t1', { title: 'X' })).rejects.toThrow('NF');
	});

	it('deleteTask OK', async () => {
		mockFetchOnce({ ok: true, status: 200, json: {} });
		await taskApi.deleteTask('t1');
		expect(fetch).toHaveBeenCalledWith(`${API_BASE}/task/t1`, expect.objectContaining({
			method: 'DELETE',
			headers: { Authorization: 'Bearer jwt' },
		}));
	});

	it('deleteTask KO', async () => {
		mockFetchOnce({ ok: false, status: 500, text: 'Err' });
		await expect(taskApi.deleteTask('t1')).rejects.toThrow('Err');
	});

	it('toggleTaskComplete OK', async () => {
		const updated = makeTask({ id: 't1', isCompleted: true });
		mockFetchOnce({ ok: true, status: 200, json: updated });
		const res = await taskApi.toggleTaskComplete('t1');
		expect(fetch).toHaveBeenCalledWith(`${API_BASE}/task/t1/toggle`, expect.objectContaining({
			method: 'PATCH',
			headers: { Authorization: 'Bearer jwt' },
		}));
		expect(res).toEqual(updated);
	});

	it('toggleTaskComplete KO', async () => {
		mockFetchOnce({ ok: false, status: 500, text: 'Err' });
		await expect(taskApi.toggleTaskComplete('t1')).rejects.toThrow('Err');
	});
});
