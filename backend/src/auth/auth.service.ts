import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../user/entities/user.entity';

import {
  AuthToken,
  LoginCredentials,
  RegisterCredentials,
} from '../utils/types';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async login(credentials: LoginCredentials): Promise<AuthToken> {
    const user = await this.userRepository.findOne({
      where: { email: credentials.email },
    });
    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    const isPasswordValid = await bcrypt.compare(
      credentials.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    const token = this.jwtService.sign({ id: user.id, email: user.email });
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    return {
      token,
      expiresAt,
      user: {
        id: user.id,
        email: user.email,
        name: user.username, // correspond au "name" du front
        avatar: user.avatar || undefined,
        createdAt: user.createdAt.toISOString(),
      },
    };
  }

  async register(data: RegisterCredentials): Promise<AuthToken> {
    const existingUser = await this.userRepository.findOne({
      where: { email: data.email },
    });
    if (existingUser) {
      throw new BadRequestException('Cet email est déjà utilisé');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const newUser = this.userRepository.create({
      username: data.name,
      email: data.email,
      password: hashedPassword,
      avatar: null,
    });

    const savedUser = await this.userRepository.save(newUser);

    const token = this.jwtService.sign({
      id: savedUser.id,
      email: savedUser.email,
    });
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    return {
      token,
      expiresAt,
      user: {
        id: savedUser.id,
        email: savedUser.email,
        name: savedUser.username,
        avatar: savedUser.avatar || undefined,
        createdAt: savedUser.createdAt.toISOString(),
      },
    };
  }

  async validateUserFromToken(token: string): Promise<User | null> {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.userRepository.findOne({
        where: { id: payload.id },
      });
      return user || null;
    } catch {
      return null;
    }
  }
}
