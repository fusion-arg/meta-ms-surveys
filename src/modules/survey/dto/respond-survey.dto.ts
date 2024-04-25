import { IsObject, IsString } from 'class-validator';

export class RespondSurveyDto {
  @IsString()
  questionId: string;

  @IsObject()
  response: object = {};
}
