import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class CreatePermissionDto {
  /** Freeform `resource:action` string (e.g. "content:approve") — see docs/adr/0005. */
  @IsString()
  @Matches(/^[a-z][a-z0-9_]*:[a-z][a-z0-9_]*$/, {
    message: 'action must be in "resource:action" form, e.g. "content:approve"',
  })
  @MaxLength(100)
  action!: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  description?: string;
}
