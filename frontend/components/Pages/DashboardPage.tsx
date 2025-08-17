'use client'
import { useState } from 'react'
import { Plus, Loader2, Search } from 'lucide-react'
import { TodoList } from '@/utils/types'
import { useTodoLists } from '@/hooks/useTodoLists'
import { TodoListCard } from '@/components/TodoLists/TodoListCard'
import { TodoListForm } from '@/components/TodoLists/TodoListForm'
import { useRouter } from 'next/navigation'

export function DashboardPage() {
    const { todoLists, loading, error, createTodoList, updateTodoList, deleteTodoList } =
        useTodoLists()

    const router = useRouter()
    const [showForm, setShowForm] = useState(false)
    const [editingList, setEditingList] = useState<TodoList | null>(null)
    const [formLoading, setFormLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')

    const filteredLists = todoLists.filter(
        (list) =>
            list.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (list.description && list.description.toLowerCase().includes(searchTerm.toLowerCase())),
    )

    const handleSaveList = async (
        data: Omit<TodoList, 'id' | 'userId' | 'createdAt' | 'updatedAt'>,
    ) => {
        setFormLoading(true)
        try {
            if (editingList) {
                await updateTodoList(editingList.id, data)
            } else {
                await createTodoList(data)
            }
            setShowForm(false)
            setEditingList(null)
        } catch (error) {
            console.error('Error saving list:', error)
        } finally {
            setFormLoading(false)
        }
    }

    const handleEditList = (list: TodoList) => {
        setEditingList(list)
        setShowForm(true)
    }

    const handleDeleteList = async (listId: string) => {
        if (
            window.confirm(
                'Êtes-vous sûr de vouloir supprimer cette liste ? Toutes les tâches seront également supprimées.',
            )
        ) {
            try {
                await deleteTodoList(listId)
            } catch (error) {
                console.error('Error deleting list:', error)
            }
        }
    }

    const handleCancelForm = () => {
        setShowForm(false)
        setEditingList(null)
    }

    if (loading && todoLists.length === 0) {
        return (
            <div
                className="flex items-center justify-center h-64"
                role="status"
                aria-live="polite"
                data-testid="dashboard-loading"
            >
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" aria-label="Chargement" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="text-center py-12" role="alert" data-testid="dashboard-error">
                <p className="text-red-600">{error}</p>
            </div>
        )
    }

    const countId = 'lists-count'

    return (
        <main
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
            aria-labelledby="dashboard-title"
            data-testid="dashboard-root"
        >
            <div className="mb-8" data-testid="dashboard-header">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1
                            id="dashboard-title"
                            className="text-2xl font-bold text-gray-900"
                            data-testid="dashboard-title"
                        >
                            Mes Listes de Tâches
                        </h1>
                        <p
                            className="text-gray-600 mt-1"
                            id={countId}
                            data-testid="lists-count"
                            aria-live="polite"
                        >
                            {todoLists.length} liste{todoLists.length !== 1 ? 's' : ''}
                        </p>
                    </div>

                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center space-x-2"
                        aria-label="Créer une nouvelle liste"
                        data-testid="add-list-button"
                        type="button"
                    >
                        <Plus className="h-5 w-5" aria-hidden="true" focusable="false" />
                        <span>Nouvelle Liste</span>
                    </button>
                </div>

                <div className="mt-6 relative">
                    <Search
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
                        aria-hidden="true"
                        focusable="false"
                    />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Rechercher une liste..."
                        aria-label="Rechercher une liste"
                        aria-describedby={countId}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        data-testid="search-input"
                    />
                </div>
            </div>

            {filteredLists.length === 0 ? (
                <div className="text-center py-12" data-testid="empty-state">
                    {searchTerm ? (
                        <div>
                            <p className="text-gray-500 mb-4">
                                Aucune liste trouvée pour &quot;{searchTerm}&quot;
                            </p>
                            <button
                                onClick={() => setSearchTerm('')}
                                className="text-blue-600 hover:text-blue-700"
                                aria-label="Effacer la recherche"
                                data-testid="clear-search-button"
                                type="button"
                            >
                                Effacer la recherche
                            </button>
                        </div>
                    ) : (
                        <div>
                            <p className="text-gray-500 mb-4">
                                Aucune liste de tâches pour le moment
                            </p>
                            <button
                                onClick={() => setShowForm(true)}
                                className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
                                aria-label="Créer ma première liste"
                                data-testid="create-first-list-button"
                                type="button"
                            >
                                Créer ma première liste
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <section
                    role="region"
                    aria-label="Listes de tâches"
                    aria-live="polite"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    data-testid="lists-grid"
                >
                    {filteredLists.map((list) => (
                        <TodoListCard
                            key={list.id}
                            todoList={list}
                            taskCount={list.tasksCount || 0}
                            completedCount={list.completedTasksCount || 0}
                            onEdit={handleEditList}
                            onDelete={handleDeleteList}
                            onSelect={() => router.push(`/listes/${list.id}`)}
                        />
                    ))}
                </section>
            )}

            {showForm && (
                <TodoListForm
                    list={editingList}
                    onSave={handleSaveList}
                    onCancel={handleCancelForm}
                    loading={formLoading}
                />
            )}
        </main>
    )
}
