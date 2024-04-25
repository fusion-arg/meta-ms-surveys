import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationService } from 'src/helpers/services/pagination.service';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Survey } from './entities/survey.entity';
import { SurveyFilter } from '../../helpers/filters/survey.filter';
import { SurveySorting } from '../../helpers/sortings/survey.sorting';
import { Pagination } from '../../contracts/pagination.contract';
import { SurveyDto } from './dto/survey.dto';
import { Question } from './entities/question.entity';
import { v4 as uuidv4 } from 'uuid';
import { Status } from '../../enums/status.enum';
import { SurveyDeadlineDto } from './dto/survey-deadline.dto';
import { UserSurvey } from './entities/user-survey.entity';
import { Answer } from './entities/answer.entity';
import { ApiAuthService } from '../../api-service/api-auth.service';
import { ApiOrganizationService } from '../../api-service/api-organization.service';
import { RespondSurveyDto } from './dto/respond-survey.dto';
import { AnswerFilter } from '../../helpers/filters/answer.filter';
import { AnswerSorting } from '../../helpers/sortings/answer.sorting';
import { SurveyType } from 'src/enums/survey-type.enum';

const statusTransitions = new Map<Status, Status[]>([
  [Status.PENDING, [Status.CLOSED, Status.OPEN, Status.FAILED]],
  [Status.OPEN, [Status.CLOSED, Status.PAUSED]],
  [Status.CLOSED, []],
  [Status.PAUSED, [Status.OPEN, Status.CLOSED]],
]);

@Injectable()
export class SurveyService extends PaginationService {
  constructor(
    @InjectRepository(Survey) private surveyRepository: Repository<Survey>,
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
    @InjectRepository(Answer)
    private answerRepository: Repository<Answer>,
    @InjectRepository(UserSurvey)
    private userSurveyRepository: Repository<UserSurvey>,
    private apiAuthService: ApiAuthService,
    private apiOrganizationService: ApiOrganizationService,
  ) {
    super();
  }

  async filter(
    projectId: string,
    filter: SurveyFilter,
    sorting: SurveySorting,
    pagination: Pagination,
  ) {
    const queryBuilder = this.surveyRepository.createQueryBuilder('survey');
    queryBuilder.andWhere('survey.projectId = :projectId', { projectId });

    this.applyFilter(queryBuilder, filter);
    this.applySorting(queryBuilder, sorting);

    return await this.paginate(queryBuilder, pagination);
  }

  async create(data: SurveyDto, projectId: string): Promise<void> {
    const survey = new Survey();
    survey.id = uuidv4();
    survey.projectId = projectId;
    survey.title = data.title;
    survey.description = data.description;
    survey.module = data.module;
    survey.type = data.type;
    survey.segmentation = JSON.stringify({});
    survey.sprintId = data.sprintId;
    survey.status = Status.PENDING;

    const surveyMetadata = {
      projectId: projectId,
      surveyId: survey.id,
    };

    survey.metadata = JSON.stringify(surveyMetadata);

    await this.surveyRepository.save(survey);

    const questions = data.questions?.map((questionDto) => {
      const question = new Question();
      question.title = questionDto.title;
      question.description = questionDto.description;
      question.order = questionDto.order;
      question.type = questionDto.type;
      question.metadata = JSON.stringify(questionDto.metadata);
      question.dropdownOptions = JSON.stringify(questionDto.dropdownOptions);
      question.survey = survey;
      return question;
    });

    if (questions) {
      const savedQuestions = await this.questionRepository.save(questions);
      survey.questions = savedQuestions;
      await this.surveyRepository.save(survey);
    }
  }

  async findOne(id: string): Promise<Survey> {
    const survey = await this.surveyRepository
      .createQueryBuilder('survey')
      .leftJoinAndSelect('survey.questions', 'question')
      .where('survey.id = :id', { id })
      .addOrderBy('question.order')
      .getOne();

    if (!survey) {
      throw new NotFoundException('Survey not found');
    }

    const segmentation = JSON.parse(JSON.stringify(survey.segmentation));
    if (segmentation.departments && segmentation.departments.length > 0) {
      const departments = await this.apiOrganizationService.getDepartments(
        segmentation.departments,
      );
      survey.segmentation['departments'] = departments;
    }
    await this.getSprint(survey);

    return survey;
  }

  private async getSprint(survey: Survey) {
    if (!survey.sprintId) return null;
    const sprint = await this.apiOrganizationService.getSprint(survey.sprintId);
    survey.sprintName = sprint.name;
  }

