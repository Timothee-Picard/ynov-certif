import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import * as bcrypt from 'bcrypt'
import { User } from './entities/user.entity'
import { UpdateUserDto } from './dto/update-user.dto'

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async findOne(id: string) {
        const user = await this.userRepository.findOne({
            where: { id },
        })
        if (!user) throw new NotFoundException('User not found')

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...result } = user
        return result
    }

    async update(id: string, updateUserDto: UpdateUserDto) {
        const user = await this.userRepository.findOne({ where: { id } })
        if (!user) throw new NotFoundException('User not found')

        if (updateUserDto.password) {
            updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10)
        }

        Object.assign(user, updateUserDto)
        return this.userRepository.save(user)
    }

    async remove(id: string) {
        const user = await this.userRepository.findOne({ where: { id } })
        if (!user) throw new NotFoundException('User not found')
        await this.userRepository.remove(user)
        return { message: 'User deleted successfully' }
    }
}
