import {use} from "react";
import {TodoListPage} from "@/components/Pages/TodoListPage";

interface ListPageProps {
	params: { id: string };
}

export default function ListPage({ params }: ListPageProps) {
	const { id } = use<{ id: string }>(Promise.resolve(params));

	return (
		<TodoListPage id={id} />
  );
}