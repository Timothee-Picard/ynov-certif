'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginCredentials, RegisterCredentials } from '@/utils/types';
import { authApi } from '@/utils/mockApi';
import { authStorage } from '@/utils/auth';

interface AuthContextType {
	user: User | null;
	loading: boolean;
	login: (credentials: LoginCredentials) => Promise<void>;
	register: (credentials: RegisterCredentials) => Promise<void>;
	logout: () => void;
	updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
	children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const initAuth = async () => {
			const tokenData = authStorage.getTokenData();
			if (tokenData) {
				try {
					const validUser = await authApi.validateToken(tokenData.token);
					if (validUser) {
						setUser(validUser);
					} else {
						authStorage.removeToken();
					}
				} catch (error) {
					authStorage.removeToken();
				}
			}
			setLoading(false);
		};

		initAuth();
	}, []);

	const login = async (credentials: LoginCredentials) => {
		setLoading(true);
		try {
			const tokenData = await authApi.login(credentials);
			authStorage.setToken(tokenData);
            localStorage.setItem('token', tokenData.token);
			setUser(tokenData.user);
		} finally {
			setLoading(false);
		}
	};

	const register = async (credentials: RegisterCredentials) => {
		setLoading(true);
		try {
			const tokenData = await authApi.register(credentials);
			authStorage.setToken(tokenData);
            localStorage.setItem('token', tokenData.token);
			setUser(tokenData.user);
		} finally {
			setLoading(false);
		}
	};

	const logout = () => {
		authStorage.removeToken();
		setUser(null);
	};

	const updateUser = (updatedUser: User) => {
		setUser(updatedUser);
	};

	return (
		<AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
}