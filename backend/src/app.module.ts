import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {HealthController} from "./health.controller";
import {ConfigModule} from "@nestjs/config";

@Module({
  imports: [
    ConfigModule.forRoot(),
  ],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {}
