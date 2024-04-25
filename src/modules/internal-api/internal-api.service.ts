import { Injectable } from '@nestjs/common';
import { SurveysForTextBlockDto } from './dto/surveys-for-text-block.dto';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { Answer } from '../survey/entities/answer.entity';
import { SurveysForRequesPresentationDto } from 'src/modules/internal-api/dto/surveys-for-reques-presentation.dto';
import { Survey } from 'src/modules/survey/entities/survey.entity';
import { v4 as uuidv4 } from 'uuid';
import { SurveyModule } from 'src/enums/survey-module.enum';
import { SurveyType } from 'src/enums/survey-type.enum';
import { Status } from 'src/enums/status.enum';
import { UserSurvey } from 'src/modules/survey/entities/user-survey.entity';
import { QuestionType } from 'src/enums/question-type.enum';
import { Question } from 'src/modules/survey/entities/question.entity';

@Injectable()
export class InternalApiService {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {}

  async surveysForTextBlocks(data: SurveysForTextBlockDto) {
    const response = [];
    const items = await this.entityManager
      .getRepository(Answer)
      .createQueryBuilder('answer')
      .leftJoinAndSelect('answer.question', 'question')
      .leftJoinAndSelect('question.survey', 'survey')
      .whereInIds(data.referenceIds)
      .getMany();

    for (const item of items) {
      response.push({
        id: item.id,
        response: item.response,
        survey: {
          id: item.question.survey.id,
          name: item.question.survey.title,
          description: item.question.survey.description,
          module: item.question.survey.module,
        },
        question: {
          id: item.question.id,
          name: item.question.title,
          description: item.question.description,
        },
        type: 'survey_answer',
      });
    }

    return response;
  }

  async surveysForRequestPresentation(
    projectId: string,
    data: SurveysForRequesPresentationDto,
  ) {
    for (const mapper of data.requestPresentation) {
      const survey = new Survey();
      survey.id = uuidv4();
      survey.projectId = projectId;
      survey.title = 'Request Capturing';
      survey.description = 'Request Capturing for current processes';
      survey.module = SurveyModule.CURRENT_STATE_PROCESS;
      survey.type = SurveyType.CAPTURE;
      survey.segmentation = JSON.stringify({});
      survey.status = Status.PENDING;
      survey.deliveredAt = new Date();

      const surveyMetadata = {
        projectId: projectId,
        surveyId: survey.id,
      };

      survey.metadata = JSON.stringify(surveyMetadata);

      await this.entityManager.save(survey);

      const userSurvey = new UserSurvey();
      userSurvey.id = uuidv4();
      userSurvey.survey = survey;
      userSurvey.userId = mapper.userId;

      await this.entityManager.save(userSurvey);

      let index = 1;
      for (const process of mapper['processes']) {
        const question = new Question();
        question.title = process.name;
        question.description = process.name;
        question.order = index;
        question.type = QuestionType.CAPTURE;
        question.metadata = JSON.stringify({ process: process.id });
        question.dropdownOptions = JSON.stringify({});
        question.survey = survey;
        await this.entityManager.save(question);
        index++;
      }
    }
  }
}
