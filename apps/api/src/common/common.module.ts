import { Global, Module } from '@nestjs/common';
import { AuditLogService } from './audit/audit-log.service';
import { OrgAccessService } from './services/org-access.service';

// Global, like PrismaModule — these two services are consumed by nearly
// every feature module (audit trail + org-wide-role checks), so requiring
// every module to import this individually would be pure boilerplate.
@Global()
@Module({
  providers: [AuditLogService, OrgAccessService],
  exports: [AuditLogService, OrgAccessService],
})
export class CommonModule {}
