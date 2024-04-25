import { IsOptional } from 'class-validator';
import { Sorting } from 'src/contracts/sorting.contract';

export class AnswerSorting implements Sorting {
  @IsOptional()
  stakeholder?: 'ASC' | 'DESC';

  @IsOptional()
  lastAnsweredAt?: 'ASC' | 'DESC';
}
