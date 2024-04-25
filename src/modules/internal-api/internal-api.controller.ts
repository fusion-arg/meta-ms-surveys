import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { InternalApiService } from './internal-api.service';
import { SurveysForTextBlockDto } from './dto/surveys-for-text-block.dto';
import { SurveysForRequesPresentationDto } from 'src/modules/internal-api/dto/surveys-for-reques-presentation.dto';

@Controller('internal-apis')
export class InternalApiController {
  constructor(private readonly internalApis: InternalApiService) {}

  @Post('surveys-for-text-blocks')
  @HttpCode(HttpStatus.OK)
  async processesForTextBlocks(@Body() data: SurveysForTextBlockDto) {
    return await this.internalApis.surveysForTextBlocks(data);
  }

  @Post('projects/:projectId/surveys-for-request-presentation')
  @HttpCode(HttpStatus.OK)
  async surveyForRequestPresentation(
    @Param('projectId') projectId: string,
    @Body() data: SurveysForRequesPresentationDto,
  ) {
    return await this.internalApis.surveysForRequestPresentation(
      projectId,
      data,
    );
  }
}
