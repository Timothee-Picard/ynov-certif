import {
    ForbiddenException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Task } from './entities/task.entity'
import { CreateTaskDto } from './dto/create-task.dto'
import { UpdateTaskDto } from './dto/update-task.dto'
import { List } from '../list/entities/list.entity'

@Injectable()
export class TaskService {
    constructor(
        @InjectRepository(Task)
        private readonly taskRepository: Repository<Task>,

        @InjectRepository(List)
        private readonly listRepository: Repository<List>,
    ) {}

    async create(userId: string, listId: string, createTaskDto: CreateTaskDto) {
        const list = await this.listRepository.findOne({
            where: { id: listId },
            relations: ['user'],
        })
        if (!list) throw new NotFoundException('List not found')
        if (list.user.id !== userId)
            throw new UnauthorizedException('List does not belong to the user')

        const task = this.taskRepository.create({
            title: createTaskDto.title,
            description: createTaskDto.description,
            priority: createTaskDto.priority || 'medium',
            isCompleted: createTaskDto.isCompleted ?? false,
            dueDate: createTaskDto.dueDate ? new Date(createTaskDto.dueDate) : null,
            list,
        })

        return this.taskRepository.save(task)
    }

    async findAllByListId(userId: string, listId: string) {
        const tasks = await this.taskRepository.find({
            where: {
                list: { id: listId, user: { id: userId } },
            },
            order: {
                dueDate: 'ASC',
            },
            select: [
                'id',
                'title',
                'description',
                'priority',
                'isCompleted',
                'dueDate',
                'createdAt',
            ],
        })

        return tasks
    }

    async update(userId: string, taskId: string, updateTaskDto: UpdateTaskDto) {
        const task = await this.taskRepository.findOne({
            where: { id: taskId },
            relations: ['list', 'list.user'],
            select: [
                'id',
                'title',
                'description',
                'priority',
                'isCompleted',
                'dueDate',
                'createdAt',
            ],
        })
        if (!task) throw new NotFoundException('Task not found')

        if (task.list.user.id !== userId) {
            throw new ForbiddenException("Vous n'avez pas la permission de modifier cette tâche")
        }

        if (updateTaskDto.title !== undefined) {
            task.title = updateTaskDto.title
        }
        if (updateTaskDto.description !== undefined) {
            task.description = updateTaskDto.description
        }
        if (updateTaskDto.priority !== undefined) {
            task.priority = updateTaskDto.priority
        }
        if (updateTaskDto.isCompleted !== undefined) {
            task.isCompleted = updateTaskDto.isCompleted
        }
        if (updateTaskDto.dueDate !== undefined) {
            task.dueDate = new Date(updateTaskDto.dueDate)
        }
        return this.taskRepository.save(task)
    }

    async toggleComplete(userId: string, taskId: string) {
        const task = await this.taskRepository.findOne({
            where: { id: taskId },
            relations: ['list', 'list.user'],
            select: [
                'id',
                'title',
                'description',
                'priority',
                'isCompleted',
                'dueDate',
                'createdAt',
            ],
        })

        if (!task) {
            throw new NotFoundException('Task not found')
        }

        if (task.list.user.id !== userId) {
            throw new ForbiddenException("Vous n'avez pas la permission de modifier cette tâche")
        }

        task.isCompleted = !task.isCompleted
        return this.taskRepository.save(task)
    }

    async remove(userId: string, taskId: string) {
        const task = await this.taskRepository.findOne({
            where: { id: taskId },
            relations: ['list', 'list.user'],
        })

        if (!task) throw new NotFoundException('Task not found')

        if (task.list.user.id !== userId) {
            throw new ForbiddenException("Vous n'avez pas la permission de supprimer cette tâche")
        }

        await this.taskRepository.remove(task)
        return { message: 'Task deleted successfully' }
    }
}
