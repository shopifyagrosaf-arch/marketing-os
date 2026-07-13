import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { ContentRequestStatus } from '@prisma/client';

export class ListContentRequestsQueryDto {
  @IsOptional()
  @IsEnum(ContentRequestStatus)
  status?: ContentRequestStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
