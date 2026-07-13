import { BadRequestException } from '@nestjs/common';
import { ContentRequestStatus } from '@prisma/client';

/**
 * The workflow engine skeleton the roadmap's Sprint 3B scope calls for:
 * a status enum (see schema.prisma's `ContentRequestStatus`) plus a
 * transition table, not yet the full 10-step approval pipeline. Sprints
 * 5-7 (Brand Review, Compliance, Design Approval, Marketing Head Approval)
 * extend both `ContentRequestStatus` and the table below rather than
 * introducing a parallel state machine.
 */
export const CONTENT_REQUEST_TRANSITIONS: Record<ContentRequestStatus, ContentRequestStatus[]> = {
  DRAFT: [ContentRequestStatus.SUBMITTED, ContentRequestStatus.CANCELLED],
  SUBMITTED: [ContentRequestStatus.CANCELLED],
  CANCELLED: [],
};

/** Throws if `to` is not a legal transition from `from`; no-op otherwise. */
export function assertValidContentRequestTransition(
  from: ContentRequestStatus,
  to: ContentRequestStatus,
): void {
  if (!CONTENT_REQUEST_TRANSITIONS[from].includes(to)) {
    throw new BadRequestException(`Cannot transition a content request from ${from} to ${to}.`);
  }
}
