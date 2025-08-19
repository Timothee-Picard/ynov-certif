// app/not-found.tsx
import Link from 'next/link'

export default function NotFound() {
    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col items-center justify-center text-center">
                <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
                <p className="text-gray-600 mb-6">Désolé, cette page est introuvable.</p>
                <Link
                    href="/"
                    className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition"
                >
                    Retour à l’accueil
                </Link>
            </div>
        </div>
    )
}
