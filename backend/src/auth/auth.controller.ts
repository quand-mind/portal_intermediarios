import { Controller, Post, Body, HttpCode, HttpStatus, Inject, Optional } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { EXELIXI_PARTNER_HOST, ExelixiPartnerHost } from '@jsotoexelixitech/nest-api-sdk';
import { AuthService } from './auth.service';
import { ForgotPasswordDto, ResetPasswordDto, LoginDto } from './dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @Optional()
    @Inject(EXELIXI_PARTNER_HOST)
    private readonly host?: ExelixiPartnerHost,
  ) {}

  /**
   * 1. Send Reset password link in email template
   */
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Enviar enlace de recuperación de contraseña',
    description:
      'Valida si el correo existe en seusuariosweb (columna xcorreo), genera un token con { email, id (de xusuario), type: "reset" } y envía la plantilla de correo con el enlace.',
  })
  @ApiResponse({
    status: 200,
    description: 'Enlace de restablecimiento generado y correo enviado',
    schema: {
      example: {
        status: true,
        message: 'Enlace de restablecimiento de contraseña enviado exitosamente a su correo.',
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        data: {
          email: 'usuario@lamundialdeseguros.com',
          id: 'J-12345678-0',
          type: 'reset',
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Correo no encontrado en seusuariosweb' })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    this.host?.log('log', `POST /api/v1/auth/forgot-password para ${forgotPasswordDto.email}`, 'AuthController');
    return await this.authService.sendResetPasswordLink(forgotPasswordDto);
  }

  /**
   * Alias de la ruta 1 para compatibilidad
   */
  @Post('send-reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Enviar enlace de recuperación de contraseña (Alias)',
    description: 'Ruta alternativa para enviar el enlace de recuperación al correo.',
  })
  async sendResetPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return await this.authService.sendResetPasswordLink(forgotPasswordDto);
  }

  /**
   * 2. Reset Password
   */
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Restablecer contraseña de usuario',
    description:
      'Valida el email y verifica que el token contenga los datos enviados en la solicitud (email, id y type: "reset"). Actualiza la contraseña en seusuariosweb.',
  })
  @ApiResponse({
    status: 200,
    description: 'Contraseña actualizada exitosamente',
    schema: {
      example: {
        status: true,
        message: 'Contraseña restablecida exitosamente.',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos o token no coincide con el correo' })
  @ApiResponse({ status: 401, description: 'Token inválido o expirado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    this.host?.log('log', `POST /api/v1/auth/reset-password para ${resetPasswordDto.email}`, 'AuthController');
    return await this.authService.resetPassword(resetPasswordDto);
  }

  /**
   * 3. Login
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Iniciar sesión',
    description:
      'Valida las credenciales contra la tabla seusuariosweb y genera un token JWT con { email, id (de xusuario), type: "logged" } y la información del usuario.',
  })
  @ApiResponse({
    status: 200,
    description: 'Autenticación exitosa',
    schema: {
      example: {
        status: true,
        message: 'Inicio de sesión exitoso.',
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        data: {
          email: 'usuario@lamundialdeseguros.com',
          id: 'J-12345678-0',
          type: 'logged',
        },
        user: {
          cusuario: 1422,
          xusuario: 'J-12345678-0',
          xnombre: 'JUAN PEREZ',
          xapellido: 'GONZALEZ',
          xcorreo: 'usuario@lamundialdeseguros.com',
          xlogin: 'jperez',
          ccorredor: '1001',
          type: 'logged',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas o usuario inactivo' })
  async login(@Body() loginDto: LoginDto) {
    this.host?.log('log', `POST /api/v1/auth/login para ${loginDto.email}`, 'AuthController');
    return await this.authService.login(loginDto);
  }
}
