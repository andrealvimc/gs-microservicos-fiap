import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { Certificate } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as puppeteer from 'puppeteer';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { randomUUID } from 'crypto';

@Injectable()
export class CertificateService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('certificate') private certificateQueue: Queue,
  ) {}

  async generateCertificate(
    studentName: string,
    studentRM: number,
    courseId: number,
    courseName: string,
    completionDate: string,
    signatureName: string,
    position: string,
  ): Promise<any> {
    try {
      const uuid = randomUUID();

      // Adicionando o job à fila
      await this.certificateQueue.add(
        'generateCertificate',
        {
          studentName,
          studentRM,
          courseId,
          courseName,
          completionDate,
          signatureName,
          position,
          id: uuid,
        },
        {
          attempts: 3, // Número de tentativas
          backoff: { type: 'exponential', delay: 1000 },
        },
      );

      // Criando o certificado no banco de dados
      const certificate = await this.prisma.certificate.create({
        data: {
          id: uuid,
          peopleName: studentName,
          studentName: studentName,
          RM: studentRM,
          courseId: courseId,
          courseName: courseName,
          status: 'PENDING', // Status inicial
        },
      });

      console.log(`Job de certificado adicionado à fila com ID ${uuid}`);

      return certificate;
    } catch (error) {
      console.error('Erro ao gerar certificado:', error.message);
      throw new Error('Erro ao gerar certificado');
    }
  }

  async getCertificate(id: string): Promise<Certificate | null> {
    const certificate = await this.prisma.certificate.findUnique({
      where: { id: id },
    });

    return certificate;
  }
}