  async changeStatus(id: string, status: Status): Promise<void> {
    const survey = await this.findOne(id);

    const validTransitions = statusTransitions.get(survey.status);
    if (!validTransitions || !validTransitions.includes(status)) {
      throw new ConflictException('Invalid status transition');
    }

    survey.status = status;

    await this.surveyRepository.save(survey);
  }

  async genericUpdate(surveyId: string, data: SurveyDto) {
    let survey = await this.findOne(surveyId);

    if (survey.status !== Status.PENDING) {
      throw new BadRequestException('Survey must be pending to edit');
    }

    await this.surveyRepository.manager.transaction(async (manager) => {
      await manager
        .createQueryBuilder()
        .delete()
        .from(Question)
        .where('survey = :surveyId', { surveyId })
        .execute();

      survey.title = data.title;
      survey.description = data.description;
      survey.module = data.module;
      survey.type = data.type;
      survey.sprintId = data.sprintId;

      await manager.save(survey);

      if (data.questions && data.questions.length > 0) {
        const questions = data.questions.map((questionDto) => {
          const question = new Question();
          question.title = questionDto.title;
          question.description = questionDto.description;
          question.order = questionDto.order;
          question.type = questionDto.type;
          question.metadata = JSON.stringify(questionDto.metadata);
          question.dropdownOptions = JSON.stringify(
            questionDto.dropdownOptions,
          );
          question.survey = survey;

          return question;
        });

        await manager.save(questions);
      }
    });

    survey = await this.findOne(surveyId);

    return survey;
  }

  async deadlineUpdate(surveyId: string, data: SurveyDeadlineDto) {
    const survey = await this.findOne(surveyId);

    if (survey.status !== Status.PENDING) {
      throw new BadRequestException('Survey must be pending to edit');
    }

    if (data.deliveredAt >= data.closedAt) {
      throw new BadRequestException(
        'The delivered date must be before the closed date',
      );
    }
    this.getProcessesForSegmentation(data, survey);
    survey.segmentation = JSON.parse(JSON.stringify(data.segmentation));

    await this.getUsersForSurvey(survey);
    survey.deliveredAt = data.deliveredAt;
    survey.closedAt = data.closedAt;

    await this.surveyRepository.save(survey);

    return await this.findOne(surveyId);
  }

  private getProcessesForSegmentation(
    data: SurveyDeadlineDto,
    survey: Survey,
  ): void {
    const processes: string[] = [];
    if (data.segmentation.associatedInfluencers) {
      for (const item of survey.questions) {
        const metadata = JSON.parse(JSON.stringify(item.metadata));
        if (metadata.process) {
          processes.push(metadata.process);
        }
      }
    }
    data.segmentation.processes = processes;
  }

  async activateSurveys() {
    const pendingSurveys = await this.getAllPendingSurveys();
    await this.surveyRepository.manager.transaction(async (manager) => {
      for (const survey of pendingSurveys) {
        let userIds = [];
        try {
          userIds = await this.getUsersForSurvey(survey);
        } catch (error) {
          Logger.debug(
            `${survey.id} - ${survey.title}: change status to failed `,
            error,
          );
          survey.status = Status.FAILED;
          await manager.getRepository(Survey).save(survey);
          continue;
        }
        if (survey.type !== SurveyType.CAPTURE) {
          for (const userId of userIds) {
            const userSurvey = new UserSurvey();
            userSurvey.userId = userId;
            userSurvey.survey = survey;
            userSurvey.responded = false;

            await manager.getRepository(UserSurvey).save(userSurvey);
          }
        }

        for (const question of survey.questions) {
          for (const userId of userIds) {
            const answer = new Answer();
            answer.question = question;
            answer.userId = userId;
            answer.response = JSON.stringify({});

            await manager.getRepository(Answer).save(answer);
          }
        }

        await manager
          .getRepository(Survey)
          .createQueryBuilder()
          .update(Survey)
          .set({ status: Status.OPEN, totalExpected: userIds.length })
          .where('id = :id', { id: survey.id })
          .execute();

        this.sendEmail(userIds, {
          projectId: survey.projectId,
          surveyId: survey.id,
        });
      }
    });

    Logger.debug(
      `${pendingSurveys.length} ROWS AFFECTED IN SURVEYS ACTIVATION`,
    );
  }

