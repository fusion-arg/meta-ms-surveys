import { Transform } from 'class-transformer';
import { IsString, IsOptional } from 'class-validator';
import { Filter } from 'src/contracts/filter.contract';

export class AnswerFilter implements Filter {
  @IsOptional()
  @IsString()
  stakeholder?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value.split(','))
  departments?: string[];

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value.split(','))
  positions?: string[];

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value.split(','))
  influencerTypes?: string[];

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value.split(','))
  projectRoles?: string[];
}
