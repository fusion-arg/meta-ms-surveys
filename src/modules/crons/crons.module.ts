import { Module } from '@nestjs/common';
import { CronsService } from './crons.service';
import { SurveyModule } from '../survey/survey.module';

@Module({
  imports: [SurveyModule],
  providers: [CronsService],
})
export class CronsModule {}
