'use client';
import {ChangeEvent, FormEvent, useEffect, useState} from 'react';
import { User as UserIcon, Mail, Save, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { userApi } from '@/utils/Api';
import Image from "next/image";

export function ProfileForm() {
	const { user, updateUser, logout } = useAuth();
	const [formData, setFormData] = useState({
		username: user?.username || '',
		email: user?.email || '',
		avatar: user?.avatar || ''
	});

	useEffect(() => {
		if (user) {
			setFormData({
				username: user.username || '',
				email: user.email || '',
				avatar: user.avatar || ''
			});
		}
	}, [user]);

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
			const updatedUser = await userApi.updateProfile(formData);
			updateUser(updatedUser);
			setSuccess('Profil mis à jour avec succès !');
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
		} finally {
			setLoading(false);
		}
	};

	const handleDeleteAccount = async () => {
		if (!user) return;
		if (!confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) {
			return;
		}
		setLoading(true);
		setError('');
		setSuccess('');
		try {
			await userApi.deleteProfile();
			logout();
			setSuccess('Compte supprimé avec succès.');
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Erreur lors de la suppression du compte');
		} finally {
			setLoading(false);
		}
	};

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
		setSuccess('');
		setError('');
	};

	const errorId = 'profile-error';
	const successId = 'profile-success';

	return (
		<div className="max-w-2xl mx-auto" data-testid="profile-container">
			<div className="bg-white rounded-lg shadow-lg p-8">
				<div className="mb-8">
					<h2 className="text-2xl font-bold text-gray-900" id="profile-title" data-testid="profile-title">
						Mon Profil
					</h2>
					<p className="text-gray-600 mt-2">Gérez vos informations personnelles</p>
				</div>

				<form
					onSubmit={handleSubmit}
					className="space-y-6"
					aria-labelledby="profile-title"
					data-testid="profile-form"
				>
					{error && (
						<div
							id={errorId}
							role="alert"
							aria-live="assertive"
							aria-atomic="true"
							className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm"
							data-testid="profile-error"
						>
							{error}
						</div>
					)}

					{success && (
						<div
							id={successId}
							role="status"
							aria-live="polite"
							className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm"
							data-testid="profile-success"
						>
							{success}
						</div>
					)}

					<div className="flex items-center space-x-6">
						<div className="shrink-0" data-testid="avatar-wrapper">
							{formData.avatar ? (
								<Image
									src={formData.avatar}
									alt="Avatar"
									width={80}
									height={80}
									className="h-20 w-20 rounded-full object-cover border-4 border-gray-2 00"
									data-testid="avatar-image"
								/>
							) : (
								<div
									className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center"
									aria-label="Aucun avatar"
									data-testid="avatar-placeholder"
								>
									<UserIcon className="h-8 w-8 text-gray-400" aria-hidden="true" focusable="false" />
								</div>
							)}
						</div>

						<div className="flex-1">
							<label htmlFor="avatar" className="block text-sm font-medium text-gray-700 mb-2">
								URL de l&apos;avatar
							</label>
							<input
								id="avatar"
								name="avatar"
								type="url"
								value={formData.avatar}
								onChange={handleChange}
								aria-describedby={error ? errorId : undefined}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								placeholder="https://example.com/avatar.jpg"
								inputMode="url"
								data-testid="profile-avatar"
							/>
						</div>
					</div>

					<div>
						<label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
							Nom complet
						</label>
						<div className="relative">
							<UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" aria-hidden="true" focusable="false" />
							<input
								id="username"
								name="username"
								type="text"
								required
								value={formData.username}
								onChange={handleChange}
								autoComplete="name"
								aria-invalid={!!error && formData.username.trim() === '' ? true : undefined}
								aria-describedby={error ? errorId : undefined}
								className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								placeholder="John Doe"
								data-testid="profile-username"
							/>
						</div>
					</div>

					<div>
						<label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
							Email
						</label>
						<div className="relative">
							<Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" aria-hidden="true" focusable="false" />
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
								data-testid="profile-email"
							/>
						</div>
					</div>

					<div className="flex justify-between items-center">
						<button
							type="button"
							onClick={handleDeleteAccount}
							className="text-sm text-red-500 hover:text-red-700 hover:underline transition-colors"
							aria-label="Supprimer mon compte"
							data-testid="delete-account-button"
						>
							Supprimer mon compte
						</button>

						<button
							type="submit"
							disabled={loading}
							aria-label="Sauvegarder le profil"
							aria-busy={loading}
							className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
							data-testid="save-button"
						>
							{loading ? (
								<Loader2 className="h-5 w-5 animate-spin" role="status" aria-label="Chargement" />
							) : (
								<Save className="h-5 w-5" aria-hidden="true" focusable="false" />
							)}
							<span>{loading ? 'Sauvegarde...' : 'Sauvegarder'}</span>
						</button>
					</div>
				</form>

				<div className="mt-8 pt-6 border-t border-gray-200" data-testid="profile-meta">
					<div className="text-sm text-gray-500">
						<p>
							Membre depuis:{' '}
							{user?.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : 'N/A'}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
