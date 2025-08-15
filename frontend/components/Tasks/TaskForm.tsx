import {useState, useEffect, FormEvent, ChangeEvent} from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { Task } from '@/utils/types';

interface TaskFormProps {
	task?: Task | null;
	onSave: (data: Omit<Task, 'id' | 'listId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
	onCancel: () => void;
	loading?: boolean;
}

export function TaskForm({ task, onSave, onCancel, loading = false }: TaskFormProps) {
	const [formData, setFormData] = useState({
		title: '',
		description: '',
		isCompleted: false,
		priority: 'medium' as 'low' | 'medium' | 'high',
		dueDate: ''
	});

	useEffect(() => {
		if (task) {
			setFormData({
				title: task.title,
				description: task.description || '',
				isCompleted: task.isCompleted || false,
				priority: task.priority,
				dueDate: task.dueDate ? task.dueDate.split('T')[0] : ''
			});
		} else {
			setFormData({
				title: '',
				description: '',
				isCompleted: false,
				priority: 'medium',
				dueDate: ''
			});
		}
	}, [task]);

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		const submitData = {
			...formData,
			dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined
		};
		await onSave(submitData);
	};

	const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
		const { name, value, type } = e.target;
		setFormData(prev => ({
			...prev,
			[name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
		}));
	};

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
			<div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
				<div className="p-6">
					<div className="flex items-center justify-between mb-6">
						<h2 className="text-xl font-semibold text-gray-900">
							{task ? 'Modifier la tâche' : 'Nouvelle tâche'}
						</h2>
						<button
							onClick={onCancel}
							className="text-gray-400 hover:text-gray-600 transition-colors"
						>
							<X className="h-6 w-6" />
						</button>
					</div>

					<form onSubmit={handleSubmit} className="space-y-6">
						<div>
							<label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
								Titre *
							</label>
							<input
								id="title"
								name="title"
								type="text"
								required
								value={formData.title}
								onChange={handleChange}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								placeholder="Titre de la tâche"
							/>
						</div>

						<div>
							<label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
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
							/>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div>
								<label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
									Priorité
								</label>
								<select
									id="priority"
									name="priority"
									value={formData.priority}
									onChange={handleChange}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								>
									<option value="low">Basse</option>
									<option value="medium">Moyenne</option>
									<option value="high">Haute</option>
								</select>
							</div>

							<div>
								<label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-2">
									Date d'échéance
								</label>
								<input
									id="dueDate"
									name="dueDate"
									type="date"
									value={formData.dueDate}
									onChange={handleChange}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								/>
							</div>
						</div>

						{task && (
							<div className="flex items-center">
								<input
									id="isCompleted"
									name="isCompleted"
									type="checkbox"
									checked={formData.isCompleted}
									onChange={handleChange}
									className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
								/>
								<label htmlFor="isCompleted" className="ml-2 text-sm text-gray-700">
									Tâche terminée
								</label>
							</div>
						)}

						<div className="flex space-x-3 pt-4">
							<button
								type="button"
								onClick={onCancel}
								className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
							>
								Annuler
							</button>
							<button
								type="submit"
								disabled={loading || !formData.title.trim()}
								className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
							>
								{loading ? (
									<Loader2 className="h-4 w-4 animate-spin" />
								) : (
									<Save className="h-4 w-4" />
								)}
								<span>{loading ? 'Sauvegarde...' : 'Sauvegarder'}</span>
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}