import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { Header } from '@/components/Layout/Header'

const mockLogout = jest.fn()
let mockUser: any = { id: 'u1', username: 'Tim', email: 'tim@example.com', avatar: null }

jest.mock('@/contexts/AuthContext', () => ({
    useAuth: () => ({ user: mockUser, logout: mockLogout }),
}))

const push = jest.fn()
let mockPathname = '/'

jest.mock('next/navigation', () => ({
    useRouter: () => ({ push }),
    usePathname: () => mockPathname,
}))

jest.mock('next/image', () => (props: any) => {
    // eslint-disable-next-line jsx-a11y/alt-text
    return <img {...props} />
})

describe('Header', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockPathname = '/'
        mockUser = { id: 'u1', username: 'Tim', email: 'tim@example.com', avatar: null }
    })

    it('affiche le titre et le username', () => {
        render(<Header />)
        expect(screen.getByText('TodoApp')).toBeInTheDocument()
        expect(screen.getByText('Tim')).toBeInTheDocument()
    })

    it('met en surbrillance "Mes Listes" quand pathname === "/"', () => {
        mockPathname = '/'
        render(<Header />)

        const listesBtn = screen.getByRole('button', { name: 'Mes Listes' })
        const profilBtn = screen.getByRole('button', { name: /Profil/i })

        expect(listesBtn).toHaveClass('bg-blue-100')
        expect(listesBtn).toHaveClass('text-blue-700')
        expect(profilBtn).not.toHaveClass('bg-blue-100')
    })

    it('met en surbrillance "Profil" quand pathname === "/profil"', () => {
        mockPathname = '/profil'
        render(<Header />)

        const profilBtn = screen.getByRole('button', { name: /Profil/i })
        const listesBtn = screen.getByRole('button', { name: 'Mes Listes' })

        expect(profilBtn).toHaveClass('bg-blue-100')
        expect(profilBtn).toHaveClass('text-blue-700')
        expect(listesBtn).not.toHaveClass('bg-blue-100')
    })

    it('navigue vers "/" au clic sur "Mes Listes"', async () => {
        render(<Header />)
        await userEvent.click(screen.getByRole('button', { name: 'Mes Listes' }))
        expect(push).toHaveBeenCalledWith('/')
    })

    it('navigue vers "/profil" au clic sur "Profil"', async () => {
        render(<Header />)
        await userEvent.click(screen.getByRole('button', { name: /Profil/i }))
        expect(push).toHaveBeenCalledWith('/profil')
    })

    it('appelle logout au clic sur "Déconnexion"', async () => {
        render(<Header />)
        await userEvent.click(screen.getByRole('button', { name: /Déconnexion/i }))
        expect(mockLogout).toHaveBeenCalledTimes(1)
    })

    it("affiche l'avatar quand present", () => {
        mockUser = { ...mockUser, username: 'Tim', avatar: 'https://example.com/a.png' }
        render(<Header />)

        const img = screen.getByRole('img')
        expect(img).toBeInTheDocument()
        expect(img).toHaveAttribute('src', 'https://example.com/a.png')
        expect(img).toHaveAttribute('alt', 'Tim')
    })

    it("n'affiche pas d'image si l'avatar est null (icône User svg)", () => {
        mockUser = { ...mockUser, avatar: null }
        render(<Header />)

        expect(screen.queryByRole('img')).not.toBeInTheDocument()
        expect(screen.getByText('Tim')).toBeInTheDocument()
    })
})
