import { IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { SurveyModule } from '../../../enums/survey-module.enum';
import { SurveyType } from '../../../enums/survey-type.enum';
import { Type } from 'class-transformer';
import { QuestionDto } from './question.dto';

export class SurveyDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  sprintId: string;

  @IsString()
  description: string;

  @IsEnum(SurveyModule)
  module: SurveyModule;

  @IsEnum(SurveyType)
  type: SurveyType;

  @ValidateNested({ each: true })
  @Type(() => QuestionDto)
  questions: QuestionDto[];
}
