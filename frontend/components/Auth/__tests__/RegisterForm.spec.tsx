import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RegisterForm } from '@/components/Auth/RegisterForm';

const mockRegister = jest.fn();
let mockLoading = false;

jest.mock('@/contexts/AuthContext', () => ({
	useAuth: () => ({ register: mockRegister, loading: mockLoading }),
}));

describe('RegisterForm', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockLoading = false;
	});

	it('affiche le formulaire et les champs par défaut', () => {
		render(<RegisterForm onSwitchToLogin={jest.fn()} />);

		expect(screen.getByTestId('register-title')).toHaveTextContent(/inscription/i);
		expect(screen.getByText(/créez votre compte todoapp/i)).toBeInTheDocument();

		const username = screen.getByTestId('register-username') as HTMLInputElement;
		const email = screen.getByTestId('register-email') as HTMLInputElement;
		const password = screen.getByTestId('register-password') as HTMLInputElement;
		const confirm = screen.getByTestId('register-confirm') as HTMLInputElement;

		expect(username.value).toBe('');
		expect(email.value).toBe('');
		expect(password.value).toBe('');
		expect(confirm.value).toBe('');

		const submit = screen.getByRole('button', { name: /s'inscrire/i });
		expect(submit).toBeEnabled();
		expect(submit).toHaveAttribute('type', 'submit');
	});

	it('met à jour les champs à la saisie', async () => {
		render(<RegisterForm onSwitchToLogin={jest.fn()} />);

		const username = screen.getByTestId('register-username') as HTMLInputElement;
		const email = screen.getByTestId('register-email') as HTMLInputElement;
		const password = screen.getByTestId('register-password') as HTMLInputElement;
		const confirm = screen.getByTestId('register-confirm') as HTMLInputElement;

		await userEvent.type(username, 'Tim');
		await userEvent.type(email, 'tim@example.com');
		await userEvent.type(password, 'secret');
		await userEvent.type(confirm, 'secret');

		expect(username.value).toBe('Tim');
		expect(email.value).toBe('tim@example.com');
		expect(password.value).toBe('secret');
		expect(confirm.value).toBe('secret');
	});

	it('affiche une erreur si les mots de passe ne correspondent pas (erreur locale)', async () => {
		render(<RegisterForm onSwitchToLogin={jest.fn()} />);

		await userEvent.type(screen.getByTestId('register-username'), 'Tim');
		await userEvent.type(screen.getByTestId('register-email'), 'tim@example.com');
		await userEvent.type(screen.getByTestId('register-password'), 'secret');
		await userEvent.type(screen.getByTestId('register-confirm'), 'different');

		await userEvent.click(screen.getByRole('button', { name: /s'inscrire/i }));

		const alert = await screen.findByRole('alert');
		expect(alert).toHaveTextContent(/les mots de passe ne correspondent pas/i);

		const pwd = screen.getByTestId('register-password');
		const confirm = screen.getByTestId('register-confirm');
		expect(pwd).toHaveAttribute('aria-describedby', 'register-error');
		expect(confirm).toHaveAttribute('aria-describedby', 'register-error');
	});

	it('affiche une erreur si le mot de passe est trop court (<6) (erreur locale)', async () => {
		render(<RegisterForm onSwitchToLogin={jest.fn()} />);

		await userEvent.type(screen.getByTestId('register-username'), 'Tim');
		await userEvent.type(screen.getByTestId('register-email'), 'tim@example.com');
		await userEvent.type(screen.getByTestId('register-password'), '123');
		await userEvent.type(screen.getByTestId('register-confirm'), '123');

		await userEvent.click(screen.getByRole('button', { name: /s'inscrire/i }));

		const alert = await screen.findByRole('alert');
		expect(alert).toHaveTextContent(/au moins 6 caractères/i);
	});

	it('soumet et appelle register(username, email, password) quand OK', async () => {
		mockRegister.mockResolvedValueOnce(undefined);
		render(<RegisterForm onSwitchToLogin={jest.fn()} />);

		await userEvent.type(screen.getByTestId('register-username'), 'Tim');
		await userEvent.type(screen.getByTestId('register-email'), 'tim@example.com');
		await userEvent.type(screen.getByTestId('register-password'), 'secret');
		await userEvent.type(screen.getByTestId('register-confirm'), 'secret');

		await userEvent.click(screen.getByRole('button', { name: /s'inscrire/i }));

		await waitFor(() => {
			expect(mockRegister).toHaveBeenCalledWith({
				username: 'Tim',
				email: 'tim@example.com',
				password: 'secret',
			});
		});

		expect(screen.queryByTestId('register-error')).toBeNull();
	});

	it("affiche le message d'erreur si register rejette avec Error(message)", async () => {
		mockRegister.mockRejectedValueOnce(new Error('Email déjà utilisé'));
		render(<RegisterForm onSwitchToLogin={jest.fn()} />);

		await userEvent.type(screen.getByTestId('register-username'), 'Tim');
		await userEvent.type(screen.getByTestId('register-email'), 'tim@example.com');
		await userEvent.type(screen.getByTestId('register-password'), 'secret');
		await userEvent.type(screen.getByTestId('register-confirm'), 'secret');

		await userEvent.click(screen.getByRole('button', { name: /s'inscrire/i }));

		const alert = await screen.findByRole('alert');
		expect(alert).toHaveTextContent('Email déjà utilisé');
	});

	it("affiche 'Erreur lors de l'inscription' si register rejette avec une valeur non-Error", async () => {
		mockRegister.mockRejectedValueOnce('bad');
		render(<RegisterForm onSwitchToLogin={jest.fn()} />);

		await userEvent.type(screen.getByTestId('register-username'), 'Tim');
		await userEvent.type(screen.getByTestId('register-email'), 'tim@example.com');
		await userEvent.type(screen.getByTestId('register-password'), 'secret');
		await userEvent.type(screen.getByTestId('register-confirm'), 'secret');

		await userEvent.click(screen.getByRole('button', { name: /s'inscrire/i }));

		const alert = await screen.findByRole('alert');
		expect(alert).toHaveTextContent(/erreur lors de l'inscription/i);
	});

	it('désactive le bouton, ajoute aria-busy et montre le spinner quand loading=true', () => {
		mockLoading = true;
		render(<RegisterForm onSwitchToLogin={jest.fn()} />);

		const submit = screen.getByRole('button', { name: /s'inscrire/i });
		expect(submit).toBeDisabled();
		expect(submit).toHaveAttribute('aria-busy', 'true');

		const spinner = within(submit).getByRole('status', { name: /chargement/i });
		expect(spinner).toBeInTheDocument();
	});

	it("appelle onSwitchToLogin au clic sur 'Déjà un compte ? Se connecter'", async () => {
		const onSwitch = jest.fn();
		render(<RegisterForm onSwitchToLogin={onSwitch} />);

		await userEvent.click(screen.getByTestId('switch-login-button'));
		expect(onSwitch).toHaveBeenCalledTimes(1);
	});

	it("nettoie l'erreur avant un nouvel essai", async () => {
		render(<RegisterForm onSwitchToLogin={jest.fn()} />);
		await userEvent.type(screen.getByTestId('register-username'), 'Tim');
		await userEvent.type(screen.getByTestId('register-email'), 'tim@example.com');
		await userEvent.type(screen.getByTestId('register-password'), 'secret');
		await userEvent.type(screen.getByTestId('register-confirm'), 'nope');

		await userEvent.click(screen.getByRole('button', { name: /s'inscrire/i }));
		expect(await screen.findByRole('alert')).toBeInTheDocument();

		await userEvent.clear(screen.getByTestId('register-confirm'));
		await userEvent.type(screen.getByTestId('register-confirm'), 'secret');

		mockRegister.mockResolvedValueOnce(undefined);
		await userEvent.click(screen.getByRole('button', { name: /s'inscrire/i }));

		await waitFor(() => {
			expect(screen.queryByRole('alert')).toBeNull();
		});
	});
});
