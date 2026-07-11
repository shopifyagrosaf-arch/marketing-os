/**
 * Types/constants shared between apps/api and apps/web. Kept deliberately
 * small in Sprint 1 (just role names) — grows as later sprints add
 * content/workflow DTOs that both the API and the frontend need to agree on.
 */

export const ROLE_NAMES = [
  'SUPER_ADMIN',
  'MARKETING_HEAD',
  'BRAND_MANAGER',
  'CONTENT_WRITER',
  'GRAPHIC_DESIGNER',
  'VIDEO_EDITOR',
  'SEO_SPECIALIST',
  'WEBSITE_MANAGER',
  'SOCIAL_MEDIA_EXECUTIVE',
  'PERFORMANCE_MARKETING_EXECUTIVE',
  'PHOTOGRAPHER',
  'SALES_VIEW_ONLY',
  'EXTERNAL_AGENCY',
  'MEDICAL_REGULATORY_REVIEWER',
] as const;

export type RoleName = (typeof ROLE_NAMES)[number];

/** Roles with organization-wide access (not scoped to a single brand). */
export const ORG_WIDE_ROLES: RoleName[] = ['SUPER_ADMIN', 'MARKETING_HEAD'];

export interface BrandSummary {
  id: string;
  name: string;
  slug: string;
}
