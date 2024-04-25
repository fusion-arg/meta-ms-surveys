import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SurveyService } from './survey.service';
import { FilterParams } from '../../helpers/decorators/filter.decorator';
import { PaginationParams } from '../../helpers/decorators/pagination.decorator';
import { Pagination } from '../../contracts/pagination.contract';
import { SurveyFilter } from '../../helpers/filters/survey.filter';
import { SortingParams } from '../../helpers/decorators/sorting.decorator';
import { SurveySorting } from '../../helpers/sortings/survey.sorting';
import { SurveySerializer } from '../../serializers/survey.serializer';
import { PermissionsGuard } from '../../guards/permissions.guard';
import { SurveyDto } from './dto/survey.dto';
import { SurveyDetailSerializer } from '../../serializers/survey-detail.serializer';
import { Status } from '../../enums/status.enum';
import { SurveyDeadlineDto } from './dto/survey-deadline.dto';
import { RespondSurveyDto } from './dto/respond-survey.dto';
import { SurveyDetailResponseSerializer } from '../../serializers/survey-detail-response.serializer';
import { AnswerFilter } from '../../helpers/filters/answer.filter';
import { AnswerSorting } from '../../helpers/sortings/answer.sorting';
import { AnswerSerializer } from '../../serializers/answer.serializer';
import { AnswerDetailSerializer } from '../../serializers/answer-detail.serializer';

@Controller('projects/:projectId/surveys')
export class SurveyController {
  constructor(private surveys: SurveyService) {}

  @Get()
  @UseGuards(new PermissionsGuard(['surveys.list', 'client-users.default']))
  async findAll(
    @FilterParams(SurveyFilter) filter: SurveyFilter,
    @SortingParams(SurveySorting) sorting: SurveySorting,
    @PaginationParams() paginationParams: Pagination,
    @Param('projectId') projectId: string,
  ): Promise<any> {
    const { items, pagination } = await this.surveys.filter(
      projectId,
      filter,
      sorting,
      paginationParams,
    );

    const serializer = new SurveySerializer();
    const serializedData = serializer.respondMany(items, pagination);

    return serializedData;
  }

  @Post()
  @UseGuards(new PermissionsGuard(['surveys.create', 'client-users.default']))
  @HttpCode(HttpStatus.CREATED)
  async create(@Param('projectId') projectId: string, @Body() body: SurveyDto) {
    await this.surveys.create(body, projectId);
  }

  @Get(':id')
  @UseGuards(new PermissionsGuard(['surveys.view', 'client-users.default']))
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) {
    const item = await this.surveys.findOne(id);

    const serializer = new SurveyDetailSerializer();

    return serializer.respond(item);
  }

  @Post(':id/respondings')
  @UseGuards(new PermissionsGuard(['surveys.view', 'client-users.default']))
  @HttpCode(HttpStatus.CREATED)
  async respondSurvey(
    @Param('id') surveyId: string,
    @Body() body: RespondSurveyDto,
    @Req() req: any,
  ) {
    const userId = req['user']?.id;

    await this.surveys.respondSurvey(surveyId, body, userId);
  }

  @Post(':id/pause')
  @UseGuards(new PermissionsGuard(['surveys.pause', 'client-users.default']))
  async pause(@Param('id') id: string) {
    await this.surveys.changeStatus(id, Status.PAUSED);
  }

  @Post(':id/close')
  @UseGuards(new PermissionsGuard(['surveys.close', 'client-users.default']))
  async close(@Param('id') id: string) {
    await this.surveys.changeStatus(id, Status.CLOSED);
  }

  @Post(':id/continue')
  @UseGuards(new PermissionsGuard(['surveys.pause', 'client-users.default']))
  async restart(@Param('id') id: string) {
    await this.surveys.changeStatus(id, Status.OPEN);
  }

  @Patch(':id/generic-update')
  @UseGuards(
    new PermissionsGuard(['surveys.generic-update', 'client-users.default']),
  )
  async genericUpdate(@Param('id') id: string, @Body() body: SurveyDto) {
    const item = await this.surveys.genericUpdate(id, body);
    const serializer = new SurveyDetailSerializer();

    return serializer.respond(item);
  }

  @Patch(':id/deadline-update')
  @UseGuards(
    new PermissionsGuard(['surveys.deadline-update', 'client-users.default']),
  )
  async deadlineUpdate(
    @Param('id') id: string,
    @Body() body: SurveyDeadlineDto,
  ) {
    const item = await this.surveys.deadlineUpdate(id, body);
    const serializer = new SurveyDetailSerializer();

    return serializer.respond(item);
  }

  @Get(':id/respondings')
  @UseGuards(new PermissionsGuard(['surveys.view', 'client-users.default']))
  @HttpCode(HttpStatus.OK)
  async findAnswers(@Param('id') id: string, @Req() request: any) {
    const item = await this.surveys.findOneByUser(id, request.user.id);

    const serializer = new SurveyDetailResponseSerializer();

    return serializer.respond(item);
  }

  @Get(':id/answers')
  @UseGuards(new PermissionsGuard(['surveys.view', 'client-users.default']))
  @HttpCode(HttpStatus.OK)
  async findUserAnswers(
    @Param('id') surveyId: string,
    @Param('projectId') projectId: string,
    @FilterParams(AnswerFilter) filter: AnswerFilter,
    @SortingParams(AnswerSorting) sorting: AnswerSorting,
  ) {
    const item = await this.surveys.findUserAnswers(
      filter,
      sorting,
      surveyId,
      projectId,
    );

    const serializer = new AnswerSerializer();

    return serializer.respondMany(item);
  }

  @Get(':surveyId/answers/:answerId')
  @UseGuards(new PermissionsGuard(['surveys.view', 'client-users.default']))
  @HttpCode(HttpStatus.OK)
  async answerDetail(
    @Param('surveyId') surveyId: string,
    @Param('answerId') answerId: string,
  ) {
    const item = await this.surveys.answerDetail(surveyId, answerId);

    const serializer = new AnswerDetailSerializer();

    return serializer.respond(item);
  }
}
