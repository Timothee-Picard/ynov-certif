import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { List } from '../list/entities/list.entity';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,

    @InjectRepository(List)
    private readonly listRepository: Repository<List>,
  ) {}

  async create(userId: string, createTaskDto: CreateTaskDto) {
    const list = await this.listRepository.findOne({
      where: { id: createTaskDto.listId },
      relations: ['user'],
    });
    if (!list) throw new NotFoundException('List not found');
    if (list.user.id !== userId)
      throw new UnauthorizedException('List does not belong to the user');

    const task = this.taskRepository.create({
      title: createTaskDto.title,
      description: createTaskDto.description,
      isCompleted: createTaskDto.isCompleted ?? false,
      dueDate: createTaskDto.dueDate ? new Date(createTaskDto.dueDate) : null,
      list,
    });

    return this.taskRepository.save(task);
  }

  async findOne(id: string) {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['list'],
    });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async update(userId: string, taskId: string, updateTaskDto: UpdateTaskDto) {
    const task = await this.taskRepository.findOne({
      where: { id: taskId },
      relations: ['list', 'list.user'],
    });
    if (!task) throw new NotFoundException('Task not found');

    if (task.list.user.id !== userId) {
      throw new ForbiddenException(
        "Vous n'avez pas la permission de modifier cette tâche",
      );
    }

    if (updateTaskDto.listId) {
      const newList = await this.listRepository.findOne({
        where: { id: updateTaskDto.listId },
        relations: ['user'],
      });
      if (!newList) throw new NotFoundException('List not found');
      if (newList.user.id !== userId) {
        throw new ForbiddenException(
          'Vous ne pouvez pas déplacer la tâche vers une liste qui ne vous appartient pas',
        );
      }
      task.list = newList;
    }

    Object.assign(task, updateTaskDto);
    return this.taskRepository.save(task);
  }

  async remove(userId: string, taskId: string) {
    const task = await this.taskRepository.findOne({
      where: { id: taskId },
      relations: ['list'],
    });

    if (!task) throw new NotFoundException('Task not found');

    if (task.list.user.id !== userId) {
      throw new ForbiddenException(
        "Vous n'avez pas la permission de supprimer cette tâche",
      );
    }

    await this.taskRepository.remove(task);
    return { message: 'Task deleted successfully' };
  }
}
