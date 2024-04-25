import { Type } from 'class-transformer';
import { IsDateString, ValidateNested } from 'class-validator';
import { SegmentationDto } from './segmentation.dto';

export class SurveyDeadlineDto {
  @IsDateString()
  deliveredAt: Date;

  @IsDateString()
  closedAt: Date;

  @ValidateNested()
  @Type(() => SegmentationDto)
  segmentation: SegmentationDto;
}
