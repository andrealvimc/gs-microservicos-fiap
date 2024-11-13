import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as puppeteer from 'puppeteer';
import { Certificate } from '@prisma/client';
import { PrismaService } from './prisma.service';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';

@Injectable()
export class AppService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('certificate') private certificateQueue: Queue,
  ) {}

  async processCertificate(job: any): Promise<Certificate> {
    this.certificateQueue.on('waiting', (jobId) => {
      console.log(`Job ${jobId} está aguardando na fila.`);
    });

    this.certificateQueue.on('resumed', () => {
      console.log(`Job ${job.id} completado com sucesso.`);
    });

    this.certificateQueue.on('error', (err) => {
      console.error(`Job ${job.id} falhou:`, err);
    });

    const {
      id,
      studentName,
      studentRM,
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

    if (fs.existsSync(pdfPath)) {
      console.log(`PDF para RM ${studentRM} já existe. Pulando processamento.`);
      return;
    }

    console.log(id);

    console.log('Iniciando processo de geração de certificado...');
    await this.prisma.certificate.update({
      where: { id },
      data: { pdfPath: pdfPath, status: 'SUCCESS' },
    });
    console.log(`Certificado com ID ${id} marcado como SUCCESS.`);

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

    console.log('Tentando gerar o PDF...');
    const browser = await puppeteer.launch({ headless: true });
    console.log('Puppeteer iniciado.');
    const page = await browser.newPage();
    await page.setContent(filledTemplate);
    console.log('HTML carregado no Puppeteer.');
    await page.pdf({ path: pdfPath, format: 'A4', landscape: true });
    console.log(`PDF gerado em: ${pdfPath}`);
    await browser.close();

    const certificate = await this.prisma.certificate.findUnique({
      where: { id },
    });

    return certificate;
  }
}
