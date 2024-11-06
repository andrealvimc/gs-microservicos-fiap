import { Processor, WorkerHost, OnQueueEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';

import { CertificateService } from './certificate.service';

@Processor('certificate')
export class CertificateConsumer extends WorkerHost {
  constructor(private readonly certificateService: CertificateService) {
    super();
  }

  async process(job: Job) {
    console.log('Processing job:', job.id);
    return await this.certificateService.processCertificate(job);
  }

  @OnQueueEvent('active')
  onActive(job: Job<unknown>) {
    Logger.log(`Starting job ${job.id} : ${job.data['custom_id']}`);
  }

  @OnQueueEvent('completed')
  onCompleted(job: Job<unknown>) {
    Logger.log(`Job ${job.id} has been finished`);
  }
}
