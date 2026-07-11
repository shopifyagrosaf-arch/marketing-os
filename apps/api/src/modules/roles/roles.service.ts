import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Read-only listing for Sprint 1 — enough for the frontend to render role
   * names (e.g. in a future admin screen). Full CRUD for custom-role
   * creation is scoped to Sprint 2's Admin Console per the roadmap.
   */
  findAll() {
    return this.prisma.role.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, isCustom: true, isOrgWide: true },
    });
  }
}
