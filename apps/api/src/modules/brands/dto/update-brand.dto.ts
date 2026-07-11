import { IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateBrandDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsString()
  @IsIn(['en', 'hi'], {
    message: 'localeDefault must be a supported locale (en, hi) at this stage',
  })
  localeDefault?: string;
}
