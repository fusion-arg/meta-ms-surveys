import { IsArray, IsBoolean, IsOptional } from 'class-validator';

export class SegmentationDto {
  @IsArray()
  departments: string[];

  @IsBoolean()
  includeChildren: boolean;

  @IsBoolean()
  allDepartmentStakeholders: boolean;

  @IsBoolean()
  allInfluencerStakeholders: boolean;

  @IsBoolean()
  associatedInfluencers: boolean;

  @IsBoolean()
  includingExcluded: boolean;

  @IsArray()
  @IsOptional()
  processes: string[] = [];
}