  async closeSurveys() {
    const currentDate = new Date();

    await this.surveyRepository
      .createQueryBuilder('survey')
      .update(Survey)
      .set({ status: Status.CLOSED })
      .where('closed_at <= :currentDate', { currentDate })
      .andWhere('(status = :openStatus OR status = :pausedStatus)', {
        openStatus: Status.OPEN,
        pausedStatus: Status.PAUSED,
      })
      .execute();
  }

  async respondSurvey(
    surveyId: string,
    data: RespondSurveyDto,
    userId: string,
  ) {
    const survey = await this.findOne(surveyId);
    const answer = await this.answerRepository.findOneOrFail({
      where: { question: { id: data.questionId }, userId },
    });
    const userSurvey = await this.userSurveyRepository.findOneOrFail({
      where: { survey: { id: survey.id }, userId },
    });

    this.surveyRepository.manager.transaction(async (manager) => {
      answer.response = JSON.stringify(data.response);
      answer.respondedAt = new Date();
      await manager.getRepository(Answer).save(answer);

      if (userSurvey.responded) return null;

      const questionIds = survey.questions.map((question) => question.id);
      const userAnswers = await this.answerRepository
        .createQueryBuilder('answer')
        .where('answer.userId = :userId', { userId })
        .andWhere('answer.question IN (:...questionIds)', { questionIds })
        .getMany();

      for (const item of userAnswers) {
        if (item.respondedAt === null && item.id !== answer.id) {
          return;
        }
      }

      userSurvey.responded = true;
      await manager.getRepository(UserSurvey).save(userSurvey);

      survey.totalAnswered = survey.totalAnswered + 1;
      await manager.getRepository(Survey).save(survey);
    });
  }

  async findUserAnswers(
    filter: AnswerFilter,
    sorting: AnswerSorting,
    surveyId: string,
    projectId: string,
  ): Promise<any[]> {
    const usersOfSurvey = await this.answerRepository
      .createQueryBuilder('answer')
      .select(['answer.userId as userId'])
      .innerJoin('answer.question', 'question')
      .where('question.surveyId = :surveyId', { surveyId })
      .groupBy('answer.userId')
      .getRawMany();

    const userIds = usersOfSurvey.map((answer) => answer.userId);

    if (!userIds.length) {
      return [];
    }

    const payload = {
      departments: filter.departments,
      positions: filter.positions,
      projectId,
      influencerTypes: filter.influencerTypes,
      stakeholderOrder: sorting.stakeholder,
      stakeholder: filter.stakeholder || '',
      projectRoles: filter.projectRoles,
      userIds,
    };

    const partialItems =
      await this.apiOrganizationService.getStakeholdersForAnswers(payload);

    for (const partialItem of partialItems) {
      const userAnswer = await this.answerRepository
        .createQueryBuilder('answer')
        .innerJoinAndSelect('answer.question', 'question')
        .where('question.surveyId = :surveyId', { surveyId })
        .andWhere(
          'answer.respondedAt = (SELECT MAX(sub.responded_at) FROM surv_answer as sub WHERE sub.questionId = answer.questionId AND sub.user_id = answer.userId AND sub.user_id = :userId)',
        )
        .setParameter('userId', partialItem.userId)
        .getOne();

      partialItem['id'] = userAnswer?.id;
      partialItem['lastAnswerAt'] = userAnswer?.respondedAt;
    }

    if (sorting.lastAnsweredAt) {
      partialItems.sort((a: any, b: any) => {
        if (a.lastAnswerAt === null && b.lastAnswerAt === null) {
          return 0;
        }
        if (a.lastAnswerAt === null) {
          return 1;
        }
        if (b.lastAnswerAt === null) {
          return -1;
        }
        if (sorting.lastAnsweredAt === 'ASC') {
          return a.lastAnswerAt.getTime() - b.lastAnswerAt.getTime();
        } else {
          return b.lastAnswerAt.getTime() - a.lastAnswerAt.getTime();
        }
      });
    }

    return partialItems;
  }

  async answerDetail(surveyId: string, answerId: string): Promise<Survey> {
    const answer = await this.answerRepository.findOneByOrFail({
      id: answerId,
    });

    const survey = await this.surveyRepository
      .createQueryBuilder('survey')
      .leftJoinAndSelect('survey.questions', 'question')
      .leftJoinAndSelect('question.answers', 'answer')
      .andWhere('survey.id = :surveyId', { surveyId })
      .andWhere('answer.userId = :userId', { userId: answer.userId })
      .addOrderBy('question.order')
      .getOneOrFail();

    const stakeholder = await this.apiOrganizationService.getStakeholder(
      answer.userId,
      survey.projectId,
    );

    survey['stakeholder'] = stakeholder;

    return survey;
  }

