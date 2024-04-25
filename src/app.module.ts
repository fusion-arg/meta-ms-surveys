import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import { CommandModule } from './commands/command.module';
import { TypeOrmModule } from './modules/typeorm/typeorm.module';
import { HttpModule } from '@nestjs/axios';
import { SurveyModule } from './modules/survey/survey.module';
import { ScheduleModule } from '@nestjs/schedule';
import { CronsModule } from './modules/crons/crons.module';
import { InternalApiModule } from './modules/internal-api/internal-api.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    CronsModule,
    TypeOrmModule,
    CommandModule,
    SurveyModule,
    InternalApiModule,
    HttpModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        always: true,
      }),
    },
  ],
})
export class AppModule {}
