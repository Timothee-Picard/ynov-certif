'use client';
import { useState } from 'react';
import { ArrowLeft, Plus, Loader2, Search, Filter } from 'lucide-react';
import {Task} from "@/utils/types";
import {useTasks} from "@/hooks/useTasks";
import {TaskItem} from "@/components/Tasks/TaskItem";
import {TaskForm} from "@/components/Tasks/TaskForm";
import {useRouter} from "next/navigation";
import {useTodoList} from "@/hooks/useTodoList";

interface TodoListPageProps {
	id: string;
}

type FilterType = 'all' | 'pending' | 'completed';

export function TodoListPage({ id }: TodoListPageProps) {

	const { todoList, loading: listLoading, error: listError } = useTodoList(id);
	const { tasks, loading: tasksLoading, error: tasksError, createTask, updateTask, deleteTask, toggleTaskComplete } = useTasks(id);

	const router = useRouter();
	const [showForm, setShowForm] = useState(false);
	const [editingTask, setEditingTask] = useState<Task | null>(null);
	const [formLoading, setFormLoading] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');
	const [filter, setFilter] = useState<FilterType>('all');

	const filteredTasks = tasks
		.slice()
		.sort((a, b) => {
			if (a.isCompleted !== b.isCompleted) {
				return a.isCompleted ? 1 : -1;
			}
			const dateA = a.dueDate ? new Date(a.dueDate).getTime() : new Date(a.createdAt).getTime();
			const dateB = b.dueDate ? new Date(b.dueDate).getTime() : new Date(b.createdAt).getTime();
			return dateA - dateB;
		})
		.filter(task => {
			if (filter === 'pending') return !task.isCompleted;
			if (filter === 'completed') return task.isCompleted;
			return true;
		})
		.filter(task =>
			task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
			(task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()))
		);



	const completedCount = tasks.filter(task => task.isCompleted).length;
	const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

	const handleSaveTask = async (data: Omit<Task, 'id' | 'listId' | 'createdAt' | 'updatedAt'>) => {
		setFormLoading(true);
		try {
			if (editingTask) {
				await updateTask(editingTask.id, data);
			} else {
				await createTask(data);
			}
			setShowForm(false);
			setEditingTask(null);
		} catch (error) {
			console.error('Error saving task:', error);
		} finally {
			setFormLoading(false);
		}
	};

	const handleEditTask = (task: Task) => {
		setEditingTask(task);
		setShowForm(true);
	};

	const handleCancelForm = () => {
		setShowForm(false);
		setEditingTask(null);
	};

	if ((tasksLoading && tasks.length === 0) || listLoading) {
		return (
			<div className="flex items-center justify-center h-64">
				<Loader2 className="h-8 w-8 animate-spin text-blue-600" />
			</div>
		);
	}

	if (!todoList) {
		return (
			<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="text-center text-gray-600">
					<p>La liste de tâches n&#39;a pas été trouvée.</p>
					<button
						onClick={() => router.push('/')}
						className="mt-4 text-blue-600 hover:text-blue-700"
					>
						Retour aux listes de tâches
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
			{/* Header */}
			<div className="mb-8">
				<div className="flex items-center space-x-4 mb-4">
					<button
						onClick={() => router.back()}
						className="text-gray-600 hover:text-gray-900 transition-colors"
					>
						<ArrowLeft className="h-6 w-6" />
					</button>
					<div
						className="w-4 h-4 rounded-full flex-shrink-0"
						style={{ backgroundColor: todoList.color }}
					/>
					<div>
						<h1 className="text-2xl font-bold text-gray-900">{todoList.name}</h1>
						{todoList.description && (
							<p className="text-gray-600 mt-1">{todoList.description}</p>
						)}
					</div>
				</div>

				{/* Progress bar */}
				{tasks.length > 0 && (
					<div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-6">
						<div className="flex justify-between text-sm text-gray-600 mb-2">
							<span>Progression</span>
							<span>{completedCount}/{tasks.length} tâches terminées ({Math.round(progress)}%)</span>
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

				{/* Controls */}
				<div className="flex flex-col sm:flex-row gap-4">
					<div className="flex-1 relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
						<input
							type="text"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							placeholder="Rechercher une tâche..."
							className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						/>
					</div>

					<div className="flex space-x-2">
						<div className="relative">
							<Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
							<select
								value={filter}
								onChange={(e) => setFilter(e.target.value as FilterType)}
								className="pl-9 pr-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
							>
								<option value="all">Toutes</option>
								<option value="pending">À faire</option>
								<option value="completed">Terminées</option>
							</select>
						</div>

						<button
							onClick={() => setShowForm(true)}
							className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center space-x-2"
						>
							<Plus className="h-5 w-5" />
							<span className="hidden sm:inline">Nouvelle Tâche</span>
						</button>
					</div>
				</div>
			</div>

			{/* Error handling */}
			{listError && (
				<div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
					{listError || 'Une erreur est survenue en chargeant la liste de tâches.'}
				</div>
			)}

			{tasksError && (
				<div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
					{tasksError || 'Une erreur est survenue en chargeant les tâches.'}
				</div>
			)}

			{/* Tasks list */}
			{filteredTasks.length === 0 ? (
				<div className="text-center py-12">
					{searchTerm || filter !== 'all' ? (
						<div>
							<p className="text-gray-500 mb-4">
								Aucune tâche trouvée
								{searchTerm && ` pour "${searchTerm}"`}
								{filter !== 'all' && ` dans la catégorie "${filter === 'pending' ? 'À faire' : 'Terminées'}"`}
							</p>
							<div className="space-x-4">
								{searchTerm && (
									<button
										onClick={() => setSearchTerm('')}
										className="text-blue-600 hover:text-blue-700"
									>
										Effacer la recherche
									</button>
								)}
								{filter !== 'all' && (
									<button
										onClick={() => setFilter('all')}
										className="text-blue-600 hover:text-blue-700"
									>
										Voir toutes les tâches
									</button>
								)}
							</div>
						</div>
					) : (
						<div>
							<p className="text-gray-500 mb-4">Aucune tâche dans cette liste</p>
							<button
								onClick={() => setShowForm(true)}
								className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
							>
								Créer ma première tâche
							</button>
						</div>
					)}
				</div>
			) : (
				<div className="space-y-4">
					{filteredTasks.map((task) => (
						<TaskItem
							key={task.id}
							task={task}
							onToggleComplete={toggleTaskComplete}
							onEdit={handleEditTask}
							onDelete={deleteTask}
						/>
					))}
				</div>
			)}

			{/* Task form modal */}
			{showForm && (
				<TaskForm
					task={editingTask}
					onSave={handleSaveTask}
					onCancel={handleCancelForm}
					loading={formLoading}
				/>
			)}
		</div>
	);
}