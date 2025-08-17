'use client'
import { useState, useEffect, ChangeEvent, FormEvent, KeyboardEvent } from 'react'
import { X, Save, Loader2 } from 'lucide-react'
import { TodoList } from '@/utils/types'

interface TodoListFormProps {
    list?: TodoList | null
    onSave: (data: Omit<TodoList, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>
    onCancel: () => void
    loading?: boolean
}

const colors = [
    '#3B82F6',
    '#10B981',
    '#F97316',
    '#EF4444',
    '#8B5CF6',
    '#EC4899',
    '#06B6D4',
    '#84CC16',
]

export function TodoListForm({ list, onSave, onCancel, loading = false }: TodoListFormProps) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        color: colors[0],
    })

    useEffect(() => {
        if (list) {
            setFormData({
                name: list.name,
                description: list.description || '',
                color: list.color,
            })
        } else {
            setFormData({
                name: '',
                description: '',
                color: colors[0],
            })
        }
    }, [list])

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        await onSave(formData)
    }

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }))
    }

    const onOverlayKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Escape') onCancel()
    }

    const titleId = 'todolistform-title'
    const descId = 'todolistform-desc'

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onKeyDown={onOverlayKeyDown}
            tabIndex={-1}
            data-testid="todolistform-overlay"
        >
            <div
                className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                aria-describedby={descId}
                data-testid="todolistform-dialog"
            >
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2
                                id={titleId}
                                className="text-xl font-semibold text-gray-900"
                                data-testid="todolistform-title"
                            >
                                {list ? 'Modifier la liste' : 'Nouvelle liste'}
                            </h2>
                            <p id={descId} className="sr-only">
                                Formulaire de {list ? 'modification' : 'création'} d’une liste de
                                tâches
                            </p>
                            <span className="sr-only" data-testid="todolist-form-mode">
                                {list ? 'editing' : 'creating'}
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={onCancel}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                            aria-label="Fermer le formulaire"
                            data-testid="todolistform-close"
                        >
                            <X className="h-6 w-6" aria-hidden="true" />
                        </button>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-6"
                        data-testid="todolistform-form"
                    >
                        <div>
                            <label
                                htmlFor="name"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Titre <span aria-hidden="true">*</span>
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                aria-invalid={!formData.name.trim() ? true : undefined}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Nom de la liste"
                                data-testid="todolistform-name"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="description"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Description
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                rows={3}
                                value={formData.description}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                placeholder="Description optionnelle"
                                data-testid="todolistform-description"
                            />
                        </div>

                        <fieldset aria-labelledby="color-legend">
                            <legend
                                id="color-legend"
                                className="block text-sm font-medium text-gray-700 mb-3"
                            >
                                Couleur
                            </legend>
                            <div
                                className="flex flex-wrap gap-3"
                                role="radiogroup"
                                aria-label="Choisir une couleur pour la liste"
                                data-testid="todolistform-color-group"
                            >
                                {colors.map((color) => {
                                    const checked = formData.color === color
                                    return (
                                        <button
                                            key={color}
                                            type="button"
                                            onClick={() =>
                                                setFormData((prev) => ({ ...prev, color }))
                                            }
                                            className={`w-8 h-8 rounded-full border-2 transition-all ${
                                                checked
                                                    ? 'border-gray-800 scale-110'
                                                    : 'border-gray-300 hover:scale-105'
                                            }`}
                                            style={{ backgroundColor: color }}
                                            role="radio"
                                            aria-checked={checked}
                                            aria-label={`Couleur ${color}${checked ? ' sélectionnée' : ''}`}
                                            data-testid={`todolistform-color-${color}`}
                                        />
                                    )
                                })}
                            </div>
                        </fieldset>

                        <div className="flex space-x-3 pt-4">
                            <button
                                type="button"
                                onClick={onCancel}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                                aria-label="Annuler"
                                data-testid="todolistform-cancel"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                disabled={loading || !formData.name.trim()}
                                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                                aria-label="Sauvegarder la liste"
                                aria-busy={loading}
                                data-testid="todolistform-submit"
                            >
                                {loading ? (
                                    <Loader2
                                        className="h-4 w-4 animate-spin"
                                        role="status"
                                        aria-label="Chargement"
                                        data-testid="todolistform-spinner"
                                    />
                                ) : (
                                    <Save className="h-4 w-4" aria-hidden="true" />
                                )}
                                <span>{loading ? 'Sauvegarde...' : 'Sauvegarder'}</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
