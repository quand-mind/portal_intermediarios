import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private readonly configService: ConfigService) {
    this.initTransporter();
  }

  private initTransporter() {
    const user = this.configService.get<string>('USER_EMAIL') || process.env['USER_EMAIL'];
    const pass = this.configService.get<string>('PASS_EMAIL') || process.env['PASS_EMAIL'];
    const host = this.configService.get<string>('SMTP_HOST') || process.env['SMTP_HOST'] || 'smtp.gmail.com';
    const port = Number(this.configService.get<number>('SMTP_PORT') || process.env['SMTP_PORT'] || 587);

    if (user && user.includes('@gmail.com')) {
      this.transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: { user, pass },
      });
    } else if (user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
        tls: {
          rejectUnauthorized: false,
        },
      });
    }
  }

  /**
   * Envía el correo con el enlace y plantilla para restablecimiento de contraseña
   */
  async sendPasswordResetEmail(
    to: string,
    userName: string,
    token: string,
    customResetUrl?: string,
  ): Promise<boolean> {
    try {
      if (!this.transporter) {
        this.initTransporter();
      }

      const frontendUrl =
        this.configService.get<string>('FRONTEND_URL') ||
        process.env['FRONTEND_URL'] ||
        'http://localhost:4200';

      const resetLink = customResetUrl || `${frontendUrl}/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(to)}`;
      const sender = this.configService.get<string>('USER_EMAIL') || process.env['USER_EMAIL'] || 'no-reply@lamundialdeseguros.com';

      const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Restablecer Contraseña - Portal Intermediarios</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f4f6f9;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #333333;
    }
    .container {
      max-width: 600px;
      margin: 30px auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
    }
    .header {
      background: linear-gradient(135deg, #0b2f64 0%, #1e5bb8 100%);
      padding: 30px 20px;
      text-align: center;
      color: #ffffff;
    }
    .header h1 {
      margin: 0;
      font-size: 22px;
      letter-spacing: 0.5px;
    }
    .content {
      padding: 35px 30px;
      line-height: 1.6;
    }
    .content h2 {
      color: #0b2f64;
      font-size: 18px;
      margin-top: 0;
    }
    .button-container {
      text-align: center;
      margin: 35px 0;
    }
    .btn {
      display: inline-block;
      padding: 14px 32px;
      background-color: #0b2f64;
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      font-size: 15px;
      box-shadow: 0 3px 8px rgba(11, 47, 100, 0.3);
    }
    .btn:hover {
      background-color: #1e5bb8;
    }
    .note {
      font-size: 13px;
      color: #666666;
      border-top: 1px solid #eeeeee;
      padding-top: 20px;
      margin-top: 25px;
    }
    .footer {
      background-color: #f8fafc;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #888888;
      border-top: 1px solid #eef2f6;
    }
    .token-box {
      background-color: #f1f5f9;
      padding: 12px;
      border-radius: 4px;
      font-family: monospace;
      font-size: 12px;
      word-break: break-all;
      margin-top: 15px;
      color: #475569;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Portal de Intermediarios</h1>
      <p style="margin: 5px 0 0 0; font-size: 13px; opacity: 0.9;">La Mundial de Seguros</p>
    </div>
    <div class="content">
      <h2>Hola, ${userName || 'Usuario'}</h2>
      <p>Hemos recibido una solicitud para restablecer la contraseña asociada a tu cuenta en el Portal de Intermediarios.</p>
      <p>Para continuar con el proceso, por favor haz clic en el siguiente botón:</p>
      
      <div class="button-container">
        <a href="${resetLink}" class="btn" target="_blank">Restablecer mi Contraseña</a>
      </div>

      <p style="font-size: 13px; color: #555555;">Si el botón no funciona, puedes copiar y pegar el siguiente enlace en tu navegador:</p>
      <div class="token-box">${resetLink}</div>

      <div class="note">
        <p><strong>Importante:</strong> Este enlace expirará en 1 hora por motivos de seguridad. Si no solicitaste este cambio, puedes ignorar este correo y tu contraseña permanecerá segura.</p>
      </div>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} La Mundial de Seguros, C.A. Todos los derechos reservados.</p>
    </div>
  </div>
</body>
</html>
      `;

      if (!this.transporter) {
        this.logger.warn(`No se configuró transporte SMTP. El enlace de recuperación es: ${resetLink}`);
        return true;
      }

      await this.transporter.sendMail({
        from: `"La Mundial de Seguros" <${sender}>`,
        to,
        subject: 'Restablecimiento de Contraseña - Portal Intermediarios',
        html: htmlContent,
      });

      this.logger.log(`Correo de restablecimiento enviado exitosamente a ${to}`);
      return true;
    } catch (error: any) {
      this.logger.error(`Error enviando correo de restablecimiento a ${to}: ${error.message}`, error.stack);
      // Retornar falso para que el servicio decida o devuelva aviso
      return false;
    }
  }
}
