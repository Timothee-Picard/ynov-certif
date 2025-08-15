import { TodoListPage } from '@/components/Pages/TodoListPage'

export default async function ListPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    return <TodoListPage id={id} />
}
