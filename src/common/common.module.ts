import { Module, Global } from '@nestjs/common';
import { NotificationService } from './services/notification.service';
import { StorageService } from './services/storage.service';

@Global()
@Module({
  providers: [NotificationService, StorageService],
  exports: [NotificationService, StorageService],
})
export class CommonModule {}
