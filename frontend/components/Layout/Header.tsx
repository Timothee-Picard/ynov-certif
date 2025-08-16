'use client';
import { User, LogOut, Settings, CheckSquare } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from "next/navigation";
import {useEffect, useState} from "react";
import Image from "next/image";

export function Header() {
	const { user, logout } = useAuth();

	const [displayUser, setDisplayUser] = useState(user);

	const router = useRouter();
	const pathname = usePathname();

	useEffect(() => {
		setDisplayUser(user);
	}, [user]);


	function handleLogout() {
		logout();
	}

	return (
		<header className="bg-white shadow-sm border-b border-gray-200">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center h-16">
					<div className="flex items-center space-x-3">
						<div className="flex items-center space-x-2">
							<CheckSquare className="h-8 w-8 text-blue-600" />
							<h1 className="text-xl font-bold text-gray-900">TodoApp</h1>
						</div>
					</div>

					<nav className="flex items-center space-x-4">
						<button
							onClick={() => router.push('/')}
							className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
								pathname === '/'
									? 'bg-blue-100 text-blue-700'
									: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
							}`}
						>
							Mes Listes
						</button>
						<button
							onClick={() => router.push('/profil')}
							className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
								pathname === '/profil'
									? 'bg-blue-100 text-blue-700'
									: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
							}`}
						>
							<Settings className="h-4 w-4 inline mr-2" />
							Profil
						</button>
					</nav>

					<div className="flex items-center space-x-4">
						<div className="flex items-center space-x-2">
							{displayUser?.avatar ? (
								<Image
									src={displayUser.avatar}
									alt={displayUser.username}
									className="h-8 w-8 rounded-full object-cover"
								/>
							) : (
								<User className="h-8 w-8 text-gray-400" />
							)}
							<span className="text-sm font-medium text-gray-700">{displayUser?.username}</span>
						</div>
						<button
							onClick={() => handleLogout()}
							className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors"
						>
							<LogOut className="h-4 w-4" />
							<span className="text-sm">Déconnexion</span>
						</button>
					</div>
				</div>
			</div>
		</header>
	);
}