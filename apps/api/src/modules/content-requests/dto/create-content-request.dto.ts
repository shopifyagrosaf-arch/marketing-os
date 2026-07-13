import { IsISO8601, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateContentRequestDto {
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  description?: string;

  /** Free-form, e.g. "social_post", "blog_article" — see schema.prisma's doc comment for why this isn't a fixed enum. */
  @IsString()
  @MinLength(2)
  @MaxLength(60)
  contentType!: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  channel?: string;

  @IsOptional()
  @IsISO8601()
  dueDate?: string;
}
