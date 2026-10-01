import {
  Injectable,
  Inject,
  Optional,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EXELIXI_PARTNER_HOST, ExelixiPartnerHost } from '@jsotoexelixitech/nest-api-sdk';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import * as sql from 'mssql';
import { DatabaseService } from '../database/database.service';
import { MailService } from '../mail/mail.service';
import { ForgotPasswordDto, ResetPasswordDto, LoginDto } from './dto';

export interface JwtAuthPayload {
  email: string;
  id: string;
  type: 'reset' | 'logged';
  iat?: number;
  exp?: number;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly mailService: MailService,
    @Optional() private readonly configService?: ConfigService,
    @Optional() @Inject(EXELIXI_PARTNER_HOST) private readonly host?: ExelixiPartnerHost,
  ) { }

  private getJwtSecret(): string {
    return (
      this.host?.getConfig('JWT_SECRET') ||
      this.configService?.get<string>('JWT_SECRET') ||
      process.env['JWT_SECRET'] ||
      'default_jwt_secret_portal_intermediarios_2026'
    ).trim();
  }

  private getJwtExpiresIn(): string {
    return (
      this.host?.getConfig('JWT_EXPIRES_IN') ||
      this.configService?.get<string>('JWT_EXPIRES_IN') ||
      process.env['JWT_EXPIRES_IN'] ||
      '24h'
    );
  }

  private getResetTokenExpiresIn(): string {
    return (
      this.host?.getConfig('JWT_RESET_EXPIRES_IN') ||
      this.configService?.get<string>('JWT_RESET_EXPIRES_IN') ||
      process.env['JWT_RESET_EXPIRES_IN'] ||
      '1h'
    );
  }

  /**
   * 1. Send Reset password link in email template
   * Consulta en seusuariosweb si el correo existe en la columna xcorreo.
   * Genera y retorna un token con { email, id: xusuario, type: 'reset' } y envía el correo.
   */
  async sendResetPasswordLink(dto: ForgotPasswordDto) {
    const cleanEmail = dto.email.trim().toLowerCase();

    try {
      const pool = await this.databaseService.getPool();
      const result = await pool
        .request()
        .input('xcorreo', sql.VarChar(200), cleanEmail)
        .query(`
          SELECT TOP 1 
            cusuario, 
            xusuario, 
            xnombre, 
            xapellido, 
            xlogin, 
            xcorreo, 
            istatus
          FROM seusuariosweb
          WHERE LOWER(LTRIM(RTRIM(xcorreo))) = @xcorreo
          ORDER BY cusuario DESC
        `);

      if (!result.recordset || result.recordset.length === 0) {
        throw new NotFoundException(
          `No se encontró un usuario registrado con el correo: ${dto.email}`,
        );
      }

      const user = result.recordset[0];

      // Generar token con email, id (obtenido de xusuario) y type: 'reset'
      const payload: JwtAuthPayload = {
        email: user.xcorreo,
        id: user.xusuario,
        type: 'reset',
      };

      const token = jwt.sign(payload, this.getJwtSecret(), {
        expiresIn: this.getResetTokenExpiresIn() as any,
      });

      // Enviar correo con la plantilla HTML
      const userName = user.xnombre || user.xusuario || 'Usuario';
      const mailSent = await this.mailService.sendPasswordResetEmail(
        user.xcorreo,
        userName,
        token,
      );

      return {
        status: true,
        message: mailSent
          ? 'Enlace de restablecimiento de contraseña enviado exitosamente a su correo.'
          : 'Token de restablecimiento generado. Verifique la configuración del servidor de correo.',
        token,
        data: {
          email: user.xcorreo,
          id: user.xusuario,
          type: 'reset',
        },
      };
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error en sendResetPasswordLink: ${error.message}`, error.stack);
      throw new InternalServerErrorException(
        error.message || 'Error interno al procesar solicitud de recuperación',
      );
    }
  }

  /**
   * 2. Reset Password
   * Valida el email y que el token contenga los datos enviados en la solicitud.
   * Actualiza la contraseña en seusuariosweb.
   */
  async resetPassword(dto: ResetPasswordDto) {
    const cleanEmail = dto.email.trim().toLowerCase();

    // 1. Validar y decodificar el token JWT
    let decoded: JwtAuthPayload;
    try {
      decoded = jwt.verify(dto.token, this.getJwtSecret()) as JwtAuthPayload;
    } catch (err: any) {
      throw new UnauthorizedException(
        'El token de recuperación es inválido o ha expirado.',
      );
    }

    if (decoded.type !== 'reset') {
      throw new BadRequestException(
        'El tipo de token no es válido para restablecer contraseña.',
      );
    }

    // 2. Verificar que el token contenga el email enviado
    if (!decoded.email || decoded.email.trim().toLowerCase() !== cleanEmail) {
      throw new BadRequestException(
        'El correo proporcionado no coincide con el correo asociado al token.',
      );
    }

    try {
      const pool = await this.databaseService.getPool();

      // Verificar existencia del usuario y que coincida el id (xusuario)
      const userResult = await pool
        .request()
        .input('xcorreo', sql.VarChar(200), cleanEmail)
        .query(`
          SELECT TOP 1 cusuario, xusuario, xlogin, xcorreo
          FROM seusuariosweb
          WHERE LOWER(LTRIM(RTRIM(xcorreo))) = @xcorreo
          ORDER BY cusuario DESC
        `);

      if (!userResult.recordset || userResult.recordset.length === 0) {
        throw new NotFoundException('Usuario no encontrado en el sistema.');
      }

      const user = userResult.recordset[0];

      if (decoded.id && user.xusuario && decoded.id.trim() !== user.xusuario.trim()) {
        throw new BadRequestException(
          'La identidad del usuario no coincide con el token emitido.',
        );
      }

      // 3. Actualizar contraseña en seusuariosweb (y sincronizar seusuarios si aplica)
      await pool
        .request()
        .input('xcorreo', sql.VarChar(200), cleanEmail)
        .input('xcontrasena', sql.VarChar(150), dto.password)
        .input('xlogin', sql.VarChar(50), user.xlogin || cleanEmail)
        .query(`
          UPDATE seusuariosweb
          SET xcontrasena = @xcontrasena,
              bcambioclave = 0
          WHERE LOWER(LTRIM(RTRIM(xcorreo))) = @xcorreo;

          IF EXISTS (SELECT 1 FROM seusuarios WHERE LOWER(LTRIM(RTRIM(xuserid))) = LOWER(LTRIM(RTRIM(@xlogin))))
          BEGIN
            UPDATE seusuarios 
            SET xclavesec = @xcontrasena 
            WHERE LOWER(LTRIM(RTRIM(xuserid))) = LOWER(LTRIM(RTRIM(@xlogin)));
          END
        `);

      this.logger.log(`Contraseña actualizada exitosamente para usuario: ${cleanEmail}`);

      return {
        status: true,
        message: 'Contraseña restablecida exitosamente.',
      };
    } catch (error: any) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }
      this.logger.error(`Error en resetPassword: ${error.message}`, error.stack);
      throw new InternalServerErrorException(
        error.message || 'Error interno al restablecer la contraseña',
      );
    }
  }

  /**
   * 3. Login
   * Valida el email y credenciales contra seusuariosweb.
   * Retorna un token con { email, id: xusuario, type: 'logged' } y la información del usuario.
   */
  async login(dto: LoginDto) {
    const cleanIdentifier = dto.email.trim().toLowerCase();

    try {
      const pool = await this.databaseService.getPool();

      // Consultar usuario por xcorreo o por xlogin con join a maclient
      const result = await pool
        .request()
        .input('identifier', sql.VarChar(200), cleanIdentifier)
        .query(`
          SELECT TOP 1
            u.cusuario,
            u.xnombre,
            u.xusuario,
            u.xcorreo,
            u.xcontrasena,
            TRIM(m.cid) AS cid,
            m.cci_rif
          FROM seusuariosweb u
          INNER JOIN maclient m 
            ON m.cci_rif = TRY_CAST(LTRIM(RTRIM(u.xusuario)) AS INT)
          WHERE (LOWER(LTRIM(RTRIM(u.xcorreo))) = @identifier OR LOWER(LTRIM(RTRIM(u.xlogin))) = @identifier)
            AND u.istatus = 'V'
          ORDER BY u.cusuario DESC
        `);

      if (!result.recordset || result.recordset.length === 0) {
        throw new UnauthorizedException('Credenciales inválidas (usuario no encontrado o inactivo).');
      }

      const user = result.recordset[0];

      // Validar contraseña (soporta texto plano, MD5 y MD5 con salt LMS)
      const isMatch = this.verifyPassword(dto.password, user.xcontrasena);

      if (!isMatch) {
        throw new UnauthorizedException('Credenciales inválidas (contraseña incorrecta).');
      }

      // Generar token con email, id (obtenido de xusuario) y type: 'logged'
      const payload: JwtAuthPayload = {
        email: user.xcorreo || cleanIdentifier,
        id: user.xusuario,
        type: 'logged',
      };

      const token = jwt.sign(payload, this.getJwtSecret(), {
        expiresIn: this.getJwtExpiresIn() as any,
      });

      return {
        status: true,
        message: 'Inicio de sesión exitoso.',
        token,
        data: {
          email: user.xcorreo || cleanIdentifier,
          id: user.xusuario,
          type: 'logged',
        },
        user: {
          cusuario: user.cusuario,
          xnombre: user.xnombre,
          xusuario: user.xusuario,
          xcorreo: user.xcorreo,
          cid: user.cid,
          cci_rif: user.cci_rif ? Number(user.cci_rif) : (Number(user.xusuario) || undefined),
          type: 'logged',
        },
      };
    } catch (error: any) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error(`Error en login: ${error.message}`, error.stack);
      throw new InternalServerErrorException(
        error.message || 'Error interno al procesar el inicio de sesión',
      );
    }
  }

  /**
   * Verifica la contraseña considerando hash MD5, MD5 con 'LMS' y texto plano
   */
  private verifyPassword(rawPassword: string, storedPassword?: string): boolean {
    if (!storedPassword) return false;

    const trimmedStored = storedPassword.trim();
    const trimmedRaw = rawPassword.trim();

    // 1. Comparación directa texto plano
    if (trimmedStored === trimmedRaw) {
      return true;
    }

    // 2. Comparación MD5 estándar
    const md5Hash = crypto.createHash('md5').update(trimmedRaw).digest('hex');
    if (trimmedStored.toLowerCase() === md5Hash.toLowerCase()) {
      return true;
    }

    // 3. Comparación MD5 con sufijo LMS (usado en Sis2000 / lamundialcms)
    const md5LmsHash = crypto.createHash('md5').update(trimmedRaw + 'LMS').digest('hex');
    if (trimmedStored.toLowerCase() === md5LmsHash.toLowerCase()) {
      return true;
    }

    return false;
  }
}
