import { Module } from '@nestjs/common';
import { TypeOrmModule } from '../typeorm/typeorm.module';
import { SurveyController } from './survey.controller';
import { SurveyService } from './survey.service';
import { Survey } from './entities/survey.entity';
import { Answer } from './entities/answer.entity';
import { Question } from './entities/question.entity';
import { UserSurvey } from './entities/user-survey.entity';
import { ApiServiceModule } from '../../api-service/api-service.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Survey, Answer, Question, UserSurvey]),
    ApiServiceModule,
  ],
  controllers: [SurveyController],
  providers: [SurveyService],
  exports: [SurveyService],
})
export class SurveyModule {}