  private async getAllPendingSurveys(): Promise<Survey[]> {
    const currentDate = new Date();
    return await this.surveyRepository
      .createQueryBuilder('survey')
      .leftJoinAndSelect('survey.questions', 'question')
      .leftJoinAndSelect('survey.users', 'users')
      .where('survey.deliveredAt <= :currentDate', { currentDate })
      .andWhere('survey.status = :status', { status: Status.PENDING })
      .getMany();
  }

  private async getUsersForSurvey(survey: Survey): Promise<Array<string>> {
    if (survey.type === SurveyType.CAPTURE) {
      return survey.users.map((userSurvey) => {
        return userSurvey.userId;
      });
    }
    const payload = JSON.parse(JSON.stringify(survey.segmentation));
    payload['projectId'] = survey.projectId;

    const userIds = await this.apiOrganizationService.getStakeholders(payload);

    return userIds;
  }

  private sendEmail(userIds: Array<string>, metadata: object) {
    this.apiAuthService.sendSurveyEmail(userIds, metadata);
  }

  private applySorting(
    queryBuilder: SelectQueryBuilder<Survey>,
    sorting: SurveySorting,
  ): void {
    const { title, type, deliveredAt, closedAt, status } = sorting;

    if (title) {
      queryBuilder.addOrderBy('survey.title', title);
    }

    if (type) {
      queryBuilder.addOrderBy('survey.type', type);
    }

    if (deliveredAt) {
      queryBuilder.addOrderBy('survey.deliveredAt', deliveredAt);
    }

    if (closedAt) {
      queryBuilder.addOrderBy('survey.closedAt', closedAt);
    }

    if (status) {
      queryBuilder.addOrderBy('survey.status', status);
    }
  }

  private applyFilter(
    queryBuilder: SelectQueryBuilder<Survey>,
    filter: SurveyFilter,
  ): void {
    const {
      title,
      types,
      deliveredAtFrom,
      deliveredAtTo,
      closedAtFrom,
      closedAtTo,
      statuses,
      module,
      sprint,
    } = filter;

    if (title) {
      queryBuilder.andWhere(`survey.title LIKE :title`, {
        title: `%${title}%`,
      });
    }

    if (types) {
      queryBuilder.andWhere(`survey.type IN (:...types)`, {
        types,
      });
    }

    if (sprint) {
      queryBuilder.andWhere(`survey.sprintId = :sprint`, {
        sprint,
      });
    }

    if (deliveredAtFrom) {
      queryBuilder.andWhere(`survey.deliveredAt >= :deliveredAtFrom`, {
        deliveredAtFrom,
      });
    }

    if (deliveredAtTo) {
      queryBuilder.andWhere(`survey.deliveredAt <= :deliveredAtTo`, {
        deliveredAtTo,
      });
    }

    if (closedAtFrom) {
      queryBuilder.andWhere(`survey.closedAt >= :closedAtFrom`, {
        closedAtFrom,
      });
    }

    if (closedAtTo) {
      queryBuilder.andWhere(`survey.closedAt <= :closedAtTo`, {
        closedAtTo,
      });
    }

    if (statuses) {
      queryBuilder.andWhere(`survey.status IN (:...statuses)`, {
        statuses,
      });
    }

    if (module) {
      queryBuilder.andWhere(`survey.module LIKE :module`, {
        module: `%${module}%`,
      });
    }
  }

  async findOneByUser(id: string, userId: string): Promise<Survey> {
    const survey = await this.surveyRepository
      .createQueryBuilder('survey')
      .leftJoinAndSelect('survey.questions', 'question')
      .leftJoinAndMapMany(
        'question.answers',
        'surv_answer',
        'answer',
        'answer.questionId = question.id AND answer.userId = :userId',
        { userId: userId },
      )
      .where('survey.id = :id', { id })
      .addOrderBy('question.order')
      .getOne();

    if (!survey) {
      throw new NotFoundException('Survey not found');
    }

    const segmentation = JSON.parse(JSON.stringify(survey.segmentation));
    if (segmentation.departments && segmentation.departments.length > 0) {
      const departments = await this.apiOrganizationService.getDepartments(
        segmentation.departments,
      );
      survey.segmentation['departments'] = departments;
    }

    return survey;
  }
}
