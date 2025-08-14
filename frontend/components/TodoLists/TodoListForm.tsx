import {useState, useEffect, ChangeEvent, FormEvent} from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { TodoList } from '@/utils/types';

interface TodoListFormProps {
	list?: TodoList | null;
	onSave: (data: Omit<TodoList, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
	onCancel: () => void;
	loading?: boolean;
}

const colors = [
	'#3B82F6', '#10B981', '#F97316', '#EF4444',
	'#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
];

export function TodoListForm({ list, onSave, onCancel, loading = false }: TodoListFormProps) {
	const [formData, setFormData] = useState({
		name: '',
		description: '',
		color: colors[0]
	});

	useEffect(() => {
		if (list) {
			setFormData({
                name: list.name,
				description: list.description || '',
				color: list.color
			});
		} else {
			setFormData({
                name: '',
				description: '',
				color: colors[0]
			});
		}
	}, [list]);

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		await onSave(formData);
	};

	const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		setFormData(prev => ({
			...prev,
			[e.target.name]: e.target.value
		}));
	};

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
			<div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
				<div className="p-6">
					<div className="flex items-center justify-between mb-6">
						<h2 className="text-xl font-semibold text-gray-900">
							{list ? 'Modifier la liste' : 'Nouvelle liste'}
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
							<label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
								Titre *
							</label>
							<input
								id="name"
								name="name"
								type="text"
								required
								value={formData.name}
								onChange={handleChange}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								placeholder="Nom de la liste"
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

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-3">
								Couleur
							</label>
							<div className="flex flex-wrap gap-3">
								{colors.map((color) => (
									<button
										key={color}
										type="button"
										onClick={() => setFormData(prev => ({ ...prev, color }))}
										className={`w-8 h-8 rounded-full border-2 transition-all ${
											formData.color === color
												? 'border-gray-800 scale-110'
												: 'border-gray-300 hover:scale-105'
										}`}
										style={{ backgroundColor: color }}
									/>
								))}
							</div>
						</div>

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
								disabled={loading || !formData.name.trim()}
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