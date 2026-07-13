import { IsEnum } from 'class-validator';
import { ContentRequestStatus } from '@prisma/client';

export class UpdateContentRequestStatusDto {
  @IsEnum(ContentRequestStatus)
  status!: ContentRequestStatus;
}
