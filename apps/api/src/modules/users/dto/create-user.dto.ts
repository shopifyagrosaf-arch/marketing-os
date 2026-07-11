import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';

class InitialBrandAccessDto {
  @IsString()
  brandId!: string;

  @IsString()
  roleId!: string;
}

/**
 * Pre-provisions a User row (and optionally initial BrandAccess grants)
 * before the person ever logs in — auth is SSO-only (see docs/adr/0004),
 * so "creating a user" here means "let this email in and decide their
 * access ahead of time," not setting a password.
 */
export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name!: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InitialBrandAccessDto)
  brandAccess?: InitialBrandAccessDto[];
}
