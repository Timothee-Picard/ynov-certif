import { useState } from 'react';
import { Check, Clock, AlertCircle, Edit, Trash2, Calendar } from 'lucide-react';
import { Task } from '@/utils/types';

interface TaskItemProps {
	task: Task;
	onToggleComplete: (taskId: string) => Promise<Task>;
	onEdit: (task: Task) => void;
	onDelete: (taskId: string) => Promise<void>;
}

const priorityColors = {
	low: 'text-green-600 bg-green-100',
	medium: 'text-yellow-600 bg-yellow-100',
	high: 'text-red-600 bg-red-100',
} as const;

const priorityIcons = {
	low: Clock,
	medium: AlertCircle,
	high: AlertCircle,
} as const;

export function TaskItem({ task, onToggleComplete, onEdit, onDelete }: TaskItemProps) {
	const [isToggling, setIsToggling] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const PriorityIcon = priorityIcons[task.priority] || AlertCircle;
	const isOverdue = !!task.dueDate && new Date(task.dueDate) < new Date() && !task.isCompleted;

	const handleToggleComplete = async () => {
		setIsToggling(true);
		try {
			await onToggleComplete(task.id);
		} finally {
			setIsToggling(false);
		}
	};

	const handleDelete = async () => {
		setIsDeleting(true);
		try {
			await onDelete(task.id);
		} finally {
			setIsDeleting(false);
		}
	};

	const toggleLabel = `${task.isCompleted ? 'Marquer comme à faire' : 'Marquer comme terminée'} — ${task.title}`;

	return (
		<div
			className={`bg-white border border-gray-200 rounded-lg p-4 transition-all duration-200 hover:shadow-md group ${
				task.isCompleted ? 'opacity-75' : ''
			}`}
			data-testid="task-item"
			data-task-id={task.id}
		>
			<div className="flex items-start space-x-3">
				{/* Toggle completion as an accessible checkbox-like control */}
				<button
					type="button"
					onClick={handleToggleComplete}
					disabled={isToggling}
					className={`flex-shrink-0 w-5 h-5 rounded border-2 transition-all ${
						task.isCompleted
							? 'bg-green-500 border-green-500 text-white'
							: 'border-gray-300 hover:border-green-500 hover:bg-green-50'
					} ${isToggling ? 'opacity-50' : ''}`}
					role="checkbox"
					aria-checked={task.isCompleted}
					aria-label={toggleLabel}
					aria-busy={isToggling || undefined}
					data-testid={`toggle-${task.id}`}
				>
					{task.isCompleted && <Check className="w-3 h-3 m-0.5" aria-hidden="true" />}
				</button>

				<div className="flex-1 min-w-0">
					<div className="flex items-start justify-between">
						<div className="flex-1">
							<h4
								className={`text-sm font-medium ${
									task.isCompleted ? 'line-through text-gray-500' : 'text-gray-900'
								}`}
								data-testid="task-title"
							>
								{task.title}
							</h4>
							{task.description && (
								<p
									className={`text-sm mt-1 ${
										task.isCompleted ? 'line-through text-gray-400' : 'text-gray-600'
									}`}
									data-testid="task-description"
								>
									{task.description}
								</p>
							)}
						</div>

						<div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
							<button
								type="button"
								onClick={() => onEdit(task)}
								className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
								aria-label={`Modifier la tâche : ${task.title}`}
								data-testid={`edit-${task.id}`}
							>
								<Edit className="h-4 w-4" aria-hidden="true" />
							</button>
							<button
								type="button"
								onClick={handleDelete}
								disabled={isDeleting}
								className="p-1 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
								aria-label={`Supprimer la tâche : ${task.title}`}
								aria-busy={isDeleting || undefined}
								data-testid={`delete-${task.id}`}
							>
								<Trash2 className="h-4 w-4" aria-hidden="true" />
							</button>
						</div>
					</div>

					<div className="flex items-center space-x-4 mt-3">
						<div
							className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
								priorityColors[task.priority]
							}`}
							aria-label={`Priorité : ${task.priority}`}
							data-testid="task-priority"
						>
							<PriorityIcon className="h-3 w-3" aria-hidden="true" />
							<span className="capitalize">{task.priority}</span>
						</div>

						{task.dueDate && (
							<div
								className={`flex items-center space-x-1 text-xs ${
									isOverdue ? 'text-red-600' : 'text-gray-500'
								}`}
								aria-label={`Échéance : ${new Date(task.dueDate).toLocaleDateString('fr-FR')}${
									isOverdue ? ' — en retard' : ''
								}`}
								data-testid={isOverdue ? 'task-due-overdue' : 'task-due-date'}
							>
								<Calendar className="h-3 w-3" aria-hidden="true" />
								<span>{new Date(task.dueDate).toLocaleDateString('fr-FR')}</span>
							</div>
						)}

						{/* Zone réservée à d'autres méta-infos (updatedAt, etc.) si besoin */}
						{/* <div className="text-xs text-gray-400">{...}</div> */}
					</div>
				</div>
			</div>
		</div>
	);
}
