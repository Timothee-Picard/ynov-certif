import { ChangeEvent, FormEvent, useState } from 'react';
import { Mail, Lock, User, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface RegisterFormProps {
	onSwitchToLogin: () => void;
}

export function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
	const { register, loading } = useAuth();
	const [formData, setFormData] = useState({
		username: '',
		email: '',
		password: '',
		confirmPassword: '',
	});
	const [error, setError] = useState('');

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		setError('');

		if (formData.password !== formData.confirmPassword) {
			setError('Les mots de passe ne correspondent pas');
			return;
		}

		if (formData.password.length < 6) {
			setError('Le mot de passe doit contenir au moins 6 caractères');
			return;
		}

		try {
			await register({
				username: formData.username,
				email: formData.email,
				password: formData.password,
			});
		} catch (err) {
			setError(err instanceof Error ? err.message : "Erreur lors de l'inscription");
		}
	};

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		setFormData(prev => ({
			...prev,
			[e.target.name]: e.target.value,
		}));
	};

	const errorId = 'register-error';

	return (
		<div className="w-full max-w-md mx-auto" data-testid="register-container">
			<div className="bg-white rounded-lg shadow-lg p-8">
				<div className="text-center mb-8">
					<h2 className="text-3xl font-bold text-gray-900" data-testid="register-title">
						Inscription
					</h2>
					<p className="text-gray-600 mt-2">Créez votre compte TodoApp</p>
				</div>

				<form
					onSubmit={handleSubmit}
					className="space-y-6"
					aria-labelledby="register-title"
					data-testid="register-form"
				>
					{error && (
						<div
							id={errorId}
							role="alert"
							aria-live="assertive"
							aria-atomic="true"
							className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm"
							data-testid="register-error"
						>
							{error}
						</div>
					)}

					<div>
						<label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
							Nom d&apos;utilisateur
						</label>
						<div className="relative">
							<User
								className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
								aria-hidden="true"
								focusable="false"
							/>
							<input
								id="username"
								name="username"
								type="text"
								required
								value={formData.username}
								onChange={handleChange}
								autoComplete="username"
								aria-invalid={!!error && formData.username.trim() === '' ? true : undefined}
								aria-describedby={error ? errorId : undefined}
								className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								placeholder="John Doe"
								data-testid="register-username"
							/>
						</div>
					</div>

					<div>
						<label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
							Email
						</label>
						<div className="relative">
							<Mail
								className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
								aria-hidden="true"
								focusable="false"
							/>
							<input
								id="email"
								name="email"
								type="email"
								required
								value={formData.email}
								onChange={handleChange}
								autoComplete="email"
								aria-invalid={!!error && formData.email.trim() === '' ? true : undefined}
								aria-describedby={error ? errorId : undefined}
								className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								placeholder="votre@email.com"
								data-testid="register-email"
							/>
						</div>
					</div>

					<div>
						<label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
							Mot de passe
						</label>
						<div className="relative">
							<Lock
								className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
								aria-hidden="true"
								focusable="false"
							/>
							<input
								id="password"
								name="password"
								type="password"
								required
								value={formData.password}
								onChange={handleChange}
								autoComplete="new-password"
								aria-invalid={
									!!error &&
									(error.includes('caractères') || error.includes('correspondent'))
										? true
										: undefined
								}
								aria-describedby={error ? errorId : undefined}
								className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								placeholder="••••••••"
								data-testid="register-password"
							/>
						</div>
					</div>

					<div>
						<label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
							Confirmer le mot de passe
						</label>
						<div className="relative">
							<Lock
								className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
								aria-hidden="true"
								focusable="false"
							/>
							<input
								id="confirmPassword"
								name="confirmPassword"
								type="password"
								required
								value={formData.confirmPassword}
								onChange={handleChange}
								autoComplete="new-password"
								aria-invalid={!!error && error.includes('correspondent') ? true : undefined}
								aria-describedby={error ? errorId : undefined}
								className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								placeholder="••••••••"
								data-testid="register-confirm"
							/>
						</div>
					</div>

					<button
						type="submit"
						disabled={loading}
						aria-label="S'inscrire"
						aria-busy={loading}
						className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
						data-testid="submit-button"
					>
						{loading ? (
							<Loader2 className="h-5 w-5 animate-spin" role="status" aria-label="Chargement" />
						) : (
							"S'inscrire"
						)}
					</button>
				</form>

				<div className="mt-6 text-center">
					<button
						onClick={onSwitchToLogin}
						className="text-blue-600 hover:text-blue-700 text-sm font-medium"
						type="button"
						data-testid="switch-login-button"
					>
						Déjà un compte ? Se connecter
					</button>
				</div>
			</div>
		</div>
	);
}
