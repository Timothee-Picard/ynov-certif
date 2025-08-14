import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateListDto {
  @ApiProperty({ example: 'Courses', description: 'Nom de la liste' })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    example: 'Liste des courses à faire',
    description: 'Description de la liste',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: '#FF5733',
    description: 'Couleur de la liste en hexadécimal',
  })
  @IsOptional()
  @IsString()
  color?: string;
}
