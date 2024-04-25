import { IsOptional } from 'class-validator';
import { Sorting } from 'src/contracts/sorting.contract';

export class SurveySorting implements Sorting {
  @IsOptional()
  title?: 'ASC' | 'DESC';

  @IsOptional()
  type?: 'ASC' | 'DESC';

  @IsOptional()
  deliveredAt?: 'ASC' | 'DESC';

  @IsOptional()
  closedAt?: 'ASC' | 'DESC';

  @IsOptional()
  status?: 'ASC' | 'DESC';
}
