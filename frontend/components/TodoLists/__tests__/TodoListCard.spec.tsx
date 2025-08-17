import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TodoListCard } from '@/components/TodoLists/TodoListCard';
import type { TodoList } from '@/utils/types';

const baseList = (overrides: Partial<TodoList> = {}): TodoList => ({
	id: 'list-1',
	userId: 'u1',
	name: 'Courses',
	description: 'Acheter fruits et légumes',
	color: '#33aaff',
	tasksCount: 0,
	completedTasksCount: 0,
	createdAt: new Date('2025-08-10T10:00:00.000Z').toISOString(),
	updatedAt: new Date('2025-08-15T10:00:00.000Z').toISOString(),
	...overrides,
});

describe('TodoListCard', () => {
	it('rend le titre, la description, la pastille couleur et les compteurs', () => {
		const list = baseList();
		render(
			<TodoListCard
				todoList={list}
				taskCount={5}
				completedCount={2}
				onEdit={jest.fn()}
				onDelete={jest.fn()}
				onSelect={jest.fn()}
			/>
		);

		expect(screen.getByTestId('list-card')).toBeInTheDocument();
		expect(screen.getByTestId('list-title')).toHaveTextContent('Courses');
		expect(screen.getByTestId('list-description')).toHaveTextContent('Acheter fruits et légumes');
		expect(screen.getByTestId('list-color')).toBeInTheDocument();

		const count = screen.getByTestId('list-count');
		expect(count).toHaveTextContent(/5 tâche/);
		expect(count).toHaveTextContent(/2 terminée/);

		const date = screen.getByTestId('list-date');
		expect(date).toHaveTextContent(new Date(list.updatedAt).toLocaleDateString('fr-FR'));
	});

	it('appelle onSelect au clic sur la carte', async () => {
		const user = userEvent.setup();
		const onSelect = jest.fn();
		const list = baseList();

		render(
			<TodoListCard
				todoList={list}
				taskCount={0}
				completedCount={0}
				onEdit={jest.fn()}
				onDelete={jest.fn()}
				onSelect={onSelect}
			/>
		);

		await user.click(screen.getByTestId('list-card'));
		expect(onSelect).toHaveBeenCalledWith(list);
	});

	it('navigation clavier : Enter et Espace déclenchent onSelect', async () => {
		const user = userEvent.setup();
		const onSelect = jest.fn();
		const list = baseList();

		render(
			<TodoListCard
				todoList={list}
				onEdit={jest.fn()}
				onDelete={jest.fn()}
				onSelect={onSelect}
			/>
		);

		const card = screen.getByTestId('list-card');
		card.focus();

		await user.keyboard('{Enter}');
		await user.keyboard(' ');
		expect(onSelect).toHaveBeenCalledTimes(2);
		expect(onSelect).toHaveBeenLastCalledWith(list);
	});

	it("clic sur Éditer n'appelle PAS onSelect et appelle onEdit", async () => {
		const user = userEvent.setup();
		const onEdit = jest.fn();
		const onSelect = jest.fn();
		const list = baseList({ id: 'abc' });

		render(
			<TodoListCard
				todoList={list}
				onEdit={onEdit}
				onDelete={jest.fn()}
				onSelect={onSelect}
			/>
		);

		const editBtn = screen.getByTestId('edit-list-abc');
		await user.click(editBtn);

		expect(onEdit).toHaveBeenCalledWith(list);
		expect(onSelect).not.toHaveBeenCalled();
	});

	it("clic sur Supprimer n'appelle PAS onSelect et appelle onDelete avec l'id", async () => {
		const user = userEvent.setup();
		const onDelete = jest.fn();
		const onSelect = jest.fn();
		const list = baseList({ id: 'xyz' });

		render(
			<TodoListCard
				todoList={list}
				onEdit={jest.fn()}
				onDelete={onDelete}
				onSelect={onSelect}
			/>
		);

		const delBtn = screen.getByTestId('delete-list-xyz');
		await user.click(delBtn);

		expect(onDelete).toHaveBeenCalledWith('xyz');
		expect(onSelect).not.toHaveBeenCalled();
	});

	it('affiche la progression (progressbar ARIA) quand taskCount > 0', () => {
		const list = baseList({ id: 'p1' });

		render(
			<TodoListCard
				todoList={list}
				taskCount={10}
				completedCount={7}
				onEdit={jest.fn()}
				onDelete={jest.fn()}
				onSelect={jest.fn()}
			/>
		);

		const container = screen.getByTestId('progress-container');
		const bar = within(container).getByTestId('progressbar');
		const text = within(container).getByTestId('progress-text');

		expect(text).toHaveTextContent('70%');
		expect(bar).toHaveAttribute('role', 'progressbar');
		expect(bar).toHaveAttribute('aria-valuemin', '0');
		expect(bar).toHaveAttribute('aria-valuemax', '100');
		expect(bar).toHaveAttribute('aria-valuenow', '70');
	});

	it("n'affiche PAS la progression quand taskCount === 0", () => {
		const list = baseList({ id: 'empty' });

		render(
			<TodoListCard
				todoList={list}
				taskCount={0}
				completedCount={0}
				onEdit={jest.fn()}
				onDelete={jest.fn()}
				onSelect={jest.fn()}
			/>
		);

		expect(screen.queryByTestId('progress-container')).toBeNull();
		expect(screen.queryByTestId('progressbar')).toBeNull();
	});

	it("peut ne pas afficher la description si absente", () => {
		const list = baseList({ description: '' });

		render(
			<TodoListCard
				todoList={list}
				taskCount={3}
				completedCount={1}
				onEdit={jest.fn()}
				onDelete={jest.fn()}
				onSelect={jest.fn()}
			/>
		);

		expect(screen.queryByTestId('list-description')).toBeNull();
		expect(screen.getByTestId('list-title')).toHaveTextContent('Courses');
	});
});
