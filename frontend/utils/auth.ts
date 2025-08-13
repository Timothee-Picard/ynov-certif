import {AuthToken} from "@/utils/types";

const TOKEN_KEY = 'todoapp_auth_token';

export const authStorage = {
	getToken(): string | null {
		return localStorage.getItem(TOKEN_KEY);
	},

	setToken(tokenData: AuthToken): void {
		localStorage.setItem(TOKEN_KEY, JSON.stringify(tokenData));
	},

	removeToken(): void {
		localStorage.removeItem(TOKEN_KEY);
	},

	getTokenData(): AuthToken | null {
		const data = localStorage.getItem(TOKEN_KEY);
		if (!data) return null;

		try {
			const tokenData: AuthToken = JSON.parse(data);

			// Check if token is expired
			if (new Date(tokenData.expiresAt) < new Date()) {
				this.removeToken();
				return null;
			}

			return tokenData;
		} catch {
			this.removeToken();
			return null;
		}
	},

	isTokenValid(): boolean {
		const tokenData = this.getTokenData();
		return tokenData !== null;
	}
};