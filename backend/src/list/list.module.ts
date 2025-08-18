import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { List } from './entities/list.entity'
import { User } from '../user/entities/user.entity'
import { ListService } from './list.service'
import { ListController } from './list.controller'

@Module({
    imports: [TypeOrmModule.forFeature([List, User])],
    controllers: [ListController],
    providers: [ListService],
})
export class ListModule {}
