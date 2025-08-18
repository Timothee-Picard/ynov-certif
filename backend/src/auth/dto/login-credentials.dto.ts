import { ApiProperty } from '@nestjs/swagger'

export class LoginCredentialsDto {
    @ApiProperty({ example: 'user@example.com' })
    email: string

    @ApiProperty({ example: 'password123' })
    password: string
}
