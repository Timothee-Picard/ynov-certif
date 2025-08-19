'use client'

import { useAuth } from '@/contexts/AuthContext'
import { AuthPage } from '@/components/Pages/AuthPage'
import { DashboardPage } from '@/components/Pages/DashboardPage'

export default function Home() {
    const { user } = useAuth()

    if (!user) {
        return <AuthPage />
    }

    return <DashboardPage />
}
