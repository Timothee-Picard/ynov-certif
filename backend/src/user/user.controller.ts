import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('users')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un nouvel utilisateur' })
  @ApiResponse({ status: 201, description: 'Utilisateur créé avec succès.' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer tous les utilisateurs' })
  @ApiResponse({
    status: 200,
    description: 'Liste des utilisateurs retournée.',
  })
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un utilisateur par son ID' })
  @ApiParam({ name: 'id', type: Number, description: "ID de l'utilisateur" })
  @ApiResponse({ status: 200, description: 'Utilisateur trouvé.' })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé.' })
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour un utilisateur par son ID' })
  @ApiParam({ name: 'id', type: Number, description: "ID de l'utilisateur" })
  @ApiResponse({ status: 200, description: 'Utilisateur mis à jour.' })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé.' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un utilisateur par son ID' })
  @ApiParam({ name: 'id', type: Number, description: "ID de l'utilisateur" })
  @ApiResponse({ status: 200, description: 'Utilisateur supprimé.' })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé.' })
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
