import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber } from 'class-validator';

export class CreateListDto {
	@ApiProperty({ example: 'Courses', description: 'Nom de la liste' })
	@IsString()
	name: string;

	@ApiProperty({ example: 1, description: 'ID de l’utilisateur propriétaire' })
	@IsNumber()
	userId: number;
}
