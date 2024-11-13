import { Processor, WorkerHost, OnQueueEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';

import { AppService } from './app.service';

@Processor('certificate')
export class CertificateConsumer extends WorkerHost {
  constructor(private readonly appService: AppService) {
    super();
  }

  async process(job: Job) {
    console.log('Processing job:', job.id);

    return await this.appService.processCertificate(job);
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
