import { useState } from 'react';
import { CheckSquare } from 'lucide-react';
import {LoginForm} from "@/components/Auth/LoginForm";
import {RegisterForm} from "@/components/Auth/RegisterForm";

export function AuthPage() {
	const [isLogin, setIsLogin] = useState(true);

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
			<div className="max-w-md w-full">
				<div className="text-center mb-8">
					<div className="flex items-center justify-center space-x-2 mb-4">
						<CheckSquare className="h-12 w-12 text-blue-600" />
						<h1 className="text-3xl font-bold text-gray-900">TodoApp</h1>
					</div>
					<p className="text-gray-600">Organisez vos tâches efficacement</p>
				</div>

				{isLogin ? (
					<LoginForm onSwitchToRegister={() => setIsLogin(false)} />
				) : (
					<RegisterForm onSwitchToLogin={() => setIsLogin(true)} />
				)}
			</div>
		</div>
	);
}