import { IsArray } from 'class-validator';
export class SurveysForTextBlockDto {
  @IsArray()
  referenceIds: string[];
}
