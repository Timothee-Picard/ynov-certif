import { Controller, Post, Body, Patch, Param, Delete, UseGuards, Get } from '@nestjs/common'
import { TaskService } from './task.service'
import { CreateTaskDto } from './dto/create-task.dto'
import { UpdateTaskDto } from './dto/update-task.dto'
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiBearerAuth,
    ApiBody,
} from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { User } from '../utils/types'
import { GetUser } from '../auth/get-user.decorator'

@ApiBearerAuth()
@ApiTags('tasks')
@Controller('task')
export class TaskController {
    constructor(private readonly taskService: TaskService) {}

    @UseGuards(JwtAuthGuard)
    @Post(':listeId')
    @ApiOperation({ summary: 'Créer une nouvelle tâche' })
    @ApiParam({ name: 'listeId', type: String, description: 'ID de la liste' })
    @ApiBody({ type: CreateTaskDto })
    @ApiResponse({ status: 201, description: 'La tâche a été créée avec succès.' })
    @ApiResponse({ status: 404, description: 'Liste non trouvée.' })
    @ApiResponse({ status: 403, description: 'Accès interdit. La liste ne vous appartient pas.' })
    create(
        @GetUser() user: User,
        @Param('listeId') listeId: string,
        @Body() createTaskDto: CreateTaskDto,
    ) {
        return this.taskService.create(user.id, listeId, createTaskDto)
    }

    @UseGuards(JwtAuthGuard)
    @Get('list/:listeId')
    @ApiOperation({ summary: "Récupérer la liste d'une tâche par l'ID de sa liste" })
    @ApiParam({ name: 'listeId', type: String, description: 'ID de la liste' })
    @ApiResponse({ status: 200, description: 'La tâche a été récupérée avec succès.' })
    @ApiResponse({ status: 404, description: 'Tâche non trouvée.' })
    findAllByListId(@GetUser() user: User, @Param('listeId') listeId: string) {
        return this.taskService.findAllByListId(user.id, listeId)
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    @ApiOperation({ summary: 'Mettre à jour une tâche par son ID' })
    @ApiParam({ name: 'id', type: String, description: 'ID de la tâche' })
    @ApiResponse({ status: 200, description: 'La tâche a été mise à jour.' })
    @ApiResponse({ status: 404, description: 'Tâche non trouvée.' })
    update(@GetUser() user: User, @Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
        return this.taskService.update(user.id, id, updateTaskDto)
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id/toggle')
    @ApiOperation({ summary: 'Inverser le statut de complétion d’une tâche' })
    @ApiParam({ name: 'id', type: String, description: 'ID de la tâche' })
    @ApiResponse({ status: 200, description: 'Statut de la tâche inversé.' })
    @ApiResponse({ status: 404, description: 'Tâche non trouvée.' })
    toggle(@GetUser() user: User, @Param('id') id: string) {
        return this.taskService.toggleComplete(user.id, id)
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    @ApiOperation({ summary: 'Supprimer une tâche par son ID' })
    @ApiParam({ name: 'id', type: String, description: 'ID de la tâche' })
    @ApiResponse({ status: 200, description: 'La tâche a été supprimée.' })
    @ApiResponse({ status: 404, description: 'Tâche non trouvée.' })
    remove(@GetUser() user: User, @Param('id') id: string) {
        return this.taskService.remove(user.id, id)
    }
}
