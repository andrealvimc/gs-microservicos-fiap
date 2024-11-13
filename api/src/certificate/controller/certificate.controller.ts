import { Response } from 'express';
import { Controller, Get, Param, Post, Res, Body } from '@nestjs/common';
import { CertificateService } from '../service/certificate.service';

@Controller('certificate')
export class CertificateController {
  constructor(private readonly certificateService: CertificateService) {}

  @Post('')
  async generatePdf(@Body() body: any, @Res() response: Response) {
    const {
      studentName,
      studentRM,
      courseId,
      courseName,
      completionDate,
      signatureName,
      position,
    } = body;

    try {
      const certificate = await this.certificateService.generateCertificate(
        studentName,
        studentRM,
        courseId,
        courseName,
        completionDate,
        signatureName,
        position,
      );

      response.json({
        message: 'Certificado gerado com sucesso',
        certificate,
        id: certificate.id,
      });
    } catch (error) {
      response.status(500).json({ message: error.message });
    }
  }

  @Get('/:id')
  async getPdf(@Param('id') id: string, @Res() response: Response) {
    const certificate = await this.certificateService.getCertificate(id);
    return response.status(200).json(certificate);
  }
}
