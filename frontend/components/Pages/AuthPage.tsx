import { useState } from 'react';
import { CheckSquare } from 'lucide-react';
import { LoginForm } from '@/components/Auth/LoginForm';
import { RegisterForm } from '@/components/Auth/RegisterForm';

export function AuthPage() {
	const [isLogin, setIsLogin] = useState(true);

	const headingId = 'auth-heading';

	return (
		<div
			className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4"
			data-testid="auth-root"
		>
			<main
				className="max-w-md w-full"
				aria-labelledby={headingId}
				data-testid="auth-main"
			>
				<div className="text-center mb-8" data-testid="auth-header">
					<div className="flex items-center justify-center space-x-2 mb-4">
						<CheckSquare
							className="h-12 w-12 text-blue-600"
							aria-hidden="true"
							focusable="false"
						/>
						<h1
							id={headingId}
							className="text-3xl font-bold text-gray-900"
							data-testid="auth-title"
						>
							TodoApp
						</h1>
					</div>
					<p className="text-gray-600" data-testid="auth-subtitle">
						Organisez vos tâches efficacement
					</p>
				</div>

				{/* Région dynamique : connexion / inscription */}
				<section
					role="region"
					aria-live="polite"
					aria-atomic="true"
					aria-label={isLogin ? 'Formulaire de connexion' : "Formulaire d’inscription"}
					data-testid="auth-mode"
				>
					{isLogin ? (
						<LoginForm onSwitchToRegister={() => setIsLogin(false)} />
					) : (
						<RegisterForm onSwitchToLogin={() => setIsLogin(true)} />
					)}
				</section>
			</main>
		</div>
	);
}
