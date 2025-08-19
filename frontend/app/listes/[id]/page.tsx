import { TodoListPage } from '@/components/Pages/TodoListPage'

export default async function ListPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <TodoListPage id={id} />
        </div>
    )
}
