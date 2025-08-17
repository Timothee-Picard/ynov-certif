import { authStorage } from '@/utils/auth'
import type { AuthToken, User } from '@/utils/types'

const TOKEN_KEY = 'todoapp_auth_token'

const makeUser = (over: Partial<User> = {}): User => ({
    id: 'u1',
    email: 'tim@example.com',
    username: 'Tim',
    avatar: 'https://example.com/avatar.jpg',
    createdAt: new Date('2025-08-01T10:00:00.000Z').toISOString(),
    ...over,
})

const makeToken = (over: Partial<AuthToken> = {}): AuthToken => ({
    token: 'jwt-token',
    expiresAt: new Date(Date.now() + 60_000).toISOString(),
    user: makeUser(),
    ...over,
})

beforeEach(() => {
    const store: Record<string, string> = {}
    Object.defineProperty(window, 'localStorage', {
        value: {
            getItem: jest.fn((k: string) => (k in store ? store[k] : null)),
            setItem: jest.fn((k: string, v: string) => {
                store[k] = String(v)
            }),
            removeItem: jest.fn((k: string) => {
                delete store[k]
            }),
            clear: jest.fn(() => {
                for (const k of Object.keys(store)) delete store[k]
            }),
            key: jest.fn(),
            length: 0,
        },
        writable: true,
    })
    jest.clearAllMocks()
})

describe('authStorage', () => {
    it('getToken retourne null si rien en storage', () => {
        expect(authStorage.getToken()).toBeNull()
    })

    it('setToken stocke la valeur et getToken retourne la chaîne JSON', () => {
        const t = makeToken()
        authStorage.setToken(t)
        expect(window.localStorage.setItem).toHaveBeenCalledWith(TOKEN_KEY, JSON.stringify(t))
        const raw = authStorage.getToken()
        expect(raw).toBe(JSON.stringify(t))
    })

    it('removeToken supprime la valeur', () => {
        const t = makeToken()
        authStorage.setToken(t)
        authStorage.removeToken()
        expect(window.localStorage.removeItem).toHaveBeenCalledWith(TOKEN_KEY)
        expect(authStorage.getToken()).toBeNull()
    })

    it('getTokenData retourne un token valide non expiré', () => {
        const t = makeToken()
        window.localStorage.setItem(TOKEN_KEY, JSON.stringify(t))
        const data = authStorage.getTokenData()
        expect(data).toEqual(t)
        expect(authStorage.isTokenValid()).toBe(true)
    })

    it('getTokenData retourne null et purge si expiré', () => {
        const spy = jest.spyOn(authStorage, 'removeToken')
        const expired = makeToken({ expiresAt: new Date(Date.now() - 1000).toISOString() })
        window.localStorage.setItem(TOKEN_KEY, JSON.stringify(expired))
        const data = authStorage.getTokenData()
        expect(data).toBeNull()
        expect(spy).toHaveBeenCalled()
        expect(authStorage.isTokenValid()).toBe(false)
    })

    it('getTokenData retourne null et purge si JSON invalide', () => {
        const spy = jest.spyOn(authStorage, 'removeToken')
        window.localStorage.setItem(TOKEN_KEY, 'not-json')
        const data = authStorage.getTokenData()
        expect(data).toBeNull()
        expect(spy).toHaveBeenCalled()
        expect(authStorage.isTokenValid()).toBe(false)
    })

    it('isTokenValid retourne false si aucun token', () => {
        expect(authStorage.isTokenValid()).toBe(false)
    })
})
