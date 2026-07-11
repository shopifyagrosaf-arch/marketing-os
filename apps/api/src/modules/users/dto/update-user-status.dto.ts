import { IsIn } from 'class-validator';

/**
 * Deliberately narrower than the full Prisma `UserStatus` enum: an admin
 * manually toggles ACTIVE/SUSPENDED only. EXPIRED is reserved for the
 * time-boxed External Agency/Freelancer auto-expiry behavior (SRS v2 §1.4)
 * once that automation exists — not something a manual PATCH should set.
 */
export class UpdateUserStatusDto {
  @IsIn(['ACTIVE', 'SUSPENDED'])
  status!: 'ACTIVE' | 'SUSPENDED';
}
