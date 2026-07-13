import { IsISO8601, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

/** Editable only while the request is still DRAFT — enforced in ContentRequestsService, not here. */
export class UpdateContentRequestDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  description?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(60)
  contentType?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  channel?: string;

  @IsOptional()
  @IsISO8601()
  dueDate?: string;
}
