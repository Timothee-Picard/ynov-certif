import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'timothee', description: "Nom d'utilisateur" })
  @IsString()
  username: string;

  @ApiProperty({
    example: 'timothee@example.com',
    description: 'Adresse email',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'secret123',
    description: 'Mot de passe (min 6 caractères)',
  })
  @IsString()
  @MinLength(6)
  password: string;
}
