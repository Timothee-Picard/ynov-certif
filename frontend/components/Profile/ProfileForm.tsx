'use client';
import {ChangeEvent, FormEvent, useState} from 'react';
import { User, Mail, Save, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { userApi } from '@/utils/mockApi';

export function ProfileForm() {
	const { user, updateUser } = useAuth();
	const [formData, setFormData] = useState({
		name: user?.name || '',
		email: user?.email || '',
		avatar: user?.avatar || ''
	});
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState('');
	const [error, setError] = useState('');

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		if (!user) return;

		setLoading(true);
		setError('');
		setSuccess('');

		try {
			const updatedUser = await userApi.updateProfile(user.id, formData);
			updateUser(updatedUser);
			setSuccess('Profil mis à jour avec succès !');
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
		} finally {
			setLoading(false);
		}
	};

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		setFormData(prev => ({
			...prev,
			[e.target.name]: e.target.value
		}));
		setSuccess('');
		setError('');
	};

	return (
		<div className="max-w-2xl mx-auto">
			<div className="bg-white rounded-lg shadow-lg p-8">
				<div className="mb-8">
					<h2 className="text-2xl font-bold text-gray-900">Mon Profil</h2>
					<p className="text-gray-600 mt-2">Gérez vos informations personnelles</p>
				</div>

				<form onSubmit={handleSubmit} className="space-y-6">
					{error && (
						<div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
							{error}
						</div>
					)}

					{success && (
						<div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm">
							{success}
						</div>
					)}

					<div className="flex items-center space-x-6">
						<div className="shrink-0">
							{formData.avatar ? (
								<img
									src={formData.avatar}
									alt="Avatar"
									className="h-20 w-20 rounded-full object-cover border-4 border-gray-200"
								/>
							) : (
								<div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center">
									<User className="h-8 w-8 text-gray-400" />
								</div>
							)}
						</div>
						<div className="flex-1">
							<label htmlFor="avatar" className="block text-sm font-medium text-gray-700 mb-2">
								URL de l'avatar
							</label>
							<input
								id="avatar"
								name="avatar"
								type="url"
								value={formData.avatar}
								onChange={handleChange}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								placeholder="https://example.com/avatar.jpg"
							/>
						</div>
					</div>

					<div>
						<label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
							Nom complet
						</label>
						<div className="relative">
							<User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
							<input
								id="name"
								name="name"
								type="text"
								required
								value={formData.name}
								onChange={handleChange}
								className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								placeholder="John Doe"
							/>
						</div>
					</div>

					<div>
						<label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
							Email
						</label>
						<div className="relative">
							<Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
							<input
								id="email"
								name="email"
								type="email"
								required
								value={formData.email}
								onChange={handleChange}
								className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								placeholder="votre@email.com"
							/>
						</div>
					</div>

					<div className="flex justify-end">
						<button
							type="submit"
							disabled={loading}
							className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
						>
							{loading ? (
								<Loader2 className="h-5 w-5 animate-spin" />
							) : (
								<Save className="h-5 w-5" />
							)}
							<span>{loading ? 'Sauvegarde...' : 'Sauvegarder'}</span>
						</button>
					</div>
				</form>

				<div className="mt-8 pt-6 border-t border-gray-200">
					<div className="text-sm text-gray-500">
						<p>Membre depuis: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : 'N/A'}</p>
					</div>
				</div>
			</div>
		</div>
	);
}