import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { HealthController } from './health.controller'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserModule } from './user/user.module'
import { ListModule } from './list/list.module'
import { TaskModule } from './task/task.module'
import { AuthModule } from './auth/auth.module'

type dbType = 'mysql' | 'mariadb' | 'postgres' | 'sqlite' | 'mongodb'

const validDbTypes: dbType[] = ['mysql', 'mariadb', 'postgres', 'sqlite', 'mongodb']

const dbType = process.env.DB_TYPE as dbType | undefined

if (!dbType || !validDbTypes.includes(dbType)) {
    throw new Error('Invalid or missing DB_TYPE environment variable')
}

@Module({
    imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forRoot({
            type: dbType || 'postgres',
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT ?? '5432'),
            database: process.env.DB_DATABASE,
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            authSource: 'admin',
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            // TODO: Remove synchronize in production
            synchronize: true,
            logging: true,
        }),
        AuthModule,
        UserModule,
        ListModule,
        TaskModule,
    ],
    controllers: [AppController, HealthController],
    providers: [AppService],
})
export class AppModule {}
