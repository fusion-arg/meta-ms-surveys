import { Inject, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SurveyService } from '../survey/survey.service';

@Injectable()
export class CronsService {
  constructor(
    @Inject(SurveyService)
    private surveyService: SurveyService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async activateSurveys() {
    await this.surveyService.activateSurveys();
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async closeSurveys() {
    await this.surveyService.closeSurveys();
  }
}
