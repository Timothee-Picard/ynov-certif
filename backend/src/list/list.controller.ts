import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common'
import { ListService } from './list.service'
import { CreateListDto } from './dto/create-list.dto'
import { UpdateListDto } from './dto/update-list.dto'
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { User } from '../utils/types'
import { GetUser } from '../auth/get-user.decorator'

@ApiBearerAuth()
@ApiTags('lists')
@Controller('list')
export class ListController {
    constructor(private readonly listService: ListService) {}

    @UseGuards(JwtAuthGuard)
    @Post()
    @ApiOperation({
        summary: 'Créer une nouvelle liste pour l’utilisateur connecté',
    })
    @ApiResponse({ status: 201, description: 'Liste créée avec succès.' })
    create(@GetUser() user: Partial<User>, @Body() createListDto: CreateListDto) {
        return this.listService.create(user.id, createListDto)
    }

    @UseGuards(JwtAuthGuard)
    @Get('')
    @ApiOperation({ summary: 'Récupérer les listes de l’utilisateur connecté' })
    @ApiResponse({
        status: 200,
        description: 'Listes de l’utilisateur trouvées.',
    })
    @ApiResponse({
        status: 404,
        description: 'Aucune liste trouvée pour cet utilisateur.',
    })
    findAllByUser(@GetUser() user: User) {
        return this.listService.findAllByUser(user.id)
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    @ApiOperation({ summary: 'Récupérer une liste par son ID' })
    @ApiResponse({
        status: 200,
        description: 'Liste trouvée.',
    })
    @ApiResponse({
        status: 404,
        description: 'Aucune liste trouvée avec cet ID.',
    })
    findOneByUser(@GetUser() user: User, @Param('id') id: string) {
        return this.listService.findOneByUser(user.id, id)
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    @ApiOperation({ summary: 'Mettre à jour une liste par son ID' })
    @ApiParam({ name: 'id', type: Number, description: 'ID de la liste' })
    @ApiResponse({ status: 200, description: 'Liste mise à jour.' })
    @ApiResponse({ status: 404, description: 'Liste non trouvée.' })
    @ApiResponse({
        status: 403,
        description: "Action interdite si vous n'êtes pas le propriétaire",
    })
    update(@GetUser() user: User, @Param('id') id: string, @Body() updateListDto: UpdateListDto) {
        return this.listService.update(user.id, id, updateListDto)
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    @ApiOperation({
        summary: 'Supprimer une liste par son ID si elle appartient à l’utilisateur connecté',
    })
    @ApiParam({ name: 'id', type: Number, description: 'ID de la liste' })
    @ApiResponse({ status: 200, description: 'Liste supprimée.' })
    @ApiResponse({
        status: 403,
        description: "Vous n'êtes pas autorisé à supprimer cette liste.",
    })
    @ApiResponse({ status: 404, description: 'Liste non trouvée.' })
    remove(@GetUser() user: Partial<User>, @Param('id') id: string) {
        return this.listService.remove(user.id, id)
    }
}
