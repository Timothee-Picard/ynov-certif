import './globals.css'
import type { ReactNode } from 'react'
import { AuthProvider } from '@/contexts/AuthContext'
import { Header } from '@/components/Layout/Header'

export const metadata = {
    title: 'Mon App',
    description: 'Migrée depuis React vers Next.js App Router',
}

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="fr">
            <body>
                <AuthProvider>
                    <div className="min-h-screen bg-gray-50 text-gray-900">
                        <Header />
                        <main>{children}</main>
                    </div>
                </AuthProvider>
            </body>
        </html>
    )
}
