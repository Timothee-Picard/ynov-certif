import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateListDto {
  @ApiProperty({ example: 'Courses', description: 'Nom de la liste' })
  @IsString()
  name: string;
}
