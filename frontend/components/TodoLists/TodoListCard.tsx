import { KeyboardEvent } from 'react';
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
								 onSelect,
							 }: TodoListCardProps) {
	const progress = taskCount > 0 ? (completedCount / taskCount) * 100 : 0;

	const handleKey = (e: KeyboardEvent<HTMLDivElement>) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			onSelect(todoList);
		}
	};

	const titleId = `todolistcard-title-${todoList.id}`;

	return (
		<div
			className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 cursor-pointer group"
			onClick={() => onSelect(todoList)}
			onKeyDown={handleKey}
			role="button"
			tabIndex={0}
			aria-labelledby={titleId}
			data-testid="list-card"
			data-list-id={todoList.id}
		>
			<div className="flex items-start justify-between mb-4">
				<div
					className="w-4 h-4 rounded-full flex-shrink-0 mt-1"
					style={{ backgroundColor: todoList.color }}
					aria-hidden="true"
					data-testid="list-color"
				/>
				<div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
					<button
						onClick={(e) => {
							e.stopPropagation();
							onEdit(todoList);
						}}
						className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
						aria-label={`Modifier la liste : ${todoList.name}`}
						data-testid={`edit-list-${todoList.id}`}
						type="button"
					>
						<Edit className="h-4 w-4" aria-hidden="true" />
					</button>
					<button
						onClick={(e) => {
							e.stopPropagation();
							onDelete(todoList.id);
						}}
						className="p-1 text-gray-400 hover:text-red-600 transition-colors"
						aria-label={`Supprimer la liste : ${todoList.name}`}
						data-testid={`delete-list-${todoList.id}`}
						type="button"
					>
						<Trash2 className="h-4 w-4" aria-hidden="true" />
					</button>
				</div>
			</div>

			<div className="mb-4">
				<h3
					id={titleId}
					className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors"
					data-testid="list-title"
				>
					{todoList.name}
				</h3>
				{todoList.description && (
					<p className="text-gray-600 text-sm line-clamp-2" data-testid="list-description">
						{todoList.description}
					</p>
				)}
			</div>

			<div className="space-y-3">
				<div className="flex items-center justify-between text-sm">
					<div className="flex items-center space-x-2 text-gray-500" data-testid="list-count">
						<List className="h-4 w-4" aria-hidden="true" />
						<span>
              {taskCount} tâche{taskCount !== 1 ? 's' : ''} (dont {completedCount} terminée
							{completedCount !== 1 ? 's' : ''})
            </span>
					</div>
					<div className="flex items-center space-x-2 text-gray-500" data-testid="list-date">
						<Calendar className="h-4 w-4" aria-hidden="true" />
						<span>{new Date(todoList.updatedAt).toLocaleDateString('fr-FR')}</span>
					</div>
				</div>

				{taskCount > 0 && (
					<div className="space-y-2" data-testid="progress-container">
						<div className="flex justify-between text-xs text-gray-500">
							<span>Progression</span>
							<span data-testid="progress-text">{Math.round(progress)}%</span>
						</div>
						<div className="w-full bg-gray-200 rounded-full h-2" aria-hidden="true">
							<div
								className="h-2 rounded-full transition-all duration-300"
								style={{ width: `${progress}%`, backgroundColor: todoList.color }}
								role="progressbar"
								aria-valuemin={0}
								aria-valuemax={100}
								aria-valuenow={Math.round(progress)}
								aria-label={`Progression : ${Math.round(progress)}%`}
								data-testid="progressbar"
							/>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
