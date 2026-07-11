import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateRoleDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(60)
  @Matches(/^[A-Z][A-Z0-9_]*$/, {
    message: 'name must be UPPER_SNAKE_CASE, e.g. "REGIONAL_BRAND_LEAD"',
  })
  name?: string;

  @IsOptional()
  @IsBoolean()
  isOrgWide?: boolean;

  /** When provided, replaces the role's entire permission set (not a merge). */
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  permissionActions?: string[];
}
