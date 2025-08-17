import { ChangeEvent, FormEvent, useState } from 'react'
import { Mail, Lock, Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface LoginFormProps {
    onSwitchToRegister: () => void
}

export function LoginForm({ onSwitchToRegister }: LoginFormProps) {
    const { login, loading } = useAuth()
    const [formData, setFormData] = useState({
        email: 'demo@example.com',
        password: 'password123',
    })
    const [error, setError] = useState('')

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setError('')

        try {
            await login(formData)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur de connexion')
        }
    }

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }))
    }

    const errorId = 'login-error'

    return (
        <div className="w-full max-w-md mx-auto" data-testid="login-container">
            <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900" data-testid="login-title">
                        Connexion
                    </h2>
                    <p className="text-gray-600 mt-2">Accédez à vos listes de tâches</p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-6"
                    aria-labelledby="login-title"
                    data-testid="login-form"
                >
                    {error && (
                        <div
                            id={errorId}
                            role="alert"
                            aria-live="assertive"
                            aria-atomic="true"
                            className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm"
                            data-testid="login-error"
                        >
                            {error}
                        </div>
                    )}

                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
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
                                aria-invalid={!!error}
                                aria-describedby={error ? errorId : undefined}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="votre@email.com"
                                data-testid="login-email"
                            />
                        </div>
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
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
                                autoComplete="current-password"
                                aria-invalid={!!error}
                                aria-describedby={error ? errorId : undefined}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="••••••••"
                                data-testid="login-password"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        aria-label="Se connecter"
                        aria-busy={loading}
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        data-testid="submit-button"
                    >
                        {loading ? (
                            <Loader2
                                className="h-5 w-5 animate-spin"
                                role="status"
                                aria-label="Chargement"
                            />
                        ) : (
                            'Se connecter'
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={onSwitchToRegister}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        type="button"
                        data-testid="switch-register-button"
                    >
                        Pas encore de compte ? S&#39;inscrire
                    </button>
                </div>

                <div
                    className="mt-4 p-3 bg-gray-50 rounded-md text-xs text-gray-600"
                    data-testid="demo-credentials"
                >
                    <p className="font-medium">Compte de démonstration :</p>
                    <p>Email: demo@example.com</p>
                    <p>Mot de passe: password123</p>
                </div>
            </div>
        </div>
    )
}
