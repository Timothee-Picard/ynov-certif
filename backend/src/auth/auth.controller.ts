import { Controller, Post, Body, Get, Headers } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from '../user/entities/user.entity';
import {
  AuthToken,
  LoginCredentials,
  RegisterCredentials,
} from '../utils/types';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { LoginCredentialsDto } from './dto/login-credentials.dto';
import { RegisterCredentialsDto } from './dto/register-credentials.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Connexion utilisateur' })
  @ApiResponse({ status: 200, description: 'Connexion réussie', type: Object })
  @ApiBody({
    description: 'Identifiants de connexion',
    type: LoginCredentialsDto,
    examples: {
      default: {
        summary: 'Exemple de login',
        value: { email: 'timothee@example.com', password: 'secret123' },
      },
    },
  })
  login(@Body() credentials: LoginCredentials): Promise<AuthToken> {
    return this.authService.login(credentials);
  }

  @Post('register')
  @ApiOperation({ summary: 'Inscription utilisateur' })
  @ApiResponse({ status: 201, description: 'Utilisateur créé', type: Object })
  @ApiBody({
    description: 'Données pour créer un utilisateur',
    type: RegisterCredentialsDto,
    examples: {
      default: {
        summary: 'Exemple d’inscription',
        value: {
          username: 'Timothee',
          email: 'timothee@example.com',
          password: 'secret123',
        },
      },
    },
  })
  register(@Body() data: RegisterCredentials): Promise<AuthToken> {
    return this.authService.register(data);
  }

  @Get('validate')
  @ApiOperation({ summary: 'Valider un token JWT' })
  @ApiResponse({ status: 200, description: 'Utilisateur trouvé', type: Object })
  async validate(
    @Headers('authorization') authHeader: string,
  ): Promise<User | null> {
    if (!authHeader?.startsWith('Bearer ')) return null;
    const token = authHeader.split(' ')[1];
    return this.authService.validateUserFromToken(token);
  }
}
