import { Module } from '@nestjs/common';
import { CertificateController } from './controller/certificate.controller';
import { CertificateService } from './service/certificate.service';
import { PrismaService } from '../prisma.service';
import { BullModule } from '@nestjs/bullmq';
import { CertificateConsumer } from './service/certificate.consumer';

@Module({
  controllers: [CertificateController],
  providers: [CertificateService, PrismaService, CertificateConsumer],
  exports: [CertificateService],
  imports: [
    BullModule.registerQueue({
      name: 'certificate',
    }),
  ],
})
export class CertificateModule {}
