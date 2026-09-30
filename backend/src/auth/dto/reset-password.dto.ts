import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    example: 'usuario@lamundialdeseguros.com',
    description: 'Correo electrónico del usuario asociado al token',
  })
  @IsNotEmpty({ message: 'El correo electrónico es requerido' })
  @IsEmail({}, { message: 'Debe proporcionar un formato de correo electrónico válido' })
  email!: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Token JWT generado para la recuperación de contraseña',
  })
  @IsNotEmpty({ message: 'El token de recuperación es requerido' })
  @IsString()
  token!: string;

  @ApiProperty({
    example: 'NuevaClave2026.',
    description: 'Nueva contraseña que se registrará en seusuariosweb',
  })
  @IsNotEmpty({ message: 'La nueva contraseña es requerida' })
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password!: string;
}
