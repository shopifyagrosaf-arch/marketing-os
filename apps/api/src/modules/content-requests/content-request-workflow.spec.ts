import { BadRequestException } from '@nestjs/common';
import { ContentRequestStatus } from '@prisma/client';
import {
  assertValidContentRequestTransition,
  CONTENT_REQUEST_TRANSITIONS,
} from './content-request-workflow';

describe('assertValidContentRequestTransition', () => {
  it('allows every transition listed in the table', () => {
    for (const from of Object.values(ContentRequestStatus)) {
      for (const to of CONTENT_REQUEST_TRANSITIONS[from]) {
        expect(() => assertValidContentRequestTransition(from, to)).not.toThrow();
      }
    }
  });

  it('rejects every transition not listed in the table, including no-ops', () => {
    for (const from of Object.values(ContentRequestStatus)) {
      for (const to of Object.values(ContentRequestStatus)) {
        if (CONTENT_REQUEST_TRANSITIONS[from].includes(to)) continue;
        expect(() => assertValidContentRequestTransition(from, to)).toThrow(BadRequestException);
      }
    }
  });

  it('never allows leaving a terminal CANCELLED request', () => {
    expect(CONTENT_REQUEST_TRANSITIONS[ContentRequestStatus.CANCELLED]).toEqual([]);
  });
});
