import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { Certificate } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as puppeteer from 'puppeteer';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

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
    const job = await this.certificateQueue.add('generateCertificate', {
      studentName,
      studentRM,
      courseId,
      courseName,
      completionDate,
      signatureName,
      position,
    });

    const certificate = await this.processCertificate(job);

    return certificate;
  }

  async processCertificate(job: any): Promise<Certificate> {
    const {
      studentName,
      studentRM,
      courseId,
      courseName,
      completionDate,
      signatureName,
      position,
    } = job.data;

    const uploadsDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir);
    }

    const pdfPath = path.join(uploadsDir, `${studentRM}.pdf`);

    const htmlTemplate = `
      <!DOCTYPE html>
      <html lang="pt-br">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Diploma</title>
          <style>
            @media print {
              @page {
                size: A4 landscape;
                margin: 0; /* Remove margem padrão */
              }
              body {
                margin: 0;
                padding: 0;
              }
              /* Ocultar cabeçalho e rodapé padrão */
              body::before,
              body::after {
                display: none;
              }
            }

            body {
              font-family: 'Times New Roman', Times, serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
            }

            .diploma-container {
              width: 90%; /* Ajuste de largura para caber na página A4 em modo paisagem */
              max-width: 1000px; /* Garantir que não ultrapasse a largura máxima */
              margin: 0 auto;
              padding: 40px;
              background-color: white;
              box-shadow: none;
            }

            .header {
              text-align: center;
              font-size: 28px;
              font-weight: bold;
            }

            .sub-header {
              text-align: center;
              font-size: 20px;
              margin: 10px 0;
            }

            .content {
              margin: 40px 0;
              font-size: 18px;
              line-height: 1.5;
            }

            .signatures {
              margin-top: 50px;
              display: flex;
              justify-content: space-between;
            }

            .signature {
              text-align: center;
            }

            .signature p {
              margin: 5px 0;
            }

            .date {
              text-align: center;
              margin-top: 40px;
              font-size: 18px;
            }
          </style>
        </head>
        <body>
          <div class="diploma-container">
            <div class="header">Universidade de Programação</div>
            <div class="sub-header">Certificado de Conclusão</div>
            <div class="content">
              <p>
                Certificamos que <strong>[[nome]]</strong>, concluiu em
                [[data_conclusao]] o curso de [[curso]], nível de especialização.
              </p>
              <p>
                Este certificado é concedido em conformidade com o artigo 44, inciso
                3353, da Lei 9394/96, e com a Resolução C.N.C./C.C.S. nº 01/07.
              </p>
            </div>
            <div class="date">São Paulo, [[data_emissao]]</div>
            <div class="signatures">
              <div class="signature">
                <p><strong>[[nome_assinatura]]</strong></p>
                <p>[[cargo]]</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const filledTemplate = htmlTemplate
      .replace('[[nome]]', studentName)
      .replace('[[data_conclusao]]', completionDate)
      .replace('[[curso]]', courseName)
      .replace('[[data_emissao]]', new Date().toLocaleDateString('pt-BR'))
      .replace('[[nome_assinatura]]', signatureName)
      .replace('[[cargo]]', position);

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(filledTemplate);
    await page.pdf({ path: pdfPath, format: 'A4', landscape: true });
    await browser.close();

    const certificate = await this.prisma.certificate.create({
      data: {
        peopleName: studentName,
        pdfPath: pdfPath,
        studentName: studentName,
        RM: studentRM,
        courseId: courseId,
        courseName: courseName,
      },
    });

    return certificate;
  }

  async getCertificate(id: string): Promise<Certificate | null> {
    const certificate = await this.prisma.certificate.findUnique({
      where: { id: id },
    });

    return certificate;
  }
}
