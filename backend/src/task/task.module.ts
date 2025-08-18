import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Task } from './entities/task.entity'
import { TaskService } from './task.service'
import { TaskController } from './task.controller'
import { List } from '../list/entities/list.entity'

@Module({
    imports: [TypeOrmModule.forFeature([Task, List])],
    controllers: [TaskController],
    providers: [TaskService],
    exports: [TypeOrmModule],
})
export class TaskModule {}
