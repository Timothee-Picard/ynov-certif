import { List, Calendar, Trash2, Edit } from 'lucide-react';
import { TodoList } from '@/utils/types';

interface TodoListCardProps {
	todoList: TodoList;
	taskCount?: number;
	completedCount?: number;
	onEdit: (list: TodoList) => void;
	onDelete: (listId: string) => void;
	onSelect: (list: TodoList) => void;
}

export function TodoListCard({
								 todoList,
								 taskCount = 0,
								 completedCount = 0,
								 onEdit,
								 onDelete,
								 onSelect
							 }: TodoListCardProps) {
	const progress = taskCount > 0 ? (completedCount / taskCount) * 100 : 0;

	console.log(todoList)

	return (
		<div
			className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 cursor-pointer group"
			onClick={() => onSelect(todoList)}
		>
			<div className="flex items-start justify-between mb-4">
				<div
					className="w-4 h-4 rounded-full flex-shrink-0 mt-1"
					style={{ backgroundColor: todoList.color }}
				/>
				<div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
					<button
						onClick={(e) => {
							e.stopPropagation();
							onEdit(todoList);
						}}
						className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
					>
						<Edit className="h-4 w-4" />
					</button>
					<button
						onClick={(e) => {
							e.stopPropagation();
							onDelete(todoList.id);
						}}
						className="p-1 text-gray-400 hover:text-red-600 transition-colors"
					>
						<Trash2 className="h-4 w-4" />
					</button>
				</div>
			</div>

			<div className="mb-4">
				<h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
					{todoList.title}
				</h3>
				{todoList.description && (
					<p className="text-gray-600 text-sm line-clamp-2">{todoList.description}</p>
				)}
			</div>

			<div className="space-y-3">
				<div className="flex items-center justify-between text-sm">
					<div className="flex items-center space-x-2 text-gray-500">
						<List className="h-4 w-4" />
						<span>{taskCount} tâche{taskCount !== 1 ? 's' : ''}</span>
					</div>
					<div className="flex items-center space-x-2 text-gray-500">
						<Calendar className="h-4 w-4" />
						<span>{new Date(todoList.updatedAt).toLocaleDateString('fr-FR')}</span>
					</div>
				</div>

				{taskCount > 0 && (
					<div className="space-y-2">
						<div className="flex justify-between text-xs text-gray-500">
							<span>Progression</span>
							<span>{Math.round(progress)}%</span>
						</div>
						<div className="w-full bg-gray-200 rounded-full h-2">
							<div
								className="h-2 rounded-full transition-all duration-300"
								style={{
									width: `${progress}%`,
									backgroundColor: todoList.color
								}}
							/>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}