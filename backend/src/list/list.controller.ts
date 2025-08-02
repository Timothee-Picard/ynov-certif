import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ListService } from './list.service';
import { CreateListDto } from './dto/create-list.dto';
import { UpdateListDto } from './dto/update-list.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('lists')
@Controller('list')
export class ListController {
  constructor(private readonly listService: ListService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle liste' })
  @ApiResponse({ status: 201, description: 'Liste créée avec succès.' })
  create(@Body() createListDto: CreateListDto) {
    return this.listService.create(createListDto);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer toutes les listes' })
  @ApiResponse({ status: 200, description: 'Liste des listes retournée.' })
  findAll() {
    return this.listService.findAll();
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Récupérer les listes d’un utilisateur par son ID' })
  @ApiParam({ name: 'userId', type: Number, description: 'ID de l’utilisateur' })
  @ApiResponse({ status: 200, description: 'Listes de l’utilisateur trouvées.' })
  @ApiResponse({ status: 404, description: 'Aucune liste trouvée pour cet utilisateur.' })
  findAllByUser(@Param('userId') userId: string) {
    return this.listService.findAllByUser(+userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une liste par son ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID de la liste' })
  @ApiResponse({ status: 200, description: 'Liste trouvée.' })
  @ApiResponse({ status: 404, description: 'Liste non trouvée.' })
  findOne(@Param('id') id: string) {
    return this.listService.findOne(+id);
  }

  @Get('user/:userId/:listId')
  @ApiOperation({ summary: "Récupérer une liste par son ID et l'ID de l'utilisateur" })
  @ApiParam({ name: 'userId', type: Number, description: "ID de l'utilisateur" })
  @ApiParam({ name: 'listId', type: Number, description: "ID de la liste" })
  @ApiResponse({ status: 200, description: 'Liste trouvée.' })
  @ApiResponse({ status: 404, description: 'Liste non trouvée pour cet utilisateur.' })
  findOneByUser(
      @Param('userId') userId: string,
      @Param('listId') listId: string,
  ) {
    return this.listService.findOneByUser(+userId, +listId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour une liste par son ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID de la liste' })
  @ApiResponse({ status: 200, description: 'Liste mise à jour.' })
  @ApiResponse({ status: 404, description: 'Liste non trouvée.' })
  update(@Param('id') id: string, @Body() updateListDto: UpdateListDto) {
    return this.listService.update(+id, updateListDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une liste par son ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID de la liste' })
  @ApiResponse({ status: 200, description: 'Liste supprimée.' })
  @ApiResponse({ status: 404, description: 'Liste non trouvée.' })
  remove(@Param('id') id: string) {
    return this.listService.remove(+id);
  }
}
