import {
  IsEnum,
  IsNumber,
  IsObject,
  IsString,
  ValidateIf,
} from 'class-validator';
import { QuestionType } from '../../../enums/question-type.enum';

export class QuestionDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsNumber()
  order: number;

  @IsEnum(QuestionType)
  type: QuestionType;

  @IsObject()
  metadata: object = {};

  @ValidateIf((object) => object.type === QuestionType.DROPDOWN)
  @IsObject()
  dropdownOptions: object = {};
}
