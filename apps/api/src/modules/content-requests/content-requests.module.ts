import { Module } from '@nestjs/common';
import { ContentRequestsService } from './content-requests.service';
import { ContentRequestsController } from './content-requests.controller';

@Module({
  controllers: [ContentRequestsController],
  providers: [ContentRequestsService],
})
export class ContentRequestsModule {}
