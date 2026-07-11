import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Role names as plain strings (not an enum) so Super Admin can add custom
// roles later without a schema migration — see schema.prisma Role model.
const ROLES: Array<{ name: string; isOrgWide: boolean }> = [
  { name: 'SUPER_ADMIN', isOrgWide: true },
  { name: 'MARKETING_HEAD', isOrgWide: true },
  { name: 'BRAND_MANAGER', isOrgWide: false },
  { name: 'CONTENT_WRITER', isOrgWide: false },
  { name: 'GRAPHIC_DESIGNER', isOrgWide: false },
  { name: 'VIDEO_EDITOR', isOrgWide: false },
  { name: 'SEO_SPECIALIST', isOrgWide: false },
  { name: 'WEBSITE_MANAGER', isOrgWide: false },
  { name: 'SOCIAL_MEDIA_EXECUTIVE', isOrgWide: false },
  { name: 'PERFORMANCE_MARKETING_EXECUTIVE', isOrgWide: false },
  { name: 'PHOTOGRAPHER', isOrgWide: false },
  { name: 'SALES_VIEW_ONLY', isOrgWide: false },
  { name: 'EXTERNAL_AGENCY', isOrgWide: false },
  { name: 'MEDICAL_REGULATORY_REVIEWER', isOrgWide: false },
];

const BRANDS = [
  { name: 'Agrosaf Pharmaceuticals', slug: 'agrosaf-pharmaceuticals' },
  { name: 'Alosafe Pharmacare', slug: 'alosafe-pharmacare' },
  { name: 'Medizone', slug: 'medizone' },
  { name: 'Hospital Marketing', slug: 'hospital-marketing' },
];

async function main() {
  const org = await prisma.organization.upsert({
    where: { id: 'agrosaf-group' },
    update: {},
    create: { id: 'agrosaf-group', name: 'Agrosaf Group', planTier: 'internal' },
  });

  for (const role of ROLES) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: { isOrgWide: role.isOrgWide },
      create: role,
    });
  }

  const brandRecords = [];
  for (const brand of BRANDS) {
    const record = await prisma.brand.upsert({
      where: { slug: brand.slug },
      update: {},
      create: { ...brand, organizationId: org.id },
    });
    brandRecords.push(record);
  }

  const superAdminRole = await prisma.role.findUniqueOrThrow({ where: { name: 'SUPER_ADMIN' } });

  const superAdminEmail = process.env.SEED_SUPER_ADMIN_EMAIL;
  if (!superAdminEmail) {
    throw new Error(
      'SEED_SUPER_ADMIN_EMAIL must be set before seeding (no hardcoded admin identity).',
    );
  }

  const superAdmin = await prisma.user.upsert({
    where: { email: superAdminEmail },
    update: {},
    create: {
      email: superAdminEmail,
      name: 'Super Admin',
      organizationId: org.id,
    },
  });

  // Org-wide roles are represented by a single BrandAccess row against the
  // organization's first brand — BrandAccessGuard/OrgRoleGuard treat any
  // isOrgWide role as valid across every brand, so this is a marker row,
  // not a scoping one.
  await prisma.brandAccess.upsert({
    where: {
      userId_brandId_roleId: {
        userId: superAdmin.id,
        brandId: brandRecords[0].id,
        roleId: superAdminRole.id,
      },
    },
    update: {},
    create: {
      userId: superAdmin.id,
      brandId: brandRecords[0].id,
      roleId: superAdminRole.id,
    },
  });

  console.log(`Seeded organization "${org.name}" with ${brandRecords.length} brands and ${ROLES.length} roles.`);
  console.log(`Super Admin: ${superAdmin.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
