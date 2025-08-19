'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'
import { User, LogOut, Settings, CheckSquare, Menu, X } from 'lucide-react'

export function Header() {
    const { user, logout } = useAuth()
    const [displayUser, setDisplayUser] = useState(user)
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        setDisplayUser(user)
    }, [user])

    function handleLogout() {
        logout()
        setIsMenuOpen(false)
    }

    const NavLinks = (
        <nav
            className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4"
            aria-label="Navigation principale"
        >
            <button
                onClick={() => {
                    router.push('/')
                    setIsMenuOpen(false)
                }}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors text-left ${
                    pathname === '/'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                }`}
            >
                Mes Listes
            </button>
            <button
                onClick={() => {
                    router.push('/profil')
                    setIsMenuOpen(false)
                }}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors text-left ${
                    pathname === '/profil'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                }`}
            >
                <Settings className="h-4 w-4 inline mr-2" />
                Profil
            </button>
        </nav>
    )

    const UserBlock = (
        <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
                {displayUser?.avatar ? (
                    <Image
                        src={displayUser.avatar}
                        alt={displayUser.username || 'Avatar utilisateur'}
                        width={32}
                        height={32}
                        className="rounded-full object-cover"
                    />
                ) : (
                    <User className="h-8 w-8 text-gray-400" aria-hidden />
                )}
                <span className="text-sm font-medium text-gray-700">{displayUser?.username}</span>
            </div>
            <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-gray-700 hover:text-gray-900 transition-colors"
            >
                <LogOut className="h-4 w-4" aria-hidden />
                <span className="text-sm">Déconnexion</span>
            </button>
        </div>
    )

    return (
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Barre supérieure */}
                <div className="flex h-16 items-center justify-between">
                    {/* Branding */}
                    <div className="flex items-center gap-2">
                        <CheckSquare className="h-8 w-8 text-blue-600" aria-hidden />
                        <h1 className="text-xl font-bold text-gray-900">TodoApp</h1>
                    </div>

                    {/* Bouton burger (mobile) */}
                    {displayUser ? (
                        <button
                            onClick={() => setIsMenuOpen((v) => !v)}
                            className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                            aria-label="Ouvrir/fermer le menu"
                            aria-expanded={isMenuOpen}
                            aria-controls="mobile-menu"
                        >
                            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    ) : null}

                    {/* Navigation + User (desktop) */}
                    {displayUser ? (
                        <div className="hidden md:flex items-center gap-6">
                            {NavLinks}
                            {UserBlock}
                        </div>
                    ) : null}
                </div>

                {/* Panneau mobile */}
                {displayUser ? (
                    <div
                        id="mobile-menu"
                        className={`md:hidden overflow-hidden transition-[max-height] duration-300 ${
                            isMenuOpen ? 'max-h-96' : 'max-h-0'
                        }`}
                    >
                        <div className="py-3 border-t border-gray-200 flex flex-col gap-4">
                            {NavLinks}
                            {UserBlock}
                        </div>
                    </div>
                ) : null}
            </div>
        </header>
    )
}
