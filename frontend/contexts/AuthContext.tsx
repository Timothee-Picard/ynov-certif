'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User, LoginCredentials, RegisterCredentials } from '@/utils/types'
import { authApi } from '@/utils/Api'
import { authStorage } from '@/utils/auth'
import { useRouter } from 'next/navigation'
import { Record } from '@sinclair/typebox'

interface AuthContextType {
    user: User | null
    loading: boolean
    login: (credentials: LoginCredentials) => Promise<void>
    register: (credentials: RegisterCredentials) => Promise<void>
    logout: () => void
    updateUser: (user: User) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
    children: ReactNode
}

type ApiLikeError = { status?: number; message?: string }
const isUnauthorized = (e: unknown) =>
    typeof (e as ApiLikeError)?.status === 'number' && (e as ApiLikeError).status === 401

type ApiErrorResponse = {
    message?: string | string[]
    statusCode?: number
    error?: string
}

export function normalizeError(e: unknown): Error {
    if (
        typeof e === 'object' &&
        e !== null &&
        'response' in e &&
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        typeof (e as Record<string, unknown>).response?.data !== 'undefined'
    ) {
        const data = (e as { response: { data: ApiErrorResponse } }).response.data
        const msg = Array.isArray(data.message) ? data.message.join(', ') : data.message
        return new Error(msg || 'Erreur de connexion')
    }

    if (e instanceof Error) {
        const m = e.message
        if (m && m.startsWith('{')) {
            try {
                const parsed = JSON.parse(m) as ApiErrorResponse
                return new Error(
                    (typeof parsed.message === 'string' ? parsed.message : undefined) ||
                        'Erreur de connexion',
                )
            } catch {
                return new Error(m)
            }
        }
        return new Error(m || 'Erreur de connexion')
    }

    if (typeof e === 'object' && e !== null && 'message' in e) {
        const msg = (e as { message?: unknown }).message
        return new Error(typeof msg === 'string' ? msg : 'Erreur de connexion')
    }

    return new Error('Erreur de connexion')
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    const router = useRouter()

    const hardLogout = () => {
        authStorage.removeToken()
        setUser(null)
    }

    useEffect(() => {
        const initAuth = async () => {
            const tokenData = authStorage.getTokenData()
            if (tokenData) {
                try {
                    const validUser = await authApi.validateToken(tokenData.token)
                    if (validUser) {
                        setUser(validUser.user)
                    } else {
                        hardLogout()
                    }
                } catch (e) {
                    isUnauthorized(e)
                    hardLogout()
                }
            }
            setLoading(false)
        }

        initAuth()
    }, [])

    const login = async (credentials: LoginCredentials) => {
        setLoading(true)
        try {
            const tokenData = await authApi.login(credentials)
            authStorage.setToken(tokenData)
            localStorage.setItem('token', tokenData.token)
            setUser(tokenData.user)
        } catch (e) {
            throw normalizeError(e)
        } finally {
            setLoading(false)
        }
    }

    const register = async (credentials: RegisterCredentials) => {
        setLoading(true)
        try {
            const tokenData = await authApi.register(credentials)
            authStorage.setToken(tokenData)
            localStorage.setItem('token', tokenData.token)
            setUser(tokenData.user)
        } catch (e) {
            if (isUnauthorized(e)) {
                throw new Error('Identifiants incorrects')
            }
            throw e
        } finally {
            setLoading(false)
        }
    }

    const logout = () => {
        hardLogout()
        router.push('/')
    }

    const updateUser = (updatedUser: User) => {
        setUser(updatedUser)
    }

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
