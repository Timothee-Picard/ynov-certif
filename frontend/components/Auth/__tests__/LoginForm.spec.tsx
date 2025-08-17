import React from 'react'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginForm } from '@/components/Auth/LoginForm'

const mockLogin = jest.fn()
let mockLoading = false

jest.mock('@/contexts/AuthContext', () => ({
    useAuth: () => ({ login: mockLogin, loading: mockLoading }),
}))

describe('LoginForm', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockLoading = false
    })

    it('affiche le formulaire avec les valeurs par défaut et le bouton accessible', () => {
        render(<LoginForm onSwitchToRegister={jest.fn()} />)

        expect(screen.getByTestId('login-title')).toHaveTextContent(/connexion/i)
        expect(screen.getByText(/accédez à vos listes/i)).toBeInTheDocument()

        const email = screen.getByTestId('login-email') as HTMLInputElement
        const password = screen.getByTestId('login-password') as HTMLInputElement
        expect(email.value).toBe('demo@example.com')
        expect(password.value).toBe('password123')

        const submit = screen.getByRole('button', { name: /se connecter/i })
        expect(submit).toBeEnabled()
        expect(submit).toHaveAttribute('type', 'submit')
    })

    it('met à jour email et mot de passe à la saisie', async () => {
        render(<LoginForm onSwitchToRegister={jest.fn()} />)

        const email = screen.getByTestId('login-email') as HTMLInputElement
        const password = screen.getByTestId('login-password') as HTMLInputElement

        await userEvent.clear(email)
        await userEvent.type(email, 'tim@example.com')
        await userEvent.clear(password)
        await userEvent.type(password, 'secret')

        expect(email.value).toBe('tim@example.com')
        expect(password.value).toBe('secret')
    })

    it('soumet et appelle login(formData) en cas de succès', async () => {
        mockLogin.mockResolvedValueOnce(undefined)
        render(<LoginForm onSwitchToRegister={jest.fn()} />)

        await userEvent.clear(screen.getByTestId('login-email'))
        await userEvent.type(screen.getByTestId('login-email'), 'tim@example.com')
        await userEvent.clear(screen.getByTestId('login-password'))
        await userEvent.type(screen.getByTestId('login-password'), 'superpass')

        await userEvent.click(screen.getByRole('button', { name: /se connecter/i }))

        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalledWith({
                email: 'tim@example.com',
                password: 'superpass',
            })
        })

        expect(screen.queryByTestId('login-error')).not.toBeInTheDocument()
    })

    it('affiche le message d’erreur quand login rejette avec Error(message)', async () => {
        mockLogin.mockRejectedValueOnce(new Error('Identifiants invalides'))
        render(<LoginForm onSwitchToRegister={jest.fn()} />)

        await userEvent.click(screen.getByRole('button', { name: /se connecter/i }))

        const alert = await screen.findByRole('alert')
        expect(alert).toHaveTextContent('Identifiants invalides')

        const email = screen.getByTestId('login-email')
        const password = screen.getByTestId('login-password')
        expect(email).toHaveAttribute('aria-describedby', 'login-error')
        expect(password).toHaveAttribute('aria-describedby', 'login-error')
        expect(email).toHaveAttribute('aria-invalid', 'true')
        expect(password).toHaveAttribute('aria-invalid', 'true')
    })

    it("affiche 'Erreur de connexion' si login rejette avec une valeur non-Error", async () => {
        mockLogin.mockRejectedValueOnce('bad')
        render(<LoginForm onSwitchToRegister={jest.fn()} />)

        await userEvent.click(screen.getByRole('button', { name: /se connecter/i }))

        const alert = await screen.findByRole('alert')
        expect(alert).toHaveTextContent(/erreur de connexion/i)
    })

    it('désactive le bouton, met aria-busy et montre le spinner quand loading=true', () => {
        mockLoading = true
        render(<LoginForm onSwitchToRegister={jest.fn()} />)

        const submit = screen.getByRole('button', { name: /se connecter/i })
        expect(submit).toBeDisabled()
        expect(submit).toHaveAttribute('aria-busy', 'true')

        const spinner = within(submit).getByRole('status', { name: /chargement/i })
        expect(spinner).toBeInTheDocument()
    })

    it("appelle onSwitchToRegister au clic sur 'S'inscrire'", async () => {
        const onSwitch = jest.fn()
        render(<LoginForm onSwitchToRegister={onSwitch} />)

        await userEvent.click(screen.getByTestId('switch-register-button'))
        expect(onSwitch).toHaveBeenCalledTimes(1)
    })

    it("nettoie l'erreur avant un nouvel essai", async () => {
        mockLogin.mockRejectedValueOnce(new Error('Bad creds'))
        render(<LoginForm onSwitchToRegister={jest.fn()} />)

        const submit = screen.getByRole('button', { name: /se connecter/i })

        await userEvent.click(submit)
        expect(await screen.findByText('Bad creds')).toBeInTheDocument()

        mockLogin.mockResolvedValueOnce(undefined)
        await userEvent.click(submit)
        await waitFor(() => {
            expect(screen.queryByText('Bad creds')).not.toBeInTheDocument()
        })
    })
})
