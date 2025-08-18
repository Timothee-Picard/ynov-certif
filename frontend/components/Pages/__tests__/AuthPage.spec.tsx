import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

jest.mock('@/components/Auth/LoginForm', () => ({
    LoginForm: ({ onSwitchToRegister }: { onSwitchToRegister: () => void }) => (
        <div data-testid="login-form-mock">
            <button onClick={onSwitchToRegister} data-testid="switch-to-register">
                Aller à l&#39;inscription
            </button>
        </div>
    ),
}))
jest.mock('@/components/Auth/RegisterForm', () => ({
    RegisterForm: ({ onSwitchToLogin }: { onSwitchToLogin: () => void }) => (
        <div data-testid="register-form-mock">
            <button onClick={onSwitchToLogin} data-testid="switch-to-login">
                Aller à la connexion
            </button>
        </div>
    ),
}))

import { AuthPage } from '@/components/Pages/AuthPage'

describe('AuthPage', () => {
    it('affiche le header (titre + sous-titre) et les landmarks', () => {
        render(<AuthPage />)

        expect(screen.getByTestId('auth-root')).toBeInTheDocument()
        const main = screen.getByTestId('auth-main')
        expect(main).toBeInTheDocument()

        expect(main).toHaveAttribute('aria-labelledby', 'auth-heading')
        const title = screen.getByTestId('auth-title')
        expect(title).toHaveTextContent('TodoApp')
        expect(title).toHaveAttribute('id', 'auth-heading')

        expect(screen.getByTestId('auth-subtitle')).toHaveTextContent(
            /organisez vos tâches efficacement/i,
        )
    })

    it('rend le LoginForm par défaut avec aria-label correct sur la région', () => {
        render(<AuthPage />)

        const region = screen.getByTestId('auth-mode')
        expect(region).toHaveAttribute('role', 'region')
        expect(region).toHaveAttribute('aria-live', 'polite')
        expect(region).toHaveAttribute('aria-atomic', 'true')

        expect(region).toHaveAttribute('aria-label', 'Formulaire de connexion')
        expect(screen.getByTestId('login-form-mock')).toBeInTheDocument()
        expect(screen.queryByTestId('register-form-mock')).not.toBeInTheDocument()
    })

    it("bascule vers l'inscription quand on clique sur le bouton du LoginForm", async () => {
        render(<AuthPage />)

        await userEvent.click(screen.getByTestId('switch-to-register'))

        const region = screen.getByTestId('auth-mode')
        expect(region).toHaveAttribute('aria-label', 'Formulaire d’inscription')
        expect(screen.getByTestId('register-form-mock')).toBeInTheDocument()
        expect(screen.queryByTestId('login-form-mock')).not.toBeInTheDocument()
    })

    it('rebascule vers la connexion quand on clique depuis le RegisterForm', async () => {
        render(<AuthPage />)

        await userEvent.click(screen.getByTestId('switch-to-register'))
        expect(screen.getByTestId('register-form-mock')).toBeInTheDocument()

        await userEvent.click(screen.getByTestId('switch-to-login'))

        const region = screen.getByTestId('auth-mode')
        expect(region).toHaveAttribute('aria-label', 'Formulaire de connexion')
        expect(screen.getByTestId('login-form-mock')).toBeInTheDocument()
        expect(screen.queryByTestId('register-form-mock')).not.toBeInTheDocument()
    })
})
