import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mockUpdateUser = jest.fn();
const mockLogout = jest.fn();
const baseUser = {
	id: 'u1',
	username: 'Tim',
	email: 'tim@example.com',
	avatar: '',
	createdAt: '2025-08-01T10:00:00.000Z',
};

jest.mock('@/contexts/AuthContext', () => ({
	useAuth: () => ({
		user: baseUser,
		updateUser: mockUpdateUser,
		logout: mockLogout,
	}),
}));

const mockUpdateProfile = jest.fn();
const mockDeleteProfile = jest.fn();
jest.mock('@/utils/Api', () => ({
	userApi: {
		updateProfile: (...args: any[]) => mockUpdateProfile(...args),
		deleteProfile: (...args: any[]) => mockDeleteProfile(...args),
	},
}));

jest.mock('next/image', () => (props: any) => {
	// eslint-disable-next-line jsx-a11y/alt-text
	return <img {...props} />;
});

import { ProfileForm } from '@/components/Profile/ProfileForm';

function frDate(iso: string) {
	return new Date(iso).toLocaleDateString('fr-FR');
}

describe('ProfileForm', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('rend le formulaire avec les valeurs utilisateur et le placeholder avatar par défaut', () => {
		render(<ProfileForm />);

		expect(screen.getByTestId('profile-title')).toHaveTextContent('Mon Profil');

		const username = screen.getByTestId('profile-username') as HTMLInputElement;
		const email = screen.getByTestId('profile-email') as HTMLInputElement;

		expect(username.value).toBe(baseUser.username);
		expect(email.value).toBe(baseUser.email);

		expect(screen.getByTestId('avatar-placeholder')).toBeInTheDocument();

		expect(screen.getByTestId('profile-meta')).toHaveTextContent(frDate(baseUser.createdAt));
	});

	it('affiche une image d’avatar si une URL est fournie', async () => {
		render(<ProfileForm />);
		const avatarInput = screen.getByTestId('profile-avatar') as HTMLInputElement;

		await userEvent.clear(avatarInput);
		await userEvent.type(avatarInput, 'https://example.com/avatar.png');

		const img = screen.getByRole('img');
		expect(img).toHaveAttribute('src', 'https://example.com/avatar.png');
		expect(screen.queryByTestId('avatar-placeholder')).toBeNull();
	});

	it('soumet et met à jour le profil avec succès', async () => {
		mockUpdateProfile.mockResolvedValueOnce({
			...baseUser,
			username: 'Timothé',
			email: 'tim@example.com',
			avatar: '',
		});

		render(<ProfileForm />);

		await userEvent.clear(screen.getByTestId('profile-username'));
		await userEvent.type(screen.getByTestId('profile-username'), 'Timothé');

		await userEvent.click(screen.getByTestId('save-button'));

		await waitFor(() => {
			expect(mockUpdateProfile).toHaveBeenCalledWith({
				username: 'Timothé',
				email: 'tim@example.com',
				avatar: '',
			});
		});

		expect(mockUpdateUser).toHaveBeenCalledWith(
			expect.objectContaining({ username: 'Timothé' })
		);
		expect(screen.getByTestId('profile-success')).toHaveTextContent(
			'Profil mis à jour avec succès !'
		);

		expect(screen.queryByTestId('profile-error')).toBeNull();
	});

	it('affiche un message d’erreur si la mise à jour échoue', async () => {
		mockUpdateProfile.mockRejectedValueOnce(new Error('Serveur indisponible'));

		render(<ProfileForm />);

		await userEvent.click(screen.getByTestId('save-button'));

		const alert = await screen.findByRole('alert');
		expect(alert).toHaveTextContent('Serveur indisponible');
	});

	it("efface les messages dès qu'on modifie un champ", async () => {
		mockUpdateProfile.mockRejectedValueOnce(new Error('Oups'));
		render(<ProfileForm />);

		await userEvent.click(screen.getByTestId('save-button'));
		expect(await screen.findByRole('alert')).toBeInTheDocument();

		await userEvent.type(screen.getByTestId('profile-username'), 'X');

		expect(screen.queryByRole('alert')).toBeNull();
		expect(screen.queryByTestId('profile-success')).toBeNull();
	});

	it('désactive le bouton et affiche un spinner pendant la soumission (état loading intermédiaire)', async () => {
		let resolvePromise: (v?: unknown) => void;
		const pending = new Promise((res) => (resolvePromise = res));
		mockUpdateProfile.mockReturnValueOnce(pending);

		render(<ProfileForm />);

		const saveBtn = screen.getByTestId('save-button');
		await userEvent.click(saveBtn);

		expect(saveBtn).toBeDisabled();
		expect(saveBtn).toHaveAttribute('aria-busy', 'true');
		const spinner = within(saveBtn).getByRole('status', { name: /chargement/i });
		expect(spinner).toBeInTheDocument();

		resolvePromise!({ ...baseUser });
		await waitFor(() => {
			expect(saveBtn).not.toBeDisabled();
			expect(saveBtn).toHaveAttribute('aria-busy', 'false');
		});
	});

	it('ne supprime pas le compte si confirm() renvoie false', async () => {
		jest.spyOn(window, 'confirm').mockReturnValueOnce(false);

		render(<ProfileForm />);
		await userEvent.click(screen.getByTestId('delete-account-button'));

		expect(mockDeleteProfile).not.toHaveBeenCalled();
		expect(mockLogout).not.toHaveBeenCalled();

		(window.confirm as jest.Mock).mockRestore();
	});

	it('supprime le compte si confirm() renvoie true puis appelle logout', async () => {
		jest.spyOn(window, 'confirm').mockReturnValueOnce(true);
		mockDeleteProfile.mockResolvedValueOnce(undefined);

		render(<ProfileForm />);

		await userEvent.click(screen.getByTestId('delete-account-button'));

		await waitFor(() => {
			expect(mockDeleteProfile).toHaveBeenCalledTimes(1);
			expect(mockLogout).toHaveBeenCalledTimes(1);
		});

		expect(screen.getByTestId('profile-success')).toHaveTextContent('Compte supprimé avec succès.');

		(window.confirm as jest.Mock).mockRestore();
	});

	it('affiche une erreur si la suppression du compte échoue', async () => {
		jest.spyOn(window, 'confirm').mockReturnValueOnce(true);
		mockDeleteProfile.mockRejectedValueOnce(new Error('Impossible de supprimer'));

		render(<ProfileForm />);

		await userEvent.click(screen.getByTestId('delete-account-button'));

		const alert = await screen.findByRole('alert');
		expect(alert).toHaveTextContent('Impossible de supprimer');

		(window.confirm as jest.Mock).mockRestore();
	});
});
