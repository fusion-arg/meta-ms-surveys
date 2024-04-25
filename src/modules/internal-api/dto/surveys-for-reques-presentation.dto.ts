import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, ValidateNested } from 'class-validator';
export class SurveysForRequesPresentationDto {
  @ValidateNested({ each: true })
  @Type(() => RequestPresentationDto)
  requestPresentation: RequestPresentationDto[];
}

export class RequestPresentationDto {
  @IsNotEmpty()
  userId: string;
  @IsArray()
  processes: Array<any>;
}

export class PrecessesDto {
  @IsNotEmpty()
  id: string;
  @IsNotEmpty()
  name: string;
}
