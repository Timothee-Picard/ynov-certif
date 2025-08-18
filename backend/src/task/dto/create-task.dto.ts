import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsString, IsOptional, IsBoolean, IsDateString } from 'class-validator'

export class CreateTaskDto {
    @ApiProperty({ example: 'Acheter du lait', description: 'Titre de la tâche' })
    @IsString()
    title: string

    @ApiPropertyOptional({
        example: 'Acheter du lait avant 18h',
        description: 'Description optionnelle',
    })
    @IsOptional()
    @IsString()
    description?: string

    @ApiPropertyOptional({
        example: 'medium',
        description: 'Priorité de la tâche (low, medium, high)',
    })
    @IsOptional()
    @IsString()
    priority?: 'low' | 'medium' | 'high' = 'medium'

    @ApiPropertyOptional({ example: false, description: 'Statut de la tâche' })
    @IsOptional()
    @IsBoolean()
    isCompleted?: boolean

    @ApiPropertyOptional({
        example: '2025-08-03T18:00:00Z',
        description: 'Date limite (ISO 8601)',
    })
    @IsOptional()
    @IsDateString()
    dueDate?: string
}
