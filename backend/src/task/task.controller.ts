import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('tasks') // Groupe les routes dans Swagger sous "tasks"
@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle tâche' })
  @ApiResponse({
    status: 201,
    description: 'La tâche a été créée avec succès.',
  })
  create(@Body() createTaskDto: CreateTaskDto) {
    return this.taskService.create(createTaskDto);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer toutes les tâches' })
  @ApiResponse({ status: 200, description: 'Liste des tâches retournée.' })
  findAll() {
    return this.taskService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une tâche par son ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID de la tâche' })
  @ApiResponse({ status: 200, description: 'La tâche trouvée.' })
  @ApiResponse({ status: 404, description: 'Tâche non trouvée.' })
  findOne(@Param('id') id: string) {
    return this.taskService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour une tâche par son ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID de la tâche' })
  @ApiResponse({ status: 200, description: 'La tâche a été mise à jour.' })
  @ApiResponse({ status: 404, description: 'Tâche non trouvée.' })
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.taskService.update(id, updateTaskDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une tâche par son ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID de la tâche' })
  @ApiResponse({ status: 200, description: 'La tâche a été supprimée.' })
  @ApiResponse({ status: 404, description: 'Tâche non trouvée.' })
  remove(@Param('id') id: string) {
    return this.taskService.remove(id);
  }
}
