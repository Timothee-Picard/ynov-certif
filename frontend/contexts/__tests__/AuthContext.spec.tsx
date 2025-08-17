import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import type { User } from '@/utils/types';

const push = jest.fn();

jest.mock('next/navigation', () => ({
	useRouter: () => ({ push }),
}));

const validateToken = jest.fn();
const loginApi = jest.fn();
const registerApi = jest.fn();

jest.mock('@/utils/Api', () => ({
	authApi: {
		validateToken: (...args: any[]) => validateToken(...args),
		login: (...args: any[]) => loginApi(...args),
		register: (...args: any[]) => registerApi(...args),
	},
}));

const getTokenData = jest.fn();
const setToken = jest.fn();
const removeToken = jest.fn();

jest.mock('@/utils/auth', () => ({
	authStorage: {
		getTokenData: (...args: any[]) => getTokenData(...args),
		setToken: (...args: any[]) => setToken(...args),
		removeToken: (...args: any[]) => removeToken(...args),
	},
}));

const makeUser = (over: Partial<User> = {}): User => ({
	id: 'u1',
	email: 'tim@example.com',
	username: 'Tim',
	avatar: 'https://example.com/avatar.jpg',
	createdAt: new Date('2025-08-01T10:00:00.000Z').toISOString(),
	...over,
});

const tokenData = (user: User) => ({
	token: 'jwt-token',
	expiresAt: new Date(Date.now() + 3600_000).toISOString(),
	user,
});

function Consumer() {
	const { user, loading, login, register, logout, updateUser } = useAuth();
	return (
		<div>
			<div data-testid="auth-loading">{String(loading)}</div>
			<div data-testid="auth-user">{user ? user.email : ''}</div>
			<button
				data-testid="btn-login"
				onClick={() => login({ email: 'login@example.com', password: 'secret' })}
			>
				login
			</button>
			<button
				data-testid="btn-register"
				onClick={() => register({ username: 'Neo', email: 'reg@example.com', password: 'secret' })}
			>
				register
			</button>
			<button data-testid="btn-logout" onClick={() => logout()}>logout</button>
			<button
				data-testid="btn-update"
				onClick={() =>
					updateUser(
						makeUser({ id: 'u2', email: 'updated@example.com', username: 'Updated' })
					)
				}
			>
				update
			</button>
		</div>
	);
}

function renderWithProvider(ui: React.ReactElement) {
	return render(<AuthProvider>{ui}</AuthProvider>);
}

beforeEach(() => {
	push.mockReset();
	validateToken.mockReset();
	loginApi.mockReset();
	registerApi.mockReset();
	getTokenData.mockReset();
	setToken.mockReset();
	removeToken.mockReset();

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
});

describe('AuthContext', () => {
	it('lance une erreur si useAuth est utilisé hors AuthProvider', () => {
		function Bad() {
			useAuth();
			return null;
		}
		expect(() => render(<Bad />)).toThrow(/useAuth must be used within an AuthProvider/i);
	});

	it("init: pas de token -> loading=false & user=null", async () => {
		getTokenData.mockReturnValue(null);

		renderWithProvider(<Consumer />);

		await waitFor(() =>
			expect(screen.getByTestId('auth-loading')).toHaveTextContent('false')
		);
		expect(screen.getByTestId('auth-user')).toHaveTextContent('');
		expect(validateToken).not.toHaveBeenCalled();
		expect(removeToken).not.toHaveBeenCalled();
	});

	it('init: token présent et valide -> set user, loading=false', async () => {
		const u = makeUser();
		getTokenData.mockReturnValue({ token: 'jwt' });
		validateToken.mockResolvedValue(tokenData(u));

		renderWithProvider(<Consumer />);

		await waitFor(() =>
			expect(screen.getByTestId('auth-loading')).toHaveTextContent('false')
		);
		expect(screen.getByTestId('auth-user')).toHaveTextContent(u.email);
		expect(removeToken).not.toHaveBeenCalled();
	});

	it('init: token présent mais invalide -> removeToken, user=null', async () => {
		getTokenData.mockReturnValue({ token: 'jwt' });
		validateToken.mockResolvedValue(null);

		renderWithProvider(<Consumer />);

		await waitFor(() =>
			expect(screen.getByTestId('auth-loading')).toHaveTextContent('false')
		);
		expect(removeToken).toHaveBeenCalled();
		expect(screen.getByTestId('auth-user')).toHaveTextContent('');
	});

	it('init: validateToken throw -> removeToken, user=null', async () => {
		getTokenData.mockReturnValue({ token: 'jwt' });
		validateToken.mockRejectedValue(new Error('boom'));

		renderWithProvider(<Consumer />);

		await waitFor(() =>
			expect(screen.getByTestId('auth-loading')).toHaveTextContent('false')
		);
		expect(removeToken).toHaveBeenCalled();
		expect(screen.getByTestId('auth-user')).toHaveTextContent('');
	});

	it('login: set token (authStorage + localStorage) & user & loading=false', async () => {
		getTokenData.mockReturnValue(null);
		const u = makeUser({ email: 'login@example.com' });
		loginApi.mockResolvedValue(tokenData(u));

		renderWithProvider(<Consumer />);

		await userEvent.click(screen.getByTestId('btn-login'));

		await waitFor(() =>
			expect(screen.getByTestId('auth-loading')).toHaveTextContent('false')
		);

		expect(setToken).toHaveBeenCalled();
		expect(window.localStorage.setItem).toHaveBeenCalledWith('token', 'jwt-token');
		expect(screen.getByTestId('auth-user')).toHaveTextContent('login@example.com');
	});

	it('register: set token (authStorage + localStorage) & user & loading=false', async () => {
		getTokenData.mockReturnValue(null);
		const u = makeUser({ email: 'reg@example.com' });
		registerApi.mockResolvedValue(tokenData(u));

		renderWithProvider(<Consumer />);

		await userEvent.click(screen.getByTestId('btn-register'));

		await waitFor(() =>
			expect(screen.getByTestId('auth-loading')).toHaveTextContent('false')
		);

		expect(setToken).toHaveBeenCalled();
		expect(window.localStorage.setItem).toHaveBeenCalledWith('token', 'jwt-token');
		expect(screen.getByTestId('auth-user')).toHaveTextContent('reg@example.com');
	});

	it('logout: removeToken, user=null et redirect /', async () => {
		getTokenData.mockReturnValue(null);

		renderWithProvider(<Consumer />);
		await userEvent.click(screen.getByTestId('btn-update')); // set user

		expect(screen.getByTestId('auth-user')).toHaveTextContent('updated@example.com');

		await userEvent.click(screen.getByTestId('btn-logout'));

		expect(removeToken).toHaveBeenCalled();
		expect(screen.getByTestId('auth-user')).toHaveTextContent('');
		expect(push).toHaveBeenCalledWith('/');
	});

	it('updateUser: met à jour le user courant', async () => {
		getTokenData.mockReturnValue(null);

		renderWithProvider(<Consumer />);

		await userEvent.click(screen.getByTestId('btn-update'));
		expect(screen.getByTestId('auth-user')).toHaveTextContent('updated@example.com');
	});
});
