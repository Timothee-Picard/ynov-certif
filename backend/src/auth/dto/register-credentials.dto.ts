import { ApiProperty } from '@nestjs/swagger';

export class RegisterCredentialsDto {
  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'password123' })
  password: string;

  @ApiProperty({ example: 'John Doe' })
  name: string;
}
