import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../utils/types';
import { GetUser } from '../auth/get-user.decorator';

@ApiBearerAuth()
@ApiTags('tasks') // Groupe les routes dans Swagger sous "tasks"
@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle tâche' })
  @ApiResponse({
    status: 201,
    description: 'La tâche a été créée avec succès.',
  })
  @ApiBody({
    description: 'Données pour créer une tâche',
    type: CreateTaskDto,
    examples: {
      default: {
        summary: 'Exemple de tâche',
        value: {
          title: 'Acheter du lait',
          description: 'Acheter du lait avant 18h',
          isCompleted: false,
          dueDate: '2025-08-15T18:00:00Z',
          listId: '1',
        },
      },
    },
  })
  create(@GetUser() user: User, @Body() createTaskDto: CreateTaskDto) {
    return this.taskService.create(user.id, createTaskDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour une tâche par son ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID de la tâche' })
  @ApiResponse({ status: 200, description: 'La tâche a été mise à jour.' })
  @ApiResponse({ status: 404, description: 'Tâche non trouvée.' })
  update(
    @GetUser() user: User,
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    return this.taskService.update(user.id, id, updateTaskDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une tâche par son ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID de la tâche' })
  @ApiResponse({ status: 200, description: 'La tâche a été supprimée.' })
  @ApiResponse({ status: 404, description: 'Tâche non trouvée.' })
  remove(@GetUser() user: User, @Param('id') id: string) {
    return this.taskService.remove(user.id, id);
  }
}
