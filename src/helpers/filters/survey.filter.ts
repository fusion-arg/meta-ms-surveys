import { Transform } from 'class-transformer';
import { IsArray, IsOptional, IsString } from 'class-validator';
import { Filter } from 'src/contracts/filter.contract';

export class SurveyFilter implements Filter {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsArray()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map((id) => id.trim());
    }
    return value;
  })
  types?: string[];

  @IsOptional()
  @IsString()
  deliveredAtFrom?: string;

  @IsOptional()
  @IsString()
  deliveredAtTo?: string;

  @IsOptional()
  @IsString()
  closedAtFrom?: string;

  @IsOptional()
  @IsString()
  closedAtTo?: string;

  @IsOptional()
  @IsArray()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map((id) => id.trim());
    }
    return value;
  })
  statuses?: string[];

  @IsOptional()
  @IsString()
  module?: string;

  @IsOptional()
  @IsString()
  sprint?: string;
}
