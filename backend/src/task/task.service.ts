import { Injectable, NotFoundException } from '@nestjs/common';
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

  async create(createTaskDto: CreateTaskDto) {
    const list = await this.listRepository.findOne({ where: { id: createTaskDto.listId } });
    if (!list) throw new NotFoundException('List not found');

    const task = this.taskRepository.create({
      title: createTaskDto.title,
      description: createTaskDto.description,
      isCompleted: createTaskDto.isCompleted ?? false,
      dueDate: createTaskDto.dueDate ? new Date(createTaskDto.dueDate) : null,
      list,
    });

    return this.taskRepository.save(task);
  }

  async findAll() {
    return this.taskRepository.find({ relations: ['list'] });
  }

  async findOne(id: number) {
    const task = await this.taskRepository.findOne({ where: { id }, relations: ['list'] });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async update(id: number, updateTaskDto: UpdateTaskDto) {
    const task = await this.taskRepository.findOne({ where: { id }, relations: ['list'] });
    if (!task) throw new NotFoundException('Task not found');

    if (updateTaskDto.listId) {
      const newList = await this.listRepository.findOne({ where: { id: updateTaskDto.listId } });
      if (!newList) throw new NotFoundException('List not found');
      task.list = newList;
    }

    Object.assign(task, updateTaskDto);
    return this.taskRepository.save(task);
  }

  async remove(id: number) {
    const task = await this.taskRepository.findOne({ where: { id } });
    if (!task) throw new NotFoundException('Task not found');
    await this.taskRepository.remove(task);
    return { message: 'Task deleted successfully' };
  }
}
