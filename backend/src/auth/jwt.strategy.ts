import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from '../user/entities/user.entity'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.JWT_SECRET || 'super_secret_key',
        })
    }

    async validate(payload: any): Promise<Partial<User>> {
        const user = await this.userRepository.findOne({
            where: { id: payload.id },
        })

        if (!user) {
            throw new UnauthorizedException()
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...result } = user
        return result
    }
}
