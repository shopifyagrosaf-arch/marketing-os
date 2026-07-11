import { IsIn, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class CreateBrandDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name!: string;

  @IsString()
  @Matches(/^[a-z0-9-]+$/, {
    message: 'slug must be lowercase alphanumeric with hyphens only',
  })
  @MaxLength(60)
  slug!: string;

  @IsOptional()
  @IsString()
  @IsIn(['en', 'hi'], {
    message: 'localeDefault must be a supported locale (en, hi) at this stage',
  })
  localeDefault?: string;
}
