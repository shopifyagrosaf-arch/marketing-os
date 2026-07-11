import { IsString } from 'class-validator';

export class GrantBrandAccessDto {
  @IsString()
  brandId!: string;

  @IsString()
  roleId!: string;
}
